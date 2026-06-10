//código creado x The Carlos 👑 
import Jimp from "jimp"
import { sticker } from '../lib/sticker.js'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Escribe algo después de ${usedPrefix + command}*\n*Ejemplo:* ${usedPrefix + command} Hola 🤣`)

  let words = text.split(/\s+/).slice(0, 30)
  text = words.join(' ')

  let randomNum = Math.floor(Math.random() * 4) + 1
  let imagePath = `./src/sticker/pat${randomNum}.jpg`
  
  if (!fs.existsSync(imagePath)) return m.reply(`❌ *No se encontró ${imagePath}*`)
  
  let image = await Jimp.read(imagePath)

  let fontSize = 220
  let font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE)
  const maxWidth = image.bitmap.width - 80
  const maxHeight = 650

  while (Jimp.measureTextHeight(font, text, maxWidth) > maxHeight && fontSize > 56) {
    fontSize -= 12
    font = await Jimp.loadFont(
      fontSize > 128 ? Jimp.FONT_SANS_128_WHITE :
      fontSize > 64 ? Jimp.FONT_SANS_64_WHITE :
      Jimp.FONT_SANS_32_WHITE
    )
  }

  const textHeight = Jimp.measureTextHeight(font, text, maxWidth)
  const y = image.bitmap.height - textHeight - 40

  let shadow = await Jimp.loadFont(
    fontSize > 128 ? Jimp.FONT_SANS_128_BLACK :
    fontSize > 64 ? Jimp.FONT_SANS_64_BLACK :
    Jimp.FONT_SANS_32_BLACK
  )

  let offsets = [
    { x: -4, y: 0 }, { x: 4, y: 0 },
    { x: 0, y: -4 }, { x: 0, y: 4 },
    { x: -3, y: -3 }, { x: 3, y: 3 },
    { x: -3, y: 3 }, { x: 3, y: -3 }
  ]

  offsets.forEach(o => {
    image.print(
      shadow,
      40 + o.x,
      y + o.y,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      maxWidth,
      textHeight
    )
  })

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

  image.quality(98)
  image.blur(0)

  let buffer = await image.getBufferAsync(Jimp.MIME_PNG)
  let stiker = await sticker(
    buffer, 
    false, 
    global.packsticker || '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗', 
    global.author || 'The Carlos 👑',
    ['👻', '🤣', '✨'],
    512,
    { type: 'default' }
  )

  if (!stiker) return m.reply("❌ *No se pudo generar el sticker.*")

  if (Buffer.isBuffer(stiker) && stiker.length > 1000000) return m.reply('❌ *El sticker pesa más de 1MB. Usa menos texto.*')

  await conn.sendMessage(
    m.chat, 
    { sticker: stiker }, 
    { quoted: m, ephemeralExpiration: m.isGroup ? 86400 : 0 }
  )
}

handler.help = ['pat <texto>']
handler.tags = ['sticker']
handler.command = ['pat', 'patricio']
handler.group = false
handler.register = true
handler.limit = true

export default handler