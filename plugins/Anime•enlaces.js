var handler = async (m, { conn }) => {
  const message = `
┏━━━━━━━━━━━━━━━━━┅
┇                 *「 ANIME」*       
┣━━━━━━━━━━━━━━━━━┅
┃ ❖ https://kusonime.com
┃ ❖ https://huntersekaisub.blogspot.com
┃ ❖ https://riie.jp
┃ ❖ https://m.meownime.ai
┃ ❖ https://meownime.ltd
┃ ❖ https://nimegami.id
┃ ❖ https://animekompi.cam
┃ ❖ https://nontonanimeid.top
┃ ❖ https://kazefuri.vip
┃ ❖ https://pendekarsubs.us
┃ ❖ https://myanimelist.net
┗━━━━━━━━━━━━━━━━┅
`;

 
  const rcanal = m.quoted || m;

  
  await conn.reply(m.chat, message, rcanal);
};

handler.help = ['animelink'];
handler.tags = ['anime'];
handler.command = ['animelink'];

handler.cookies = 1;
handler.register = true;

export default handler;