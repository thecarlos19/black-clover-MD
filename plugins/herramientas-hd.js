import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })
    return m.reply(`Error responde o envia una imagen con el comando:\n*${usedPrefix + command}*`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const media = await quoted.download()
    const ext = mime.split('/')[1]
    const filename = `upscaled_${Date.now()}.${ext}`

    const form = new FormData()
    form.append('image', media, { filename, contentType: mime })
    form.append('scale', '2')

    const headers = {
      ...form.getHeaders(),
      accept: 'application/json',
      'x-client-version': 'web',
      'x-locale': 'en'
    }

    const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    })

    const json = await res.json()
    if (!json?.result_url || !json.result_url.startsWith('http')) throw new Error('No se pudo obtener la URL del resultado.')

    const resultBuffer = await (await fetch(json.result_url)).buffer()

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: '✨ Tu imagen ha sido mejorada a una resolución 2x.'
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ Ocurrió un error:\n${err.message || err}`)
  }
}

handler.help = ['upscale']
handler.tags = ['tools', 'image']
handler.command ='hd', /^(upscale2|hd|remini)$/i

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