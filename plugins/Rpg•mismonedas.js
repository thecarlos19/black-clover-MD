const handler = async (m, { conn }) => {
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  const user = global.db.data.users[m.sender]

  const monedas = Number(user.monedas || 0)
  const xp = Number(user.exp || 0)
  const nivel = Number(user.level || 0)

  const mensaje = `
╭━━━〔 *📊 ESTADO DE TU CUENTA* 〕━━━⬣
┃🪙 Monedas: *${monedas.toLocaleString()}*
┃✨ Experiencia: *${xp.toLocaleString()}*
┃🔝 Nivel: *${nivel.toLocaleString()}*
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`

  return conn.reply(m.chat, mensaje.trim(), m)
}

handler.help = ['miestatus', 'mismonedas', 'miexp']
handler.tags = ['rpg', 'economia']
handler.command = ['miestatus', 'mismonedas', 'miexp']
handler.register = true

export default handler