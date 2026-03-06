const handler = async (m, { conn, isAdmin, groupMetadata }) => {
  if (isAdmin) return m.reply('✧ *Tu ya eres adm.*')

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')

    await m.react('✅')

    m.reply('✧ *Ya te di admin.*')

    let nn = await conn.getName(m.sender)

    conn.reply(
      '525544876071@s.whatsapp.net',
      `🚩 *${nn}* se dio Auto Admin en:\n> ${groupMetadata.subject}.`,
      m
    )

  } catch (e) {
    m.reply('✦ Ocurrio un error.')
  }
}

handler.tags = ['owner']
handler.help = ['autoadmin']
handler.command = ['autoadmin']
handler.rowner = true
handler.group = true
handler.botAdmin = true

export default handler