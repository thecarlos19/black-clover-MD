import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command, args }) => {
  const quoted = m.quoted? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })
    return m.reply(`Responde a una imagen con:\n*${usedPrefix + command}* [2x|4x|8x]\n\nEj: *${usedPrefix + command} 4x*`)
  }

  const scale = args[0]?.replace('x', '') || '2'
  const validScales = ['2', '4', '8']
  if (!validScales.includes(scale)) {
    return m.reply(`❌ Escala inválida. Usa: 2x, 4x, 8x\n\nEj: *${usedPrefix + command} 4x*`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const media = await quoted.download()
    const ext = mime.split('/')[1]
    const filename = `upscaled_${Date.now()}.${ext}`

    let resultBuffer
    let apiUsed = ''

    try {
      const form = new FormData()
      form.append('image', media, { filename, contentType: mime })
      form.append('scale', scale)

      const headers = {
       ...form.getHeaders(),
        accept: 'application/json',
        'x-client-version': 'web',
        'x-locale': 'en'
      }

      const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
        method: 'POST',
        headers,
        body: form,
        timeout: 30000
      })

      const json = await res.json()
      if (!json?.result_url) throw new Error('Pixelcut falló')
      resultBuffer = await (await fetch(json.result_url)).buffer()
      apiUsed = 'Pixelcut AI'

    } catch (e) {
      resultBuffer = await remini(media, 'enhance')
      apiUsed = 'Remini AI'
    }

    if (!resultBuffer) throw new Error('No se pudo procesar la imagen')

    let txt = `✨ *IMAGEN MEJORADA ${scale}X*\n\n`
    txt += `*» API* : ${apiUsed}\n`
    txt += `*» Escala* : ${scale}x\n`
    txt += `*» Tamaño* : ${formatBytes(resultBuffer.length)}\n`
    txt += `*» Formato* : ${ext.toUpperCase()}\n\n`
    txt += `> by The Carlos 👑`

    const buttons = [
      { buttonId: `${usedPrefix + command} 4x`, buttonText: { displayText: '⚡ Mejorar 4x' }, type: 1 },
      { buttonId: `${usedPrefix + command} 8x`, buttonText: { displayText: '🔥 Mejorar 8x' }, type: 1 },
      { buttonId: `${usedPrefix}hdinfo`, buttonText: { displayText: 'ℹ️ Info HD' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: txt,
      footer: 'HD Upscaler 2026',
      buttons: buttons,
      headerType: 4
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ Ocurrió un error:\n${err.message || err}`)
  }
}

handler.hdinfo = async (m, { conn }) => {
  let txt = `乂 *H D - U P S C A L E R* 乂\n\n`
  txt += `*» APIs* : Pixelcut + Remini\n`
  txt += `*» Escalas* : 2x, 4x, 8x\n`
  txt += `*» Formatos* : JPG, PNG, WEBP\n`
  txt += `*» Límite* : 20MB por imagen\n`
  txt += `*» Fallback* : Si una API falla usa la otra\n\n`
  txt += `*Uso:*\n`
  txt += `• Responde imagen: *.hd 4x*\n`
  txt += `• Default sin escala: 2x\n\n`
  txt += `> by The Carlos 👑`
  await m.reply(txt)
}

handler.before = async (m, { conn }) => {
  if (m.text === '.hdinfo') {
    return handler.hdinfo(m, { conn })
  }
}

handler.help = ['hd <2x|4x|8x>', 'upscale']
handler.tags = ['tools', 'image','hdinfo']
handler.command = ['upscale','hd','remini','4k',]
handler.limit = true

export default handler

async function remini(imageData, operation) {
  return new Promise(async (resolve, reject) => {
    const availableOperations = ["enhance", "recolor", "dehaze"]
    if (!availableOperations.includes(operation)) operation = availableOperations[0]

    const baseUrl = `https://inferenceengine.vyro.ai/${operation}.vyro`
    const formData = new FormData()
    formData.append("image", Buffer.from(imageData), { filename: "enhance_image_body.jpg", contentType: "image/jpeg" })
    formData.append("model_version", 1, { "Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=utf-8" })

    formData.submit({
      url: baseUrl,
      host: "inferenceengine.vyro.ai",
      path: "/" + operation,
      protocol: "https:",
      headers: { "User-Agent": "okhttp/4.9.3", Connection: "Keep-Alive", "Accept-Encoding": "gzip" }
    }, function (err, res) {
      if (err) reject(err)
      const chunks = []
      res.on("data", chunk => chunks.push(chunk))
      res.on("end", () => resolve(Buffer.concat(chunks)))
      res.on("error", err => reject(err))
    })
  })
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}