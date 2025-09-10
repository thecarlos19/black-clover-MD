import { writeFile } from 'fs/promises'

let handler = async (m, { conn }) => {
  const emoji = '⚠️'
  const rwait = '⏳'
  const done = '✅'
  const error = '❌'

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/webp/.test(mime)) return conn.reply(m.chat, `${emoji} Responde a un sticker para convertirlo en imagen.`, m)

  await m.react(rwait)

  try {
    let img = await q.download()
    if (!img) throw new Error('No se pudo descargar el sticker.')

    let fileName = `sticker-${Date.now()}.jpg`
    await writeFile(fileName, img)

    await conn.sendMessage(m.chat, { image: img, caption: 'Aquí tienes tu imagen.' }, { quoted: m })
    await m.react(done)
  } catch (err) {
    console.error(err)
    await m.react(error)
    conn.reply(m.chat, `${emoji} Error al convertir el sticker:\n${err.message}`, m)
  }
}

handler.help = ['toimg']
handler.tags = ['herramientas']
handler.command = ['toimg']
export default handler