let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) {
    return conn.reply(m.chat, '🚩 Responde al mensaje que deseas eliminar.', m);
  }

  try {
    const delet = m.message.extendedTextMessage.contextInfo.participant;
    const bang = m.message.extendedTextMessage.contextInfo.stanzaId;
    const botJid = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
    const groupMeta = m.isGroup ? await conn.groupMetadata(m.chat) : null;
    const botIsAdmin = m.isGroup
      ? groupMeta.participants.find(p => p.jid === botJid)?.admin
      : true;

    if (m.isGroup && !botIsAdmin) {
      return conn.reply(
        m.chat,
        `🤖 *BOT SIN PERMISOS SUFICIENTES*\n\n> Debo tener permisos de *Administrador* para ejecutar esta acción.\n\n🔍 Ejecuta: *dar al bot admin*\n🔒 Estado actual: *no admin XD*`,
        m
      );
    }

    return conn.sendMessage(m.chat, {
      delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }
    });
  } catch {
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: m.quoted.key.id } });
  }
};

handler.help = ['delete'];
handler.tags = ['grupo'];
handler.command = ['delete', 'del'];
handler.group = true;
handler.admin = true;

export default handler;