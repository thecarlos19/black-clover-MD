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
    path.join(__dirname, './index.html'),
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
    
    fs.mkdirSync(dir, { recursive: true });
    
    const { state, saveCreds: saveCredsDB } = await useMultiFileAuthState(dir);
    const { version } = await fetchLatestBaileysVersion();
    
    let saveCredsTimer = null;
    const saveCreds = () => { 
      clearTimeout(saveCredsTimer); 
      saveCredsTimer = setTimeout(saveCredsDB, 2000); 
    };
    
    const msgStore = new Map();
    const msgLimit = 500;
    console.info = () => {};
    
    const s = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.windows('Chrome'),
      auth: { 
        creds: state.creds, 
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) 
      },
      shouldIgnoreJid: (jid) => jid.endsWith('@broadcast'),
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      keepAliveIntervalMs: 30000,
      msgRetryCounterCache,
      userDevicesCache,
      getMessage: async (key) => msgStore.get(key.remoteJid + ':' + key.id),
    });
    
    s.isInit = false;
    s.ev.on('creds.update', saveCreds);
    
    s.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
      }
      return jid;
    };
    
    let botReady = false;
    let bootTime = Date.now();
    
    s.ev.on("messages.upsert", async ({ messages, type }) => {
      if (!botReady || type !== 'notify') return;
      for (const msg of messages) {
        if (msg?.message && msg?.key?.id) {
          const sid = msg.key.remoteJid + ':' + msg.key.id;
          msgStore.set(sid, msg.message);
          if (msgStore.size > msgLimit) msgStore.delete(msgStore.keys().next().value);
        }
      }
    });
    
    s.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin }) => {
      if (isNewLogin) s.isInit = false;
      
      if (connection === 'open') {
        bootTime = Date.now();
        botReady = true;
        s.isInit = true;
        s.uptime = Date.now();
        s.userId = cleanJid(s.user?.id?.split('@')[0]);
        
        const jid = pho + '@s.whatsapp.net';
        global.subBotSessions.set(jid, s);
        
        if (!global.conns.find((c) => c.userId === s.userId)) {
          global.conns.push(s);
        }
      }
      
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0;
        
        if ([401, 403, 405].includes(reason)) {
          try {
            fs.rmSync(dir, { recursive: true, force: true });
          } catch (e) {}
          const jid = pho + '@s.whatsapp.net';
          global.subBotSessions.delete(jid);
        }
      }
    });
    
    return s;
  }

  async function getOrCreateSocket(phone) {
    const pho = normalizePhoneForPairing(phone);
    const jid = pho + '@s.whatsapp.net';
    
    if (global.subBotSessions.has(jid)) {
      return global.subBotSessions.get(jid);
    }
    
    if (socketSessions.has(pho)) {
      return socketSessions.get(pho);
    }
    
    const s = await createSocket(phone);
    socketSessions.set(pho, s);
    return s;
  }

  async function requestPairingCode(rawPhone, type = 'qr') {
    const phoneDigits = normalizePhoneForPairing(rawPhone);
    if (!phoneDigits) throw new Error("Numero invalido");
    
    const s = await getOrCreateSocket(phoneDigits);
    
    if (s.user) {
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
        let qrListener = (update) => {
          if (update.qr) {
            s.ev.off('connection.update', qrListener);
            resolve({ connected: false, qr: update.qr });
          }
        };
        s.ev.on('connection.update', qrListener);
        
        setTimeout(() => {
          s.ev.off('connection.update', qrListener);
          resolve({ connected: false, error: 'Timeout esperando QR' });
        }, 60000);
      });
    }
  }

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

      if (method === 'GET' && pathname === '/health') {
        return sendJson(res, 200, { 
          ok: true, 
          status: 'online',
          bots: global.conns.length,
          sessions: global.subBotSessions.size
        });
      }

      sendJson(res, 404, { ok: false, error: 'Not Found' });

    } catch (error) {
      console.error('Error:', error);
      sendJson(res, 500, { ok: false, error: 'Internal Server Error: ' + error.message });
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`
- Sub Bot Pairing Server
- URL: http://localhost:${PORT}
- Pairing: /pairing (POST)
- Status: /pairing/status (GET)
- Health: /health (GET)
    `);
  });

  return server;
};