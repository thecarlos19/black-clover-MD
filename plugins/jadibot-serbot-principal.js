// Código creado x The Carlos 👑
// No olvides dejar créditos

import ws from 'ws'

let handler = async (m, { conn, usedPrefix }) => {

    let conns = global.conns || []

    const subBots = [...new Set(
        conns
            .filter(c => c?.user?.jid && c?.ws?.readyState !== ws.CLOSED)
            .map(c => c.user.jid)
    )]

    if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
        subBots.push(global.conn.user.jid)
    }

    if (!subBots.length)
        return conn.reply(m.chat, 'No se encontró un sub-bot activo.', m)

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = chat = {}

    let who = subBots[0]

    if (chat.primaryBot === who) {
        return conn.reply(
            m.chat,
            '🤖  Este número ya está establecido como Bot principal en este grupo.',
            m
        )
    }

    try {
        chat.primaryBot = who

        conn.reply(
            m.chat,
            ` Bot principal actualizado correctamente.\n\n✦ Ahora los comandos de este grupo serán ejecutados por:\n${who.split('@')[0]}`,
            m
        )

    } catch (e) {
        console.error(e)
        conn.reply(
            m.chat,
            `⚠︎ Ocurrió un error.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`,
            m
        )
    }
}

handler.help = ['set']
handler.tags = ['grupo']
handler.command = ['set']
handler.group = true
handler.rowner = true   

export default handler