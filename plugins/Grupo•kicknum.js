const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin }) => {
  if (!args[0] || isNaN(args[0])) {
    return conn.reply(
      m.chat,
      `🚩 Ingrese un prefijo de país válido.\nEjemplo: ${usedPrefix + command} 58`,
      m
    );
  }

  const prefix = args[0].replace(/[+]/g, '');
  const usersWithPrefix = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid && v.startsWith(prefix));

  if (usersWithPrefix.length === 0) {
    return conn.reply(
      m.chat,
      `🚩 *Aquí no hay ningún número con el prefijo +${prefix}*`,
      m
    );
  }

  const mentionsList = usersWithPrefix.map(v => '⭔ @' + v.replace(/@.+/, ''));
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const botSettings = global.db.data.settings[conn.user.jid] || {};

  switch (command) {
    case 'listanum':
    case 'listnum':
      conn.reply(
        m.chat,
        `🚩 *Lista de números con el prefijo +${prefix} que están en este grupo:*\n\n` + mentionsList.join`\n`,
        m,
        { mentions: usersWithPrefix }
      );
      break;

    case 'kicknum':
      if (!botSettings.restrict) {
        return conn.reply(
          m.chat,
          '🚩 *¡Este comando está deshabilitado por el propietario del bot!*',
          m
        );
      }

      if (!isBotAdmin) {
        return conn.reply(
          m.chat,
          `🤖 *BOT SIN PERMISOS SUFICIENTES*\n\n> Debo tener permisos de *Administrador* para ejecutar esta acción.\n🔒 Estado actual: *no admin XD*`,
          m
        );
      }

      await conn.reply(m.chat, `🚩 *Iniciando eliminación de usuarios con prefijo +${prefix}...*`, m);

      const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';

      for (const user of usersWithPrefix) {
        if (
          user === ownerGroup ||
          user === conn.user.jid ||
          user === global.owner?.[0]?.[0] + '@s.whatsapp.net' ||
          user === isSuperAdmin
        ) continue;

        await delay(2000);

        try {
          const response = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          if (response[0]?.status === '404') {
            const errorMsg = `@${user.split('@')[0]} ya ha sido eliminado o abandonó el grupo. 🌸`;
            await conn.reply(m.chat, errorMsg, m, { mentions: [user] });
          }
        } catch (e) {
          await conn.reply(m.chat, `✖️ *Error eliminando a @${user.split('@')[0]}*`, m, { mentions: [user] });
        }

        await delay(10000);
      }
      break;
  }
};

handler.command = ['kicknum', 'listnum', 'listanum'];
handler.group = true;
handler.admin = true;
handler.fail = null;

export default handler;