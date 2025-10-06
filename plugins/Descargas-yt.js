import fetch from "node-fetch";
import yts from "yt-search";
import Jimp from "jimp";

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;

async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer);
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG);
}

const handler = async (m, { conn, text, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⌛", key: m.key } });
  await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  if (!text?.trim()) return conn.reply(m.chat, `🥷🏻 Dime el nombre del video o canción que buscas`, m);

  try {
    let videoIdToFind = text.match(youtubeRegexID) || null;
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1]);

    if (videoIdToFind) {
      const videoId = videoIdToFind[1];
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId);
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2;

    if (!ytplay2 || ytplay2.length == 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply('🤖 No se encontraron resultados para tu búsqueda.');
    }

    let { title, thumbnail, url } = ytplay2;
    title = title || 'Audio desconocido';
    url = url || 'no encontrado';
    thumbnail = thumbnail || '';

    let thumbBuffer = null;
    if (thumbnail) {
      try {
        const resp = await fetch(thumbnail);
        thumbBuffer = Buffer.from(await resp.arrayBuffer());
      } catch (err) {
        console.log('No se pudo obtener la miniatura:', err.message);
      }
    }

    if (['ytmp3'].includes(command)) {
      const apiURL = `https://api.sylphy.xyz/download/ytmp3?apikey=sylphy_2962&url=${encodeURIComponent(url)}`;
      const res = await fetch(apiURL);
      const json = await res.json();

      if (!json?.status || !json.res?.url) return m.reply("❌ No se pudo descargar el audio desde Sylphy.");

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: json.res.url },
          mimetype: 'audio/mpeg',
          fileName: `${json.res.title || title}.mp3`,
          ptt: false,
          jpegThumbnail: thumbBuffer,
          caption: `${json.res.title || title} | #The Carlos 👑 (API: Sylphy)`
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    }

    if (['ytmp4doc'].includes(command)) {
      const apiURL = `https://api.sylphy.xyz/download/ytmp4?apikey=sylphy-fbb9&url=${encodeURIComponent(url)}`;
      const res = await fetch(apiURL);
      const json = await res.json();

      if (!json?.status || !json.res?.url) return m.reply("❌ No se pudo descargar el video desde Sylphy.");

      const dl = json.res.url;
      const videoTitle = json.res.title || title;

      await conn.sendMessage(
        m.chat,
        {
          document: { url: dl },
          fileName: `${videoTitle}.mp4`,
          mimetype: 'video/mp4',
          jpegThumbnail: thumbBuffer,
          caption: `${videoTitle} | #The Carlos 👑 (API: Sylphy)`
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    }

  } catch (error) {
    console.log("❌ Error:", error);
    return m.reply(`⚠️ Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ['ytmp3', 'ytmp4doc'];
handler.tags = ['descargas'];
export default handler;