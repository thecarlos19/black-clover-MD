import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const emoji = '⚠️'
  const rwait = '⏳'
  const done = '✅'
  const error = '❌'
  const dev = ' by The Carlos 👑'
  const fkontak = {}

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, `${emoji} Por favor, responde a una *Imagen* o *Vídeo.*`, m)

  await m.react(rwait)

  try {
    let media = await q.download()
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
    let link = await (isTele ? uploadImage : uploadFile)(media)

    let img = await (await fetch(link)).buffer()

    let txt = `乂  *L I N K - E N L A C E*  乂\n\n`
    txt += `*» Enlace* : ${link}\n`
    txt += `*» Acortado* : ${await shortUrl(link)}\n`
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`
    txt += `*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n\n`
    txt += `> *${dev}*`

    // Ajuste de conn.sendFile usando sendMessage para evitar el error
    await conn.sendMessage(m.chat, {
      image: img,
      caption: txt
    }, { quoted: m })

    await m.react(done)
  } catch (err) {
    console.error(err)
    await m.react(error)
    conn.reply(m.chat, `${emoji} Ocurrió un error:\n${err.message}`, m)
  }
}

handler.help = ['tourl']
handler.tags = ['transformador']
handler.register = true
handler.command = ['tourl', 'upload']

export default handler

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
  return await res.text()
}