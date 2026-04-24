import fs from 'fs'
import path from 'path'
import acrcloud from 'acrcloud'
import yts from 'yt-search'
import { spawn } from 'child_process'

let acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupwqkNGIjT7J9Ag2vIu'
})

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/audio|video/.test(mime)) {
    throw `💭 Responde a un audio o video válido.\nEjemplo: ${usedPrefix + command}`
  }

  if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true })

  try {
    let media = await q.download()
    if (!media) throw '❌ No se pudo descargar el archivo.'

    let ext = mime.split('/')[1] || 'bin'
    let filePath = path.join('./tmp', `${Date.now()}.${ext}`)

    fs.writeFileSync(filePath, media)

    let res = await acr.identify(media)

    let { code, msg } = res.status
    if (code !== 0) throw msg || 'No se pudo identificar la canción.'

    let info = res.metadata?.music?.[0] || {}

    let title = info.title || 'No encontrado'
    let artists = info.artists?.map(v => v.name).join(', ') || 'No encontrado'
    let album = info.album?.name || 'No encontrado'
    let genres = info.genres?.map(v => v.name).join(', ') || 'No encontrado'
    let release_date = info.release_date || 'No encontrado'

    let txt = `
🎧 *RESULTADO DE LA BÚSQUEDA*

• 🌻 TÍTULO: ${title}
• 🎤 ARTISTA: ${artists}
• 💿 ÁLBUM: ${album}
• 🎶 GÉNERO: ${genres}
• 📅 LANZAMIENTO: ${release_date}
`.trim()

    let search = await yts(`${title} ${artists}`)
    let video = search.videos?.[0]

    let buttons = []

    if (video) {
      buttons.push({
        buttonId: `${usedPrefix}ytmp3 ${video.url}`,
        buttonText: { displayText: '🎵 Descargar MP3' },
        type: 1
      })
    }

    await conn.sendMessage(m.chat, {
      text: txt,
      footer: 'Black Clover MD • The Carlos',
      buttons,
      headerType: 1
    }, { quoted: m })

    fs.unlinkSync(filePath)

  } catch (e) {
    m.reply(`❌ Error: ${e}`)
  }
}

handler.command = ['quemusica', 'quemusicaes', 'whatmusic']
export default handler