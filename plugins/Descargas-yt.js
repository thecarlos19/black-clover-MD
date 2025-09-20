//Codigo creado x The Carlos 👑 ` 
//No editar ya está bien hecho,si lo vas a utilizar cambia el ytmp3 a play y el ytmp4doc no funciona el api si tienen un Api que funcione madame mensaje xd 
//No olviden dejar créditos 

import fetch from "node-fetch";
import yts from 'yt-search';

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `🥷🏻 Por favor, ingresa el nombre de la música a descargar.`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: "⌛", key: m.key } });

    let videoIdToFind = text.match(youtubeRegexID) || null;
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1]);

    if (videoIdToFind) {
      const videoId = videoIdToFind[1];  
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId);
    } 
    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2;  

    if (!ytplay2 || ytplay2.length == 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply('🤖 No se encontraron resultados para tu búsqueda.');
    }

    let { title, thumbnail, url } = ytplay2;
    title = title || 'Audio desconocido';
    url = url || 'no encontrado';
    thumbnail = thumbnail || '';

    let thumbBuffer = null;
    if (thumbnail) {
      try {
        const resp = await fetch(thumbnail);
        thumbBuffer = Buffer.from(await resp.arrayBuffer());
      } catch (err) {
        console.log('No se pudo obtener la miniatura:', err.message);
      }
    }

    // ===== YTMP3 / PLAY =====
    if (['play','yta','ytmp3','playaudio'].includes(command)) {
      let result, fileName, captionText;
      
      // Intentar Sylphy primero
      try {
        const apiSylphy = await (await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${url}`)).json();
        if (apiSylphy.result?.download?.url) {
          result = apiSylphy.result.download.url;
          fileName = apiSylphy.result.title ? `${apiSylphy.result.title}.mp3` : `${title}.mp3`;
          captionText = `${apiSylphy.result.title || title} | #The Carlos 👑`;
        } else throw new Error("Sylphy no devolvió URL");
      } catch {
        // Intentar Vreden si falla Sylphy
        try {
          const apiVreden = await (await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)).json();
          if (!apiVreden.result?.download?.url) throw new Error("Vreden no devolvió URL");
          result = apiVreden.result.download.url;
          fileName = apiVreden.result.title ? `${apiVreden.result.title}.mp3` : `${title}.mp3`;
          captionText = `${apiVreden.result.title || title} | #The Carlos 👑`;
        } catch {
          await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
          return conn.reply(m.chat, '🥲︎ No se pudo enviar el audio con ninguna API.', m);
        }
      }

      await conn.sendMessage(
        m.chat,
        { 
          document: { url: result }, 
          mimetype: 'audio/mpeg', 
          fileName: fileName,
          jpegThumbnail: thumbBuffer,
          caption: captionText
        }, 
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } 
    
    // ===== donen apis :v =====
    else if (command === 'ytmp4doc') {
      const fuentes = [
        { sistema: "Sylphy", url: `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}` },
        { sistema: "Stellar", url: `https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=proyectsV2` }
      ];

      let exito = false;
      for (let fuente of fuentes) {
        try {
          const res = await fetch(fuente.url);
          const data = await res.json();
          const dl = data.res?.url || data?.data?.dl || data?.result?.download?.url || data?.downloads?.url || data?.data?.download?.url;
          const videoTitle = data.title || title;

          if (dl) {
            await conn.sendMessage(
              m.chat,
              { 
                document: { url: dl },
                fileName: `${videoTitle}.mp4`,
                mimetype: 'video/mp4',
                jpegThumbnail: thumbBuffer,
                caption: `✅ Documento entregado desde *${fuente.sistema}* | #The Carlos 👑`
              },
              { quoted: m }
            );
            exito = true;
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            break;
          }
        } catch (err) {
          console.log(`Error con ${fuente.sistema}:`, err.message);
        }
      }

      if (!exito) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, '🥲︎ No se pudo enviar el video desde ninguna fuente.', m);
      }
    } 
    else {
      return conn.reply(m.chat, '🪄︎ Comando no reconocido.', m);
    }
  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return m.reply(`🚫 Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ['ytmp3', 'ytmp4doc'];
handler.tags = ['descargas'];
handler.group = true;

export default handler;