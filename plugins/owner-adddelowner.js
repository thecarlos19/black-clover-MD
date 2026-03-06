const handler = async (m, { conn, text, command }) => {
  global.db.data.owners ||= []

  const why = `${emoji} Por favor menciona o responde a un usuario.`
  const who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.quoted
    ? m.quoted.sender
    : text
    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    : false

  if (command === 'owners') {
    if (!global.db.data.owners.length) return conn.reply(m.chat, 'No hay owners registrados.', m)
    let txt = `👑 LISTA DE OWNERS\n\n`
    for (let i of global.db.data.owners) {
      txt += `• @${i.split('@')[0]}\n`
    }
    return conn.reply(m.chat, txt, m, { mentions: global.db.data.owners })
  }

  if (!who) return conn.reply(m.chat, why, m, { mentions: [m.sender] })

  switch (command) {

    case 'addowner':
      if (!global.db.data.owners.includes(who)) {
        global.db.data.owners.push(who)
        await conn.reply(m.chat, `${emoji} Usuario agregado como owner.`, m)
      } else {
        await conn.reply(m.chat, `${emoji2} Ese usuario ya es owner.`, m)
      }
    break

    case 'delowner':
      const index = global.db.data.owners.indexOf(who)

      if (index !== -1) {
        global.db.data.owners.splice(index, 1)
        await conn.reply(m.chat, `${emoji2} Owner eliminado correctamente.`, m)
      } else {
        await conn.reply(m.chat, `${emoji2} Ese usuario no es owner.`, m)
      }
    break
  }
}

handler.command = ['addowner', 'delowner', 'owners']
handler.rowner = true

export default handler