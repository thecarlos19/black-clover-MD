let handler = async (m, { conn }) => {
  if (!m.quoted) {
    await conn.sendMessage(m.chat, { text: '🚩 Responde a un *video*.' }, { quoted: m });
    return;
  }

  const q = m.quoted;
  const mime = (q.msg || q).mimetype || '';
  if (!/(mp4)/.test(mime)) {
    await conn.sendMessage(m.chat, { text: '🚩 Responde a un *video*.' }, { quoted: m });
    return;
  }

  if (typeof m.react === 'function') await m.react('⌛');

  const media = await q.download();
  const caption = 'Aquí está. 🐢';

  await conn.sendMessage(m.chat, {
    video: media,
    gifPlayback: true,
    caption: caption,
    mimetype: 'video/mp4'
  }, { quoted: m });

  if (typeof m.react === 'function') await m.react('✅');
};

handler.help = ['togifaud'];
handler.tags = ['transformador'];
handler.command = ['togifaud'];

export default handler;