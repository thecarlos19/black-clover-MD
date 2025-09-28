const handler = async (m, { conn, text, command, usedPrefix }) => {
    const pp = 'https://i.imgur.com/vWnsjh8.jpg'
    let number, ownerNumber, aa, who
    if (m.isGroup) {
        who = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted?.sender ? m.quoted.sender : text
    } else who = m.chat
    if (!who) {
        const warntext = `*❌ Etiquete a una persona o responda a un mensaje del grupo para advertir al usuario*\n\n*Ejemplo:*\n*${usedPrefix + command} @tag*`
        return m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) })
    }

    const user = global.db.data.users[who] || {}
    global.db.data.users[who] = user
    user.warn = user.warn || 0

    const usuario = conn.user.jid.split`@`[0] + '@s.whatsapp.net'
    for (let i = 0; i < global.owner.length; i++) {
        ownerNumber = global.owner[i][0]
        if (usuario.replace(/@s\.whatsapp\.net$/, '') === ownerNumber) {
            aa = ownerNumber + '@s.whatsapp.net'
            await conn.reply(m.chat, `…`, m, { mentions: [aa] })
            return
        }
    }

    const dReason = 'Sin motivo'
    const msgtext = text || dReason
    const sdms = msgtext.replace(/@\d+-?\d* /g, '')

    user.warn += 1
    await m.reply(`${user.warn == 1 ? `*@${who.split`@`[0]}*` : `*@${who.split`@`[0]}*`} 𝚁𝙴𝙲𝙸𝙱𝙸𝙾 𝚄𝙽𝙰 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾!\nMotivo: ${sdms}\n*Advertencias: ${user.warn}/3*`, null, { mentions: [who] })

    if (user.warn >= 3) {
        user.warn = 0
        await m.reply(`𝚃𝙴 𝙻𝙾 𝙰𝙳𝚅𝙴𝚁𝚃𝙸 𝚅𝙰𝚁𝙸𝙰𝚂 𝚅𝙴𝙲𝙴𝚂!!\n*@${who.split`@`[0]}* 𝚂𝚄𝙿𝙴𝚁𝙰𝚂𝚃𝙴 𝙻𝙰𝚂 *3* 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰𝚂, 𝙰𝙷𝙾𝚁𝙰 𝚂𝙴 𝚁𝙴𝙼𝙾𝚅𝙴𝚁𝙰́ 👽`, null, { mentions: [who] })
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    }
    return false
}

handler.command = ['advertir', 'advertencia', 'warn', 'warning']
handler.group = true
handler.admin = true
export default handler