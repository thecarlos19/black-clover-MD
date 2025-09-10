import { googleImage } from '@bochilteam/scraper'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const paroleproibite = [
    'se men','hen tai','se xo','te tas','cu lo','c ulo','cul o','ntr',
    'rule34','rule','caca','polla','porno','porn','gore','cum','semen',
    'puta','puto','culo','putita','putito','pussy','hentai','pene','coño',
    'asesinato','zoofilia','mia khalifa','desnudo','desnuda','cuca','chocha',
    'muertos','pornhub','xnxx','xvideos','teta','vagina','marsha may','misha cross',
    'sexmex','furry','furro','furra','rule34','panocha','pedofilia','necrofilia',
    'pinga','horny','ass','popo','nsfw','femdom','futanari','erofeet','sexo','sex',
    'yuri','ero','ecchi','blowjob','anal','ahegao','pija','verga','trasero','violation',
    'violacion','bdsm','cachonda','+18','cp','xxx','nuda','nude','mia marin','lana rhoades',
    'cepesito','hot','buceta'
  ]

  if (paroleproibite.some(word => m.text.toLowerCase().includes(word))) 
    return conn.sendMessage(m.chat, { text: '⚠️ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐢𝐧𝐯𝐢𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨' }, { quoted: m })

  if (!text) 
    return conn.sendMessage(m.chat, { text: `> ⓘ 𝐔𝐬𝐨 𝐝𝐞𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:\n> ${usedPrefix + command} gatto` }, { quoted: m })

  const res = await googleImage(text)
  let image = res.getRandom()
  
  await conn.sendMessage(m.chat, {
    image: { url: image },
    caption: `🔍 𝐈𝐦𝐦𝐚𝐠𝐢𝐧𝐞: ${text}`
  }, { quoted: m })
}

handler.command = /^(iaimagen|immagine|img|immagini)$/i
handler.register = true
export default handler