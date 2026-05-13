import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.isGroup) return

  const chat = global.db.data.chats[m.chat]
  if (!chat || !chat.welcome) return

  let metadata = groupMetadata || await conn.groupMetadata(m.chat).catch(() => null)
  if (!metadata) return

  let groupName = metadata.subject
  let pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null)

  const audioFolder = path.resolve('./src/welcomeaudios')
  const tmpFolder = path.resolve('./tmp')

  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder, { recursive: true })
  }

  const welcomeTitles = [
    '👋 Welcome',
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

  const getRandomAudio = (type) => {
    if (!fs.existsSync(audioFolder)) return null

    let files = fs.readdirSync(audioFolder).filter(file => {
      return (
        /\.(mp3|ogg|wav|m4a)$/i.test(file) &&
        file.toLowerCase().startsWith(type)
      )
    })

    if (!files.length) return null

    let randomFile = files[Math.floor(Math.random() * files.length)]

    return path.join(audioFolder, randomFile)
  }

  const sendPTT = async (audioPath, contextInfo) => {
    try {
      const output = path.join(tmpFolder, `${Date.now()}.ogg`)

      execSync(
        `ffmpeg -i "${audioPath}" -vn -c:a libopus -b:a 128k "${output}" -y`
      )

      await conn.sendMessage(m.chat, {
        audio: { url: output },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
        contextInfo
      })

      if (fs.existsSync(output)) {
        fs.unlinkSync(output)
      }
    } catch (e) {
      console.log(e)
    }
  }

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

    const audioPath = getRandomAudio('bienvenida')

    if (audioPath) {
      await sendPTT(audioPath, contextInfo)
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

    const audioPath = getRandomAudio('bye')

    if (audioPath) {
      await sendPTT(audioPath, contextInfo)
    }
  }
}