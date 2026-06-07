import { performance } from 'perf_hooks'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { sizeFormatter } from 'human-readable'

const format = sizeFormatter({
  std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`
})

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let pp = "https://files.catbox.moe/8lfoj3.jpg"

    let totalreg = global.db?.data?.users? Object.keys(global.db.data.users).length : 0
    let totalchats = global.db?.data?.chats? Object.keys(global.db.data.chats).length : 0
    let groups = global.db?.data?.chats? Object.keys(global.db.data.chats).filter(id => id.endsWith('@g.us')).length : 0
    let privados = totalchats - groups
    let premium = global.db?.data?.users? Object.values(global.db.data.users).filter(u => u.premium).length : 0
    let banned = global.db?.data?.users? Object.values(global.db.data.users).filter(u => u.banned).length : 0

    let muptime = clockString(process.uptime() * 1000)

    let start = performance.now()
    await new Promise(r => setTimeout(r, 10))
    let speed = performance.now() - start

    let ram = process.memoryUsage()
    let totalram = os.totalmem()
    let freemem = os.freemem()

    let cpu = os.cpus()[0]?.model || 'Desconocido'
    let cores = os.cpus().length
    let load = os.loadavg()
    let arch = os.arch()

    let platform = process.platform
    let nodever = process.version
    let uptimeOS = clockString(os.uptime() * 1000)

    let modo = global.db?.data?.settings?.[conn.user.jid]?.self? 'Privado' : 'Público'
    let autobio = global.db?.data?.settings?.[conn.user.jid]?.autobio? 'On' : 'Off'
    let restrict = global.db?.data?.settings?.[conn.user.jid]?.restrict? 'On' : 'Off'

    const imgFolder = path.join('./src/img')
    let thumbnail = null
    try {
      if (fs.existsSync(imgFolder)) {
        const imgFiles = fs.readdirSync(imgFolder).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
        if (imgFiles.length) {
          thumbnail = fs.readFileSync(path.join(imgFolder, imgFiles[Math.floor(Math.random() * imgFiles.length)]))
        }
      }
    } catch {}

    let texto = `˚₊· ͟͟͞͞➳ ♱ *Estado Black Clover*\n\n`
    texto += `> ⚡ *Velocidad*\n`
    texto += `┃ ↳ ${speed.toFixed(2)} ms\n\n`
    texto += `> 🕰️ *Actividad*\n`
    texto += `┃ ↳ Bot: ${muptime}\n`
    texto += `┃ ↳ Server: ${uptimeOS}\n\n`
    texto += `> 💬 *Chats*\n`
    texto += `┃ ↳ Privados: ${privados}\n`
    texto += `┃ ↳ Grupos: ${groups}\n`
    texto += `┃ ↳ Total: ${totalchats}\n\n`
    texto += `> 👥 *Usuarios*\n`
    texto += `┃ ↳ Registrados: ${totalreg}\n`
    texto += `┃ ↳ Premium: ${premium}\n`
    texto += `┃ ↳ Baneados: ${banned}\n\n`
    texto += `> 💾 *Memoria*\n`
    texto += `┃ ↳ RAM: ${format(ram.rss)} / ${format(totalram)}\n`
    texto += `┃ ↳ Libre: ${format(freemem)}\n`
    texto += `┃ ↳ Heap: ${format(ram.heapUsed)}\n\n`
    texto += `> 🧠 *CPU*\n`
    texto += `┃ ↳ ${cpu}\n`
    texto += `┃ ↳ ${cores} Cores ${arch}\n`
    texto += `┃ ↳ Load: ${load[0].toFixed(2)}, ${load[1].toFixed(2)}, ${load[2].toFixed(2)}\n\n`
    texto += `> ⚙️ *Sistema*\n`
    texto += `┃ ↳ ${platform} • Node ${nodever}\n\n`
    texto += `> 🤖 *Bot*\n`
    texto += `┃ ↳ Modo: ${modo}\n`
    texto += `┃ ↳ Prefijo: ${global.prefix || '.'}\n`
    texto += `┃ ↳ AutoBio: ${autobio}\n`
    texto += `┃ ↳ Restrict: ${restrict}\n\n`
    texto += `╰━━━━━━━━━━━━━━━━━━⬣`

    let buttons = [
      { buttonId: `${usedPrefix}speed`, buttonText: { displayText: '⚡ Speed Test' }, type: 1 },
      { buttonId: `${usedPrefix}restart`, buttonText: { displayText: '🔄 Reiniciar' }, type: 1 },
      { buttonId: `${usedPrefix}gcinfo`, buttonText: { displayText: '📊 Info Grupos' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: thumbnail? thumbnail : { url: pp },
      caption: texto,
      footer: 'Black Clover MD • v2026',
      buttons: buttons,
      headerType: 4
    }, { quoted: m })

  } catch (e) {
    console.error("ERROR REAL:", e)
    m.reply('❌ Error en status, revisa consola')
  }
}

handler.speed = async (m, { conn }) => {
  let old = performance.now()
  await conn.sendMessage(m.chat, { text: 'Probando velocidad...' }, { quoted: m })
  let neww = performance.now()
  let speed = neww - old

  const downloads = await Promise.all([
    fetch('https://www.google.com').then(r => r.ok).catch(() => false),
    fetch('https://api.github.com').then(r => r.ok).catch(() => false),
    fetch('https://cdn.jsdelivr.net').then(r => r.ok).catch(() => false)
  ])

  let txt = `⚡ *SPEED TEST 2026*\n\n`
  txt += `▢ Latencia: ${speed.toFixed(2)} ms\n`
  txt += `▢ Google: ${downloads[0]? '✅' : '❌'}\n`
  txt += `▢ GitHub: ${downloads[1]? '✅' : '❌'}\n`
  txt += `▢ CDN: ${downloads[2]? '✅' : '❌'}\n`
  txt += `▢ Estado: ${speed < 100? 'Excelente' : speed < 300? 'Bueno' : 'Lento'}`

  await m.reply(txt)
}

handler.gcinfo = async (m, { conn }) => {
  const chats = global.db?.data?.chats || {}
  const groups = Object.entries(chats).filter(([id]) => id.endsWith('@g.us'))

  let totalUsers = 0
  let activeGroups = 0

  for (const [id, data] of groups) {
    try {
      const meta = await conn.groupMetadata(id)
      totalUsers += meta.participants.length
      if (data.isBanned!== true) activeGroups++
    } catch {}
  }

  let txt = `📊 *INFO GRUPOS 2026*\n\n`
  txt += `▢ Total grupos: ${groups.length}\n`
  txt += `▢ Grupos activos: ${activeGroups}\n`
  txt += `▢ Grupos baneados: ${groups.length - activeGroups}\n`
  txt += `▢ Usuarios totales: ${totalUsers}\n`
  txt += `▢ Promedio: ${Math.floor(totalUsers / groups.length)} users/grupo`

  await m.reply(txt)
}

handler.before = async (m, { conn }) => {
  if (m.text === '.speed') return handler.speed(m, { conn })
  if (m.text === '.gcinfo') return handler.gcinfo(m, { conn })
}

handler.help = ['status', 'estado', 'ping']
handler.tags = ['main']
handler.command = ['status','gcinfo','speed','restart', 'estado', 'ping']
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}