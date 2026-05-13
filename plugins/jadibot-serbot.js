/*
⚠ PROHIBIDO EDITAR ⚠ 

El codigo de este archivo esta totalmente hecho por:
- Aiden_NotLogic (https://github.com/ferhacks)

*El archivo original del MysticBot-MD fue liberado en mayo del 2024 aceptando su liberacion*

El codigo de este archivo fue parchado en su momento por:
- BrunoSobrino >> https://github.com/BrunoSobrino

El codigo fue modificado para Black-clover-MD:
- Black-clover-MD (https://github.com/thecarlos19/Black-clover-MD)

Adaptacion y edición echa por:
- The carlos (https://github.com/thecarlos19)

⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠
*/


import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { fileURLToPath } from 'url'
import { makeWASocket } from '../lib/simple.js'

const { exec } = await import('child_process')
const { CONNECTING } = ws

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"

let drm1 = ""
let drm2 = ""

let rtx =
`˚₊·✞『 𝗕𝗹𝗮𝗰𝗸 𝗖𝗹𝗼𝘃𝗲𝗿 - 𝗦𝘂𝗯 𝗕𝗼𝘁 』✞·—̳͟͞͞₊˚  

📲 *Escanea el Grimorio QR desde tu WhatsApp:*  
⋮ > *Dispositivos vinculados* > *Escanear código*  

⏳ *El sello mágico dura solo 45 segundos...*

🔥 *Conviértete en un Sub-Bot Temporal y sirve al Reino Mágico*  
🧿 *Tu energía quedará vinculada al Grimorio principal*`

let rtx2 =
`˚₊·✞『 𝗕𝗹𝗮𝗰𝗸 𝗖𝗹𝗼𝘃𝗲𝗿 - 𝗦𝘂𝗯 𝗕𝗼𝘁 』✞·—̳͟͞͞₊˚  
 
🜲 *Usa este Código Espiritual para convertirte en un ✧ Sub-Bot Temporal bajo el contrato del Reino de las Sombras.*  

⏳ *Atención, Guerrero de las Sombras:* este vínculo es delicado.  
⚠️ *No uses tu cuenta principal, emplea una réplica espiritual o una forma secundaria.*  

🧿 *SISTEMA ➤ [ CÓDIGO ACTIVO ] — Activa el vínculo cuando estés preparado* ⚔️`

const maxSubBots = 500

let blackJBOptions = {}

if (!global.conns) global.conns = []

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
    return m.reply(`El Comando *${command}* está desactivado temporalmente.`)
  }

  let time = global.db.data.users[m.sender].Subs + 120000
  if (new Date() - global.db.data.users[m.sender].Subs < 120000) {
    let remaining = time - new Date()
    setTimeout(() => {
      conn.reply(m.chat, `*Ya estás listo para conectarte de nuevo 🗿*`, m)
    }, remaining)
    return conn.reply(m.chat, `⏳ Debes esperar ${msToTime(remaining)} para volver a vincular un *Sub-Bot.*`, m)
  }

  const subBots = [...new Set(
    global.conns.filter(c =>
      c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED
    ).map(c => c)
  )]

  const subBotsCount = subBots.length

  if (subBotsCount >= maxSubBots) {
    return m.reply(`❌ No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }
  
  const availableSlots = maxSubBots - subBotsCount

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split('@')[0]}`
  let pathblackJadiBot = path.join(process.cwd(), 'núcleo•clover', 'blackJadiBot', id)

  if (!fs.existsSync(pathblackJadiBot)) {
    fs.mkdirSync(pathblackJadiBot, { recursive: true })
  }
  
  blackJBOptions.pathblackJadiBot = pathblackJadiBot
  blackJBOptions.m = m
  blackJBOptions.conn = conn
  blackJBOptions.args = args
  blackJBOptions.usedPrefix = usedPrefix
  blackJBOptions.command = command
  blackJBOptions.fromCommand = true

  await blackJadiBot(blackJBOptions)

  global.db.data.users[m.sender].Subs = new Date() * 1
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']

export default handler

export async function blackJadiBot(options) {
  let { pathblackJadiBot, m, conn, args, usedPrefix, command } = options
  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }
  const mcode = args[0] && /(--code|code)/.test(args[0].trim())
    ? true
    : args[1] && /(--code|code)/.test(args[1].trim())
      ? true
      : false
  let txtCode, codeBot, txtQR
  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] == "") args[0] = undefined
  }
  const pathCreds = path.join(pathblackJadiBot, "creds.json")
  if (!fs.existsSync(pathblackJadiBot)) {
    fs.mkdirSync(pathblackJadiBot, { recursive: true })
  }
  try {
    if (args[0] && args[0] != undefined) {
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
    }
  } catch {
    conn.reply(m.chat, `⚠️ Use correctamente el comando » ${usedPrefix + command}`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")

  global.conns = global.conns || []

  exec(comb.toString("utf-8"), async () => {

    const { version } = await fetchLatestBaileysVersion()
    const msgRetry = () => { }
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathblackJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      msgRetry,
      msgRetryCache,
      browser: mcode ? Browsers.macOS("Chrome") : Browsers.macOS("Desktop"),
      version: version,
      generateHighQualityLinkPreview: false
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    let reconnectAttempts = 0
    let lastReconnect = 0
    let maxReconnectDelay = 60000

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !mcode) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() }, { quoted: m })
        } else {
          return
        }
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 30000)
        }
        return
      }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode((m.sender?.split('@')[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")
        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(secret)
        console.log(secret)
      }

      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000)
      }
      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }) }, 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      if (connection === 'close') {
        const now = Date.now()
        const delay = Math.min(5000 * (reconnectAttempts + 1), maxReconnectDelay)

        if (now - lastReconnect < delay) return
        lastReconnect = now
        reconnectAttempts++

        if (reason === 428 || reason === 408) {
          console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ La conexión (+${path.basename(pathblackJadiBot)}) fue cerrada inesperadamente o expiró. Intentando reconectar...\n╰─────────────────────────`))
          await new Promise(r => setTimeout(r, delay))
          return creloadHandler(true).catch(() => {})
        }

        if (reason === 440) {
          console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ La conexión (+${path.basename(pathblackJadiBot)}) fue reemplazada por otra sesión activa.\n╰─────────────────────────`))
          try {
            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, { text: 'HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR\n\n> SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE' }, { quoted: m || null }) : ""
          } catch {}
          return
        }

        if (reason == 405 || reason == 401) {
          console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ La sesión (+${path.basename(pathblackJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰─────────────────────────`))
          try {
            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, { text: 'SESIÓN PENDIENTE\n\n> INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT' }, { quoted: m || null }) : ""
          } catch {}
          try { fs.rmSync(pathblackJadiBot, { recursive: true, force: true }) } catch {}
          return
        }

        if (reason === 500) {
          console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ Conexión perdida en la sesión (+${path.basename(pathblackJadiBot)})\n╰─────────────────────────`))
          if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, { text: 'CONEXIÓN PÉRDIDA\n\n> INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT' }, { quoted: m || null }) : ""
          await new Promise(r => setTimeout(r, delay))
          return creloadHandler(true).catch(() => {})
        }

        if (reason === 515 || !reason) {
          console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ Reinicio automático para la sesión (+${path.basename(pathblackJadiBot)}).\n╰─────────────────────────`))
          await new Promise(r => setTimeout(r, delay))
          return creloadHandler(true).catch(() => {})
        }

        if (reason === 403) {
          console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathblackJadiBot)})\n╰─────────────────────────`))
          try { fs.rmSync(pathblackJadiBot, { recursive: true, force: true }) } catch {}
          return
        }
      }

      if (connection === 'open') {
        reconnectAttempts = 0
        let userName = sock.authState.creds.me?.name || 'Anónimo'

        console.log(
          chalk.bold.cyanBright(
            `\n❒────────────【• SUB-BOT  •】────────────❒\n│\n│ 🟢 ${userName} (+${path.basename(pathblackJadiBot)}) conectado exitosamente.\n│\n❒────────────【• CONECTADO •】────────────❒`
          )
        )

        sock.isInit = true
        global.conns.push(sock)

        try {
          await sock.groupAcceptInvite('IJjWzYg976PFSXOJ3uJDOM')
        } catch {}

        if (m?.chat)
          await conn.sendMessage(
            m.chat,
            {
              text: args[0]
                ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...`
                : `@${m.sender.split('@')[0]}, *genial ya eres parte de nuestra familia black-clover Sub-Bots.*\n> Usa el comando .personalizar para personalizar tu bot y que quede a tu gusto XD `,
              mentions: [m.sender]
            },
            { quoted: m }
          )
      }
    }

    setInterval(async () => {
      try {
        if (!sock?.user) {
          try { sock.ws?.close() } catch {}
          try { sock.ev.removeAllListeners() } catch {}
          let i = global.conns.indexOf(sock)
          if (i >= 0) global.conns.splice(i, 1)
        }
      } catch {}
    }, 60000)

    let handler = await import('../núcleo•clover/handler.js')

    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../núcleo•clover/handler.js?update=${Date.now()}`).catch(() => {})
        if (Handler && Object.keys(Handler).length) handler = Handler
      } catch {}

      if (restatConn) {
        const oldChats = sock?.chats || {}
        try { sock.ws?.close() } catch {}
        try { sock.ev.removeAllListeners() } catch {}
        sock = makeWASocket(connectionOptions)
        sock.chats = oldChats
        isInit = true
      }

      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off("creds.update", sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock)

      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)

      isInit = false
      return true
    }

    creloadHandler(false)
  })
}