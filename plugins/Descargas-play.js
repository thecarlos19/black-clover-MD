import yts from 'yt-search'
import { generateWAMessageContent } from '@whiskeysockets/baileys'
import moment from 'moment-timezone'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `❗ Ingresa un texto\nEjemplo: ${usedPrefix + command} Nombre`

  if (m.isCommandAlreadyRun) return
  m.isCommandAlreadyRun = true

  try {
    const { all } = await yts(text)
    const videoInfo = all?.[0]
    if (!videoInfo) throw '❗ No se encontró nada'

    const authorUrl = videoInfo.author?.url || videoInfo.url

    const body = `Hola @${m.sender.split('@')[0]} 👋

> Te invito a seguirme en Instagram:
https://www.instagram.com/_carlitos.zx

📌 *Selecciona una de las opciones:*`

    const { imageMessage } = await generateWAMessageContent(
      { image: { url: videoInfo.thumbnail } },
      { upload: conn.waUploadToServer }
    )

    const msg = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            mentionedJid: [m.sender]
          },
          interactiveMessage: {
            body: { text: body },
            footer: { text: '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘︎| ⚔️🥷' },
            header: { hasMediaAttachment: true, imageMessage },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              mentionedJid: [m.sender]
            },
            nativeFlowMessage: {
              buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: 'ᴼᴾᶜᴵᴼᴺᴱˢ ᴰᴱ ᴰᴱˢᶜᴬᴿᴳᴬ✌(◕‿-)',
                  sections: [
                    {
                      title: '🎧 AUDIO',
                      rows: [
                        { title: 'MP3', description: videoInfo.timestamp, id: `${usedPrefix}ytmp3 ${videoInfo.url}` },
                        { title: 'MP3 Doc', description: 'Archivo', id: `${usedPrefix}ytmp3doc ${videoInfo.url}` }
                      ]
                    },
                    {
                      title: '📽️ VIDEO',
                      rows: [
                        { title: 'MP4', description: videoInfo.timestamp, id: `${usedPrefix}ytmp4 ${videoInfo.url}` },
                        { title: 'MP4 Doc', description: 'Archivo', id: `${usedPrefix}ytmp4doc ${videoInfo.url}` }
                      ]
                    },
                    {
                      title: 'ℹ️ INFO',
                      rows: [
                        { title: 'YouTube', description: 'Abrir', id: `${usedPrefix}ytlink ${videoInfo.url}` },
                        { title: 'Canal', description: videoInfo.author?.name || 'Canal', id: `${usedPrefix}ytchannel ${authorUrl}` }
                      ]
                    }
                  ]
                })
              }]
            }
          }
        }
      }
    }

    await conn.relayMessage(m.chat, msg.viewOnceMessage.message, {})

  } catch (e) {
    throw `❗ ${e.message || 'Error'}`
  }
}

handler.command = ['play', 'playvid', 'play2']
handler.tags = ['descargas']
handler.group = true
handler.limit = 6

export default handler

const getGreeting = () => {
  const h = moment().tz('America/Mexico_City').hour()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}