import fs from 'fs'
import path from 'path'

const imgDir = path.resolve('./src/img')
let images = []

try {
  images = fs.readdirSync(imgDir).filter(file => /\.(jpe?g|png|webp)$/i.test(file))
} catch {
  images = []
}

global.getRandomImage = () => {
  if (!images.length) return null
  const file = images[Math.floor(Math.random() * images.length)]
  return fs.readFileSync(path.join(imgDir, file))
}

export async function before(m, { conn }) {
  try {
    if (!m.isGroup) return true

    const chat = global.db.data.chats[m.chat]
    if (!chat || !chat.welcome) return true

    const type = m.messageStubType
    if (![7, 27, 28, 32].includes(type)) return true

    const params = m.messageStubParameters || []
    const who = (params[0] || m.participant || '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (!who) return true

    const user = global.db.data.users[who] || {}
    const userName = user.name || await conn.getName(who)
    const mentionedJid = [who]

    const thumbnail = global.getRandomImage() || null

    const audioWelcome = 'https://files.catbox.moe/ha1slk.mp3'
    const audioGoodbye = 'https://files.catbox.moe/5cslwo.mp3'

    if ([7, 27].includes(type)) {
      const texto = `
˚₊· ͟͟͞͞➳ ♱ *Bienvenido*

┃ 👤 @${who.split('@')[0]}
┃ ✨ ${userName}
┃ 📥 Se ha unido al grupo

╰━━━━━━━━━━━━━━━━⬣
`.trim()

      await conn.sendMessage(m.chat, {
        audio: { url: audioWelcome },
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: {
          mentionedJid,
          externalAdReply: {
            title: '─ W E L C O M E ─🥷🏻',
            body: `${userName} se unió`,
            thumbnail,
            mediaType: 1,
            renderLargerThumbnail: false,
            sourceUrl: "https://wa.me/" + who.split('@')[0]
          }
        }
      }, { quoted: m })

      await conn.sendMessage(m.chat, {
        text: texto,
        mentions: mentionedJid
      }, { quoted: m })
    }

    if ([28, 32].includes(type)) {
      const texto = `
˚₊· ͟͟͞͞➳ ♱ *Despedida*

┃ 👤 @${who.split('@')[0]}
┃ 💨 ${userName}
┃ 📤 Ha salido del grupo

╰━━━━━━━━━━━━━━━━⬣
`.trim()

      await conn.sendMessage(m.chat, {
        audio: { url: audioGoodbye },
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: {
          mentionedJid,
          externalAdReply: {
            title: '─ A D I Ó S ─👋🏻',
            body: `${userName} salió`,
            thumbnail,
            mediaType: 1,
            renderLargerThumbnail: false,
            sourceUrl: "https://wa.me/" + who.split('@')[0]
          }
        }
      }, { quoted: m })

      await conn.sendMessage(m.chat, {
        text: texto,
        mentions: mentionedJid
      }, { quoted: m })
    }

    return true
  } catch (err) {
    console.error('[ERROR en welcome/adios]:', err)
    return true
  }
}