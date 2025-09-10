// Código creado por Niño Piña wa.me/50557865603
import fs from 'fs';
import path from 'path';
let handler = async (m, { conn, usedPrefix }) => {
let who;
// Verificamos si se menciona a alguien o se cita un mensaje
if (m.mentionedJid.length > 0) {
who = m.mentionedJid[0]; // Si hay mención, usamos esa
} else if (m.quoted) {
who = m.quoted.sender; // Si se cita un mensaje, usamos el emisor de ese mensaje
} else {
who = m.sender; // En caso contrario, usamos el emisor
}
let name = conn.getName(who); // Nombre de la persona mencionada o del emisor
let name2 = conn.getName(m.sender); // Nombre del usuario que envía el comando
m.react('🍑'); // Reacción de durazno 🍑
// Construimos el mensaje dependiendo de si hay una mención o no
let str;
if (m.mentionedJid.length > 0) {
str = `\`${name2}\` está agarrando las nalgas de \`${name || who}\`. 🥵 🍑`;
} else if (m.quoted) {
str = `\`${name2}\` está agarrando las nalgas de \`${name || who}\`. ¡Cuidado! 🍑`;
} else {
str = `\`${name2}\` está agarrando nalgas por ahí.`.trim();
}
if (m.isGroup) {
// Aquí puedes agregar tus propios GIFs de agarrar nalgas
let pp1 = 'https://files.catbox.moe/yjulgu.mp4'; // Reemplaza con tus GIFs
let pp2 = 'https://files.catbox.moe/erm82k.mp4';
let pp3 = 'https://files.catbox.moe/9m1nkp.mp4';
let pp4 =
'https://files.catbox.moe/rzijb5.mp4';
const gifs = [pp1, pp2, pp3, pp4];
const gif = gifs[Math.floor(Math.random() * gifs.length)];
// Enviamos el mensaje con el gif y el mensaje correspondiente
let mentions = [who]; // Mencionamos al usuario que se ha citado o mencionado
conn.sendMessage(m.chat, { video: { url: gif }, gifPlayback: true, caption: str, mentions }, { quoted: m });
}
}
handler.help = ['agarrarnalgas @tag'];
handler.tags = ['emox'];
handler.command = ['agarrarnalgas'];
handler.group = true;
export default handler;