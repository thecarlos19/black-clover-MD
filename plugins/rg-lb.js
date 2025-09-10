let handler = async (m, { conn, args }) => {
  try {
    let users = Object.entries(global.db.data.users).map(([jid, user]) => ({
      jid,
      exp: Number(user.exp) || 0,
      level: Number(user.level) || 0,
      cookies: Number(user.cookies || user.money || 0) // Monedas
    }))

    users.sort((a, b) => b.exp - a.exp)

    let page = Math.max(1, parseInt(args[0]) || 1)
    let pageSize = 10
    let totalPages = Math.ceil(users.length / pageSize)
    if (page > totalPages) page = totalPages

    let start = (page - 1) * pageSize
    let end = start + pageSize
    let usersPage = users.slice(start, end)

    let names = await Promise.all(usersPage.map(async u => {
      try {
        return await conn.getName(u.jid)
      } catch {
        return 'Usuario'
      }
    }))

    let text = `🎖️ 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐓𝐎𝐏 𝐄𝐗𝐏 🎖️\n│\n`

    text += usersPage.map((user, i) => {
      let index = start + i + 1
      let displayName = names[i] || `@${user.jid.split('@')[0]}`

      return `│ ✦ ${index}. *${displayName}*\n│    ├ 🎖 Nivel: *${user.level}*\n│    ├ 🪙 Monedas: *${user.cookies.toLocaleString()}*\n│    └ 💥 XP: *${user.exp.toLocaleString()}*`
    }).join('\n│\n')

    text += `\n╰══ 📄 Página *${page}* de *${totalPages}* ══╯`
    if (page < totalPages) text += `\n\n➡️ Usa *#lb ${page + 1}* para la siguiente página`

    await conn.reply(m.chat, text.trim(), m, {
      mentions: usersPage.map(u => u.jid)
    })

  } catch (error) {
    console.error(error)
    m.reply('❌ Ocurrió un error al mostrar el ranking.')
  }
}

handler.help = ['lb [página]']
handler.tags = ['rpg']
handler.command = ['lboard', 'top', 'lb']
handler.group = true
handler.register = true
handler.fail = null
handler.exp = 0

export default handler