import { spawn } from "child_process"
import fs from "fs"
import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"

const name = "Descargas - black clover"

async function resizeImage(buffer, size = 300) {
  const img = await Jimp.read(buffer)
  return img.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

async function validateUrl(url) {
  if (!url) return null
  try {
    const res = await fetch(url, { method: "HEAD", timeout: 5000 })
    return res.ok ? url : null
  } catch {
    return null
  }
}

function extractYouTubeId(url) {
  try {
    if (url.includes("v=")) return url.split("v=")[1].split("&")[0]
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0]
    return null
  } catch {
    return null
  }
}

async function getFallbackMp3(videoUrl, videoId) {
  const sources = [
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

  for (const fn of sources) {
    try {
      const link = await fn()
      const valid = await validateUrl(link)
      if (valid) return valid
    } catch {}
  }

  throw new Error("No hay servidores disponibles")
}

const yt = {
  static: Object.freeze({
    baseUrl: "https://cnv.cx",
    headers: {
      "accept-encoding": "gzip, deflate, br",
      origin: "https://frame.y2meta-uk.com",
      "user-agent": "Mozilla/5.0"
    }
  }),

  resolveConverterPayload(link, f = "128k") {
    return {
      link,
      format: "mp3",
      audioBitrate: f.replace("k", ""),
      filenameStyle: "pretty"
    }
  },

  sanitizeFileName(n) {
    if (!n) return "audio.mp3"
    const base = n.replace(/\.[^/.]+$/, "")
      .replace(/[^A-Za-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase()
    return base + ".mp3"
  },

  async getBuffer(u) {
    const r = await fetch(u)
    if (!r.ok) throw Error("Error al descargar")
    return Buffer.from(await r.arrayBuffer())
  },

  async getKey() {
    const r = await fetch(this.static.baseUrl + "/v2/sanity/key", { headers: this.static.headers })
    const j = await r.json().catch(() => ({}))
    if (!j?.key) throw Error("Sin key")
    return j.key
  },

  async convert(u, f) {
    const key = await this.getKey()
    const payload = this.resolveConverterPayload(u, f)

    const r = await fetch(this.static.baseUrl + "/v2/converter", {
      method: "POST",
      headers: { ...this.static.headers, key },
      body: new URLSearchParams(payload)
    })

    const j = await r.json().catch(() => ({}))
    if (!j?.url) throw Error("Fallo conversión")
    return j
  },

  async download(u, f) {
    const { url, filename } = await this.convert(u, f)
    const buffer = await this.getBuffer(url)
    return { buffer, fileName: this.sanitizeFileName(filename) }
  }
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply("🎵 Pasa el link o nombre")
  await m.react("⌛")

  let url = "", title = "", thumbnail = ""

  if (args[0].includes("youtu")) {
    const id = extractYouTubeId(args[0])
    if (!id) return m.reply("❌ Link inválido")

    const info = await yts({ videoId: id }).catch(() => null)
    if (!info) return m.reply("❌ Sin info")

    url = "https://www.youtube.com/watch?v=" + id
    title = info.title
    thumbnail = info.thumbnail
  } else {
    const search = await yts(args.join(" ")).catch(() => ({ videos: [] }))
    if (!search.videos.length) return m.reply("❌ No encontrado")

    const v = search.videos[0]
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
    const res = await fetch("https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg")
    fake = Buffer.from(await res.arrayBuffer())
  } catch {}

  const fkontak = {
    key: { fromMe: false, participant: "0@s.whatsapp.net" },
    message: {
      documentMessage: {
        title: `🎵「 ${title} 」`,
        fileName: name,
        jpegThumbnail: fake || undefined
      }
    }
  }

  let buffer, fileName

  try {
    const res = await yt.download(url, "128k")
    buffer = res.buffer
    fileName = res.fileName
  } catch {
    const fallback = await getFallbackMp3(url, extractYouTubeId(url))
    buffer = await yt.getBuffer(fallback)
    fileName = "audio.mp3"
  }

  await conn.sendMessage(
    m.chat,
    {
      document: buffer,
      mimetype: "audio/mpeg",
      fileName: fileName.endsWith(".mp3") ? fileName : fileName + ".mp3",
      jpegThumbnail: thumb || undefined
    },
    { quoted: fkontak }
  )

  await m.react("✅")
}

handler.command = ["ytmp3doc"]
handler.tags = ["descargas"]
handler.help = ["ytmp3doc <link|nombre>"]

export default handler