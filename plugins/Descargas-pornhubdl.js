import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { text: `🍭 Por favor ingrese el enlace del video de Pornhub.\nEjemplo: ${command} https://www.pornhub.com/view_video.php?viewkey=XXXX` }, { quoted: m });
  }

  try {
    const apiUrl = `https://www.dark-yasiya-api.site/download/phub?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.result || !json.result.format || json.result.format.length === 0) {
      throw new Error('No se pudo obtener información del video');
    }

    const videoInfo = json.result.format[0];
    const url = videoInfo.download_url;
    const title = json.result.video_title || 'Video Pornhub';

    if (!url) {
      throw new Error('No se encontró URL de descarga');
    }

    await m.react('🕑');
    await conn.sendMessage(
      m.chat,
      { video: { url }, caption: `🎬 ${title}` },
      { quoted: m }
    );
    await m.react('✅');
  } catch (error) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${error.message}` }, { quoted: m });
  }
};

handler.command = ['pornhubdl', 'phdl'];
handler.tags = ['descargas'];
handler.help = ['pornhubdl'];

export default handler;