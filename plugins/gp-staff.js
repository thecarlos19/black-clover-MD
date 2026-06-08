let handler = async (m, { conn, participants, groupMetadata, usedPrefix, command }) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => './src/avatar_contact.png')
  const groupAdmins = participants.filter(p => p.admin)
  const groupMembers = participants.filter(p => !p.admin)
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]} ${v.admin === 'superadmin' ? '👑' : '⭐'}`).join('\n▢ ')
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
  const bots = participants.filter(p => p.id.includes('bot') || p.id.includes('Bot')).length
  const creation = groupMetadata.creation ? new Date(groupMetadata.creation * 1000).toLocaleDateString('es') : 'Desconocida'

  let text = `≡ *STAFF DEL GRUPO* _${groupMetadata.subject}_\n\n`
  text += `👑 *Owner:* @${owner.split('@')[0]}\n\n`
  text += `📊 *Info del grupo:*\n`
  text += `▢ Participantes: ${participants.length}\n`
  text += `▢ Admins: ${groupAdmins.length}\n`
  text += `▢ Miembros: ${groupMembers.length}\n`
  text += `▢ Bots: ${bots}\n`
  text += `▢ Creación: ${creation}\n`
  text += `▢ Restricción: ${groupMetadata.restrict ? 'On' : 'Off'}\n`
  text += `▢ Anuncios: ${groupMetadata.announce ? 'Solo admins' : 'Todos'}\n\n`
  text += `┌─⊷ *ADMINS* (${groupAdmins.length})\n`
  text += `▢ ${listAdmin}\n`
  text += `└───────────`

  const buttons = [
    { buttonId: `${usedPrefix}listonline`, buttonText: { displayText: '🟢 Ver online' }, type: 1 },
    { buttonId: `${usedPrefix}kickinactive`, buttonText: { displayText: '🗑️ Limpiar inactivos' }, type: 1 },
    { buttonId: `${usedPrefix}gplink`, buttonText: { displayText: '🔗 Link grupo' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: text,
    footer: 'Staff 2026',
    buttons: buttons,
    headerType: 4,
    mentions: [...groupAdmins.map(v => v.id), owner]
  }, { quoted: m })
}

handler.listonline = async (m, { conn, participants }) => {
  const online = participants.filter(p => p.presence === 'available').length
  const text = `🟢 *Usuarios online ahora:* ${online}/${participants.length}\n\n> Nota: WhatsApp limita esta función`
  await m.reply(text)
}

handler.kickinactive = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!isAdmin) return m.reply('❌ Solo admins pueden usar esto')
  if (!isBotAdmin) return m.reply('❌ Necesito ser admin')

  await m.react('⏳')
  const users = global.db.data.users
  let inactive = []

  for (const p of participants) {
    if (p.admin || p.id === conn.user.jid) continue
    const user = users[p.id]
    const lastActive = user?.lastseen || user?.lastMessage || 0
    const daysInactive = (Date.now() - lastActive) / 86400000
    if (daysInactive > 30) inactive.push(p.id)
  }

  if (!inactive.length) return m.reply('✅ No hay usuarios inactivos +30 días')

  let txt = `🗑️ *Inactivos detectados:* ${inactive.length}\n\n`
  txt += inactive.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n')
  txt += `\n\nUsa *.kick* para eliminarlos`

  await conn.sendMessage(m.chat, { text: txt, mentions: inactive }, { quoted: m })
  await m.react('✅')
}

handler.before = async (m, { conn }) => {
  if (m.text === '.listonline') {
    const groupMetadata = await conn.groupMetadata(m.chat)
    return handler.listonline(m, { conn, participants: groupMetadata.participants })
  }
  if (m.text === '.kickinactive') {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    const isBotAdmin = groupMetadata.participants.find(p => p.id === conn.user.jid)?.admin
    return handler.kickinactive(m, { conn, participants: groupMetadata.participants, isAdmin, isBotAdmin })
  }
}

handler.help = ['staff', 'admins', 'listadmin', 'kickinactive', 'listonline']
handler.tags = ['group']

handler.command = [
  'staff',
  'listonline',
  'kickinactive',
  'admins',
  'gplink',
  'listadmin'
]

handler.group = true
handler.admin = false

export default handler