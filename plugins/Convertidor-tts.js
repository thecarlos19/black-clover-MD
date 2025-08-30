import fetch from 'node-fetch'

function dividirTexto(texto, max = 300) {
    let partes = []
    while (texto.length > max) {
        let fragmento = texto.slice(0, max)
        partes.push(fragmento)
        texto = texto.slice(max)
    }
    if (texto.length > 0) partes.push(texto)
    return partes
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Uso correcto:* ${usedPrefix + command} Tu texto`)

    try {
        const partes = dividirTexto(text, 300)

        if (partes.length === 1) {
            let url = `https://api.nekorinn.my.id/tools/openai-tts?text=${encodeURIComponent(text)}&voice=ash`
            let res = await fetch(url)

            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
            let audioBuffer = await res.arrayBuffer()

            await conn.sendMessage(m.chat, {
                audio: Buffer.from(audioBuffer),
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: m })
        } else {
            for (let parte of partes) {
                let url = `https://api.nekorinn.my.id/tools/openai-tts?text=${encodeURIComponent(parte)}&voice=ash`
                let res = await fetch(url)

                if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
                let audioBuffer = await res.arrayBuffer()

                await conn.sendMessage(m.chat, {
                    audio: Buffer.from(audioBuffer),
                    mimetype: 'audio/mpeg',
                    ptt: true
                }, { quoted: m })
            }
        }

    } catch (e) {
        m.reply(`❌ *Error al generar audio:* ${e.message}`)
    }
}

handler.help = ['tts <texto>']
handler.tags = ['convertidor']
handler.command = 'tts', /^tts$/i

export default handler