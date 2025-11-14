export async function before(m, { conn }) {
  try {
    if (!m.messageStubType || !m.chat || !m.chat.endsWith('@g.us')) return;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.detect) return;

    const fkontak = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:Bot\nitem1.TEL;waid=${(m.sender || '').split('@')[0]}:${(m.sender || '').split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
        }
      }
    };

    const getSenderId = () => m.sender || m.key?.participant || m.participant || null;
    const senderId = getSenderId();
    const safeSplit = id => (typeof id === 'string' && id.includes('@')) ? id : (typeof id === 'string' ? `${id}@s.whatsapp.net` : null);

    let usuarioLegible = 'Desconocido';

    if (senderId && m.chat.endsWith('@g.us')) {
      try {
        const metadata = await conn.groupMetadata(m.chat);
        const participant = metadata.participants.find(p => p.id === senderId);
        usuarioLegible = participant?.displayName || participant?.pushname || senderId.split('@')[0];
      } catch {
        usuarioLegible = senderId.split('@')[0];
      }
    } else if (senderId) {
      usuarioLegible = senderId.split('@')[0];
    }

    const usuario = `*${usuarioLegible}*`;

    const parametros = Array.isArray(m.messageStubParameters) ? m.messageStubParameters : [];

    let pp;
    try {
      pp = await conn.profilePictureUrl(m.chat, 'image');
    } catch {
      pp = 'https://qu.ax/QGAVS.jpg';
    }

    const esNombreValido = txt => typeof txt === 'string' && txt && !txt.includes('@') && txt.length > 2;
    let mensaje = null;
    const t0 = parametros[0];

    switch (m.messageStubType) {
      case 21:
        if (esNombreValido(t0)) mensaje = `${usuario}\n✨ Ha cambiado el nombre del grupo\n\n🌻 Ahora el grupo se llama:\n*${t0}*`;
        break;
      case 22:
        mensaje = `${usuario}\n🚩 Ha cambiado la imagen del grupo`;
        break;
      case 23:
        mensaje = `${usuario}\n🌀 Ahora pueden configurar el grupo: ${['on', 'true', '1'].includes(String(t0).toLowerCase()) ? '*solo admins*' : '*todos*'}`;
        break;
      case 24:
        mensaje = `🌀 El enlace del grupo ha sido restablecido por:\n${usuario}`;
        break;
      case 25:
        const cerrado = ['on', 'true', '1'].includes(String(t0).toLowerCase());
        mensaje = `⚙️ El grupo ha sido ${cerrado ? '*cerrado 🔒*' : '*abierto 🔓*'} por ${usuario}\n\n💬 Ahora ${cerrado ? '*solo los admins*' : '*todos los miembros*'} pueden enviar mensajes`;
        break;
      case 29:
      case 30: {
        const rawTarget = parametros[0];
        const targetId = safeSplit(rawTarget || '');
        let targetName = 'Alguien';

        if (targetId && m.chat.endsWith('@g.us')) {
          try {
            const metadata = await conn.groupMetadata(m.chat);
            const participant = metadata.participants.find(p => p.id === targetId);
            targetName = participant?.displayName || participant?.pushname || targetId.split('@')[0];
          } catch {
            targetName = targetId.split('@')[0];
          }
        } else if (targetId) {
          targetName = targetId.split('@')[0];
        }

        mensaje = m.messageStubType === 29
          ? `*${targetName}* ahora es admin del grupo 🥳\n\n💫 Acción hecha por: ${usuario}`
          : `*${targetName}* deja de ser admin 😿\n\n💫 Acción hecha por: ${usuario}`;
        break;
      }
      default:
        return;
    }

    const contextInfo = {
      externalAdReply: {
        showAdAttribution: false,
        title: `⚙️ Configuración del Grupo`,
        body: `✡︎ Black-clover-MD • The Carlos`,
        mediaType: 2,
        sourceUrl: global.redes || '',
        thumbnail: global.icons || null
      }
    };

    const mentions = [];
    if (senderId) mentions.push(senderId);
    parametros.forEach(p => {
      if (!p) return;
      if (typeof p === 'string') {
        const maybeId = p.includes('@') ? p : (p.match(/^\d+$/) ? `${p}@s.whatsapp.net` : null);
        if (maybeId) mentions.push(maybeId);
      }
    });

    if (m.messageStubType === 22) {
      await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: mensaje,
        mentions,
        contextInfo
      }, { quoted: fkontak });
    } else {
      await conn.sendMessage(m.chat, {
        text: mensaje,
        mentions,
        contextInfo
      }, { quoted: fkontak });
    }

  } catch (e) {
    console.error('Error en detección de eventos de grupo:', e);
  }
}