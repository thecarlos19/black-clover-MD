import fs from 'fs';

export async function before(m, { conn }) {
  try {
    if (!m.isGroup) return true; 

    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.welcome) return true;

    const type = m.messageStubType;
    if (!type) return true;

    const params = m.messageStubParameters || [];
    if (params.length === 0 && !m.participant) return true;

    const who = (params[0] || m.participant) + '@s.whatsapp.net';
    const user = global.db.data.users[who];
    const userName = user ? user.name : await conn.getName(who);
    const mentionedJids = [who];

    const welcomeAudio = 'https://files.catbox.moe/ha1slk.mp3';
    const goodbyeAudio = 'https://files.catbox.moe/5cslwo.mp3';

    const welcomeThumb = global.welcome; 
    const goodbyeThumb = global.adios;   

    if ([7, 27].includes(type)) {
      await conn.sendMessage(m.chat, {
        audio: { url: welcomeAudio },
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: {
          mentionedJid: mentionedJids,
          externalAdReply: {
            thumbnail: welcomeThumb,
            title: "  ͟͞ Ｗ Ｅ Ｌ Ｃ Ｏ Ｍ Ｅ ͟͞  ",
            body: `${userName}!`,
            previewType: "PHOTO",
            renderLargerThumbnail: true,
            showAdAttribution: true
          }
        }
      });
    }

    if ([28, 32].includes(type)) {
      await conn.sendMessage(m.chat, {
        audio: { url: goodbyeAudio },
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: {
          mentionedJid: mentionedJids,
          externalAdReply: {
            thumbnail: goodbyeThumb,
            title: '  ͟͞ Ａ Ｄ Ｉ Ｏ Ｓ ͟͞  ',
            body: `${userName}, se despide.`,
            previewType: "PHOTO",
            renderLargerThumbnail: true,
            showAdAttribution: true
          }
        }
      });
    }

    return true;

  } catch (err) {
    console.error('Error en welcome:', err);
    return true;
  }
}