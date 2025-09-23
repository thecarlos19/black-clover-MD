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
    const randomImage = images[Math.floor(Math.random() * images.length)]
    return fs.readFileSync(path.join(imgDir, randomImage))
}

var handler = async (m, { conn }) => {
    let timestamp = speed()
    let latensi = speed() - timestamp

    let _muptime = process.uptime() * 1000
    let muptime = clockString(_muptime)

    let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
    let groups = Object.entries(conn.chats)
        .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce)
        .map(v => v[0])

    let texto = `˚₊·—̳͟͞͞✞ *Ping del Bot*\n\n` +
                `✞ Velocidad:\n> ⤿ ${latensi.toFixed(4)} ms\n\n` +
                `✞ Actividad:\n> ⤿ ${muptime}\n\n` +
                `✞ Chats:\n> ⤿ ${chats.length} Chats privados\n> ⤿ ${groups.length} Grupos\n\n` +
                `✞ Servidor:\n> ⤿ RAM: ${format(totalmem() - freemem())} / ${format(totalmem())}\n\n` +
                `ᥫ᭡ Información en tiempo real`

    const thumbnailBuffer = getRandomImage()

    conn.sendMessage(
        m.chat,
        {
            text: texto,
            contextInfo: {
                externalAdReply: {
                    title: "⏱ Ping del Bot",
                    body: "Información en tiempo real",
                    thumbnail: thumbnailBuffer,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    sourceUrl: "https://wa.me/" + m.sender.split('@')[0]
                }
            }
        }
    )
}

handler.help = ['ping']
handler.tags = ['bot']
handler.command = ['ping', 'p']
handler.register = true

export default handler

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}