export async function before(m, { conn }) {
  try {
    if (!m.isGroup || !m.messageStubType) return

    const chat = global?.db?.data?.chats?.[m.chat]
    if (!chat?.detect) return

    const fkontak = {
      key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
      },
      message: {
        contactMessage: {
          vcard:
            `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${(m.sender || '').split('@')[0]}:${(m.sender || '').split('@')[0]}\nEND:VCARD`
        }
      }
    }

    const senderId = m.sender || m.key?.participant
    if (!senderId) return

    const safeId = id =>
      typeof id === 'string'
        ? id.includes('@')
          ? id
          : `${id}@s.whatsapp.net`
        : null

    let metadata
    try {
      metadata = await conn.groupMetadata(m.chat)
    } catch {
      metadata = null
    }

    const participants = metadata?.participants || []

    // ✅ FIX: nunca devuelve undefined
    const getName = async (id) => {
      const jid = safeId(id)
      if (!jid) return 'Usuario'

      try {
        const name = await conn.getName(jid)
        if (name && name !== 'undefined') return name
      } catch {}

      const p = participants.find(x => [x.id, x.jid].includes(jid))
      return (
        p?.name ||
        p?.notify ||
        p?.pushname ||
        jid.split('@')[0]
      )
    }

    // 🔥 SOLO MENCIÓN (como pediste)
    const usuario = `@${senderId.split('@')[0]}`

    const params = Array.isArray(m.messageStubParameters)
      ? m.messageStubParameters
      : []

    let pp
    try {
      pp = await conn.profilePictureUrl(m.chat, 'image')
    } catch {
      pp = global.icons || 'https://qu.ax/QGAVS.jpg'
    }

    const isValidText = t =>
      typeof t === 'string' && t.trim().length > 1 && !t.includes('@')

    const t0 = params[0]
    let mensaje = null

    switch (m.messageStubType) {
      case 21:
        if (isValidText(t0)) {
          mensaje = `${usuario}\n✨ cambió el nombre del grupo\n\n🌿 Nuevo nombre:\n*${t0}*`
        }
        break

      case 22:
        mensaje = `${usuario}\n🖼️ cambió la foto del grupo`
        break

      case 23:
        mensaje = `${usuario}\n⚙️ permisos del grupo actualizados`
        break

      case 24:
        mensaje = `${usuario}\n🔗 reinició el enlace del grupo`
        break

      case 25:
        mensaje = `${usuario}\n🔒 configuración de mensajes del grupo cambió`
        break

      case 29:
      case 30: {
        const target = safeId(params[0])
        const tag = target ? `@${target.split('@')[0]}` : 'Alguien'

        mensaje =
          m.messageStubType === 29
            ? `${tag} ahora es admin 🥳\n\n👤 Por: ${usuario}`
            : `${tag} ya no es admin 😿\n\n👤 Por: ${usuario}`
        break
      }

      default:
        return
    }

    if (!mensaje) return

    const contextInfo = {
      externalAdReply: {
        showAdAttribution: false,
        title: '⚙️ Eventos del Grupo',
        body: 'Black Clover MD • The Carlos',
        mediaType: 2,
        sourceUrl: global.redes || '',
        thumbnailUrl: pp
      }
    }

    const mentions = [senderId]

    for (const p of params) {
      const id = safeId(p)
      if (id) mentions.push(id)
    }

    const msgOptions = {
      mentions,
      contextInfo,
      ...(m.messageStubType === 22
        ? { image: { url: pp }, caption: mensaje }
        : { text: mensaje })
    }

    await conn.sendMessage(m.chat, msgOptions, { quoted: fkontak })

  } catch (e) {
    console.error('error eventos grupo:', e)
  }
}