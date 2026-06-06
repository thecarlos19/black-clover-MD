let handler = async (m, { conn, text, isAdmin, isOwner, isROwner }) => {
  let chat = global.db.data.chats[m.chat]

  if (!m.isGroup) {
    return m.reply('> Este comando solo funciona en grupos.')
  }

  if (!isAdmin &&!isOwner &&!isROwner) {
    return m.reply('> Solo los administradores pueden usar este comando.')
  }

  if (!chat) global.db.data.chats[m.chat] = chat = {}

  if (!chat.isBanned) {
    return m.reply('> Este chat no está baneado.')
  }

  let motivo = text || 'Sin razón especificada'
  let baneadoPor = chat.bannedBy? `@${chat.bannedBy.split('@')[0]}` : 'Desconocido'
  let razonBan = chat.banReason || 'Sin razón'

  chat.isBanned = false
  delete chat.banReason
  delete chat.bannedBy
  delete chat.banTime
  delete chat.banExpires

  let ownerMsg = `*✅ CHAT DESBANEADO*\n\n📍 Grupo: ${await conn.getName(m.chat)}\n👤 Desbaneado por: @${m.sender.split('@')[0]}\n📝 Razón: ${motivo}\n\n🔒 Había sido baneado por: ${baneadoPor}\n📌 Motivo anterior: ${razonBan}`

  for (let owner of global.owner.map(v => v[0] + '@s.whatsapp.net')) {
    await conn.sendMessage(owner, { text: ownerMsg, mentions: [m.sender, chat.bannedBy].filter(Boolean) }).catch(() => {})
  }

  m.reply(
    `> El chat fue desbaneado correctamente.\n📝 Razón: ${motivo}\n\n✦ Los comandos han sido reactivados.`
  )
}

handler.help = ['unbanchat <razón>']
handler.tags = ['group']
handler.command = ['unbanchat']
handler.group = true
handler.admin = true

export default handler