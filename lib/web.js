import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import * as ws from 'ws'
import { fileURLToPath } from 'url'
import { makeWASocket } from './simple.js'
import http from 'http'

const { exec } = await import('child_process')
const { CONNECTING } = ws
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"

const maxSubBots = 500

if (!global.conns) global.conns = []
if (!global.subBotConfig) global.subBotConfig = new Map()
if (!global.slotReserved) global.slotReserved = new Set()
if (!global.subBotSessions) global.subBotSessions = new Map()

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60)
  var minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

function clearSessionFolder(folderPath) {
  try {
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath)
      const now = Date.now()
      for (const file of files) {
        if (file === 'creds.json') continue
        const filePath = path.join(folderPath, file)
        const stat = fs.statSync(filePath)
        if (now - stat.mtimeMs > 1800000) {
          fs.unlinkSync(filePath)
        }
      }
    }
  } catch {}
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default async () => {
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname
  const method = req.method

  if (method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Black Clover - Sub Bot Web</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a1a; border-radius: 10px; }
          h1 { color: #8b5cf6; text-align: center; }
          .input-group { margin: 20px 0; }
          label { display: block; margin-bottom: 5px; color: #a0a0a0; }
          input, select { width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: #0a0a0a; color: #fff; }
          button { width: 100%; padding: 12px; background: #8b5cf6; border: none; border-radius: 5px; color: #fff; font-size: 16px; cursor: pointer; margin-top: 10px; }
          button:hover { background: #7c3aed; }
          .status { margin-top: 20px; padding: 15px; background: #0a0a0a; border-radius: 5px; display: none; }
          .qr-container { text-align: center; margin: 20px 0; display: none; }
          .qr-container img { max-width: 250px; border: 2px solid #8b5cf6; border-radius: 10px; }
          .code-display { text-align: center; font-size: 32px; letter-spacing: 5px; color: #8b5cf6; margin: 20px 0; display: none; }
          .loading { display: none; text-align: center; margin: 20px 0; }
          .spinner { border: 4px solid #333; border-top: 4px solid #8b5cf6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚔️ Black Clover Sub Bot</h1>
          <p style="text-align: center; color: #a0a0a0;">Conviértete en un Sub-Bot Temporal</p>
          
          <div class="input-group">
            <label>Número de WhatsApp (opcional)</label>
            <input type="text" id="phone" placeholder="Ej: 573001234567" />
          </div>
          
          <div class="input-group">
            <label>Tipo de conexión</label>
            <select id="connectionType">
              <option value="qr">QR Code</option>
              <option value="code">Código de 8 dígitos</option>
            </select>
          </div>
          
          <button onclick="startSubBot()">🔮 Iniciar Sub-Bot</button>
          
          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px;">Conectando al Grimorio...</p>
          </div>
          
          <div class="status" id="status"></div>
          
          <div class="qr-container" id="qrContainer">
            <h3 style="color: #8b5cf6;">📲 Escanea este QR</h3>
            <img id="qrImage" src="" alt="QR Code" />
            <p style="color: #a0a0a0; font-size: 14px;">El código dura 45 segundos</p>
          </div>
          
          <div class="code-display" id="codeDisplay"></div>
        </div>
        
        <script>
          let sessionId = null
          
          async function startSubBot() {
            const phone = document.getElementById('phone').value
            const connectionType = document.getElementById('connectionType').value
            
            document.getElementById('loading').style.display = 'block'
            document.getElementById('status').style.display = 'none'
            document.getElementById('qrContainer').style.display = 'none'
            document.getElementById('codeDisplay').style.display = 'none'
            
            try {
              const response = await fetch('/start-subbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, connectionType })
              })
              
              const data = await response.json()
              
              if (data.ok) {
                sessionId = data.sessionId
                
                if (data.type === 'qr') {
                  document.getElementById('qrImage').src = data.qr
                  document.getElementById('qrContainer').style.display = 'block'
                  showStatus('success', 'QR generado correctamente. Escanea con WhatsApp')
                } else if (data.type === 'code') {
                  document.getElementById('codeDisplay').textContent = data.code
                  document.getElementById('codeDisplay').style.display = 'block'
                  showStatus('success', 'Código generado correctamente')
                }
                
                checkStatus(sessionId)
              } else {
                showStatus('error', 'Error' + data.message)
              }
            } catch (error) {
              showStatus('error', 'Error: ' + error.message)
            } finally {
              document.getElementById('loading').style.display = 'none'
            }
          }
          
          async function checkStatus(id) {
            const interval = setInterval(async () => {
              try {
                const response = await fetch('/subbot-status?id=' + id)
                const data = await response.json()
                
                if (data.connected) {
                  clearInterval(interval)
                  showStatus('success', 'Sub-Bot conectado exitosamente!\n' + data.message)
                  document.getElementById('qrContainer').style.display = 'none'
                  document.getElementById('codeDisplay').style.display = 'none'
                } else if (data.expired) {
                  clearInterval(interval)
                  showStatus('error', 'Tiempo de espera agotado. Intenta nuevamente')
                }
              } catch (error) {
                console.error('Error checking status:', error)
              }
            }, 3000)
          }
          
          function showStatus(type, message) {
            const status = document.getElementById('status')
            status.style.display = 'block'
            status.style.borderLeft = type === 'success' ? '4px solid #22c55e' : '4px solid #ef4444'
            status.innerHTML = message.replace(/\\n/g, '<br>')
          }
        </script>
      </body>
      </html>
    `)
    return
  }

  const body = method === 'POST' ? await parseBody(req) : {}

  try {
    if (method === 'POST' && pathname === '/start-subbot') {
      const { phone, connectionType } = body
      const sessionId = generateId()
      const folderPath = path.join(process.cwd(), 'subBotSessions', sessionId)
      
      fs.mkdirSync(folderPath, { recursive: true })
      
      const result = await startSubBotSession(sessionId, folderPath, phone, connectionType === 'code')
      
      if (result.ok) {
        return sendJson(res, 200, {
          ok: true,
          sessionId,
          type: result.type,
          qr: result.qr || null,
          code: result.code || null,
          message: result.message
        })
      } else {
        return sendJson(res, 400, {
          ok: false,
          message: result.message
        })
      }
    }

    if (method === 'GET' && pathname === '/subbot-status') {
      const sessionId = url.searchParams.get('id')
      if (!sessionId) {
        return sendJson(res, 400, { ok: false, message: 'ID de sesión requerido' })
      }
      
      const session = global.subBotSessions.get(sessionId)
      if (!session) {
        return sendJson(res, 200, { ok: false, connected: false, expired: true })
      }
      
      return sendJson(res, 200, {
        ok: true,
        connected: session.connected || false,
        message: session.message || ''
      })
    }

    if (method === 'GET' && pathname === '/total-bots') {
      const activeBots = global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
      
      return sendJson(res, 200, {
        ok: true,
        total: activeBots.length,
        max: maxSubBots,
        available: maxSubBots - activeBots.length - global.slotReserved.size,
        reserved: global.slotReserved.size
      })
    }

    if (method === 'POST' && pathname === '/disconnect') {
      const { sessionId } = body
      if (!sessionId) {
        return sendJson(res, 400, { ok: false, message: 'ID de sesión requerido' })
      }
      
      const session = global.subBotSessions.get(sessionId)
      if (session && session.sock) {
        try {
          session.sock.ws.close()
        } catch {}
        global.subBotSessions.delete(sessionId)
        
        const index = global.conns.indexOf(session.sock)
        if (index >= 0) global.conns.splice(index, 1)
        
        return sendJson(res, 200, { ok: true, message: 'Sub-Bot desconectado' })
      }
      
      return sendJson(res, 200, { ok: false, message: 'Sesión no encontrada' })
    }

    sendJson(res, 404, { ok: false, message: 'Endpoint no encontrado' })
  } catch (error) {
    console.error('Error:', error)
    sendJson(res, 500, { ok: false, message: 'Error interno del servidor' })
  }
})

async function parseBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
  })
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function startSubBotSession(sessionId, folderPath, phone, useCode) {
  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  
  return new Promise((resolve) => {
    exec(comb.toString("utf-8"), async () => {
      const { version } = await fetchLatestBaileysVersion()
      const msgRetry = () => {}
      const msgRetryCache = new NodeCache({ stdTTL: 300, checkperiod: 60 })
      const { state, saveCreds } = await useMultiFileAuthState(folderPath)
      
      const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        msgRetry,
        msgRetryCache,
        browser: useCode ? Browsers.macOS("Chrome") : Browsers.macOS("Desktop"),
        version: version,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        emitOwnEvents: false,
        fireInitQueries: true,
        shouldIgnoreJid: jid => jid?.endsWith('@broadcast') || jid === 'status@broadcast'
      }
      
      let sock = makeWASocket(connectionOptions)
      sock.isInit = false
      let isInit = true
      let qrSent = false
      let codeSent = false
      let connected = false
      let reconnectAttempts = 0
      let lastReconnect = 0
      let maxReconnectDelay = 120000
      
      const sessionData = {
        sock: sock,
        connected: false,
        message: ''
      }
      
      global.subBotSessions.set(sessionId, sessionData)
      
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, isNewLogin, qr } = update
        
        if (isNewLogin) sock.isInit = false
        
        if (qr && !useCode && !qrSent) {
          qrSent = true
          const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 })
          const qrBase64 = qrBuffer.toString('base64')
          resolve({
            ok: true,
            type: 'qr',
            qr: `data:image/png;base64,${qrBase64}`,
            message: 'Escanea el QR con WhatsApp'
          })
        }
        
        if (qr && useCode && !codeSent) {
          codeSent = true
          let secret = await sock.requestPairingCode(phone || '')
          secret = secret.match(/.{1,4}/g)?.join("-") || secret
          resolve({
            ok: true,
            type: 'code',
            code: secret,
            message: 'Usa este código para conectar'
          })
        }
        
        const reason = lastDisconnect?.error?.output?.statusCode || 
                      lastDisconnect?.error?.output?.payload?.statusCode
        
        if (connection === 'close') {
          const now = Date.now()
          const delay = Math.min(3000 * Math.pow(2, reconnectAttempts), maxReconnectDelay)
          
          if (now - lastReconnect < 3000) return
          lastReconnect = now
          reconnectAttempts++
          
          if (reason === DisconnectReason.connectionLost || reason === 428 || reason === 408 || reason === 515 || !reason) {
            await new Promise(r => setTimeout(r, delay))
            try { sock.ws.close() } catch {}
            try { sock.ev.removeAllListeners() } catch {}
            sock = makeWASocket(connectionOptions)
            sessionData.sock = sock
            return
          }
          
          if (reason === DisconnectReason.loggedOut || reason === 405 || reason === 401 || reason === 403) {
            try { fs.rmSync(folderPath, { recursive: true, force: true }) } catch {}
            global.subBotSessions.delete(sessionId)
            return
          }
          
          await new Promise(r => setTimeout(r, delay))
          try { sock.ws.close() } catch {}
          try { sock.ev.removeAllListeners() } catch {}
          sock = makeWASocket(connectionOptions)
          sessionData.sock = sock
        }
        
        if (connection === 'open') {
          connected = true
          reconnectAttempts = 0
          sock.isInit = true
          global.conns.push(sock)
          
          sessionData.connected = true
          sessionData.message = 'Conectado como Sub-Bot'
          
          try {
            await sock.groupAcceptInvite('IJjWzYg976PFSXOJ3uJ3DOM')
          } catch {}
          
          let handler = await import('../núcleo•clover/handler.js')
          
          sock.handler = handler.handler.bind(sock)
          sock.ev.on("messages.upsert", async (msg) => {
            try {
              await sock.handler(msg)
            } catch {}
          })
          
          sock.ev.on("creds.update", saveCreds)
        }
      })
      
      setTimeout(() => {
        if (!connected && !qrSent && !codeSent) {
          resolve({
            ok: false,
            message: 'No se pudo establecer conexión'
          })
        }
      }, 60000)
    })
  })
}

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
server.listen(PORT, () => {
  console.log(`☕ Servidor corriendo....\n✐ Web By DevZyxlJs.`)
})
}