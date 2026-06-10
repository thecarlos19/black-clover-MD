import Jimp from "jimp"
import { sticker } from '../lib/sticker.js'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Escribe algo después de ${usedPrefix + command}*\n*Ejemplo:* ${usedPrefix + command} Hola mundo`)

  let words = text.split(/\s+/).slice(0, 25)
  text = words.join(' ')

  if (!fs.existsSync('./src/sticker/nota.jpg')) return m.reply('❌ *No se encontró ./src/sticker/nota.jpg*')

  let image = await Jimp.read("./src/sticker/nota.jpg")
  let fontSize = 220
  let font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK)
  const maxWidth = image.bitmap.width - 80
  const maxHeight = 600

  while (Jimp.measureTextHeight(font, text, maxWidth) > maxHeight && fontSize > 56) {
    fontSize -= 14
    font = await Jimp.loadFont(
      fontSize > 128 ? Jimp.FONT_SANS_128_BLACK :
      fontSize > 64 ? Jimp.FONT_SANS_64_BLACK :
      Jimp.FONT_SANS_32_BLACK
    )
  }

  const textHeight = Jimp.measureTextHeight(font, text, maxWidth)
  const y = (image.bitmap.height - textHeight) / 2

  image.print(
    font,
    40,
    y,
    {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP
    },
    maxWidth,
    textHeight
  )

  image.quality(95)

  let buffer = await image.getBufferAsync(Jimp.MIME_PNG)
  let stiker = await sticker(
    buffer, 
    false, 
    global.packsticker || '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗', 
    global.author || 'The Carlos 👑',
    ['📝', '✨', '👑'],
    512,
    { type: 'default' }
  )

  if (!stiker) return m.reply("❌ *No se pudo generar el sticker. La imagen base puede estar dañada.*")

  if (Buffer.isBuffer(stiker) && stiker.length > 1000000) return m.reply('❌ *El sticker pesa más de 1MB. Usa menos texto.*')

  await conn.sendMessage(
    m.chat, 
    { sticker: stiker }, 
    { quoted: m, ephemeralExpiration: m.isGroup ? 86400 : 0 }
  )
}

handler.help = ['n', 'nota'].map(v => v + ' <texto>')
handler.tags = ['sticker']
handler.command = ['n', 'nota', 'Nota']
handler.group = false
handler.register = true
handler.limit = true

export default handler