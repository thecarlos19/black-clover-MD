let handler = async (m, { conn, isAdmin, isOwner, isROwner }) => {
  let chat = global.db.data.chats[m.chat]

  if (!m.isGroup) 
    return m.reply('> Este comando solo funciona en grupos.')

  if (!isAdmin && !isOwner && !isROwner) 
    return m.reply('> Solo administradores pueden usar este comando.')

  if (!chat.isBanned) 
    return m.reply('> Este chat no está baneado.')

  chat.isBanned = false

  m.reply('> El chat fue desbaneado correctamente.\n\n✦ Los comandos vuelven a estar disponibles.')
}

handler.command = ['unbanchat']
handler.group = true
handler.admin = true

export default handler