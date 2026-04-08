import { performance } from 'perf_hooks'
import os from 'os'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  try {
    let pp = "https://files.catbox.moe/8lfoj3.jpg"

    let totalreg = global.db?.data?.users ? Object.keys(global.db.data.users).length : 0
    let totalchats = global.db?.data?.chats ? Object.keys(global.db.data.chats).length : 0

    let groups = global.db?.data?.chats 
      ? Object.keys(global.db.data.chats).filter(id => id.endsWith('@g.us')).length 
      : 0

    let privados = totalchats - groups

    let muptime = clockString(process.uptime() * 1000)

    let start = performance.now()
    await new Promise(r => setTimeout(r, 10))
    let speed = performance.now() - start

    let ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
    let heap = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    let totalram = (os.totalmem() / 1024 / 1024).toFixed(0)
    let freemem = (os.freemem() / 1024 / 1024).toFixed(0)

    let cpu = os.cpus()[0]?.model || 'Desconocido'
    let cores = os.cpus().length
    let load = os.loadavg()[0].toFixed(2)

    let platform = process.platform
    let nodever = process.version
    let uptimeOS = clockString(os.uptime() * 1000)

    let modo = global.db?.data?.settings?.[conn.user.jid]?.self ? 'Privado' : 'Público'

    const imgFolder = path.join('./src/img')
    const imgFiles = fs.existsSync(imgFolder)
      ? fs.readdirSync(imgFolder).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      : []

    let contextInfo = {}

    if (imgFiles.length > 0) {
      contextInfo = {
        externalAdReply: {
          title: '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 | Estado',
          body: 'Dev • The Carlos 👑',
          mediaType: 2,
          thumbnail: fs.readFileSync(path.join(imgFolder, imgFiles[0]))
        }
      }
    }

    let texto = `
˚₊· ͟͟͞͞➳ ♱ *Estado Black Clover*

> ⚡ Velocidad
┃ ↳ ${speed.toFixed(4)} ms

> 🕰️ Actividad
┃ ↳ ${muptime}

> 💬 Chats
┃ ↳ ${privados} Privados
┃ ↳ ${groups} Grupos

> 👥 Usuarios
┃ ↳ ${totalreg}

> 💾 Memoria
┃ ↳ ${ram} MB / ${totalram} MB
┃ ↳ Libre: ${freemem} MB
┃ ↳ Heap: ${heap} MB

> 🧠 CPU
┃ ↳ ${cpu}
┃ ↳ ${cores} Núcleos • ${load} Load

> ⚙️ Sistema
┃ ↳ ${platform} • ${nodever}
┃ ↳ Server: ${uptimeOS}

> 🤖 Bot
┃ ↳ ${modo} • Prefijo: ${global.prefix || '.'}

╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: texto,
      contextInfo
    }, { quoted: m })

  } catch (e) {
    console.error("ERROR REAL:", e)
    m.reply('❌ Error en status, revisa consola')
  }
}

handler.command = ['status', 'estado', 'ping']
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}