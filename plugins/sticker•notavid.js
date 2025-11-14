import axios from 'axios'
import { sticker } from '../lib/sticker.js'

const fetchStickerVideo = async (text) => {
    // Codifica el texto para que funcione con emojis o espacios
    const encodedText = encodeURIComponent(text)
    const response = await axios.get(`https://brayan-api.vercel.app/maker/bratvid?text=${encodedText}`, {
        responseType: 'arraybuffer'
    })
    if (!response.data) throw new Error('Error al obtener el video desde la API de Brayan.')
    return response.data
}

let handler = async (m, { conn, text }) => {
    // Si el mensaje es respuesta a otro texto, usar ese
    if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else if (!text) {
        return conn.sendMessage(m.chat, {
            text: '✨ *Por favor, escribe o responde a un mensaje con el texto para crear el sticker.*'
        }, { quoted: m })
    }

    // Obtener info del pack
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.packsticker
    let texto2 = packstickers.text2 || global.packsticker2

    try {
        const videoBuffer = await fetchStickerVideo(text)
        const stickerBuffer = await sticker(videoBuffer, null, texto1, texto2)
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, {
            text: `⚠️ Ocurrió un error al generar el sticker:\n${e.message}`
        }, { quoted: m })
    }
}

handler.help = ['notavid <texto>']
handler.tags = ['sticker']
handler.command = ['nvid', 'notavid']

export default handler