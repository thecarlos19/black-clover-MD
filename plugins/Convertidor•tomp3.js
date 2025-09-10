import { toAudio } from '../lib/converter.js';

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || '';
    if (!/video|audio/.test(mime)) {
      await conn.sendMessage(m.chat, { text: '*🌳 Responde a un video o nota de voz que desees convertir a audio/MP3*' }, { quoted: m });
      return;
    }

    const media = await q.download();
    if (!media) {
      await conn.sendMessage(m.chat, { text: '*🌳 Ocurrió un error al descargar el archivo. Por favor, inténtalo de nuevo.*' }, { quoted: m });
      return;
    }

    const audio = await toAudio(media, 'mp4');
    if (!audio.data) {
      await conn.sendMessage(m.chat, { text: '*🌳 Ocurrió un error al convertir el archivo a audio/MP3. Por favor, inténtalo de nuevo.*' }, { quoted: m });
      return;
    }

    await conn.sendMessage(m.chat, {
      audio: audio.data,
      mimetype: 'audio/mpeg',
      fileName: 'audio.mp3',
      ptt: false
    }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
  }
};

handler.alias = ['tomp3', 'toaudio'];
handler.command = ['tomp3', 'toaudio'];
export default handler;