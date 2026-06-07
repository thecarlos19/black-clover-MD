import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, usedPrefix, command }) => {
  const emoji = '⚠️'
  const rwait = '⏳'
  const done = '✅'
  const error = '❌'
  const dev = 'by The Carlos 👑'

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, `${emoji} Por favor, responde a una *Imagen*, *Vídeo*, *Audio* o *Documento.*`, m)

  if (mime.includes('webp')) return conn.reply(m.chat, `${emoji} Los stickers no se pueden subir. Conviértelos primero.`, m)

  await m.react(rwait)

  try {
    let media = await q.download()
    if (!media) throw new Error('No se pudo descargar el archivo')
    if (media.length > 100 * 1024 * 1024) throw new Error('Archivo muy grande. Máximo 100MB')

    let isImage = /image\/(png|jpe?g|gif|webp)/.test(mime)
    let isVideo = /video\/(mp4|mkv|avi|mov)/.test(mime)
    let isAudio = /audio\/(mpeg|mp3|ogg|wav|m4a)/.test(mime)
    let isDoc = /application\/(pdf|zip|rar)/.test(mime)
    let isTele = isImage || isVideo

    let link = await (isTele ? uploadImage : uploadFile)(media)
    let thumb = isImage ? await getThumb(media) : null
    let fileType = isImage ? 'Imagen' : isVideo ? 'Video' : isAudio ? 'Audio' : isDoc ? 'Documento' : 'Archivo'

    let txt = `乂 *L I N K - E N L A C E* 乂\n\n`
    txt += `*» Tipo* : ${fileType}\n`
    txt += `*» Enlace* : ${link}\n`
    txt += `*» Acortado* : ${await shortUrl(link)}\n`
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`
    txt += `*» MIME* : ${mime}\n`
    txt += `*» Expiración* : ${isTele ? 'No expira' : '30 días'}\n\n`
    txt += `> *${dev}*`

    const buttons = [
      { buttonId: `${usedPrefix}qrurl ${link}`, buttonText: { displayText: '📱 Generar QR' }, type: 1 },
      { buttonId: `${usedPrefix}dlfile ${link}`, buttonText: { displayText: '⬇️ Descargar' }, type: 1 },
      { buttonId: `${usedPrefix}infourl ${link}`, buttonText: { displayText: 'ℹ️ Info completa' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: thumb || { url: link },
      caption: txt,
      footer: 'Upload 2026',
      buttons: buttons,
      headerType: 4
    }, { quoted: m })

    await m.react(done)
  } catch (err) {
    console.error(err)
    await m.react(error)
    conn.reply(m.chat, `${emoji} Ocurrió un error:\n${err.message}`, m)
  }
}

handler.qrurl = async (m, { conn, args }) => {
  const url = args[0]
  if (!url) return m.reply('❌ URL inválida')

  await m.react('⏳')
  try {
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`
    await conn.sendMessage(m.chat, {
      image: { url: qr },
      caption: `📱 *Código QR*\n\n${url}`
    }, { quoted: m })
    await m.react('✅')
  } catch {
    await m.react('❌')
    m.reply('❌ Error al generar QR')
  }
}

handler.dlfile = async (m, { conn, args }) => {
  const url = args[0]
  if (!url) return m.reply('❌ URL inválida')

  await m.react('⏳')
  try {
    const res = await fetch(url)
    const buffer = await res.buffer()
    const type = res.headers.get('content-type') || 'application/octet-stream'
    const ext = type.split('/')[1] || 'bin'

    await conn.sendMessage(m.chat, {
      document: buffer,
      mimetype: type,
      fileName: `archivo_${Date.now()}.${ext}`,
      caption: '⬇️ *Archivo descargado*\n\n> by The Carlos 👑'
    }, { quoted: m })
    await m.react('✅')
  } catch {
    await m.react('❌')
    m.reply('❌ Error al descargar archivo')
  }
}

handler.infourl = async (m, { conn, args }) => {
  const url = args[0]
  if (!url) return m.reply('❌ URL inválida')

  await m.react('⏳')
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const size = res.headers.get('content-length')
    const type = res.headers.get('content-type')
    const last = res.headers.get('last-modified')

    let txt = `乂 *I N F O - U R L* 乂\n\n`
    txt += `*» URL* : ${url}\n`
    txt += `*» Tipo* : ${type || 'Desconocido'}\n`
    txt += `*» Tamaño* : ${size ? formatBytes(parseInt(size)) : 'Desconocido'}\n`
    txt += `*» Modificado* : ${last || 'Desconocido'}\n`
    txt += `*» Estado* : ${res.ok ? 'Activo' : 'Inactivo'}`

    await m.reply(txt)
    await m.react('✅')
  } catch {
    await m.react('❌')
    m.reply('❌ Error al obtener info')
  }
}

handler.before = async (m, { conn }) => {
  if (m.text?.startsWith('.qrurl ')) {
    const args = m.text.slice(7).split(' ')
    return handler.qrurl(m, { conn, args })
  }
  if (m.text?.startsWith('.dlfile ')) {
    const args = m.text.slice(8).split(' ')
    return handler.dlfile(m, { conn, args })
  }
  if (m.text?.startsWith('.infourl ')) {
    const args = m.text.slice(9).split(' ')
    return handler.infourl(m, { conn, args })
  }
}

handler.help = ['tourl', 'upload']
handler.tags = ['transformador']
handler.register = true
handler.command = ['tourl','infourl','dlfile','qrurl', 'upload']
handler.limit = true

export default handler

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function shortUrl(url) {
  try {
    let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`, { timeout: 5000 })
    return await res.text()
  } catch {
    return url
  }
}

async function getThumb(buffer) {
  try {
    return (await Jimp.read(buffer)).resize(300, 300).getBufferAsync(Jimp.MIME_JPEG)
  } catch {
    return null
  }
}