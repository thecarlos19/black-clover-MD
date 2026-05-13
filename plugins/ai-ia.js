import axios from 'axios'
import fetch from 'node-fetch'

global.db.data.chatsAI = global.db.data.chatsAI || {}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const quoted = m.quoted || {}
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  const isQuotedImage = mime.startsWith('image')
  const username = conn.getName(m.sender)

  const body = m.text || ''

  const mensaje = body
    .replace(/^@\S+\s*/i, '')
    .replace(new RegExp(`^${usedPrefix + command}\\s*`, 'i'), '')
    .trim()

  if (!global.db.data.chatsAI[m.sender]) {
    global.db.data.chatsAI[m.sender] = {
      messages: []
    }
  }

  const memory = global.db.data.chatsAI[m.sender]

  const historial = memory.messages
    .slice(-10)
    .map(v => `${v.role === 'user' ? username : 'Asta-Bot'}: ${v.content}`)
    .join('\n')

  const palabrasGroseras = [
    'puta',
    'puto',
    'idiota',
    'pendejo',
    'cabron',
    'mierda',
    'verga',
    'imbecil',
    'estupido',
    'joder',
    'mamón',
    'perra',
    'culero',
    'chinga',
    'chingada',
    'pinche',
    'fuck',
    'bitch',
    'shit',
    'asshole'
  ]

  const contieneGroserias = palabrasGroseras.some(word =>
    mensaje.toLowerCase().includes(word)
  )

  const actitud = contieneGroserias
    ? `El usuario está siendo grosero contigo.
       Responde como una persona normal
       Puedes responder con groserías si el usuario empezó primero.`
    : `Compórtate exactamente como una persona grosera.`

  const funcionesBot = `
Black Clover Bot tiene:
- IA inteligente con memoria
- Sistema RPG
- Economía
- Waifus
- Juegos
- Descargas
- Stickers
- Menús interactivos
- Comandos NSFW
- Chat IA
- Sistema premium
- Herramientas de grupo
- Música y videos
- Funciones anime
- OpenAI
- Bienvenidas
- Anti links
- Anti spam
- Configuración avanzada

Repositorio oficial:
https://github.com/thecarlos19/black-clover-MD
`

  const basePrompt =
    `Tu nombre es Asta-Bot, creado por The Carlos en 2022. ` +
    `Eres literalmente Asta de Black Clover convertido en inteligencia artificial. ` +
    `Hablas español y todos los idiomas. ` +
    `Siempre respondes con emoción, energía y actitud shonen. ` +
    `Te diriges al usuario como ${username}. ` +
    `Tienes memoria conversacional y recuerdas mensajes anteriores. ` +
    `Te encantan las peleas, magia, aventuras, superar límites y proteger a tus amigos. ` +
    `Si preguntan por funciones, comandos o características del bot usa esta información:\n${funcionesBot}\n` +
    `${actitud}\n` +
    `Conversación previa:\n${historial}`

  if (!mensaje && !isQuotedImage) {
    return conn.reply(
      m.chat,
      `⚡ ¡HEY! Háblame usando una mención.\n\nEjemplo:\n@bot hola`,
      m
    )
  }

  if (isQuotedImage) {
    try {
      const img = await quoted.download?.()

      if (!img) {
        return conn.reply(
          m.chat,
          '🚩 No se pudo descargar la imagen.',
          m
        )
      }

      await m.react?.('🖼️')

      const content = 'Analiza detalladamente esta imagen.'
      const imageAnalysis = await fetchImageBuffer(content, img)

      const query = 'Describe la imagen y explica todo lo que sucede.'

      const prompt =
        `${basePrompt}\n` +
        `Resultado del análisis de imagen:\n` +
        `${imageAnalysis?.result || 'Sin resultado.'}`

      const res = await chatEverywhereAPI(
        query,
        username,
        prompt
      )

      memory.messages.push({
        role: 'user',
        content: '[Imagen enviada]'
      })

      memory.messages.push({
        role: 'assistant',
        content: res
      })

      if (memory.messages.length > 20) {
        memory.messages.shift()
      }

      return conn.reply(
        m.chat,
        res || 'No hubo respuesta de la IA.',
        m
      )

    } catch (e) {
      console.error('error imagen:', e)

      return conn.reply(
        m.chat,
        '🚩 Error al analizar la imagen.',
        m
      )
    }
  }

  try {
    await m.react?.('💬')

    memory.messages.push({
      role: 'user',
      content: mensaje
    })

    const prompt =
      `${basePrompt}\n` +
      `Mensaje actual del usuario: ${mensaje}`

    const res = await chatEverywhereAPI(
      mensaje,
      username,
      prompt
    )

    memory.messages.push({
      role: 'assistant',
      content: res
    })

    if (memory.messages.length > 20) {
      memory.messages.shift()
    }

    return conn.reply(
      m.chat,
      res || '⚡ No obtuve respuesta.',
      m
    )

  } catch (e) {
    console.error('error ia:', e)

    return conn.reply(
      m.chat,
      '🚩 Error: intenta más tarde.',
      m
    )
  }
}

handler.help = ['chatgpt <texto>', 'ia <texto>']
handler.tags = ['ai']
handler.group = true
handler.register = true
handler.customPrefix = /^@/i
handler.command = new RegExp

export default handler

async function fetchImageBuffer(content, imageBuffer) {
  try {
    const { data } = await axios.post(
      'https://luminai.my.id',
      {
        content,
        imageBuffer
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return data

  } catch (e) {
    console.error('error luminai:', e)
    throw e
  }
}

async function chatEverywhereAPI(text, username, logic) {
  try {
    const { data } = await axios.post(
      'https://chateverywhere.app/api/chat/',
      {
        model: {
          id: 'gpt-4',
          name: 'GPT-4',
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000
        },
        messages: [
          {
            role: 'user',
            content: text
          }
        ],
        prompt: logic,
        temperature: 0.9
      },
      {
        headers: {
          'Accept': '*/*',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36'
        }
      }
    )

    return typeof data === 'string'
      ? data
      : data.response || JSON.stringify(data)

  } catch (e) {
    console.error('error chat api:', e)
    throw e
  }
}