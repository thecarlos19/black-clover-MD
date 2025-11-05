export async function before(m, { conn }) {
  try {
    if (!m.messageStubType || !m.chat.endsWith('@g.us')) return

    const chat = global.db.data.chats[m.chat]
    if (!chat || !chat.detect) return

    const fkontak = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
        }
      }
    }

    // Obtener nombre del sender con try/catch
    let senderName
    try {
      senderName = await conn.getName(m.sender)
    } catch {
      senderName = `@${m.sender.split('@')[0]}`
    }
    const usuario = `*${senderName}*`

    const parametros = Array.isArray(m.messageStubParameters) ? m.messageStubParameters : []

    // Obtener foto de grupo
    let pp
    try {
      pp = await conn.profilePictureUrl(m.chat, 'image')
    } catch {
      pp = 'https://qu.ax/QGAVS.jpg'
    }

    const esNombreValido = txt => txt && !txt.includes('@') && txt.length > 2

    let mensaje = null

    switch (m.messageStubType) {
      case 21:
        if (esNombreValido(parametros[0])) {
          mensaje = `${usuario}\n✨ Ha cambiado el nombre del grupo\n\n🌻 Ahora el grupo se llama:\n*${parametros[0]}*`
        }
        break
      case 22:
        mensaje = `${usuario}\n🚩 Ha cambiado la imagen del grupo`
        break
      case 23:
        mensaje = `${usuario}\n🌀 Ahora pueden configurar el grupo: ${parametros[0] === 'on' ? '*solo admins*' : '*todos*'}`
        break
      case 24:
        mensaje = `🌀 El enlace del grupo ha sido restablecido por:\n${usuario}`
        break
      case 25:
        mensaje = `⚙️ El grupo ha sido ${parametros[0] === 'on' ? '*cerrado 🔒*' : '*abierto 🔓*'} por ${usuario}\n\n💬 Ahora ${parametros[0] === 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensajes`
        break
      case 29: {
        const target = parametros[0]
        let targetName
        try {
          targetName = target ? await conn.getName(target) : `@${target.split('@')[0]}`
        } catch {
          targetName = target ? `@${target.split('@')[0]}` : 'alguien'
        }
        mensaje = `*${targetName}* ahora es admin del grupo 🥳\n\n💫 Acción hecha por:\n${usuario}`
        break
      }
      case 30: {
        const target = parametros[0]
        let targetName
        try {
          targetName = target ? await conn.getName(target) : `@${target.split('@')[0]}`
        } catch {
          targetName = target ? `@${target.split('@')[0]}` : 'alguien'
        }
        mensaje = `*${targetName}* deja de ser admin 😿\n\n💫 Acción hecha por:\n${usuario}`
        break
      }
    }

    if (!mensaje) return

    const contextInfo = {
      externalAdReply: {
        showAdAttribution: false,
        title: `⚙️ Configuración del Grupo`,
        body: `✡︎ Black-clover-MD • The Carlos`,
        mediaType: 2,
        sourceUrl: global.redes || '',
        thumbnail: global.icons || null
      }
    }

    if (m.messageStubType === 22) {
      await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: mensaje,
        mentions: [m.sender],
        contextInfo
      }, { quoted: fkontak })
    } else {
      const mentions = [m.sender]
      parametros.forEach(p => { if (p && p.endsWith('@s.whatsapp.net')) mentions.push(p) })

      await conn.sendMessage(m.chat, {
        text: mensaje,
        mentions,
        contextInfo
      }, { quoted: fkontak })
    }
  } catch (e) {
    console.error('Error en detección de eventos de grupo:', e)
  }
}