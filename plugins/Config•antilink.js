let linkRegex = /(https?:\/\/(?:www\.)?(?:t\.me|telegram\.me|whatsapp\.com)\/\S+)|(https?:\/\/chat\.whatsapp\.com\/\S+)|(https?:\/\/whatsapp\.com\/channel\/\S+)/i  

export async function before(m, { conn, isAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false

  let chat = global.db.data.chats[m.chat]
  let settings = global.db.data.settings[conn.user.jid] || {}
  let grupoBase = `https://chat.whatsapp.com`
  let isGroupLink = linkRegex.exec(m.text)

  if (!chat.antiLink || !m.text || !isGroupLink) return true

  let metadata
  try {
    metadata = await conn.groupMetadata(m.chat)
  } catch (e) {
    metadata = null
  }

  let participant = metadata?.participants?.find(p => (p.id || p.jid) === (m.sender || m.key?.participant))

  if (participant?.admin === 'superadmin' && m.text.includes(grupoBase)) {
    await conn.reply(m.chat, `⚔️ *Anti-Enlace activado, pero eres el creador del grupo (superadmin). Te salvaste.*`, m)
    return true
  }

  if (isAdmin) {
    await conn.reply(m.chat, `⚠️ *Eres admin, el sistema no te expulsará aunque compartas enlaces.*`, m)
    return true
  }

  const thisGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
  if (m.text.includes(thisGroupLink)) return true

  await conn.reply(
    m.chat,
    `📎 *¡ALERTA DE ENLACE PROHIBIDO!*\n\n⚠️ *@${m.sender.split('@')[0]}* ha compartido un enlace sospechoso.\n💀 *Eliminación inminente...*`,
    m,
    { mentions: [m.sender] }
  )

  if (settings.restrict) {
    try {
      // eliminar mensaje del enlace
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })

      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    } catch (e) {
      return conn.reply(m.chat, `🚫 *Error al intentar eliminar:* ${e}`, m)
    }
  } else {
    await conn.reply(m.chat, `⚙️ *Restricción desactivada.* No puedo expulsar a @${m.sender.split('@')[0]}`, m, { mentions: [m.sender] })
  }

  return true
}