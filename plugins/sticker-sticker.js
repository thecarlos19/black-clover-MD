import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import fs from 'fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = null
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true })
    
    if (/webp|image|video/g.test(mime)) {
      if (/video/.test(mime) && ((q.msg || q).seconds > 10)) {
        return m.reply('⚠️ *El video no puede durar más de 10 segundos.*')
      }
      const media = await q.download()
      if (!media) return m.reply('❌ *No se pudo descargar el archivo. Responde a una imagen/video/gif.*')
      
      const fileType = await fileTypeFromBuffer(media)
      if (!fileType || !/image|video/.test(fileType.mime)) return m.reply('❌ *Formato no soportado. Usa imagen, video o gif.*')
      
      const tmpPath = path.join('./tmp', `${Date.now()}.webp`)
      try {
        stiker = await sticker(
          media,
          false,
          global.packsticker || 'Black Clover Pack',
          global.author || 'By The Carlos',
          ['🤖', '⚡', '🔥'],
          512,
          { type: 'default' }
        )
        if (Buffer.isBuffer(stiker)) fs.writeFileSync(tmpPath, stiker)
      } catch (e) {
        let out
        if (/webp/.test(mime)) out = await webp2png(media)
        else if (/image/.test(mime)) out = await uploadImage(media)
        else if (/video/.test(mime)) out = await uploadFile(media)
        if (typeof out !== 'string') out = await uploadImage(media)
        stiker = await sticker(
          false,
          out,
          global.packsticker || 'Black Clover Pack',
          global.author || 'By The Carlos',
          ['🤖', '⚡', '🔥'],
          512,
          { type: 'default' }
        )
        if (Buffer.isBuffer(stiker)) fs.writeFileSync(tmpPath, stiker)
      }
    } else if (args[0]) {
      if (isUrl(args[0])) {
        stiker = await sticker(
          false,
          args[0],
          global.packsticker || 'Black Clover Pack',
          global.author || 'By The Carlos',
          ['🤖', '⚡', '🔥'],
          512,
          { type: 'crop' }
        )
        const tmpPath = path.join('./tmp', `${Date.now()}.webp`)
        if (Buffer.isBuffer(stiker)) fs.writeFileSync(tmpPath, stiker)
      } else if (args.join(' ').length > 1 && args.join(' ').length < 50) {
        stiker = await sticker(
          null,
          `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(args.join(' '))}`,
          global.packsticker || 'Black Clover Pack',
          global.author || 'By The Carlos',
          [],
          512,
          { type: 'default' }
        )
      } else {
        return m.reply(`📛 *Usa: ${usedPrefix + command} <imagen|video|url|texto>*`)
      }
    } else {
      return m.reply(`📌 *Envía o responde a una imagen/video/gif máx 10s*\n*O usa:* ${usedPrefix + command} https://ejemplo.jpg\n*O texto:* ${usedPrefix + command} hola`)
    }
  } catch (e) {
    console.error('❌ Error al crear el sticker:', e)
    return m.reply('⚠️ *Ocurrió un error al crear el sticker. El archivo puede estar dañado.*')
  }
  
  if (stiker) {
    try {
      const fileSize = Buffer.isBuffer(stiker) ? stiker.length : 0
      if (fileSize > 1000000) return m.reply('❌ *El sticker pesa más de 1MB. WhatsApp no lo permite.*')
      
      await conn.sendMessage(
        m.chat,
        { sticker: stiker },
        { quoted: m, ephemeralExpiration: m.isGroup ? 86400 : 0 }
      )
      
      setTimeout(() => {
        try {
          const tmpFiles = fs.readdirSync('./tmp').filter(f => f.endsWith('.webp'))
          tmpFiles.forEach(f => fs.unlinkSync(path.join('./tmp', f)))
        } catch {}
      }, 5000)
      
    } catch (e) {
      console.error('⚠️ Error al enviar el sticker:', e)
      return m.reply('❌ *No se pudo enviar el sticker. El formato no es válido para WhatsApp.*')
    }
  } else {
    return m.reply('❌ *No se pudo crear el sticker. Intenta con otro archivo.*')
  }
}

handler.help = ['sticker', 'stiker', 's'].map(v => v + ' <imagen|video|url|texto>')
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']
handler.group = false
handler.register = true
handler.limit = true

export default handler

function isUrl(text) {
  return /^https?:\/\/.*\.(jpe?g|gif|png|webp|mp4)$/i.test(text)
}