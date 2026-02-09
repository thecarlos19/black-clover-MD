import { spawn } from 'child_process'
import fs from 'fs'
import fetch from 'node-fetch'
import yts from 'yt-search'
import Jimp from 'jimp'

const name = 'Descargas - black clover'

async function resizeImage(buffer, size = 300) {
  const img = await Jimp.read(buffer)
  return img.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

const yt = {
  static: Object.freeze({
    baseUrl: 'https://cnv.cx',
    headers: {
      'accept-encoding': 'gzip, deflate, br, zstd',
      origin: 'https://frame.y2meta-uk.com',
      'user-agent': 'Mozilla/5.0'
    }
  }),
  resolveConverterPayload(link, f = '128k') {
    const formatos = ['128k', '320k', '144p', '240p', '360p', '720p', '1080p']
    if (!formatos.includes(f)) throw Error('Formato inválido')
    const tipo = f.endsWith('k') ? 'mp3' : 'mp4'
    return {
      link,
      format: tipo,
      audioBitrate: tipo === 'mp3' ? f.replace('k', '') : '128',
      videoQuality: tipo === 'mp4' ? f.replace('p', '') : '720',
      filenameStyle: 'pretty',
      vCodec: 'h264'
    }
  },
  sanitizeFileName(n) {
    const ext = n.includes('.') ? n.match(/\.[^.]+$/)[0] : '.mp3'
    const base = n.replace(ext, '').replace(/[^A-Za-z0-9]/g, '_').replace(/_+/g, '_').toLowerCase()
    return base + ext
  },
  async getBuffer(u) {
    const r = await fetch(u)
    if (!r.ok) throw Error('No se pudo descargar')
    return Buffer.from(await r.arrayBuffer())
  },
  async getKey() {
    const r = await fetch(this.static.baseUrl + '/v2/sanity/key', { headers: this.static.headers })
    return r.json()
  },
  async convert(u, f) {
    const { key } = await this.getKey()
    const p = this.resolveConverterPayload(u, f)
    const r = await fetch(this.static.baseUrl + '/v2/converter', {
      method: 'post',
      headers: { ...this.static.headers, key },
      body: new URLSearchParams(p)
    })
    return r.json()
  },
  async download(u, f) {
    const { url, filename } = await this.convert(u, f)
    const buffer = await this.getBuffer(url)
    return { buffer, fileName: this.sanitizeFileName(filename) }
  }
}

async function convertToFast(buffer) {
  const tempIn = './temp_in.mp4'
  const tempOut = './temp_out.mp4'
  fs.writeFileSync(tempIn, buffer)
  await new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-i', tempIn, '-c', 'copy', '-movflags', 'faststart', tempOut])
    ff.on('close', c => c === 0 ? res() : rej())
  })
  const out = fs.readFileSync(tempOut)
  fs.unlinkSync(tempIn)
  fs.unlinkSync(tempOut)
  return out
}

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply('Pasa un link o nombre')
  await m.react('⌛')

  let url, title, thumbnail

  if (args[0].includes('youtu')) {
    const id = args[0].split('v=')[1]?.split('&')[0] || args[0].split('/').pop()
    const info = await yts({ videoId: id })
    url = 'https://www.youtube.com/watch?v=' + id
    title = info.title
    thumbnail = info.thumbnail
  } else {
    const r = await yts.search(args.join(' '))
    if (!r.videos.length) return m.reply('No encontrado')
    const v = r.videos[0]
    url = v.url
    title = v.title
    thumbnail = v.thumbnail
  }

  const thumb = await resizeImage(
    Buffer.from(await (await fetch(thumbnail)).arrayBuffer())
  )

  const res3 = await fetch('https://qu.ax/xCgVW.jpg')
  const thumb3 = Buffer.from(await res3.arrayBuffer())

  const fkontak = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      documentMessage: {
        title: `🎬「 ${title} 」⚡`,
        fileName: name,
        jpegThumbnail: thumb3
      }
    }
  }

  if (command === 'ytmp3') {
    const { buffer, fileName } = await yt.download(url, '128k')
    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: fileName.endsWith('.mp3') ? fileName : fileName + '.mp3',
        ptt: false,
        jpegThumbnail: thumb
      },
      { quoted: fkontak }
    )
  }

  if (command === 'ytmp4doc') {
    let { buffer, fileName } = await yt.download(url, '720p')
    buffer = await convertToFast(buffer)
    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        mimetype: 'video/mp4',
        fileName,
        jpegThumbnail: thumb
      },
      { quoted: fkontak }
    )
  }

  await m.react('✅')
}

handler.command = ['ytmp3', 'ytmp4doc']
handler.tags = ['descargas']
handler.help = ['ytmp3 <link|nombre>', 'ytmp4doc <link|nombre>']

export default handler