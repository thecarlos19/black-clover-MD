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

    const usuario = `@${m.sender.split('@')[0]}`
    const parametros = m.messageStubParameters || []
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => 'https://qu.ax/QGAVS.jpg')

    const esNombreValido = (txt) => txt && !txt.includes('@') && txt.length > 2

    const mensajes = {
      21: esNombreValido(parametros[0])
        ? `*${usuario}*\n✨ Ha cambiado el nombre del grupo\n\n🌻 Ahora el grupo se llama:\n*${parametros[0]}*`
        : null,
      22: `*${usuario}*\n🚩 Ha cambiado la imagen del grupo`,
      23: `*${usuario}*\n🌀 Ahora pueden configurar el grupo: ${parametros[0] === 'on' ? '*solo admins*' : '*todos*'}`,
      24: `🌀 El enlace del grupo ha sido restablecido por:\n*${usuario}*`,
      25: `El grupo ha sido ${parametros[0] === 'on' ? '*cerrado 🔒*' : '*abierto 🔓*'} por *${usuario}*\n\n💬 Ahora ${parametros[0] === 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensajes`,
      29: `*@${parametros[0]?.split('@')[0] || 'alguien'}* ahora es admin del grupo 🥳\n\n💫 Acción hecha por:\n*» ${usuario}*`,
      30: `*@${parametros[0]?.split('@')[0] || 'alguien'}* deja de ser admin 😿\n\n💫 Acción hecha por:\n*» ${usuario}*`
    }

    const mensaje = mensajes[m.messageStubType]
    if (!mensaje) return

    const contextInfo = {
      externalAdReply: {
        showAdAttribution: false,
        title: `⚙️ Configuración`,
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
      if (parametros[0] && parametros[0].endsWith('@s.whatsapp.net')) mentions.push(parametros[0])

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