const handler = async (m, { conn, text }) => {
    let user;
    if (m.mentionedJid && m.mentionedJid[0]) {
        user = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
        user = m.quoted.sender
    } else if (text) {
        let number = text.replace(/\D/g, '') 
        if (!number) {
            return conn.sendMessage(m.chat, {
                text: '🚩 *Formato inválido. Usa mención, responde o escribe un número.*'
            }, { quoted: fkontak })
        }
        user = number + '@s.whatsapp.net'
    } else {
        return conn.sendMessage(m.chat, {
            text: '🚩 *Formato inválido. Usa mención, responde o escribe un número.*'
        }, { quoted: fkontak })
    }
    const userNumber = user.split('@')[0]
    if (!global.global.db.data.users[user]) {
        return conn.sendMessage(m.chat, {
            text: `🚩 *El usuario @${userNumber} no está en la base de datos.*`,
            mentions: [user]
        }, { quoted: fkontak })
    }
    delete global.global.db.data.users[user]
    await conn.sendMessage(m.chat, {
        text: `🚩 *Éxito: Todos los datos del usuario @${userNumber} fueron eliminados.*`,
        mentions: [user]
    }, { quoted: fkontak })
}

handler.tags = ['owner']
handler.command = ['restablecerdatos','deletedatauser','resetuser','borrardatos']
handler.rowner = true

export default handler