import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploaders = [
  {
    name: 'Catbox',
    fn: async (buffer, filename) => {
      const form = new FormData()
      form.append('reqtype', 'fileupload')
      form.append('fileToUpload', buffer, filename)
      let res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
        headers: {
          'User-Agent': 'Mozilla/5.0',
         ...form.getHeaders()
        }
      })
      let url = await res.text()
      if (!url.startsWith('https://files.catbox.moe')) throw new Error(url)
      return url
    }
  },
  {
    name: 'Tmpfiles',
    fn: async (buffer, filename) => {
      const form = new FormData()
      form.append('file', buffer, filename)
      let res = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form })
      let json = await res.json()
      if (!json.data?.url) throw new Error('tmpfiles falló')
      return json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    }
  },
  {
    name: 'Pomf2',
    fn: async (buffer, filename) => {
      const form = new FormData()
      form.append('files[]', buffer, filename)
      let res = await fetch('https://pomf2.lain.la/upload.php', { method: 'POST', body: form })
      let json = await res.json()
      if (!json.success ||!json.files?.[0]?.url) throw new Error('pomf2 falló')
      return json.files[0].url
    }
  }
]

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/image\/(jpe?g|png|webp)|video|audio|sticker/.test(mime)) {
    return m.reply(`Responde a una imagen, video, audio o sticker con *${usedPrefix + command}*`)
  }

  await m.react('⏳')

  try {
    let media = await q.download?.()
    if (!media) throw new Error('Error al descargar el archivo')

    let ext = mime.split('/')[1].split(';')[0] || 'bin'
    if (mime.includes('webp')) ext = 'webp'
    if (mime.includes('ogg')) ext = 'ogg'

    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
    let tempPath = path.join(__dirname, `../tmp/${Date.now()}.${ext}`)
    fs.writeFileSync(tempPath, media)

    let url = null
    let errors = []
    let successServer = ''

    for (let uploader of uploaders) {
      try {
        url = await uploader.fn(fs.createReadStream(tempPath), `file.${ext}`)
        successServer = uploader.name
        break
      } catch (e) {
        errors.push(`${uploader.name}: ${e.message}`)
        continue
      }
    }

    fs.unlinkSync(tempPath)

    if (!url) {
      await m.react('❌')
      return conn.sendMessage(m.chat, {
        text: `❌ *Fallaron todos los servidores*\n\n${errors.join('\n')}`,
        footer: 'Black Clover MD',
        buttons: [
          { buttonId: `${usedPrefix + command}`, buttonText: { displayText: '🔄 Reintentar' }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m })
    }

    await m.react('✅')
    let size = (media.length / 1024 / 1024).toFixed(2)

    await conn.sendMessage(m.chat, {
      text: `✅ *Archivo subido a ${successServer}*\n\n🔗 *Link:* ${url}\n📦 *Tipo:* ${mime}\n📏 *Tamaño:* ${size} MB\n⏰ *Expira:* Nunca`,
      footer: 'Toca el botón para copiar el link',
      buttons: [
        { buttonId: `.copy ${url}`, buttonText: { displayText: '📋 Copiar Link' }, type: 1 },
        { buttonId: `${usedPrefix + command}`, buttonText: { displayText: '🔄 Subir otro' }, type: 1 }
      ],
      headerType: 1,
      contextInfo: {
        externalAdReply: {
          title: 'URL Uploader',
          body: successServer,
          thumbnailUrl: url,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['tourl']
handler.tags = ['herramientas']
handler.command = ['tourl', 'upload', 'imgurl', 'url' , '.copy']
handler.limit = true

export default handler