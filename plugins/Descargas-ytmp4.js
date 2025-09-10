const MAX_FILE_SIZE = 280 * 1024 * 1024;
const VIDEO_THRESHOLD = 70 * 1024 * 1024;
const HEAVY_FILE_THRESHOLD = 100 * 1024 * 1024;
const REQUEST_LIMIT = 3;
const REQUEST_WINDOW_MS = 10000;
const COOLDOWN_MS = 120000;

// 🔐 Estado del sistema
const requestTimestamps = [];
let isCooldown = false;
let isProcessingHeavy = false;

// 🎯 Validador de enlaces YouTube
const isValidYouTubeUrl = url =>
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(url);

// 📏 Formatear tamaño
function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Desconocido';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  bytes = Number(bytes);
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

// 📡 Obtener tamaño por HEAD
async function getSize(url) {
  try {
    const res = await axios.head(url, { timeout: 10000 });
    const size = parseInt(res.headers['content-length'], 10);
    if (!size) throw new Error('Tamaño no disponible');
    return size;
  } catch {
    throw new Error('No se pudo obtener el tamaño del archivo');
  }
}

// 📥 Proceso de conversión y descarga
async function ytdl(url) {
  const headers = {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Chromium";v="132", "Not A(Brand";v="8"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    referer: 'https://id.ytmp3.mobi/',
    'referrer-policy': 'strict-origin-when-cross-origin'
  };

  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
  if (!videoId) throw new Error('ID de video no encontrado');

  try {
    const init = await (await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`, { headers })).json();
    const convert = await (await fetch(`${init.convertURL}&v=${videoId}&f=mp4&_=${Date.now()}`, { headers })).json();

    let info;
    for (let i = 0; i < 3; i++) {
      const res = await fetch(convert.progressURL, { headers });
      info = await res.json();
      if (info.progress === 3) break;
      await new Promise(res => setTimeout(res, 1000));
    }

    if (!info || !convert.downloadURL) throw new Error('No se pudo obtener la URL de descarga');
    return { url: convert.downloadURL, title: info.title || 'Video sin título' };
  } catch (e) {
    throw new Error(`Error en la descarga: ${e.message}`);
  }
}

// 🔐 Verifica cuántas solicitudes hay activas
function checkRequestLimit() {
  const now = Date.now();
  requestTimestamps.push(now);
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > REQUEST_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= REQUEST_LIMIT) {
    isCooldown = true;
    setTimeout(() => {
      isCooldown = false;
      requestTimestamps.length = 0;
    }, COOLDOWN_MS);
    return false;
  }
  return true;
}

// 🧠 HANDLER PRINCIPAL
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = emoji => m.react(emoji);

  if (!text) {
    return conn.reply(m.chat, `🧩 Uso: ${usedPrefix}${command} <enlace de YouTube>`, m);
  }

  if (!isValidYouTubeUrl(text)) {
    await react('🔴');
    return m.reply('🚫 Enlace de YouTube inválido');
  }

  if (isCooldown || !checkRequestLimit()) {
    await react('🔴');
    return conn.reply(m.chat, '⏳ Muchas solicitudes. Espera 2 minutos.', m);
  }

  if (isProcessingHeavy) {
    await react('🔴');
    return conn.reply(m.chat, '⚠️ Ya estoy procesando un archivo pesado. Espera un momento.', m);
  }

  await react('⏳'); // Descarga en proceso...

  try {
    const { url, title } = await ytdl(text);
    const size = await getSize(url);
    if (!size) throw new Error('No se pudo determinar el tamaño del video');

    if (size > MAX_FILE_SIZE) {
      await react('🔴');
      throw new Error('📦 El archivo supera el límite de 280 MB');
    }

    const isHeavy = size > HEAVY_FILE_THRESHOLD;
    if (isHeavy) {
      isProcessingHeavy = true;
      await conn.reply(m.chat, '💾 Espera, estoy descargando un archivo grande...', m);
    }

    const caption = `
╭╌╌〔 *🕶️ DESCARGAS BLACK - MP4* 〕╌╌╮
┃ 🧿 *Título:* ${title}
┃ 📦 *Tamaño:* ${formatSize(size)}
┃ 🔗 *URL:* ${text}
╰╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╯`.trim();

    const buffer = await fetch(url).then(res => res.buffer());
    await conn.sendFile(
      m.chat,
      buffer,
      `${title}.mp4`,
      caption,
      m,
      null,
      {
        mimetype: 'video/mp4',
        asDocument: size >= VIDEO_THRESHOLD,
        filename: `${title}.mp4`
      }
    );

    await react('✅');
    isProcessingHeavy = false;
  } catch (e) {
    await react('❌');
    isProcessingHeavy = false;
    return m.reply(`🧨 *ERROR:* ${e.message}`);
  }
};

// 🛑 Comando habilitado para usuarios premium u operativos Black
handler.help = ['ytmp4 <url>'];
handler.tags = ['descargas'];
handler.command = ['ytmp4'];
handler.black = true; // 🔒 Reemplazo elegante de "diamond = true"

export default handler;