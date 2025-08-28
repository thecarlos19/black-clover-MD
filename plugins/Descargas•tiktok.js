import fg from 'api-dylux';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return conn.sendMessage(m.chat, { text: `🥷 Debes ingresar un enlace de TikTok.\n\n📌 *Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZMreHF2dC/` }, { quoted: m });
    }

    if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok\.com\/([^\s&]+)/gi.test(text)) {
      return conn.sendMessage(m.chat, { text: `❎ Enlace de TikTok inválido.` }, { quoted: m });
    }

    
    if (typeof m.react === 'function') m.react('⌛');

    let data = await fg.tiktok(args[0]);
    let { title, play, duration } = data.result;
    let { nickname } = data.result.author;

    let caption = `
⚔️ *Descargador de TikTok*

◦ 👤 *Autor:* ${nickname}
◦ 📌 *Título:* ${title}
◦ ⏱️ *Duración:* ${duration}
`.trim();

    await conn.sendMessage(m.chat, {
      video: { url: play },
      caption
    }, { quoted: m });

    if (typeof m.react === 'function') m.react('✅');
  } catch (e) {
    return conn.sendMessage(m.chat, { text: `❌ *Error:* ${e.message}` }, { quoted: m });
  }
};

handler.help = ["tiktok"];
handler.tags = ["dl"];
handler.command = ["tt", "tiktok", "ttdl"];

export default handler;