//código creado x The Carlos 👑 
//no quiten créditos 

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return false

    const chat = global?.db?.data?.chats?.[m.chat]
    if (!chat || !chat.autoAceptar) return false

    if (isAdmin) return false
    if (!isBotAdmin) return false

    try {
        const latinPrefix = '5'

        const pending = await conn.groupRequestParticipantsList(m.chat).catch(() => [])
        if (Array.isArray(pending) && pending.length) {
            const filtered = pending.filter(p =>
                p?.jid &&
                p.jid.endsWith('@s.whatsapp.net') &&
                p.jid.split('@')[0].startsWith(latinPrefix)
            )

            for (const user of filtered) {
                await conn.groupRequestParticipantsUpdate(m.chat, [user.jid], 'approve')
            }
        }

        if (m.messageStubType === 172 && Array.isArray(m.messageStubParameters)) {
            const filteredEvent = m.messageStubParameters.filter(jid =>
                typeof jid === 'string' &&
                jid.endsWith('@s.whatsapp.net') &&
                jid.split('@')[0].startsWith(latinPrefix)
            )

            for (const jid of filteredEvent) {
                await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'approve')
            }
        }

    } catch (err) {
        console.error('Error aprobando solicitudes:', err)
    }

    return false
}

export default handler