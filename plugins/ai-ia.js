import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Tu nombre es asta-Bot y parece haber sido creado por the Carlos. Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, te encanta aprender y sobre todo las explociones. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`

  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()
    if (!img) {
      console.error('🚩 Error: No image buffer available')
      return conn.reply(m.chat, '🚩 Error: No se pudo descargar la imagen.', m, fake)
    }
    const content = '🚩 ¿Qué se observa en la imagen?'
    try {
      const imageAnalysis = await fetchImageBuffer(content, img)
      const query = '😊 Descríbeme la imagen y detalla por qué actúan así. También dime quién eres'
      const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
      const description = await chatEverywhereAPI(query, username, prompt)
      await conn.reply(m.chat, description, m, fake)
    } catch (error) {
      console.error('🚩 Error al analizar la imagen:', error)
      await conn.reply(m.chat, '🚩 Error al analizar la imagen.', m, fake)
    }
  } else {
    if (!text) {
      return conn.reply(m.chat, `🍟 *Ingrese su petición*\n🚩 *Ejemplo de uso:* ${usedPrefix + command} Como hacer un avión de papel`, m, rcanal)
    }
    await m.react('💬')
    try {
      const query = text
      const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
      const response = await chatEverywhereAPI(query, username, prompt)
      await conn.reply(m.chat, response, m, fake)
    } catch (error) {
      console.error('🚩 Error al obtener la respuesta:', error)
      await conn.reply(m.chat, 'Error: intenta más tarde.', m, fake)
    }
  }
}

handler.help = ['chatgpt <texto>', 'ia <texto>']
handler.tags = ['ai']
handler.group = true
handler.register = true
handler.command = ['ia', 'chatgpt']

export default handler

async function fetchImageBuffer(content, imageBuffer) {
  try {
    const response = await axios.post('https://Luminai.my.id', {
      content: content,
      imageBuffer: imageBuffer
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

async function chatEverywhereAPI(text, username, logic) {
  try {
    const response = await axios.post("https://chateverywhere.app/api/chat/", {
      model: {
        id: "gpt-4",
        name: "GPT-4",
        maxLength: 32000,
        tokenLimit: 8000,
        completionTokenLimit: 5000,
        deploymentName: "gpt-4"
      },
      messages: [
        { pluginId: null, content: text, role: "user" }
      ],
      prompt: logic,
      temperature: 0.5
    }, {
      headers: {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      }
    })
    return response.data
  } catch (error) {
    console.error('🚩 Error en ChatEverywhere API:', error)
    throw error
  }
}