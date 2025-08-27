var handler = async (m, { conn }) => {
  try {
    let group = m.chat;

    // Verificar si el bot es admin
    const groupMetadata = await conn.groupMetadata(group);
    const botIsAdmin = groupMetadata.participants.some(p => p.id === conn.user.id && p.admin);

    if (!botIsAdmin) {
      return conn.reply(group, '❌ No soy administrador del grupo, no puedo generar el link.', m);
    }

    // Obtener el código de invitación
    const code = await conn.groupInviteCode(group);
    const link = 'https://chat.whatsapp.com/' + code;

    conn.reply(group, `🚩 Aquí tienes el link del grupo:\n${link}`, m, { detectLink: true });
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '❌ Ocurrió un error al generar el link. Asegúrate de que soy administrador y que el grupo permite links.', m);
  }
}

handler.help = ['link'];
handler.tags = ['grupo'];
handler.command = ['link'];

handler.group = true;
handler.botAdmin = true;

export default handler;