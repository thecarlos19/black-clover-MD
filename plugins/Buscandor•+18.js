//Código creado x The Carlos 👑 
import axios from 'axios';

const handler = async (m, { command, conn, usedPrefix }) => {
  
  const user = global.db.data.users[m.sender] || {}
  if (!user.premium) throw '❌ Este comando es exclusivo para usuarios VIP/Premium.\n\nCompra VIP para acceder a contenido +18.'

  if (!db.data.chats[m.chat].nsfw && m.isGroup) 
    return m.reply('[❗] 𝐋𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 +𝟏𝟖 𝐞𝐬𝐭𝐚́𝐧 𝐝𝐞𝐬𝐚𝐜𝐭𝐢𝐯𝐚𝐝𝐨𝐬 𝐞𝐧 𝐞𝐬𝐭𝐞 𝐠𝐫𝐮𝐩𝐨.\n> 𝐬𝐢 𝐞𝐬 𝐚𝐝𝐦𝐢𝐧 𝐲 𝐝𝐞𝐬𝐞𝐚 𝐚𝐜𝐭𝐢𝐯𝐚𝐫𝐥𝐨𝐬 𝐮𝐬𝐞 .enable nsfw');

  const comandos = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yaoi', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];

  const res = (await axios.get(`https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${command}.json`)).data;
  const haha = await res[Math.floor(res.length * Math.random())];
  const caption = `*${command}* 🔥`;

  let otros = comandos.filter(c => c !== command);
  let [random1, random2] = otros.sort(() => 0.5 - Math.random()).slice(0, 2);

  await conn.sendMessage(m.chat, {
    image: { url: haha },
    caption,
    footer: wm,
    buttons: [
      { buttonId: `.${command}`, buttonText: { displayText: "🔥 sɪɢᴜɪᴇɴᴛᴇ 🔥" }, type: 1 },
      { buttonId: `.${random1}`, buttonText: { displayText: `🎲 ${random1} 🔥` }, type: 1 },
      { buttonId: `.${random2}`, buttonText: { displayText: `🎲 ${random2} 🔥` }, type: 1 },
    ],
    headerType: 4,
  }, { quoted: m });
};

handler.help = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yaoi', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];
handler.command = handler.help;
handler.tags = ['nsfw'];
handler.group = true;
handler.register = true;

export default handler;