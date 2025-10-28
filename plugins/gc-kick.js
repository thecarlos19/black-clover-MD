//código creado x The Carlos 👑 
//no quiten créditos 
var handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) 
      return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) 
      return conn.reply(m.chat, '> _Responde un mensaje o etiqueta a la persona que quieres expulsar._', m);

    const groupMeta = await conn.groupMetadata(m.chat);
    const ownerGroup = groupMeta.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // Verificar que el bot sea admin antes de expulsar
    const botIsAdmin = groupMeta.participants.some(p => p.jid === botJid && p.admin);
    if (!botIsAdmin) 
      return conn.reply(m.chat, '🚩 Necesito ser administrador para poder expulsar usuarios.', m);

    // Evitar expulsar al dueño o a números autorizados
    if ([ownerGroup, botJid, ...(global.owner?.map(o => o[0] + '@s.whatsapp.net') || [])].includes(target)) {
      return conn.reply(m.chat, '🚩 No puedo expulsar al propietario o a un número autorizado.', m);
    }

    // Evitar expulsar admins del grupo
    const userIsAdmin = groupMeta.participants.some(p => p.jid === target && p.admin);
    if (userIsAdmin) 
      return conn.reply(m.chat, '🚩 No puedo expulsar a un administrador del grupo.', m);

    // Expulsar al usuario
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
    conn.reply(m.chat, `✅ Usuario @${target.split('@')[0]} expulsado.`, m, { mentions: [target] });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '❌ Ocurrió un error al intentar expulsar al usuario.', m);
  }
};

handler.help = ['kick @usuario'];
handler.tags = ['grupo'];
handler.command = ['kick', 'echar', 'sacar', 'ban'];
handler.admin = true;
handler.group = true;

export default handler;