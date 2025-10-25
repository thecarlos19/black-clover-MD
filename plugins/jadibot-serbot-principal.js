// Código creado x The Carlos 👑
// No olvides dejar créditos

import ws from 'ws'

const handler = async (m, { conn }) => {
    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])]
    if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
        subBots.push(global.conn.user.jid)
    }

    const chat = global.db.data.chats[m.chat]

    const who = subBots[0]  
    if (!who) return conn.reply(m.chat, `No se encontró un sub-bot activo.`, m)

    if (chat.primaryBot === who) {
        return conn.reply(m.chat, `Black-clover-MD ya está como Bot principal en este grupo.`, m);
    }

    try {
        chat.primaryBot = who
        conn.reply(m.chat, `Se ha establecido a este número como Bot principal de este grupo.\n> Ahora todos los comandos de este grupo serán ejecutados.`, m)
    } catch (e) {
        conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
    }
}

handler.help = ['set']
handler.tags = ['grupo']
handler.command = ['set']
handler.group = true
handler.admin = true
handler.rowner = true

export default handler