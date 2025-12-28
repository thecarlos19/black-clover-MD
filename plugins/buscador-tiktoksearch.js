import axios from 'axios'
const baileys = (await import("@whiskeysockets/baileys")).default
const { proto, generateWAMessageFromContent, generateWAMessageContent } = baileys

let handler = async (message, { conn, text }) => {
  if (!text) return conn.reply(message.chat, '🥷🏻 Por favor, ingrese un texto para realizar una búsqueda en TikTok.', message, fake)

  await conn.reply(message.chat, '⌛ *DESCARGANDO SUS RESULTADOS..*', message, fake)

  async function createVideoMessage(url, caption) {
    try {
      const { videoMessage } = await generateWAMessageContent(
        { video: { url }, caption },
        { upload: conn.waUploadToServer }
      )
      return videoMessage
    } catch (e) {
      console.error('Error creando mensaje de video:', e)
      return null
    }
  }

  try {
    const { data } = await axios.get(
      `https://spenzy-api.vercel.app/api/search/tiktok?q=${encodeURIComponent(text)}`,
      { timeout: 30000 }
    )

    if (!data?.status || !Array.isArray(data.results) || data.results.length === 0) {
      return conn.reply(message.chat, ' *No se encontraron resultados*', message)
    }

    const videos = data.results.filter(v => v?.play).slice(0, 10)
    if (!videos.length) return conn.reply(message.chat, ' *No hay videos válidos*', message)

    const cards = []

    for (const v of videos) {
      const caption = `🎵 ${v.title || 'Sin título'}\n👤 ${v.author?.nickname || 'Desconocido'}\n▶️ ${v.duration || '?'}s`
      const videoMessage = await createVideoMessage(v.play, caption)
      if (!videoMessage) continue

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: caption.slice(0, 80) }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          hasMediaAttachment: true,
          videoMessage
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      })
    }

    if (!cards.length) return conn.reply(message.chat, ' *No se pudieron cargar los videos*', message)

    const carouselMessage = proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })

    const msg = generateWAMessageFromContent(
      message.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({ text: null }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: '🍀 Resultados de TikTok' }),
              header: proto.Message.InteractiveMessage.Header.create({ title: null, hasMediaAttachment: false }),
              carouselMessage
            })
          }
        }
      },
      { quoted: message }
    )

    await conn.relayMessage(message.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('Error TikTok Search:', e)
    return conn.reply(message.chat, ' *Error al consultar la API de TikTok*', message)
  }
}

handler.help = ['tiktoksearch <texto>']
handler.tags = ['downloader']
handler.command = ['tiktoksearch', 'tts', 'ttsearch']
handler.register = true
handler.group = true;

export default handler