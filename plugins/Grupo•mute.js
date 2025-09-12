import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
  if (!isAdmin) {
    return conn.reply(
      m.chat,
      `🤖 *BOT SIN PERMISOS SUFICIENTES*\n\n> Solo un administrador puede ejecutar este comando.\n🔒 Estado actual: *no admin XD*`,
      m
    );
  }

  let user = m.mentionedJid?.[0] || m.quoted?.sender || text;
  if (!user) {
    return conn.reply(
      m.chat,
      command === 'mute'
        ? '🚩 *Menciona a la persona que deseas mutar*'
        : '🚩 *Menciona a la persona que deseas demutar*',
      m
    );
  }

  if (user === conn.user.jid) {
    return conn.reply(m.chat, '🚩 *No puedes mutar o desmutar al bot*', m);
  }

  const ownerNumber = global.owner[0][0] + '@s.whatsapp.net';
  if (user === ownerNumber) return conn.reply(m.chat, '🚩 *No puedes mutar al creador del bot*', m);

  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupOwner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  if (user === groupOwner) return conn.reply(m.chat, '🚩 *No puedes mutar al creador del grupo*', m);

  const userData = global.db.data.users[user] || {};
  const fkontak = {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
    message: {
      locationMessage: {
        name: command === 'mute' ? '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼' : '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
        jpegThumbnail: await (await fetch(
          command === 'mute'
            ? 'https://telegra.ph/file/f8324d9798fa2ed2317bc.png'
            : 'https://telegra.ph/file/aea704d0b242b8c41bf15.png'
        )).buffer(),
        vcard:
          'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  };

  if (command === 'mute') {
    if (userData.mute === true) return conn.reply(m.chat, '🚩 *Este usuario ya ha sido mutado*', m);
    global.db.data.users[user] = { ...userData, mute: true };
    conn.reply(m.chat, '*Tus mensajes serán eliminados*', fkontak, null, { mentions: [user] });
  }

  if (command === 'unmute') {
    if (userData.mute === false || !userData.mute) return conn.reply(m.chat, '🚩 *Este usuario no ha sido mutado*', m);
    if (user === m.sender) return conn.reply(m.chat, '🚩 *Sólo otro administrador puede desmutarte*', m);
    global.db.data.users[user].mute = false;
    conn.reply(m.chat, '*Tus mensajes no serán eliminados*', fkontak, null, { mentions: [user] });
  }
};

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;

export default handler;