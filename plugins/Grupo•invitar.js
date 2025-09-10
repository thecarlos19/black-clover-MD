let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🍟 Ingrese el número al que quiere enviar una invitación al grupo\n\n🚩 Ejemplo :\n*${usedPrefix + command}* 523218138672`)
  }
  if (text.includes('+')) return m.reply('🚩 Ingrese el número todo sin el *+*')
  if (isNaN(text)) return m.reply('🍟 Ingrese sólo números más su código de país sin espacios')

  let group = m.chat
  let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
  let number = text + '@s.whatsapp.net'

  try {
    await conn.sendMessage(number, {
      text: `🍟 *INVITACIÓN A GRUPO*\n\nUn usuario te invitó a unirte a este grupo 👇\n\n${link}`,
      mentions: [m.sender]
    })
    await m.reply(`🍟 Se envió un enlace de invitación al usuario.`)
  } catch (e) {
    console.error(e)
    await m.reply('🚩 No se pudo enviar la invitación. Es posible que el número no exista, no tenga WhatsApp o nunca haya hablado con el bot.')
  }
}

handler.help = ['invite *<numero>*']
handler.tags = ['grupo']
handler.command = ['invite', 'invitar']
handler.group = true
// handler.admin = true
handler.botAdmin = true

export default handler