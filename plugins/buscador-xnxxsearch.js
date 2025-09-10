import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.sendMessage(
      m.chat,
      { text: `${emoji} El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *#nsfw on*` },
      { quoted: m }
    );
  }

  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: `${emoji} Por favor, ingrese la búsqueda.\n> Ejemplo de uso: ${usedPrefix + command} Con mi prima` },
      { quoted: m }
    );
  }

  try {
    const vids_ = { from: m.sender, urls: [] };

    if (!global.videoListXXX) {
      global.videoListXXX = [];
    }

    if (global.videoListXXX[0]?.from === m.sender) {
      global.videoListXXX.splice(0, global.videoListXXX.length);
    }

    const res = await xnxxsearch(text);
    const json = res.result;
    let cap = `*${emoji} Resultados de la búsqueda:* ${text.toUpperCase()}\n\n`;
    let count = 1;

    for (const v of json) {
      const linkXXX = v.link;
      vids_.urls.push(linkXXX);
      cap += `*[${count}]*\n• *🎬 Título:* ${v.title}\n• *🔗 Link:* ${v.link}\n• *❗ Info:* ${v.info}\n\n`;
      cap += '••••••••••••••••••••••••••••••••\n\n';
      count++;
    }

    await conn.sendMessage(m.chat, { text: cap }, { quoted: m });
    global.videoListXXX.push(vids_);
  } catch (e) {
    await conn.sendMessage(m.chat, { text: `${msm} Ocurrió un error: ${e.message}` }, { quoted: m });
  }
};

handler.help = ['xnxxsearch <query>'];
handler.tags = ['buscador'];
handler.command = ['xnxxsearch', 'xnxxs'];
handler.register = true;
handler.group = false;

export default handler;

async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const page = Math.floor(Math.random() * 3) + 1;

  const res = await fetch(`${baseurl}/search/${query}/${page}`, { method: 'get' });
  const body = await res.text();
  const $ = cheerio.load(body, { xmlMode: false });

  const title = [];
  const url = [];
  const desc = [];
  const results = [];

  $('div.mozaique').each(function () {
    $(this).find('div.thumb').each(function () {
      const href = $(this).find('a').attr('href');
      if (href) url.push(baseurl + href.replace('/THUMBNUM/', '/'));
    });
  });

  $('div.mozaique').each(function () {
    $(this).find('div.thumb-under').each(function () {
      desc.push($(this).find('p.metadata').text());
      $(this).find('a').each(function () {
        title.push($(this).attr('title'));
      });
    });
  });

  for (let i = 0; i < title.length; i++) {
    results.push({ title: title[i], info: desc[i], link: url[i] });
  }

  return { code: 200, status: true, result: results };
}