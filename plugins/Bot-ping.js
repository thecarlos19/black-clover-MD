import { totalmem, freemem } from 'os'
import speed from 'performance-now'
import { sizeFormatter } from 'human-readable'
import fs from 'fs'
import path from 'path'

const format = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

const imgDir = path.resolve('./src/img')
let images = []

try {
    images = fs.readdirSync(imgDir).filter(file => /\.(jpe?g|png|webp)$/i.test(file))
} catch {
    images = []
}

const getRandomImage = () => {
    if (images.length === 0) return null
    try {
        const randomImage = images[Math.floor(Math.random() * images.length)]
        return fs.readFileSync(path.join(imgDir, randomImage))
    } catch {
        return null
    }
}

var handler = async (m, { conn }) => {
    let timestamp = speed()
    let latensi = speed() - timestamp

    let _muptime = process.uptime() * 1000
    let muptime = clockString(_muptime)

    let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
    let groups = Object.entries(conn.chats)
       .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats &&!chat.metadata?.read_only &&!chat.metadata?.announce)
       .map(v => v[0])

    let subBots = global.conns?.filter(c => c.user && c.ws?.socket?.readyState === 1).length || 0

    let texto = `˚₊·—̳͟͞͞✞ *Ping del Bot*\n\n` +
                `✞ Velocidad:\n> ⤿ ${latensi.toFixed(4)} ms\n\n` +
                `✞ Actividad:\n> ⤿ ${muptime}\n\n` +
                `✞ Conexiones:\n> ⤿ ${chats.length} Chats privados\n> ⤿ ${groups.length} Grupos\n> ⤿ ${subBots} Sub-Bots activos\n\n` +
                `✞ Servidor:\n> ⤿ RAM: ${format(totalmem() - freemem())} / ${format(totalmem())}\n> ⤿ Node: ${process.version}\n\n` +
                `ᥫ᭡ Información en tiempo real`

    const thumbnailBuffer = getRandomImage()

    if (thumbnailBuffer) {
        await conn.sendMessage(m.chat, { image: thumbnailBuffer, caption: texto }, { quoted: m })
    } else {
        await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
    }
}

handler.help = ['ping']
handler.tags = ['bot']
handler.command = ['ping', 'p']
handler.register = true

export default handler

function clockString(ms) {
    let h = isNaN(ms)? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}