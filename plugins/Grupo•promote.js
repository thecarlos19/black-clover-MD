var handler = async (m, { conn, usedPrefix, command, text }) => {
  let number;

  if (!text && !m.quoted) {
    return conn.reply(
      m.chat,
      `🚩 *Responde a un participante del grupo o menciónalo para asignarle admin.*`,
      m
    );
  }

  if (isNaN(text) && text.includes('@')) {
    number = text.split`@`[1];
  } else if (!isNaN(text)) {
    number = text;
  }

  if (!number || number.length > 13 || (number.length < 11 && number.length > 0)) {
    return conn.reply(
      m.chat,
      `✨️ *Debe responder o mencionar a una persona válida para usar este comando.*`,
      m
    );
  }

  let user;
  try {
    if (text) {
      user = number + '@s.whatsapp.net';
    } else if (m.quoted?.sender) {
      user = m.quoted.sender;
    } else if (m.mentionedJid?.[0]) {
      user = number + '@s.whatsapp.net';
    }
  } catch (e) {
    return;
  }

  // Validar si el bot es admin
  const groupMeta = await conn.groupMetadata(m.chat);
  const botJid = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
  const botIsAdmin = groupMeta.participants.find(p => p.jid === botJid)?.admin;

  if (!botIsAdmin) {
    return conn.reply(
      m.chat,
      `🤖 *BOT SIN PERMISOS SUFICIENTES*\n\n> Debo tener permisos de *Administrador* para ejecutar esta acción.\n\n🔍 Ejecuta: *dar al bot admin*\n🔒 Estado actual: *no admin XD*`,
      m
    );
  }

  await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
  conn.reply(m.chat, `✅ *Fue agregado como admin del grupo con éxito.*`, m);
};

handler.help = ['promote'];
handler.tags = ['grupo'];
handler.command = ['promote', 'promover'];
handler.group = true;
handler.admin = true;
handler.fail = null;

export default handler;