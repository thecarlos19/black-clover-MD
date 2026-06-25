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
    path.join(__dirname, '../index.html'),
    path.join(__dirname, '../../index.html')
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
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Sub Bot Pairing</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .container { max-width: 400px; width: 100%; padding: 30px; background: #1a1a1a; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    h1 { color: #8b5cf6; text-align: center; margin-bottom: 10px; }
    p { text-align: center; color: #a0a0a0; margin-bottom: 25px; }
    .input-group { margin: 15px 0; }
    label { display: block; margin-bottom: 5px; color: #c0c0c0; font-size: 14px; }
    input, select { width: 100%; padding: 12px; border: 1px solid #333; border-radius: 6px; background: #0a0a0a; color: #fff; font-size: 15px; box-sizing: border-box; }
    input:focus, select:focus { outline: none; border-color: #8b5cf6; }
    button { width: 100%; padding: 14px; background: #8b5cf6; border: none; border-radius: 6px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 15px; transition: background 0.3s; }
    button:hover { background: #7c3aed; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .qr-container { text-align: center; margin: 20px 0; display: none; }
    .qr-container img { max-width: 220px; border: 3px solid #8b5cf6; border-radius: 10px; background: #fff; padding: 5px; }
    .code-display { text-align: center; font-size: 32px; letter-spacing: 4px; color: #8b5cf6; margin: 20px 0; display: none; font-weight: bold; background: #0a0a0a; padding: 15px; border-radius: 8px; border: 1px solid #333; }
    .loading { display: none; text-align: center; margin: 20px 0; }
    .spinner { border: 4px solid #333; border-top: 4px solid #8b5cf6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .status { margin-top: 20px; padding: 12px; border-radius: 6px; display: none; font-size: 14px; }
    .status.success { display: block; background: #064e3b; border: 1px solid #22c55e; color: #86efac; }
    .status.error { display: block; background: #7f1d1d; border: 1px solid #ef4444; color: #fca5a5; }
    .status.info { display: block; background: #1e3a5f; border: 1px solid #3b82f6; color: #93c5fd; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sub Bot</h1>
    <p>Connect your number as Sub-Bot</p>
    
    <div class="input-group">
      <label>Phone Number</label>
      <input type="text" id="phone" placeholder="Ej: 573001234567" />
    </div>
    
    <div class="input-group">
      <label>Connection Type</label>
      <select id="connectionType">
        <option value="qr">QR Code</option>
        <option value="code">8 Digit Code</option>
      </select>
    </div>
    
    <button id="connectBtn" onclick="startPairing()">Start Connection</button>
    
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p style="margin-top: 10px; color: #a0a0a0;">Connecting...</p>
    </div>
    
    <div class="status" id="status"></div>
    
    <div class="qr-container" id="qrContainer">
      <h3 style="color: #8b5cf6; margin: 0 0 10px;">Scan QR</h3>
      <img id="qrImage" src="" alt="QR Code" />
      <p style="color: #a0a0a0; font-size: 12px; margin-top: 8px;">QR expires in 60 seconds</p>
    </div>
    
    <div class="code-display" id="codeDisplay"></div>
  </div>
  
  <script>
    let sessionId = null;
    let statusInterval = null;
    
    async function startPairing() {
      const phone = document.getElementById('phone').value.trim();
      const type = document.getElementById('connectionType').value;
      
      if (!phone) {
        showStatus('error', 'Please enter a phone number');
        return;
      }
      
      const btn = document.getElementById('connectBtn');
      btn.disabled = true;
      btn.textContent = 'Connecting...';
      
      document.getElementById('loading').style.display = 'block';
      document.getElementById('status').style.display = 'none';
      document.getElementById('qrContainer').style.display = 'none';
      document.getElementById('codeDisplay').style.display = 'none';
      
      try {
        const response = await fetch('/pairing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, type })
        });
        
        const data = await response.json();
        
        if (data.ok) {
          sessionId = data.sessionId;
          
          if (data.connected) {
            showStatus('success', 'Bot connected as ' + data.number);
            btn.textContent = 'Connected';
            return;
          }
          
          if (data.type === 'qr' && data.qr) {
            document.getElementById('qrImage').src = 'data:image/png;base64,' + data.qr;
            document.getElementById('qrContainer').style.display = 'block';
            showStatus('info', 'Scan QR with WhatsApp');
            startStatusCheck(sessionId);
          } else if (data.type === 'code' && data.code) {
            document.getElementById('codeDisplay').textContent = data.code;
            document.getElementById('codeDisplay').style.display = 'block';
            showStatus('info', 'Enter this code in WhatsApp');
            startStatusCheck(sessionId);
          }
        } else {
          showStatus('error', 'Error: ' + data.message);
          btn.disabled = false;
          btn.textContent = 'Start Connection';
        }
      } catch (error) {
        showStatus('error', 'Error: ' + error.message);
        btn.disabled = false;
        btn.textContent = 'Start Connection';
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    }
    
    function startStatusCheck(id) {
      if (statusInterval) clearInterval(statusInterval);
      
      let attempts = 0;
      const maxAttempts = 40;
      
      statusInterval = setInterval(async () => {
        attempts++;
        
        try {
          const response = await fetch('/pairing/status?id=' + id);
          const data = await response.json();
          
          if (data.connected) {
            clearInterval(statusInterval);
            showStatus('success', 'Sub-Bot connected successfully!');
            document.getElementById('qrContainer').style.display = 'none';
            document.getElementById('codeDisplay').style.display = 'none';
            document.getElementById('connectBtn').textContent = 'Connected';
            document.getElementById('connectBtn').disabled = false;
          } else if (data.expired || attempts >= maxAttempts) {
            clearInterval(statusInterval);
            showStatus('error', 'Timeout. Please try again');
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('connectBtn').textContent = 'Start Connection';
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 3000);
    }
    
    function showStatus(type, message) {
      const status = document.getElementById('status');
      status.className = 'status ' + type;
      status.innerHTML = message;
      status.style.display = 'block';
    }
  </script>
</body>
</html>
      `);
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