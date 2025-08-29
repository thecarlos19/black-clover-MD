import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
  if (command === 'mute') {
    if (!isAdmin) throw '💌 *Solo un administrador puede ejecutar este comando*';

    const ownerNumber = global.owner[0][0] + '@s.whatsapp.net';
    if (m.mentionedJid[0] === ownerNumber) throw '🚩 *No puedes mutar el creador del bot*';

    let user = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : text;

    if (user === conn.user.jid) throw '🚩 *No puedes mutar el bot*';

    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupOwner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

    if (m.mentionedJid[0] === groupOwner) throw '🚩 *No puedes mutar el creador del grupo*';

    let userData = global.db.data.users[user];
    let fkontak = {
      key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
          vcard:
            'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    };

    let textReply = '🚩 *Menciona a la persona que deseas mutar*';

    if (!m.mentionedJid[0] && !m.quoted) {
      return conn.reply(m.chat, textReply, m);
    }

    if (userData.mute === true) throw '🚩 *Este usuario ya ha sido mutado*';

    conn.reply(m.chat, '*Tus mensajes serán eliminados*', fkontak, null, { mentions: [user] });
    global.db.data.users[user].mute = true;
  }

  if (command === 'unmute') {
    if (!isAdmin) throw '🚩 *Solo un administrador puede ejecutar este comando*';

    let user = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : text;

    let userData = global.db.data.users[user];
    let fkontak = {
      key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
          vcard:
            'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    };

    let textReply = '🚩 *Menciona a la persona que deseas demutar*';

    if (user === m.sender) throw '🚩 *Sólo otro administrador puede desmutarte*';

    if (!m.mentionedJid[0] && !m.quoted) {
      return conn.reply(m.chat, textReply, m);
    }

    if (userData.mute === false) throw '🚩 *Este usuario no ha sido mutado*';

    global.db.data.users[user].mute = false;
    conn.reply(m.chat, '*Tus mensajes no serán eliminados*', fkontak, null, { mentions: [user] });
  }
};

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;