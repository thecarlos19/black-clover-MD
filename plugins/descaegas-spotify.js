import fetch from 'node-fetch';

const cacheSpotify = new Set(); // Cache temporal en memoria

let handler = (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`
〔 *⛔ FALTA NOMBRE DE LA CANCIÓN* 〕
 📀 *Usa el comando así:*
 ⚙️ ${usedPrefix + command} <nombre de la canción>
 🧪 *Ejemplo:* ${usedPrefix + command} Enemy - Imagine Dragons
    `.trim());
  }

  m.react('🦠');

  fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`)
    .then(res => res.json())
    .then(json => {
      if (!json.result || !json.result.downloadUrl) {
        throw new Error('❌ No se encontró la canción.');
      }

      const { title, artist, duration, downloadUrl } = json.result;

      if (cacheSpotify.has(downloadUrl)) {
        return m.reply(`
╭━〔 *⚠️ CANCIÓN REPETIDA* 〕━⬣
┃ 🧠 *Ya fue enviada recientemente.*
┃ 🧼 *Evita repetir la misma canción.*
╰━━━━━━━━━━━━━━━━━━━━⬣
        `.trim());
      }

      // Guardar en caché temporal
      cacheSpotify.add(downloadUrl);
      setTimeout(() => cacheSpotify.delete(downloadUrl), 60 * 1000); // Auto-limpiar en 1 minuto

      conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg'
      }, { quoted: m });

      m.reply(`
╭━━━〔 *🔊 SPOTIFY DESCARGADO* 〕━━⬣
┃ 🎵 *Título:* ${title}
┃ 🎙️ *Artista:* ${artist}
┃ ⏱️ *Duración:* ${duration}
┃ 🧩 *Estado:* ¡Descarga exitosa!
╰━━━━━━━━━━━━━━━━━━━━⬣
      `.trim());

      m.react('🎶');
    })
    .catch(err => {
      console.error(err);
      m.reply(`
╭━━〔 *⚠️ ERROR* 〕━━⬣
┃ 😿 No se pudo obtener la canción.
┃ 📡 Revisa el nombre o intenta más tarde.
╰━━━━━━━━━━━━━━━━━━━━⬣
      `.trim());
      m.react('❌');
    });
};

handler.help = ['spotify *<nombre>*'];
handler.tags = ['descargas'];
handler.command = ['spotify', 'spotifydl'];

export default handler;