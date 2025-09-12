var handler = async (m, { conn }) => {
  try {
    async function getLidFromJid(id, conn) {
      if (id.endsWith('@lid')) return id;
      const res = await conn.onWhatsApp(id).catch(() => []);
      return res[0]?.lid || id;
    }

    const botLid = await getLidFromJid(conn.user.jid, conn);
    const botJid = conn.user.jid;

    const groupMetadata = m.isGroup
      ? ((conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(() => null))
      : {};

    const participants = m.isGroup && groupMetadata ? (groupMetadata.participants || []) : [];

    const bot = participants.find(
      p => (p?.id === botLid || p?.id === botJid || p?.jid === botLid || p?.jid === botJid)
    ) || {};

    const isBotAdmin = (bot && (bot.admin === 'admin' || bot.admin === 'superadmin'));

    if (!isBotAdmin) {
      return conn.reply(
        m.chat,
        `🤖 *BOT SIN PERMISOS SUFICIENTES*\n\n> Debo tener permisos de *Administrador* para ejecutar esta acción.\n\n🔍 Ejecuta: *dar al bot admin*\n🔒 Estado actual: *no admin XD*`,
        m
      );
    }

    const code = await conn.groupInviteCode(m.chat);
    const link = 'https://chat.whatsapp.com/' + code;

    conn.reply(m.chat, `🚩 Aquí tienes el link del grupo:\n${link}`, m, { detectLink: true });
  } catch (error) {
    console.error(error);
    conn.reply(
      m.chat,
      '❌ Ocurrió un error al generar el link. Asegúrate de que soy administrador y que el grupo permite links.',
      m
    );
  }
};

handler.help = ['link'];
handler.tags = ['grupo'];
handler.command = ['link'];
handler.group = true;

export default handler;