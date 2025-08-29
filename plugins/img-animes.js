import axios from "axios"

let handler = async (m, { command, conn, usedPrefix }) => {
  try {
    let res = (await axios.get(`https://raw.githubusercontent.com/davidprospero123/api-anime/main/BOT-JSON/anime-${command}.json`)).data
    let image = res[Math.floor(Math.random() * res.length)]
    let caption = `*${command}*\n\nCogido hecho x The Carlos 👑`
    
    await conn.sendMessage(m.chat, {
      image: { url: image },
      caption
    }, { quoted: m })
    
  } catch (e) {
    await conn.sendMessage(m.chat, { text: `⚠️ Error al obtener imágenes de *${command}*` }, { quoted: m })
    console.error(e)
  }
}

handler.command = handler.help = [
  'alisa','aihoshino','remcham','akira','akiyama','anna','asuna','ayuzawa','boruto','chiho','chitoge',
  'deidara','erza','elaina','eba','emilia','hestia','hinata','inori','isuzu','itachi','itori','kaga',
  'kagura','kaori','keneki','kotori','kurumitokisaki','madara','mikasa','miku','minato','naruto',
  'nezuko','sagiri','sasuke','sakura'
]
handler.tags = ['anime']
handler.register = true

export default handler