import { performance } from 'perf_hooks'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  if (command === 'downloadrepo') {
    await m.react('⏳')
    try {
      const res = await fetch('https://github.com/thecarlos19/Black-clover-MD/archive/refs/heads/main.zip')
      const buffer = await res.buffer()
      await conn.sendMessage(m.chat, {
        document: buffer,
        mimetype: 'application/zip',
        fileName: 'Black-Clover-MD.zip',
        caption: '📦 *Black Clover MD*\n\n> No olvides dejar tu ⭐ en el repositorio\n\nhttps://github.com/thecarlos19/Black-clover-MD'
      }, { quoted: m })
      await m.react('✅')
    } catch {
      await m.reply('❌ Error al descargar el repositorio')
    }
    return
  }

  const start = performance.now()
  const uptime = clockString(process.uptime() * 1000)
  const ping = (performance.now() - start).toFixed(2)
  const users = Object.keys(global.db.data.users).length
  
  const texto = `
 _*𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 *_ 🥷
 
> 🤖 𝙑𝙚𝙧𝙨𝙞𝙤𝙣 » 2026
> ⏳ 𝘼𝙘𝙩𝙞𝙫𝙤 » ${uptime}
> 📊 𝙋𝙞𝙣𝙜 » ${ping} ms
> 👥 𝙐𝙨𝙪𝙖𝙧𝙞𝙤𝙨 » ${users}

\`\`\`Repositorio OFC:\`\`\`
https://github.com/thecarlos19/Black-clover-MD

> 🌟 Deja tu estrellita ayudaría mucho :D
> 📦 Descarga el código con el botón de abajo

  `.trim()

  const buttons = [
    { buttonId: `${usedPrefix}downloadrepo`, buttonText: { displayText: '📦 DESCARGAR BOT' }, type: 1 },
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📜 MENU' }, type: 1 },
    { buttonId: `${usedPrefix}owner`, buttonText: { displayText: '👑 CREADOR' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: texto,
    footer: '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 | 𝕳𝖆𝖐 v777 ☘️',
    buttons: buttons,
    headerType: 1,
    contextInfo: {
      mentionedJid: [m.sender]
    }
  }, { quoted: m })
}

handler.help = ['script', 'sc', 'repo']
handler.tags = ['info']
handler.command = ['script', 'sc', 'repo', 'git', 'downloadrepo']

export default handler

const clockString = ms =>
  [3600000, 60000, 1000].map((v, i) =>
    String(Math.floor(ms / v) % (i? 60 : 99)).padStart(2, '0')
  ).join(':')