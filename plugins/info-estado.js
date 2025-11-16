import ws from 'ws'
import { performance } from 'perf_hooks'

let handler = async (m, { conn, usedPrefix }) => {
  let _muptime = 0
  let totalreg = Object.keys(global.db.data.users).length
  let totalchats = Object.keys(global.db.data.chats).length
  let vs = global.vs || '7.7.7'
  let pp = "https://files.catbox.moe/8lfoj3.jpg"

  if (process.send) {
    process.send('uptime')
    _muptime = await new Promise(resolve => {
      process.once('message', resolve)
      setTimeout(() => resolve(null), 1000)
    }) * 1000 || 0
  }

  let muptime = clockString(_muptime || 0)

  let users = [...new Set(global.conns.filter(connItem => 
    connItem.user && connItem.ws?.socket?.readyState === ws.OPEN
  ))]

  const chats = Object.entries(conn.chats || {}).filter(([id, data]) => data?.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
  const totalUsers = users.length

  let old = performance.now()
  let neww = performance.now()
  let speed = neww - old

  let blackclover = `
╭━━━━◇◇◇━━━━⬣
┃ ⚙️  *SISTEMA DE ESTADO*
┃ 🔰 *BLACK CLOVER BOT* ⚔️
╰━━━━◇◇◇━━━━⬣

👑 *Creador:* the-carlos
📟 *Prefijo:* [ ${usedPrefix} ]
📦 *Versión:* ${vs}

📊 *Usuarios registrados:* ${totalreg}
💬 *Total de chats:* ${totalchats}
📢 *Grupos:* ${groupsIn.length}
📩 *Privados:* ${totalchats - groupsIn.length}
🧪 *SubBots activos:* ${totalUsers || '0'}

🕰️ *Actividad:* ${muptime}
🚀 *Velocidad:* ${speed.toFixed(3)}s

📣 *Canal oficial:* 
https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04

`.trim()

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      contactMessage: {
        displayName: "Subbot",
        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Subbot;;;\nFN:Subbot\nEND:VCARD"
      }
    }
  }

  await conn.sendMessage(m.chat, { image: { url: pp }, caption: blackclover }, { quoted: fkontak })
}

handler.help = ['status']
handler.tags = ['info']
handler.command = ['estado', 'status', 'estate', 'state', 'stado', 'stats']
handler.register = true

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}