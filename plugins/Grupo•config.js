let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Obtener imagen del grupo (o un placeholder si falla)
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://qu.ax/QGAVS.jpg')

    // Diccionario de opciones
    const opciones = {
      open: 'not_announcement',
      close: 'announcement',
      abierto: 'not_announcement',
      cerrado: 'announcement',
      abrir: 'not_announcement',
      cerrar: 'announcement',
      desbloquear: 'not_announcement',
      bloquear: 'announcement'
    }

    const accion = opciones[(args[0] || '').toLowerCase()]
    if (!accion) {
      return conn.sendMessage(m.chat, {
        text: `*Elija una opción válida para configurar el grupo:*\n\n` +
              `• ${usedPrefix + command} abrir\n` +
              `• ${usedPrefix + command} cerrar\n` +
              `• ${usedPrefix + command} desbloquear\n` +
              `• ${usedPrefix + command} bloquear`
      }, { quoted: m })
    }

    // Aplicar cambio en la configuración del grupo
    await conn.groupSettingUpdate(m.chat, accion)

    // Respuesta según el estado
    if (accion === 'not_announcement') {
      m.reply(`🔓 *El grupo ha sido abierto.*\n\nTodos los miembros pueden enviar mensajes.`)
    } else {
      m.reply(`🔐 *El grupo ha sido cerrado.*\n\nSolo los administradores pueden enviar mensajes.`)
    }
  } catch (err) {
    console.error('Error al actualizar la configuración del grupo:', err)
    m.reply('❌ *Ocurrió un error al intentar actualizar la configuración del grupo.*')
  }
}

handler.help = ['group <abrir/cerrar>', 'grupo <abrir/cerrar>']
handler.tags = ['grupo']
handler.command = ['group', 'grupo']
handler.admin = true
handler.botAdmin = true

export default handler