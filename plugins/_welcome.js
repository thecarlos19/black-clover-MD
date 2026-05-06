import fs from 'fs'
import path from 'path'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.isGroup) return

  const chat = global.db.data.chats[m.chat]
  if (!chat || !chat.welcome) return

  let metadata = groupMetadata || await conn.groupMetadata(m.chat).catch(() => null)
  if (!metadata) return

  let groupName = metadata.subject
  let pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null)

  const welcomeTitles = [
    '👋 Welcome ',
    '✨ Bienvenido',
    '🍀 Nuevo integrante',
    '⚔️ Se une un mago',
    '🌟 Llegó alguien nuevo'
  ]

  const byeTitles = [
    '👋 Goodbye',
    '⚠️ Alguien salió',
    '🌙 Hasta luego',
    '🍂 Se fue un miembro',
    '🚪 Salida del grupo'
  ]

  if (m.messageStubType === 27 || m.messageStubType === 31) {

    const contextInfo = {
      externalAdReply: {
        showAdAttribution: false,
        title: welcomeTitles[Math.floor(Math.random() * welcomeTitles.length)],
        body: groupName,
        mediaType: 2,
        sourceUrl: global.redes || '',
        thumbnailUrl: pp
      }
    }

    let audioPath = path.resolve('./src/welcome.mp3')

    if (fs.existsSync(audioPath)) {
      let audioBuffer = fs.readFileSync(audioPath)
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo
      }).catch(async () => {
        await conn.sendMessage(m.chat, {
          audio: { url: audioPath },
          mimetype: 'audio/mpeg',
          ptt: true,
          contextInfo
        })
      })
    }
  }

  if (m.messageStubType === 28 || m.messageStubType === 32) {

    const contextInfo = {
      externalAdReply: {
        showAdAttribution: false,
        title: byeTitles[Math.floor(Math.random() * byeTitles.length)],
        body: groupName,
        mediaType: 2,
        sourceUrl: global.redes || '',
        thumbnailUrl: pp
      }
    }

    let audioPath = path.resolve('./src/bye.mp3')

    if (fs.existsSync(audioPath)) {
      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(audioPath),
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo
      })
    }
  }
}