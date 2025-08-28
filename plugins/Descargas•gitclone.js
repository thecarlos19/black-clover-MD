import fetch from 'node-fetch';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(
    m.chat,
    `🚩 *Ingrese la URL de un repositorio de GitHub*\n\nEjemplo: ${usedPrefix + command} https://github.com/username/repo`,
    m,
    global.rcanal
  );

  try {
    await m.react(global.rwait);

    // Normalizamos la URL a la versión zip
    let repoUrl = text.trim();
    if (!repoUrl.endsWith('/')) repoUrl += '/';
    const zipUrl = repoUrl.replace('github.com', 'github.com') + 'archive/refs/heads/main.zip';

    // Descargamos el archivo
    const response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    const filePath = join('/tmp', 'repo.zip');
    writeFileSync(filePath, response.data);

    // Enviamos el archivo al chat
    await conn.sendFile(
      m.chat,
      filePath,
      'repo.zip',
      `📦 Aquí está tu repositorio clonado: ${repoUrl}`,
      m
    );

    // Limpiamos archivo temporal
    unlinkSync(filePath);

    await m.react(global.done);
  } catch (error) {
    console.error(error);
    await m.react(global.error);
    conn.reply(
      m.chat,
      '🚩 *No se pudo clonar el repositorio.* Verifica que la URL sea correcta.',
      m,
      global.fake
    );
  }
};

handler.help = ['gitclone'];
handler.tags = ['buscador'];
handler.command = ['gitclone'];
handler.register = true;

export default handler;