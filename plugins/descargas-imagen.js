import { googleImage } from '@bochilteam/scraper';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `*🥷 Uso correcto:* ${usedPrefix + command} Yuki Suou`;
  }

  await conn.sendMessage(m.chat, { text: '⚔️ *Buscando imágenes...*' }, { quoted: m });

  try {
    const results = await googleImage(text);
    if (!results || results.length === 0) {
      return conn.sendMessage(m.chat, { text: `❌ No se encontraron imágenes para *${text}*.` }, { quoted: m });
    }

    // Tomar una imagen aleatoria
    const randomImage = results[Math.floor(Math.random() * results.length)];

    // Enviar la imagen encontrada
    await conn.sendMessage(m.chat, {
      image: { url: randomImage },
      caption: `🔍 *Resultado de búsqueda:* ${text}`
    }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
  }
};

handler.help = ['imagen <query>'];
handler.tags = ['buscador', 'descargas'];
handler.command = ['image', 'imagen'];
handler.group = true;
handler.register = true;

export default handler;