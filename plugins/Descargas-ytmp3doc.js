import { spawn } from "child_process"
import fs from "fs"
import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"

const name = "Descargas - black clover"

async function resizeImage(buffer, size = 300) {
  const img = await Jimp.read(buffer)
  return img.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

const yt = {
  static: Object.freeze({
    baseUrl: "https://cnv.cx",
    headers: {
      "accept-encoding": "gzip, deflate, br, zstd",
      origin: "https://frame.y2meta-uk.com",
      "user-agent": "Mozilla/5.0"
    }
  }),
  resolveConverterPayload(link, f = "128k") {
    if (!["128k", "320k"].includes(f)) throw Error("Formato inválido")
    return {
      link,
      format: "mp3",
      audioBitrate: f.replace("k", ""),
      filenameStyle: "pretty"
    }
  },
  sanitizeFileName(n) {
    const ext = n.match(/\.[^.]+$/)[0]
    const base = n.replace(ext, "").replace(/[^A-Za-z0-9]/g, "_").replace(/_+/g, "_").toLowerCase()
    return base + ext
  },
  async getBuffer(u) {
    const r = await fetch(u)
    if (!r.ok) throw Error("No se pudo descargar")
    return Buffer.from(await r.arrayBuffer())
  },
  async getKey() {
    const r = await fetch(this.static.baseUrl + "/v2/sanity/key", { headers: this.static.headers })
    return r.json()
  },
  async convert(u, f) {
    const { key } = await this.getKey()
    const payload = this.resolveConverterPayload(u, f)
    const r = await fetch(this.static.baseUrl + "/v2/converter", {
      method: "post",
      headers: { ...this.static.headers, key },
      body: new URLSearchParams(payload)
    })
    return r.json()
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

  let url, title, thumbnail

  if (args[0].includes("youtu")) {
    const info = await yts({ videoId: args[0].split("v=")[1] })
    url = args[0]
    title = info.title
    thumbnail = info.thumbnail
  } else {
    const search = await yts.search(args.join(" "))
    if (!search.videos.length) return m.reply("❌ No encontrado")
    const v = search.videos[0]
    url = v.url
    title = v.title
    thumbnail = v.thumbnail
  }

  const thumb = await resizeImage(await (await fetch(thumbnail)).buffer())
  const res3 = await fetch("https://qu.ax/xCgVW.jpg")
  const thumb3 = Buffer.from(await res3.arrayBuffer())

  const fkontak = {
    key: { fromMe: false, participant: "0@s.whatsapp.net" },
    message: {
      documentMessage: {
        title: `🎵「 ${title} 」`,
        fileName: name,
        jpegThumbnail: thumb3
      }
    }
  }

  const { buffer, fileName } = await yt.download(url, "128k")

  await conn.sendMessage(
    m.chat,
    {
      document: buffer,
      mimetype: "audio/mpeg",
      fileName,
      jpegThumbnail: thumb
    },
    { quoted: fkontak }
  )

  await m.react("✅")
}

handler.command = ["ytmp3doc"]
handler.tags = ["descargas"]
handler.help = ["ytmp3doc <link|nombre>"]

export default handler