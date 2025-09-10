let handler = async (m, { conn, participants, groupMetadata }) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => './src/avatar_contact.png')
  const groupAdmins = participants.filter(p => p.admin)
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ')
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

  let text = `
≡ *STAFF DEL GRUPO* _${groupMetadata.subject}_

👑 *Owner:* @${owner.split('@')[0]}

📊 *Info del grupo:*
▢ Participantes: ${participants.length}
▢ Admins: ${groupAdmins.length}

┌─⊷ *ADMINS*
▢ ${listAdmin}
└───────────
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: text,
    mentions: [...groupAdmins.map(v => v.id), owner]
  }, { quoted: m })
}

handler.help = ['staff', 'admins', 'listadmin']
handler.tags = ['group']
handler.command = ['staff', 'admins', 'listadmin']
handler.group = true

export default handler