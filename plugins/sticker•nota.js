//código creado x The Carlos 👑 
import Jimp from "jimp";
import { sticker } from '../lib/sticker.js';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("⚠️ Escribe algo después de .nota\nEjemplo: *.nota Hola asta*");

  let words = text.split(/\s+/).slice(0, 20);
  text = words.join(' ');

  let image = await Jimp.read("./src/game/nota.jpg");

  let fontSize = 128;
  let font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
  const maxWidth = 500;
  const maxHeight = 400;

  while (Jimp.measureTextHeight(font, text, maxWidth) > maxHeight && fontSize > 32) {
    fontSize -= 16;
    font = await Jimp.loadFont(
      fontSize > 64 ? Jimp.FONT_SANS_128_BLACK :
      fontSize > 32 ? Jimp.FONT_SANS_64_BLACK :
      Jimp.FONT_SANS_32_BLACK
    );
  }

  const approxCharsPerLine = Math.floor(maxWidth / (fontSize / 2));
  let lines = [];
  let currentLine = '';
  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length <= approxCharsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine.trim());
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine.trim());

  let y = 120;
  lines.forEach(line => {
    image.print(
      font,
      60,
      y,
      {
        text: line,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      maxWidth,
      maxHeight
    );
    y += fontSize + 20;
  });

  let buffer = await image.getBufferAsync(Jimp.MIME_PNG);
  let stiker = await sticker(buffer, false, global.packsticker || 'Bot-Notas', global.author || 'SubBot');

  if (!stiker) return m.reply("❌ No se pudo generar el sticker.");

  const imgFolder = path.join('./src/img');
  const imgFiles = fs.readdirSync(imgFolder).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  let contextInfo = {};
  if (imgFiles.length > 0) {
    contextInfo = {
      externalAdReply: {
        title: '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 | Notas 📝',
        body: 'Dev • The Carlos 👑',
        mediaType: 2,
        thumbnail: fs.readFileSync(path.join(imgFolder, imgFiles[0]))
      }
    };
  }

  await conn.sendMessage(m.chat, { sticker: stiker, contextInfo }, { quoted: m });
};

handler.help = ['n', 'nota', 'Nota']
handler.tags = ['sticker']
handler.command = ['n', 'nota', 'Nota']
handler.group = false
handler.register = true
export default handler;