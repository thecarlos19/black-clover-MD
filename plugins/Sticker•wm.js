import { addExif } from '../lib/sticker.js'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.quoted) return m.reply(`*⚠️ Responde a un sticker!*\n*Ejemplo:* ${usedPrefix + command} Black Clover | The Carlos`)
    let stiker = false

    try {
        await m.react('⏳')
        let [packname, ...authorParts] = text.split('|')
        let author = authorParts.join('|').trim()
        let mime = m.quoted.mimetype || ''

        if (!/webp/.test(mime)) return m.reply('⚠️ *Responde solo a stickers*')

        const img = await m.quoted.download()
        if (!img) return m.reply('⚠️ *No se pudo descargar el sticker!*')

        const fileType = await fileTypeFromBuffer(img)
        if (!fileType || fileType.mime !== 'image/webp') return m.reply('⚠️ *El archivo no es un sticker válido*')

        stiker = await addExif(
            img, 
            packname?.trim() || global.packsticker || '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗', 
            author || global.author || 'The Carlos 👑'
        )

        if (stiker) {
            if (Buffer.isBuffer(stiker) && stiker.length > 1000000) return m.reply('❌ *El sticker pesa más de 1MB. WhatsApp no lo permite.*')
            
            await conn.sendMessage(
                m.chat,
                { sticker: stiker },
                { quoted: m, ephemeralExpiration: m.isGroup ? 86400 : 0 }
            )
            await m.react('✅')
        } else {
            throw new Error('⚠️ *La conversión falló. El sticker puede estar corrupto.*')
        }
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(e.message || '⚠️ *Error al cambiar el exif del sticker*')
    }
}

handler.help = ['take <nombre>|<autor>', 'wm <nombre>|<autor>']
handler.tags = ['sticker']
handler.command = ['take', 'robar', 'wm']
handler.group = false
handler.register = true
handler.limit = true

export default handler