import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";

const formatAudio = ["mp3", "m4a", "webm", "aac", "flac", "opus", "ogg", "wav"];

const ddownr = {
  download: async (url, format) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    };
    const response = await axios.request(config);
    if (response.data && response.data.success) {
      const { id } = response.data;
      const downloadUrl = await ddownr.cekProgress(id);
      return downloadUrl;
    }
    throw new Error("Fallo al obtener los detalles del video.");
  },
  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    };
    while (true) {
      const response = await axios.request(config);
      if (response.data && response.data.success && response.data.progress === 1000) {
        return response.data.download_url;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

const apisExtra = [
  {
    name: "Vreden",
    fetchUrl: async (url) => {
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.result?.download?.url || null;
    }
  },
  {
    name: "ZenzzXD",
    fetchUrl: async (url) => {
      const res = await fetch(`https://api.zenzxz.my.id/downloader/ytmp3?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.download_url || null;
    }
  },
  {
    name: "ZenzzXD v2",
    fetchUrl: async (url) => {
      const res = await fetch(`https://api.zenzxz.my.id/downloader/ytmp3v2?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.download_url || null;
    }
  },
  {
    name: "Delirius",
    fetchUrl: async (url) => {
      const res = await fetch(`https://api.delirius.my.id/download/ymp3?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.data?.download?.url || null;
    }
  },
  {
    name: "StellarWA",
    fetchUrl: async (url) => {
      try {
        const apiKey = "Black-clover";
        const res = await fetch(`https://api.stellarwa.xyz/dow/ytmp3?url=${encodeURIComponent(url)}&apikey=${apiKey}`);
        const data = await res.json();
        return data?.status && data?.data?.dl ? data.data.dl : null;
      } catch {
        return null;
      }
    }
  }
];

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return conn.reply(m.chat, `Ingresa el nombre del video a descargar.`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: "🕑", key: m.key } });

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("No se encontraron resultados para tu búsqueda.");
    }

    const videoInfo = search.all[0];
    const { title, url } = videoInfo;
    const format = "mp3";

    let downloadUrl = null;
    try {
      downloadUrl = await ddownr.download(url, format);
    } catch (e) {
      for (let api of apisExtra) {
        try {
          downloadUrl = await api.fetchUrl(url);
          if (downloadUrl) break;
        } catch (err) {
          continue;
        }
      }
    }

    if (downloadUrl) {
      const fileName = `${title.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/ +/g, "_")}.${format}`;
      await conn.sendMessage(
        m.chat,
        {
          document: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName: fileName
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`No se pudo descargar el audio.`);
    }
  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return m.reply(`Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ["ytmp3doc"];
handler.tags = ["descargas"];

export default handler;