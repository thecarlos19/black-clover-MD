let linkRegex = /(https?:\/\/(?:www\.)?(?:t\.me|telegram\.me|whatsapp\.com)\/\S+)|(https?:\/\/chat\.whatsapp\.com\/\S+)|(https?:\/\/whatsapp\.com\/channel\/\S+)/i

export async function before(m, { isAdmin, isBotAdmin, conn }) {
  if (m.isBaileys && m.fromMe) return !0
  if (!m.isGroup) return !1

  let chat = global.db.data.chats[m.chat]
  let settings = global.db.data.settings[conn.user.jid] || {}
  let grupo = `https://chat.whatsapp.com`
  let isGroupLink = linkRegex.exec(m.text)

  if (!chat.antiLink || !m.text || !isGroupLink) return !0

  if (isAdmin && m.text.includes(grupo)) {
    return conn.reply(m.chat, `⚔️ *Anti-Enlace activado, pero eres admin, te salvaste esta vez, Guerrero Estelar.*`, m)
  }

  if (!isAdmin) {
    
    if (!isBotAdmin) {
      return conn.reply(m.chat, `⚠️ *No puedo eliminar al infractor, no soy admin del grupo... 😔*`, m)
    }

   
    const thisGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
    if (m.text.includes(thisGroupLink)) return !0

    
    await conn.reply(
      m.chat,
      `📎 *¡ALERTA DE ENLACE PROHIBIDO!*\n\n⚠️ *${await conn.getName(m.sender)}* ha compartido un enlace sospechoso.\n💣 *Eliminación perra...*`,
      m
    )

    if (settings.restrict) {
      try {
        // Borra el mensaje del infractor
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant,
          },
        })

       
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch (e) {
        return conn.reply(m.chat, `🚫 *Error al intentar eliminar: ${e}*`, m)
      }
    } else {
      return conn.reply(m.chat, `⚙️ *Restricción desactivada en la configuración global. No puedo expulsar.*`, m)
    }
  }

  return !0
}