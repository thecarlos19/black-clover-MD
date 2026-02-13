let handler = async (m, { conn, isAdmin, isOwner, isROwner }) => {
  let chat = global.db.data.chats[m.chat]

  if (!m.isGroup) 
    return m.reply('*Este comando solo funciona en grupos*.')

  if (!isAdmin && !isOwner && !isROwner) 
    return m.reply('> Solo administradores pueden usar este comando.')

  if (chat.isBanned) 
    return m.reply('> Este chat ya está baneado.')

  chat.isBanned = true

  m.reply('> El chat fue baneado correctamente.\n\n✦ Ahora no se podrán usar comandos aquí.')
}

handler.command = ['banchat']
handler.group = true
handler.admin = true

export default handler