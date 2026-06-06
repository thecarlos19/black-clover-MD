import { areJidsSameUser } from '@whiskeysockets/baileys'

export async function before(m, { participants, conn }) {
    if (!m.isGroup) return
    
    let chat = global.db.data.chats[m.chat]
    if (!chat ||!chat.antiBot) return

    let mainBotJid = global.conn.user.jid
    let thisBotJid = conn.user.jid

    if (areJidsSameUser(mainBotJid, thisBotJid)) return

    let isMainBotPresent = participants.some(p => areJidsSameUser(mainBotJid, p.id))
    if (!isMainBotPresent) return

    if (global.connsLeaving && global.connsLeaving[m.chat]) return
    
    global.connsLeaving = global.connsLeaving || {}
    global.connsLeaving[m.chat] = true

    setTimeout(async () => {
        try {
            await conn.groupLeave(m.chat)
        } catch (e) {
            console.error(e)
        } finally {
            delete global.connsLeaving[m.chat]
        }
    }, 5000)
}