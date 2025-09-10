import axios from "axios";
import baileys from "@whiskeysockets/baileys";

async function sendAlbumMessage(conn, jid, medias, options) {
  options = { ...options };
  if (typeof jid !== "string") throw new TypeError(`jid must be a string, received: ${jid}`);

  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video"))
      throw new TypeError(`medias[i].type must be "image" or "video", received: ${media.type}`);

    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data)))
      throw new TypeError(`medias[i].data must be an object with url or buffer, received: ${media.data}`);
  }

  if (medias.length < 2) throw new RangeError("Se requieren al menos 2 medios.");

  const caption = options.text || options.caption || "";
  const delay = !isNaN(options.delay) ? options.delay : 500;
  delete options.text;
  delete options.caption;
  delete options.delay;

  // Enviar cada imagen secuencialmente (simulando un álbum)
  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    await conn.sendMessage(
      jid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { quoted: options.quoted }
    );
    await new Promise(r => setTimeout(r, delay));
  }

  return true;
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const user = global.db.data.users[m.sender] || {};
  const emoji = "🌟";

  // Verificación de VIP
  if (!user.premium || (user.premiumTime && user.premiumTime < Date.now())) {
    return conn.reply(
      m.chat,
      `${emoji} Este comando es solo para usuarios *VIP*.\n\nAdquiere VIP usando *${usedPrefix}vip*.`,
      m
    );
  }

  if (!args.length) {
    return m.reply(`Por favor, proporciona una consulta.\n\nEjemplo: *${usedPrefix}pinterest gato*`);
  }

  await conn.sendMessage(m.chat, {
    react: { text: "⏱️", key: m.key },
  });

  try {
    const query = args.join(" ");
    const apiUrl = `https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);

    if (!Array.isArray(response.data) || response.data.length === 0) {
      return await conn.sendMessage(m.chat, { text: "No se encontraron resultados." }, { quoted: m });
    }

    const limitedData = response.data.slice(0, 10);
    const medias = limitedData.map(item => ({
      type: "image",
      data: { url: item.image_large_url },
    }));

    const albumCaption = `🌙 Imágenes encontradas en Pinterest: *${query}*`;
    await sendAlbumMessage(conn, m.chat, medias, { caption: albumCaption, quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (error) {
    console.error("Error durante la búsqueda en Pinterest:", error);
    conn.reply(m.chat, `${emoji} Error al obtener imágenes.`, m);
  }
};

handler.help = ["pinterest"];
handler.tags = ["search"];
handler.command = ["pinterest", "pin"];
handler.register = true;

export default handler;