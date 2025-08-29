import { WAMessageStubType } from '@whiskeysockets/baileys'

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

    const mensajes = {
      [WAMessageStubType.GROUP_CHANGE_SUBJECT]: `*${usuario}*\n✨ Ha cambiado el nombre del grupo\n\n🌻 Ahora el grupo se llama:\n*${parametros[0] || 'Sin nombre'}*`,
      [WAMessageStubType.GROUP_CHANGE_ICON]: `*${usuario}*\n🚩 Ha cambiado la imagen del grupo`,
      [WAMessageStubType.GROUP_CHANGE_SETTINGS]: `*${usuario}*\n🌀 Ahora pueden configurar el grupo: ${parametros[0] === 'on' ? '*solo admins*' : '*todos*'}`,
      [WAMessageStubType.GROUP_CHANGE_INVITE_LINK]: `🌀 El enlace del grupo ha sido restablecido por:\n*${usuario}*`,
      [WAMessageStubType.GROUP_CHANGE_ANNOUNCE]: `El grupo ha sido ${parametros[0] === 'on' ? '*cerrado 🔒*' : '*abierto 🔓*'} por *${usuario}*\n\n💬 Ahora ${parametros[0] === 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensajes`,
      [WAMessageStubType.PARTICIPANT_PROMOTE]: `*@${parametros[0]?.split('@')[0] || 'alguien'}* ahora es admin del grupo 🥳\n\n💫 Acción hecha por:\n*» ${usuario}*`,
      [WAMessageStubType.PARTICIPANT_DEMOTE]: `*@${parametros[0]?.split('@')[0] || 'alguien'}* deja de ser admin 😿\n\n💫 Acción hecha por:\n*» ${usuario}*`
    }

    const mensaje = mensajes[m.messageStubType]
    if (!mensaje) return

    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_ICON) {
      await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: mensaje,
        mentions: [m.sender]
      }, { quoted: fkontak })
    } else {
      const mentions = [m.sender]
      if (parametros[0] && parametros[0].endsWith('@s.whatsapp.net')) mentions.push(parametros[0])

      await conn.sendMessage(m.chat, {
        text: mensaje,
        mentions
      }, { quoted: fkontak })
    }
  } catch (e) {
    console.error('Error en detección de eventos de grupo:', e)
  }
}