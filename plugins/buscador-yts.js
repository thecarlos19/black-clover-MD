import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text }) => {
  if (!text) throw '⚠️ *_¿Qué quieres que busque en YouTube?_*';

  const results = await yts(text);
  const tes = results.all;

  const teks = tes
    .map((v) => {
      if (v.type === 'video') {
        return `
° *_${v.title}_*
↳ 🫐 *_Link :_* ${v.url}
↳ 🕒 *_Duración :_* ${v.timestamp}
↳ 📥 *_Subido :_* ${v.ago}
↳ 👁 *_Vistas :_* ${v.views}`;
      }
    })
    .filter((v) => v)
    .join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');

  // Usamos sendMessage en lugar de sendFile
  await conn.sendMessage(m.chat, {
    image: { url: tes[0].thumbnail },
    caption: teks,
  }, { quoted: m });
};

handler.help = ['ytsearch *<texto>*'];
handler.tags = ['search'];
handler.command = ['ytsearch', 'yts'];
export default handler;