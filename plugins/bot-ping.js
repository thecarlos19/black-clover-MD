import { totalmem, freemem } from 'os'
import speed from 'performance-now'
import { sizeFormatter } from 'human-readable'

const format = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

var handler = async (m, { conn }) => {

    let timestamp = speed()
    let latensi = speed() - timestamp

    let _muptime = process.uptime() * 1000
    let muptime = clockString(_muptime)

    let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
    let groups = Object.entries(conn.chats)
        .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce)
        .map(v => v[0])

    let texto = `*🚀 Velocidad*\n• ${latensi.toFixed(4)} ms\n\n` +
                 `*⏰ Actividad*\n• ${muptime}\n\n` +
                 `*💌 Chats*\n• ${chats.length} Chats privados\n• ${groups.length} Grupos\n\n` +
                 `*💻 Servidor*\n• RAM: ${format(totalmem() - freemem())} / ${format(totalmem())}`

    conn.sendMessage(m.chat, { text: texto })
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