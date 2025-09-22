import fs from 'fs'

global.welcome = fs.readFileSync('./src/Welcome.jpg')
global.adios = fs.readFileSync('./src/Bye.jpg')

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

    const welcomeAudio = 'https://files.catbox.moe/ha1slk.mp3'
    const goodbyeAudio = 'https://files.catbox.moe/5cslwo.mp3'

    if ([7, 27].includes(type)) {
      await conn.sendMessage(m.chat, {
        audio: { url: welcomeAudio },
        mimetype: 'audio/mpeg',
        fileName: 'welcome.mp3',
        contextInfo: {
          mentionedJid: mentionedJids,
          externalAdReply: {
            title: " Ｗ Ｅ Ｌ Ｃ Ｏ Ｍ Ｅ 👻 ",
            body: `${userName} ha llegado al grupo!`,
            thumbnail: global.welcome,
            previewType: "PHOTO",
            renderLargerThumbnail: true
          }
        }
      })
    }

    if ([28, 32].includes(type)) {
      await conn.sendMessage(m.chat, {
        audio: { url: goodbyeAudio },
        mimetype: 'audio/mpeg',
        fileName: 'goodbye.mp3',
        contextInfo: {
          mentionedJid: mentionedJids,
          externalAdReply: {
            title: " Ａ Ｄ Ｉ Ｏ Ｓ 🤡",
            body: `${userName} se ha despedido.`,
            thumbnail: global.adios,
            previewType: "PHOTO",
            renderLargerThumbnail: true
          }
        }
      })
    }

    return true
  } catch (err) {
    console.error('[ERROR en welcome/adios]:', err)
    return true
  }
}