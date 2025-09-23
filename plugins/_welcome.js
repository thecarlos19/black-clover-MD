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
  if (images.length === 0) return null
  const randomImage = images[Math.floor(Math.random() * images.length)]
  return fs.readFileSync(path.join(imgDir, randomImage))
}

export async function before(m, { conn }) {
  try {
    if (!m.isGroup) return true
    const chat = global.db.data.chats[m.chat]
    if (!chat || !chat.welcome) return true

    const type = m.messageStubType
    if (![7, 27, 28, 32].includes(type)) return true

    const params = m.messageStubParameters || []
    if (params.length === 0 && !m.participant) return true

    const who = (params[0] || m.participant) + '@s.whatsapp.net'
    const user = global.db.data.users[who]
    const userName = user ? user.name : await conn.getName(who)
    const mentionedJids = [who]

    const audioWelcome = 'https://files.catbox.moe/ha1slk.mp3'
    const audioGoodbye = 'https://files.catbox.moe/5cslwo.mp3'
    const thumbnailBuffer = global.getRandomImage()

    if ([7, 27].includes(type)) {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audioWelcome },
          mimetype: 'audio/mpeg',
          fileName: 'welcome.mp3',
          contextInfo: {
            mentionedJid: mentionedJids,
            externalAdReply: {
              title: "─ W E L C O M E ─🥷🏻",
              body: `${userName} ha llegado al grupo!`,
              thumbnail: thumbnailBuffer,
              mediaType: 1,
              renderLargerThumbnail: false,
              sourceUrl: "https://wa.me/" + who.split('@')[0]
            }
          }
        },
        { quoted: m }
      )
    }

    if ([28, 32].includes(type)) {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audioGoodbye },
          mimetype: 'audio/mpeg',
          fileName: 'goodbye.mp3',
          contextInfo: {
            mentionedJid: mentionedJids,
            externalAdReply: {
              title: "─Ａ Ｄ Ｉ Ō S─👋🏻",
              body: `${userName} se ha despedido.`,
              thumbnail: thumbnailBuffer,
              mediaType: 1,
              renderLargerThumbnail: false,
              sourceUrl: "https://wa.me/" + who.split('@')[0]
            }
          }
        },
        { quoted: m }
      )
    }

    return true
  } catch (err) {
    console.error('[ERROR en welcome/adios]:', err)
    return true
  }
}