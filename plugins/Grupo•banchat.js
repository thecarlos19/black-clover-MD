let handler = async (m, { conn, text, isAdmin, isOwner, isROwner }) => {
  let chat = global.db.data.chats[m.chat]

  if (!m.isGroup) {
    return m.reply('> Este comando solo funciona en grupos.')
  }

  if (!isAdmin &&!isOwner &&!isROwner) {
    return m.reply('> Solo los administradores pueden usar este comando.')
  }

  if (!chat) global.db.data.chats[m.chat] = chat = {}

  if (chat.isBanned) {
    return m.reply('> Este chat ya está baneado.')
  }

  let [tiempo,...razon] = text.split(' ')
  let motivo = razon.join(' ') || 'Sin razón especificada'
  let ms = 0

  if (tiempo) {
    if (/^\d+[smhd]$/i.test(tiempo)) {
      let num = parseInt(tiempo)
      let unidad = tiempo.slice(-1).toLowerCase()
      if (unidad === 's') ms = num * 1000
      if (unidad === 'm') ms = num * 60000
      if (unidad === 'h') ms = num * 3600000
      if (unidad === 'd') ms = num * 86400000
    }
  }

  chat.isBanned = true
  chat.banReason = motivo
  chat.bannedBy = m.sender
  chat.banTime = Date.now()

  if (ms > 0) {
    chat.banExpires = Date.now() + ms
    setTimeout(() => {
      let c = global.db.data.chats[m.chat]
      if (c && c.isBanned && c.banExpires <= Date.now()) {
        c.isBanned = false
        delete c.banReason
        delete c.banExpires
        conn.sendMessage(m.chat, { text: '> El baneo temporal del chat ha expirado.\n\n✦ Los comandos están activos nuevamente.' })
      }
    }, ms)
  }

  let tiempoTxt = ms > 0? `\n⏱️ Duración: ${tiempo}` : '\n♾️ Duración: Permanente'
  let ownerMsg = `*🚫 CHAT BANEADO*\n\n📍 Grupo: ${await conn.getName(m.chat)}\n👤 Por: @${m.sender.split('@')[0]}\n📝 Razón: ${motivo}${tiempoTxt}`

  for (let owner of global.owner.map(v => v[0] + '@s.whatsapp.net')) {
    await conn.sendMessage(owner, { text: ownerMsg, mentions: [m.sender] }).catch(() => {})
  }

  m.reply(
    `> El chat fue baneado correctamente.${tiempoTxt}\n📝 Razón: ${motivo}\n\n✦ Los comandos han sido desactivados para usuarios normales.`
  )
}

handler.help = ['banchat <tiempo> <razón>']
handler.tags = ['group']
handler.command = ['banchat']
handler.group = true
handler.admin = true

export default handler