import { spawn } from "child_process"
import fs from "fs"
import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"

const packname = "Descargas - black clover"

const imgSquare = async (buf, s = 300) => {
  const i = await Jimp.read(buf)
  return i.resize(s, s).getBufferAsync(Jimp.MIME_JPEG)
}

const safeLink = async (u) => {
  try {
    const h = await fetch(u, { method: "HEAD" })
    return h.ok ? u : null
  } catch {
    return null
  }
}

const altVideo = async (link) => {
  const apis = [
    () => axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${encodeURIComponent(link)}&apikey=Btz-b2H2x`).then(r => r.data.result?.mp4 || r.data.result?.url),
    () => axios.get(`https://api.adonix.xyz/api/youtube/video?url=${encodeURIComponent(link)}`).then(r => r.data?.url),
    () => axios.get(`https://api.vreden.web.id/api/v1/download/youtube/video?url=${encodeURIComponent(link)}`).then(r => r.data.result?.download?.url)
  ]

  for (let f of apis) {
    try {
      const u = await f()
      const ok = await safeLink(u)
      if (ok) return ok
    } catch {}
  }

  throw new Error("Sin fallback disponible")
}

const core = {
  base: "https://cnv.cx",
  headers: {
    "accept-encoding": "gzip, deflate, br, zstd",
    origin: "https://frame.y2meta-uk.com",
    "user-agent": "Mozilla/5.0"
  },
  async key() {
    const r = await fetch(this.base + "/v2/sanity/key", { headers: this.headers })
    const j = await r.json().catch(() => ({}))
    if (!j.key) throw Error("no key")
    return j.key
  },
  async req(link, q) {
    const k = await this.key()
    const body = new URLSearchParams({
      link,
      format: "mp4",
      videoQuality: q.replace("p", ""),
      filenameStyle: "pretty",
      vCodec: "h264"
    })
    const r = await fetch(this.base + "/v2/converter", {
      method: "POST",
      headers: { ...this.headers, key: k },
      body
    })
    const j = await r.json().catch(() => ({}))
    if (!j.url) throw Error("fail convert")
    return j
  },
  async dl(link, q) {
    const { url, filename } = await this.req(link, q)
    const r = await fetch(url)
    if (!r.ok) throw Error("fail download")
    const b = Buffer.from(await r.arrayBuffer())
    return { b, n: filename || "video.mp4" }
  }
}

const fastStart = async (buf) => {
  const a = "./_in.mp4"
  const b = "./_out.mp4"
  fs.writeFileSync(a, buf)

  await new Promise((ok, bad) => {
    const p = spawn("ffmpeg", ["-y", "-i", a, "-c", "copy", "-movflags", "faststart", b])
    p.on("close", c => c === 0 ? ok() : bad())
  })

  const out = fs.readFileSync(b)

  if (fs.existsSync(a)) fs.unlinkSync(a)
  if (fs.existsSync(b)) fs.unlinkSync(b)

  return out
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply("🎬 Envíame link o búsqueda")
  await m.react("⌛")

  let link = "", title = "", thumb = ""

  if (args[0].includes("youtu")) {
    const id = args[0].includes("v=") ? args[0].split("v=")[1]?.split("&")[0] : args[0].split("/").pop()
    if (!id) return m.reply("❌ inválido")

    const info = await yts({ videoId: id }).catch(() => null)
    if (!info) return m.reply("❌ sin info")

    link = "https://www.youtube.com/watch?v=" + id
    title = info.title
    thumb = info.thumbnail
  } else {
    const r = await yts(args.join(" ")).catch(() => ({ videos: [] }))
    if (!r.videos.length) return m.reply("❌ nada")
    const v = r.videos[0]
    link = v.url
    title = v.title
    thumb = v.thumbnail
  }

  let mini = null
  try {
    mini = await imgSquare(Buffer.from(await (await fetch(thumb)).arrayBuffer()))
  } catch {}

  let fake = null
  try {
    const x = await fetch("https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg")
    fake = Buffer.from(await x.arrayBuffer())
  } catch {}

  const quoted = {
    key: { fromMe: false, participant: "0@s.whatsapp.net" },
    message: {
      documentMessage: {
        title: `🎬 ${title}`,
        fileName: packname,
        jpegThumbnail: fake || undefined
      }
    }
  }

  let data

  try {
    data = await core.dl(link, "720p")
  } catch {
    const alt = await altVideo(link)
    const r = await fetch(alt)
    data = { b: Buffer.from(await r.arrayBuffer()), n: "video.mp4" }
  }

  const ready = await fastStart(data.b)

  await conn.sendMessage(
    m.chat,
    {
      video: ready,
      mimetype: "video/mp4",
      fileName: data.n.endsWith(".mp4") ? data.n : data.n + ".mp4",
      jpegThumbnail: mini || undefined
    },
    { quoted }
  )

  await m.react("✅")
}

handler.command = ["ytmp4"]
handler.tags = ["descargas"]
handler.help = ["ytmp4 <link|nombre>"]

export default handler