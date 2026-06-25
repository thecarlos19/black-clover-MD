import { 
  Browsers, 
  makeCacheableSignalKeyStore, 
  fetchLatestBaileysVersion, 
  DisconnectReason, 
  jidDecode, 
  useMultiFileAuthState,
  makeWASocket
} from "@whiskeysockets/baileys"
import pino from "pino";
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from 'url';
import NodeCache from 'node-cache';
import * as ws from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

if (!global.conns) global.conns = [];
if (!global.subBotSessions) global.subBotSessions = new Map();

const DIGITS = (s = "") => String(s).replace(/\D/g, "");

function normalizePhoneForPairing(input) {
  let s = DIGITS(input);
  if (!s) return "";
  if (s.startsWith("0")) s = s.replace(/^0+/, "");
  if (s.length === 10 && s.startsWith("3")) s = "57" + s;
  if (s.startsWith("52") && !s.startsWith("521") && s.length >= 12) s = "521" + s.slice(2);
  if (s.startsWith("54") && !s.startsWith("549") && s.length >= 11) s = "549" + s.slice(2);
  return s;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0];

const getHtmlPath = () => {
  const possiblePaths = [
    path.join(__dirname, 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, './index.html')
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

export default async (sock) => {
  const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
  const socketSessions = new Map();

  async function createSocket(phone) {
    const pho = normalizePhoneForPairing(phone);
    const dir = path.join(process.cwd(), 'Sessions', 'Subs', pho);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const credsPath = path.join(dir, 'creds.json');
    if (!fs.existsSync(credsPath)) {
      fs.writeFileSync(credsPath, JSON.stringify({}), 'utf8');
    }
    
    const { state, saveCreds: saveCredsDB } = await useMultiFileAuthState(dir);
    const { version } = await fetchLatestBaileysVersion();
    
    let saveCredsTimer = null;
    const saveCreds = () => { 
      clearTimeout(saveCredsTimer); 
      saveCredsTimer = setTimeout(saveCredsDB, 2000); 
    };
    
    const msgStore = new Map();
    const msgLimit = 500;
    
    let reconnectAttempts = 0;
    let lastReconnect = 0;
    let maxReconnectDelay = 120000;
    let keepAliveInterval = null;
    let watchdogInterval = null;
    let connectionTimeout = null;
    
    const connectionOptions = {
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.windows('Chrome'),
      auth: { 
        creds: state.creds, 
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) 
      },
      shouldIgnoreJid: (jid) => jid.endsWith('@broadcast'),
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      keepAliveIntervalMs: 30000,
      msgRetryCounterCache,
      userDevicesCache,
      getMessage: async (key) => msgStore.get(key.remoteJid + ':' + key.id),
    };
    
    let s = makeWASocket(connectionOptions);
    s.isInit = false;
    s.connectionStartTime = Date.now();
    
    function startKeepAlive() {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      keepAliveInterval = setInterval(() => {
        try {
          if (s?.ws?.socket?.readyState === ws.OPEN && s?.ws?.socket?.ping) {
            s.ws.socket.ping();
            s.sendPresenceUpdate('available').catch(() => {});
          }
        } catch {}
      }, 10000);
    }

    function startWatchdog() {
      if (watchdogInterval) clearInterval(watchdogInterval);
      watchdogInterval = setInterval(() => {
        try {
          if (s?.ws?.socket?.readyState === ws.CONNECTING) {
            const connectTime = s.ws.socket?.connectTime || Date.now();
            if (Date.now() - connectTime > 60000) {
              try { s.ws.close(); } catch {}
              creloadHandler(true).catch(() => {});
            }
          }
          if (!s?.ws?.socket || s.ws.socket.readyState === ws.CLOSED || s.ws.socket.readyState === ws.CLOSING) {
            creloadHandler(true).catch(() => {});
          }
        } catch {}
      }, 15000);
    }
    
    function startConnectionTimer() {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      connectionTimeout = setTimeout(() => {
        try {
          if (s && !s.isInit) {
            s.ws?.close();
            const jid = pho + '@s.whatsapp.net';
            global.subBotSessions.delete(jid);
            const idx = global.conns.findIndex(c => c.userId === s.userId);
            if (idx !== -1) global.conns.splice(idx, 1);
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            if (watchdogInterval) clearInterval(watchdogInterval);
          }
        } catch {}
      }, 60000);
    }
    
    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update;
      if (isNewLogin) s.isInit = false;
      
      if (qr) {
        s.qrCode = qr;
        return;
      }
      
      if (connection === 'open') {
        reconnectAttempts = 0;
        s.isInit = true;
        s.uptime = Date.now();
        s.userId = cleanJid(s.user?.id?.split('@')[0]);
        
        const jid = pho + '@s.whatsapp.net';
        global.subBotSessions.set(jid, s);
        
        if (!global.conns.find((c) => c.userId === s.userId)) {
          global.conns.push(s);
        }
        
        startKeepAlive();
        startWatchdog();
        if (connectionTimeout) clearTimeout(connectionTimeout);
      }
      
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode || lastDisconnect?.reason || 0;
        
        if ([401, 403, 405].includes(reason)) {
          try {
            if (fs.existsSync(dir)) {
              fs.rmSync(dir, { recursive: true, force: true });
            }
          } catch (e) {}
          const jid = pho + '@s.whatsapp.net';
          global.subBotSessions.delete(jid);
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          if (watchdogInterval) clearInterval(watchdogInterval);
          if (connectionTimeout) clearTimeout(connectionTimeout);
          return;
        }
        
        if (reason === 408 || reason === 428 || reason === 500 || reason === 515 || !reason || reason === DisconnectReason.connectionLost) {
          const now = Date.now();
          const jitter = Math.random() * 2000;
          const delay = Math.min(3000 * Math.pow(2, reconnectAttempts) + jitter, maxReconnectDelay);
          
          if (now - lastReconnect < 3000) return;
          lastReconnect = now;
          reconnectAttempts++;
          
          await new Promise(r => setTimeout(r, delay));
          return creloadHandler(true).catch(() => {});
        }
        
        if (reason === DisconnectReason.connectionReplaced || reason === 440) {
          const jid = pho + '@s.whatsapp.net';
          global.subBotSessions.delete(jid);
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          if (watchdogInterval) clearInterval(watchdogInterval);
          if (connectionTimeout) clearTimeout(connectionTimeout);
          return;
        }
        
        await new Promise(r => setTimeout(r, 5000));
        return creloadHandler(true).catch(() => {});
      }
    }
    
    let creloadHandler = async function (restatConn) {
      if (restatConn) {
        try { s.ws?.close(); } catch {}
        try { s.ev.removeAllListeners(); } catch {}
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (watchdogInterval) clearInterval(watchdogInterval);
        if (connectionTimeout) clearTimeout(connectionTimeout);
        
        const { state: newState, saveCreds: newSaveCreds } = await useMultiFileAuthState(dir);
        
        s = makeWASocket({
          ...connectionOptions,
          auth: {
            creds: newState.creds,
            keys: makeCacheableSignalKeyStore(newState.keys, pino({ level: 'silent' }))
          }
        });
        s.isInit = false;
        s.connectionStartTime = Date.now();
        
        s.ev.on('creds.update', saveCreds);
        s.ev.on('connection.update', connectionUpdate);
        
        s.ev.on("messages.upsert", async ({ messages, type }) => {
          if (!s.isInit || type !== 'notify') return;
          for (const msg of messages) {
            if (msg?.message && msg?.key?.id) {
              const sid = msg.key.remoteJid + ':' + msg.key.id;
              msgStore.set(sid, msg.message);
              if (msgStore.size > msgLimit) msgStore.delete(msgStore.keys().next().value);
            }
          }
        });
        
        const jid = pho + '@s.whatsapp.net';
        if (global.subBotSessions.has(jid)) {
          global.subBotSessions.delete(jid);
          const idx = global.conns.findIndex(c => c.userId === s.userId);
          if (idx !== -1) global.conns.splice(idx, 1);
        }
        
        startConnectionTimer();
        
        return true;
      }
      return true;
    };
    
    s.ev.on('creds.update', saveCreds);
    s.ev.on('connection.update', connectionUpdate);
    
    s.ev.on("messages.upsert", async ({ messages, type }) => {
      if (!s.isInit || type !== 'notify') return;
      for (const msg of messages) {
        if (msg?.message && msg?.key?.id) {
          const sid = msg.key.remoteJid + ':' + msg.key.id;
          msgStore.set(sid, msg.message);
          if (msgStore.size > msgLimit) msgStore.delete(msgStore.keys().next().value);
        }
      }
    });
    
    startConnectionTimer();
    
    return s;
  }

  async function getOrCreateSocket(phone) {
    const pho = normalizePhoneForPairing(phone);
    const jid = pho + '@s.whatsapp.net';
    
    if (global.subBotSessions.has(jid)) {
      const existing = global.subBotSessions.get(jid);
      if (existing && existing.isInit) {
        return existing;
      }
    }
    
    if (socketSessions.has(pho)) {
      const existing = socketSessions.get(pho);
      if (existing && existing.isInit) {
        return existing;
      }
    }
    
    const s = await createSocket(phone);
    socketSessions.set(pho, s);
    return s;
  }

  async function requestPairingCode(rawPhone, type = 'qr') {
    const phoneDigits = normalizePhoneForPairing(rawPhone);
    if (!phoneDigits) throw new Error("Numero invalido");
    
    const s = await getOrCreateSocket(phoneDigits);
    
    if (s.isInit && s.user) {
      const jid = s.user.id || "";
      const num = DIGITS(jid.split("@")[0]);
      return { connected: true, number: num };
    }
    
    await sleep(1500);
    
    if (type === 'code') {
      const code = await s.requestPairingCode(phoneDigits);
      const formattedCode = String(code).match(/.{1,4}/g)?.join("-") || code;
      return { connected: false, code: formattedCode };
    } else {
      return new Promise((resolve) => {
        let timeoutId;
        let qrListener = (update) => {
          if (update.qr) {
            clearTimeout(timeoutId);
            s.ev.off('connection.update', qrListener);
            resolve({ connected: false, qr: update.qr });
          }
          if (update.connection === 'open') {
            clearTimeout(timeoutId);
            s.ev.off('connection.update', qrListener);
            const jid = s.user?.id || "";
            const num = DIGITS(jid.split("@")[0]);
            resolve({ connected: true, number: num });
          }
        };
        s.ev.on('connection.update', qrListener);
        
        timeoutId = setTimeout(() => {
          s.ev.off('connection.update', qrListener);
          resolve({ connected: false, error: 'Timeout esperando QR' });
        }, 60000);
      });
    }
  }

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    if (method === 'GET' && pathname === '/') {
      const htmlPath = getHtmlPath();
      if (htmlPath && fs.existsSync(htmlPath)) {
        try {
          const html = fs.readFileSync(htmlPath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
          return;
        } catch (e) {
          console.error('Error reading HTML:', e);
        }
      }
      sendJson(res, 404, { ok: false, error: 'index.html not found' });
      return;
    }
            
    const body = method === 'POST' ? await parseBody(req) : {};

    try {
      if (method === 'POST' && pathname === '/pairing') {
        const { phone, type = 'qr' } = body;
        
        if (!phone) {
          return sendJson(res, 400, { ok: false, message: 'Phone number required' });
        }
        
        const pho = normalizePhoneForPairing(phone);
        if (!pho) {
          return sendJson(res, 400, { ok: false, message: 'Invalid number' });
        }
        
        const result = await requestPairingCode(phone, type);
        const sessionId = pho + '@s.whatsapp.net';
        
        if (result.connected) {
          return sendJson(res, 200, {
            ok: true,
            connected: true,
            sessionId: sessionId,
            number: result.number + '@s.whatsapp.net'
          });
        }
        
        if (result.error) {
          return sendJson(res, 200, {
            ok: false,
            message: result.error
          });
        }
        
        return sendJson(res, 200, {
          ok: true,
          connected: false,
          sessionId: sessionId,
          type: type,
          qr: result.qr || null,
          code: result.code || null
        });
      }

      if (method === 'GET' && pathname === '/pairing/status') {
        const sessionId = url.searchParams.get('id');
        if (!sessionId) {
          return sendJson(res, 400, { ok: false, message: 'Session ID required' });
        }
        
        const session = global.subBotSessions.get(sessionId);
        if (!session) {
          return sendJson(res, 200, { ok: false, connected: false, expired: true });
        }
        
        return sendJson(res, 200, {
          ok: true,
          connected: session.isInit || false,
          userId: session.userId || null
        });
      }

      if (method === 'GET' && pathname === '/sessions') {
        const sessions = [];
        for (const [id, session] of global.subBotSessions) {
          sessions.push({
            id: id,
            connected: session.isInit || false,
            userId: session.userId || null,
            uptime: session.uptime ? Math.floor((Date.now() - session.uptime) / 1000) : 0
          });
        }
        return sendJson(res, 200, {
          ok: true,
          sessions: sessions,
          total: sessions.length
        });
      }

      if (method === 'DELETE' && pathname === '/session') {
        const sessionId = url.searchParams.get('id');
        if (!sessionId) {
          return sendJson(res, 400, { ok: false, message: 'Session ID required' });
        }
        
        const session = global.subBotSessions.get(sessionId);
        if (session) {
          try {
            session.ws?.close();
            session.ev.removeAllListeners();
          } catch {}
          const pho = sessionId.split('@')[0];
          const dir = path.join(process.cwd(), 'Sessions', 'Subs', pho);
          try {
            if (fs.existsSync(dir)) {
              fs.rmSync(dir, { recursive: true, force: true });
            }
          } catch {}
          global.subBotSessions.delete(sessionId);
          const idx = global.conns.findIndex(c => c.userId === session.userId);
          if (idx !== -1) global.conns.splice(idx, 1);
        }
        
        return sendJson(res, 200, { ok: true, deleted: true });
      }

      if (method === 'GET' && pathname === '/health') {
        return sendJson(res, 200, { 
          ok: true, 
          status: 'online',
          bots: global.conns.length,
          sessions: global.subBotSessions.size,
          uptime: process.uptime()
        });
      }

      sendJson(res, 404, { ok: false, error: 'Not Found' });

    } catch (error) {
      console.error('Error:', error);
      sendJson(res, 500, { ok: false, error: 'Internal Server Error: ' + error.message });
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    // console.log(`[ INFO ] :: Web Inicializada.`);
  });

  return server;
};