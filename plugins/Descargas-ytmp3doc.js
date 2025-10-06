import fetch from "node-fetch";
import yts from "yt-search";

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) {
      await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
      return conn.reply(m.chat, `Ingresa el nombre del video a descargar.`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: "⌛", key: m.key } });

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
      return m.reply("No se encontraron resultados para tu búsqueda.");
    }

    const videoInfo = search.all[0];
    const { title, url, thumbnail } = videoInfo;

    let thumbBuffer = null;
    if (thumbnail) {
      try {
        const resp = await fetch(thumbnail);
        thumbBuffer = Buffer.from(await resp.arrayBuffer());
      } catch (err) {
        console.log('No se pudo obtener la miniatura:', err.message);
      }
    }

    const apiURL = `https://api.sylphy.xyz/download/ytmp3?apikey=sylphy_2962&url=${encodeURIComponent(url)}`;
    const res = await fetch(apiURL);
    const json = await res.json();

    if (!json?.status || !json.res?.url) {
      await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
      return m.reply("No se pudo descargar el audio.");
    }

    const downloadUrl = json.res.url;
    const fileName = `${json.res.title || title}.mp3`;

    await conn.sendMessage(
      m.chat,
      {
        document: { url: downloadUrl },
        mimetype: "audio/mpeg",
        fileName: fileName,
        jpegThumbnail: thumbBuffer,
        caption: `${json.res.title || title}` 
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
    return m.reply(`Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ["ytmp3doc"];
handler.tags = ["descargas"];

export default handler;