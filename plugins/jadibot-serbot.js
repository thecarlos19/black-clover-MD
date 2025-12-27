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


import { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import * as ws from "ws"
import { fileURLToPath } from "url"
import { makeWASocket } from "../lib/simple.js"

const { exec } = await import("child_process")

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"

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

const maxSubBots = 1000

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
      conn.reply(m.chat, `> Ya estás listo para conectarte de nuevo 🗿`, m)
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
  

  let who = m.mentionedJid?.[0] || m.sender
  let id = who.split("@")[0]

  const baseDir = "./blackJadiBot"
  const pathblackJadiBot = path.join(baseDir, id)

  fs.mkdirSync(pathblackJadiBot, { recursive: true })

  await blackJadiBot({
    pathblackJadiBot,
    m,
    conn,
    args,
    usedPrefix,
    command,
    fromCommand: true
  })

  global.db.data.users[m.sender].Subs = Date.now()
}

handler.help = ["qr", "code"]
handler.tags = ["serbot"]
handler.command = ["qr", "code"]

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
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] === "") args[0] = undefined
  }

  const pathCreds = path.join(pathblackJadiBot, "creds.json")

  if (!fs.existsSync(pathblackJadiBot)) {
    fs.mkdirSync(pathblackJadiBot, { recursive: true })
  }

  try {
    if (args[0]) {
      fs.writeFileSync(
        pathCreds,
        JSON.stringify(
          JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")),
          null,
          '\t'
        )
      )
    }
  } catch {
    conn.reply(m.chat, `⚠️ Use correctamente el comando » ${usedPrefix + command}`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")

  exec(comb.toString("utf-8"), async () => {
    const { version } = await fetchLatestBaileysVersion()
    const msgRetry = () => {}
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathblackJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetry,
      msgRetryCache,
      browser: mcode ? Browsers.macOS("Chrome") : Browsers.macOS("Desktop"),
      version,
      generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !mcode) {
        txtQR = await conn.sendMessage(
          m.chat,
          { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() },
          { quoted: m }
        )
        if (txtQR?.key) {
          setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
        }
        return
      }

      if (qr && mcode) {
        let addNumber = m.sender.split('@')[0]
        let code = await sock.requestPairingCode(addNumber)
        code = code?.match(/.{1,4}/g)?.join('-') || code

        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(code)

        console.log(chalk.bgGreen.black('✞ Código:'), chalk.white(code))

        if (txtCode?.key) {
          setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
        }
        if (codeBot?.key) {
          setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
        }
        return
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      if (connection === 'close') {
        if (reason === 428 || reason === 408) {
          await creloadHandler(true).catch(console.error)
        }

        if (reason === 440) {
          try {
            if (options.fromCommand && m?.chat) {
              await conn.sendMessage(
                `${path.basename(pathblackJadiBot)}@s.whatsapp.net`,
                { text: 'HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR\n\n> SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE' },
                { quoted: m }
              )
            }
          } catch {}
        }

        if (reason === 405 || reason === 401) {
          try {
            if (options.fromCommand && m?.chat) {
              await conn.sendMessage(
                `${path.basename(pathblackJadiBot)}@s.whatsapp.net`,
                { text: 'SESIÓN PENDIENTE\n\n> INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT' },
                { quoted: m }
              )
            }
          } catch {}
          fs.rmdirSync(pathblackJadiBot, { recursive: true })
        }

        if (reason === 500) {
          if (options.fromCommand && m?.chat) {
            await conn.sendMessage(
              `${path.basename(pathblackJadiBot)}@s.whatsapp.net`,
              { text: 'CONEXIÓN PÉRDIDA\n\n> INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT' },
              { quoted: m }
            )
          }
          return creloadHandler(true)
        }

        if (reason === 515) {
          await creloadHandler(true)
        }

        if (reason === 403) {
          fs.rmdirSync(pathblackJadiBot, { recursive: true })
        }
      }

      if (connection === 'open') {
        if (!global.db.data?.users) loadDatabase()

        sock.isInit = true
        global.conns.push(sock)

        if (m?.chat) {
          await conn.sendMessage(
            m.chat,
            {
              text: args[0]
                ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...`
                : `@${m.sender.split('@')[0]}, *genial ya eres parte de nuestra familia black-clover Sub-Bots.*\n> Usa el comando .personalizar para personalizar tu bot`,
              mentions: [m.sender]
            },
            { quoted: m }
          )
        }
      }
    }

    setInterval(() => {
      if (!sock.user) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
      }
    }, 60000)

    let handler = await import('../handler.js')

    let creloadHandler = async function (restartConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`)
        if (Object.keys(Handler).length) handler = Handler
      } catch {}

      if (restartConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }

      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off("creds.update", sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)

      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)

      isInit = false
      return true
    }

    creloadHandler(false)
  })
}