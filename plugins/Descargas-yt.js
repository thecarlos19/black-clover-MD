import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import yts from 'yt-search'
import Jimp from 'jimp'
import axios from 'axios'

const name = 'Descargas - black clover'

async function resizeImage(buffer, size = 300) {
  const img = await Jimp.read(buffer)
  return img.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

async function validateUrl(url) {
  if (!url) return null
  try {
    const res = await fetch(url, { method: 'HEAD', timeout: 5000 })
    return res.ok ? url : null
  } catch {
    return null
  }
}

async function getFallbackMp3(videoUrl, videoId) {
  const apis = [
    async () => {
      const r = await axios.get(`https://api.ryuzei.xyz/dl/ytmp3?url=${encodeURIComponent(videoUrl)}&key=Corvette`)
      return r.data?.url
    },
    async () => {
      const r = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=Btz-b2H2x`)
      return r.data?.result?.mp3 || r.data?.result?.download?.url
    },
    async () => {
      const r = await axios.get(`https://sylphy.xyz/download/v3/ytmp3?url=${videoId}&api_key=Killua-Wa`)
      return r.data?.result?.download?.url || r.data?.result?.url
    },
    async () => {
      const r = await axios.get(`https://api-adonix.ultraplus.click/download/ytaudio?apikey=Yuki-WaBot&url=${encodeURIComponent(videoUrl)}`)
      return r.data?.result?.url || r.data?.data?.url
    },
    async () => {
      const r = await axios.get(`https://api.vreden.web.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}`)
      return r.data?.result?.download?.url
    },
    async () => {
      const r = await axios.get(`https://api.stellarwa.xyz/dl/ytdl?url=${encodeURIComponent(videoUrl)}&format=mp3&key=YukiWaBot`)
      return r.data?.result?.download || r.data?.result
    }
  ]

  for (const fn of apis) {
    try {
      const link = await fn()
      const valid = await validateUrl(link)
      if (valid) return valid
    } catch {}
  }

  throw new Error('Sin fallback')
}

const yt = {
  static: Object.freeze({
    baseUrl: 'https://cnv.cx',
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      origin: 'https://frame.y2meta-uk.com',
      'user-agent': 'Mozilla/5.0'
    }
  }),

  resolveConverterPayload(link, f = '128k') {
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
    if (!n) return 'file.mp3'
    const ext = n.includes('.') ? n.match(/\.[^.]+$/)?.[0] || '.mp3' : '.mp3'
    const base = n.replace(ext, '')
      .replace(/[^A-Za-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
    return base + ext
  },

  async getBuffer(u) {
    const r = await fetch(u)
    if (!r.ok) throw Error('Error descarga')
    return Buffer.from(await r.arrayBuffer())
  },

  async getKey() {
    const r = await fetch(this.static.baseUrl + '/v2/sanity/key', { headers: this.static.headers })
    const j = await r.json().catch(() => ({}))
    if (!j?.key) throw Error('No key')
    return j.key
  },

  async convert(u, f) {
    const key = await this.getKey()
    const r = await fetch(this.static.baseUrl + '/v2/converter', {
      method: 'POST',
      headers: { ...this.static.headers, key },
      body: new URLSearchParams(this.resolveConverterPayload(u, f))
    })
    const j = await r.json().catch(() => ({}))
    if (!j?.url) throw Error('Fail convert')
    return j
  },

  async download(u, f) {
    const { url, filename } = await this.convert(u, f)
    const buffer = await this.getBuffer(url)
    return { buffer, fileName: this.sanitizeFileName(filename) }
  }
}

async function convertToFast(buffer) {
  const tmpDir = path.join(process.cwd(), 'tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

  const id = Date.now()
  const input = path.join(tmpDir, `in_${id}.mp4`)
  const output = path.join(tmpDir, `out_${id}.mp4`)

  fs.writeFileSync(input, buffer)

  await new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-y', '-i', input, '-c', 'copy', '-movflags', 'faststart', output])
    ff.on('error', rej)
    ff.on('close', c => c === 0 ? res() : rej())
  })

  let out = null
  if (fs.existsSync(output)) out = fs.readFileSync(output)

  if (fs.existsSync(input)) fs.unlinkSync(input)
  if (fs.existsSync(output)) fs.unlinkSync(output)

  if (!out) throw new Error('Error ffmpeg')

  return out
}

function extractYouTubeId(url) {
  try {
    if (url.includes('v=')) return url.split('v=')[1].split('&')[0]
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0]
    return null
  } catch {
    return null
  }
}

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply('Pasa un link o nombre')
  await m.react('⌛')

  let url, title, thumbnail

  if (args[0].includes('youtu')) {
    const id = extractYouTubeId(args[0])
    if (!id) return m.reply('Link inválido')

    const info = await yts({ videoId: id }).catch(() => null)
    if (!info) return m.reply('Sin info')

    url = 'https://www.youtube.com/watch?v=' + id
    title = info.title
    thumbnail = info.thumbnail
  } else {
    const r = await yts(args.join(' ')).catch(() => ({ videos: [] }))
    if (!r.videos.length) return m.reply('No encontrado')
    const v = r.videos[0]
    url = v.url
    title = v.title
    thumbnail = v.thumbnail
  }

  let thumb = null
  try {
    const res = await fetch(thumbnail)
    thumb = await resizeImage(Buffer.from(await res.arrayBuffer()))
  } catch {}

  let fake = null
  try {
    const r = await fetch('https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg')
    fake = Buffer.from(await r.arrayBuffer())
  } catch {}

  const fkontak = {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      documentMessage: {
        title: `🎬「 ${title} 」⚡`,
        fileName: name,
        jpegThumbnail: fake || undefined
      }
    }
  }

  if (command === 'ytmp3') {
    let buffer, fileName

    try {
      const res = await yt.download(url, '128k')
      buffer = res.buffer
      fileName = res.fileName
    } catch {
      const fb = await getFallbackMp3(url, extractYouTubeId(url))
      buffer = await yt.getBuffer(fb)
      fileName = 'audio.mp3'
    }

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: fileName.endsWith('.mp3') ? fileName : fileName + '.mp3',
      jpegThumbnail: thumb || undefined
    }, { quoted: fkontak })
  }

  if (command === 'ytmp4doc') {
    let { buffer, fileName } = await yt.download(url, '720p')
    buffer = await convertToFast(buffer)

    await conn.sendMessage(m.chat, {
      document: buffer,
      mimetype: 'video/mp4',
      fileName: fileName.endsWith('.mp4') ? fileName : fileName + '.mp4',
      jpegThumbnail: thumb || undefined
    }, { quoted: fkontak })
  }

  await m.react('✅')
}

handler.command = ['ytmp3', 'ytmp4doc']
handler.tags = ['descargas']
handler.help = ['ytmp3 <link|nombre>', 'ytmp4doc <link|nombre>']

export default handler