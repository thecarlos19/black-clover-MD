import yts from 'yt-search';
const _0x3b1c=_0x2f34;(function(_0x5d2a,_0x4f3b){const _0x1a6b=_0x2f34,_0x2e9f=_0x5d2a();while(!![]){try{const _0x4c2d=(parseInt(_0x1a6b(0x14a))/1)*(parseInt(_0x1a6b(0x14b))/2)+-parseInt(_0x1a6b(0x14c))/3;if(_0x4c2d===_0x4f3b)break;else _0x2e9f.push(_0x2e9f.shift());}catch(_0x5821){_0x2e9f.push(_0x2e9f.shift());}}}(_0x4e7f,0x7a3b));
function _0x2f34(_0x4bfa,_0x56d2){const _0x4e7f=_0x4e7fList();return _0x2f34=function(_0x1f3a,_0x3b9c){_0x1f3a=_0x1f3a-0x14a;let _0x5d7e=_0x4e7f[_0x1f3a];return _0x5d7e;},_0x2f34(_0x4bfa,_0x56d2);}
function _0x4e7fList(){const _0x5a2f=['❗ Por favor ingresa un texto para buscar.\nEjemplo: ','❗ No se encontraron resultados para tu búsqueda. Intenta con otro título.','Elige una de las opciones para descargar:\n🎧 *Audio* o 📽️ *Video*','𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘︎| ⚔️🥷','📡 Descargas clover','✡︎ Dev • TheCarlos','buttons','buttonId','buttonText','displayText','viewOnce','headerType','contextInfo','externalAdReply','showAdAttribution','title','body','mediaType','sourceUrl','thumbnail','sendMessage','reply','react','command','tags','group','limit'];_0x4e7fList=function(){return _0x5a2f;};return _0x4e7fList();}
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw _0x3b1c(0x14a) + (usedPrefix + command) + '\n';
  const _0x5f9a = await yts(text);
  const videoInfo = _0x5f9a.all?.[0];
  if (!videoInfo) throw _0x3b1c(0x14b);
  const body = `\`\`\`El mejor bot de WhatsApp ⚔️\n\n${_0x3b1c(0x14c)}\`\`\``;
  await conn.sendMessage(
    m.chat,
    {
      image: { url: videoInfo.thumbnail },
      caption: body,
      footer: _0x3b1c(0x14d),
      [_0x3b1c(0x14e)]: [
        { [_0x3b1c(0x14f)]: `.ytmp3 ${videoInfo.url}`, [_0x3b1c(0x150)]: { [_0x3b1c(0x151)]: '🎧 Audio' } },
        { [_0x3b1c(0x14f)]: `.ytmp4 ${videoInfo.url}`, [_0x3b1c(0x150)]: { [_0x3b1c(0x151)]: '📽️ Video' } },
        { [_0x3b1c(0x14f)]: `.ytmp3doc ${videoInfo.url}`, [_0x3b1c(0x150)]: { [_0x3b1c(0x151)]: '💿 audio doc' } },
        { [_0x3b1c(0x14f)]: `.ytmp4doc ${videoInfo.url}`, [_0x3b1c(0x150)]: { [_0x3b1c(0x151)]: '🎥 vídeo doc' } }
      ],
      [_0x3b1c(0x152)]: true,
      [_0x3b1c(0x153)]: 4,
      [_0x3b1c(0x154)]: {
        [_0x3b1c(0x155)]: {
          [_0x3b1c(0x156)]: false,
          [_0x3b1c(0x157)]: _0x3b1c(0x14d),
          [_0x3b1c(0x158)]: global.redes || '',
          [_0x3b1c(0x159)]: global.icons || null
        }
      }
    },
    { quoted: m }
  );
  m.react('✅');
};
handler[_0x3b1c(0x15a)] = ['play', 'playvid', 'play2'];
handler[_0x3b1c(0x15b)] = ['descargas'];
handler[_0x3b1c(0x15c)] = true;
handler[_0x3b1c(0x15d)] = 6;
export default handler;