import fs from 'fs'
import path from 'path'
import acrcloud from 'acrcloud'
import yts from 'yt-search'

let acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupwqkNGIjT7J9Ag2vIu'
})

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/audio|video/.test(mime)) {
    return m.reply(`💭 Responde a un audio o video válido.\nEjemplo: ${usedPrefix + command}`)
  }

  if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true })

  await m.react('🔍')

  let filePath = ''
  try {
    let media = await q.download()
    if (!media) throw 'No se pudo descargar el archivo.'

    let ext = mime.split('/')[1]?.split(';')[0] || 'mp3'
    filePath = path.join('./tmp', `${Date.now()}.${ext}`)
    fs.writeFileSync(filePath, media)

    let res = await acr.identify(media)
    let { code, msg } = res.status
    if (code!== 0) throw msg || 'No se pudo identificar la canción.'

    let music = res.metadata?.music
    if (!music ||!music.length) throw 'No se encontraron coincidencias.'

    let info = music[0]
    let title = info.title || 'Desconocido'
    let artists = info.artists?.map(v => v.name).join(', ') || 'Desconocido'
    let album = info.album?.name || 'Desconocido'
    let genres = info.genres?.map(v => v.name).join(', ') || 'Desconocido'
    let release_date = info.release_date || 'Desconocido'
    let duration = info.duration_ms? `${Math.floor(info.duration_ms / 60000)}:${String(Math.floor((info.duration_ms % 60000) / 1000)).padStart(2, '0')}` : 'Desconocido'
    let score = info.score || 0

    let txt = `
🎧 *CANCIÓN IDENTIFICADA*

• 🌻 TÍTULO: ${title}
• 🎤 ARTISTA: ${artists}
• 💿 ÁLBUM: ${album}
• 🎶 GÉNERO: ${genres}
• 📅 LANZAMIENTO: ${release_date}
• ⏱️ DURACIÓN: ${duration}
• 📊 PRECISIÓN: ${score}%`.trim()

    let search = await yts(`${title} ${artists}`)
    let video = search.videos?.[0]

    if (video) {
      await conn.sendMessage(m.chat, {
        image: { url: video.thumbnail },
        caption: txt,
        footer: 'Black Clover MD • The Carlos',
        buttons: [{
          buttonId: `${usedPrefix}ytmp3 ${video.url}`,
          buttonText: { displayText: '🎵 Descargar MP3' },
          type: 1
        }],
        headerType: 4
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: txt, footer: 'Black Clover MD • The Carlos' }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply(`❌ Error: ${e.toString()}`)
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

handler.help = ['quemusica']
handler.tags = ['tools']
handler.command = ['quemusica', 'quemusicaes', 'whatmusic', 'shazam']
handler.limit = true

export default handler