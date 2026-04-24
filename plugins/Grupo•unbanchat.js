let handler = async (m, { conn, isAdmin, isOwner, isROwner }) => {
  let chat = global.db.data.chats[m.chat]

  if (!m.isGroup) {
    return m.reply('> Este comando solo funciona en grupos.')
  }

  if (!isAdmin && !isOwner && !isROwner) {
    return m.reply('> Solo los administradores pueden usar este comando.')
  }

  // asegurar que exista el estado del chat
  if (!chat) global.db.data.chats[m.chat] = chat = {}

  if (!chat.isBanned) {
    return m.reply('> Este chat no está baneado.')
  }

  chat.isBanned = false

  m.reply(
    '> El chat fue desbaneado correctamente.\n\n✦ Los comandos han sido reactivados.'
  )
}

handler.command = ['unbanchat']
handler.group = true
handler.admin = true

export default handler