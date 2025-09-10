import { sticker } from '../lib/sticker.js';
import axios from 'axios';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let text;

    if (args.length >= 1) {
        text = args.join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else {
        return conn.reply(m.chat, '🚩 Te faltó el texto!', m);
    }

    if (!text) return conn.reply(m.chat, '🚩 Te faltó el texto!', m);

    const who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.fromMe ? conn.user.jid : m.sender;

    const mentionRegex = new RegExp(`@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
    const mishi = text.replace(mentionRegex, '');

    if (mishi.length > 40) return conn.reply(m.chat, '🚩 El texto no puede tener más de 40 caracteres', m);

    const pp = await conn.profilePictureUrl(who).catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
    const nombre = await conn.getName(who);

    const obj = {
        type: "quote",
        format: "png",
        backgroundColor: "#000000",
        width: 512,
        height: 768,
        scale: 2,
        messages: [{
            entities: [],
            avatar: true,
            from: { id: 1, name: nombre, photo: { url: pp } },
            text: mishi,
            replyMessage: {}
        }]
    };

    try {
        const res = await axios.post('https://bot.lyo.su/quote/generate', obj, {
            headers: { 'Content-Type': 'application/json' }
        });

        const buffer = Buffer.from(res.data.result.image, 'base64');
        const stiker = await sticker(buffer, false, global.packname || 'Bot-Stickers', global.author || 'SubBot');

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
        } else {
            return conn.reply(m.chat, '❌ No se pudo generar el sticker.', m);
        }
    } catch (e) {
        console.error(e);
        return conn.reply(m.chat, `❌ Ocurrió un error: ${e.message}`, m);
    }
};

handler.help = ['qc <texto>'];
handler.tags = ['sticker'];
handler.command = ['qc'];
export default handler;