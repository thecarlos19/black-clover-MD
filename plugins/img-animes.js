import axios from "axios"
import fs from 'fs'
import path from 'path'

let handler = async (m, { command, conn }) => {
  try {
    let res = (await axios.get(`https://raw.githubusercontent.com/davidprospero123/api-anime/main/BOT-JSON/anime-${command}.json`)).data
    let image = res[Math.floor(Math.random() * res.length)]
    let caption = `*${command}*\n\nCogido hecho x The Carlos 👑`

    let imgFolder = path.join('./src/img')
    let imgFiles = fs.existsSync(imgFolder) ? fs.readdirSync(imgFolder).filter(f => /\.(jpe?g|png|webp)$/i.test(f)) : []
    let thumbnail = null
    if (imgFiles.length > 0) {
      let imgPath = path.join(imgFolder, imgFiles[Math.floor(Math.random() * imgFiles.length)])
      thumbnail = fs.readFileSync(imgPath)
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption,
        contextInfo: thumbnail ? { externalAdReply: { mediaType: 2, title: "Anime", body: "By The Carlos", thumbnail } } : {}
      },
      { quoted: m }
    )

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