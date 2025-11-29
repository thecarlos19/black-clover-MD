import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import crypto from "crypto"

async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer)
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
}

const name = 'Descargas - black clover'

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    info: "/v2/info",
    download: "/download",
    cdn: "/random-cdn"
  },
  headers: {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://yt.savetube.me",
    referer: "https://yt.savetube.me/",
    "user-agent": "Postify/1.0.0"
  },
  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g)
      return Buffer.from(matches.join(""), "hex")
    },
    decrypt: async (enc) => {
      const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12"
      const data = Buffer.from(enc, "base64")
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = savetube.crypto.hexToBuffer(secretKey)
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    }
  },
  isUrl: (str) => {
    try {
      new URL(str)
      return /youtube.com|youtu.be/.test(str)
    } catch {
      return false
    }
  },
  youtube: (url) => {
    const patterns = [
      /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtu.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (let pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  },
  request: async (endpoint, data = {}, method = "post") => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
        headers: savetube.headers
      })
      return { status: true, code: 200, data: response }
    } catch (error) {
      return { status: false, code: error.response?.status || 500, error: error.message }
    }
  },
  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, "get")
    if (!response.status) return response
    return { status: true, code: 200, data: response.data.cdn }
  },
  download: async (link, type = "video") => {
    if (!savetube.isUrl(link)) return { status: false, code: 400, error: "URL inválida" }
    const id = savetube.youtube(link)
    if (!id) return { status: false, code: 400, error: "No se pudo obtener el ID del video" }
    try {
      const cdnx = await savetube.getCDN()
      if (!cdnx.status) return cdnx
      const cdn = cdnx.data
      const videoInfo = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` })
      if (!videoInfo.status || !videoInfo.data?.data) return { status: false, code: 500, error: "No se pudo obtener información del video" }
      const decrypted = await savetube.crypto.decrypt(videoInfo.data.data)
      const downloadData = await savetube.request(
        `https://${cdn}${savetube.api.download}`,
        { id, downloadType: type === "audio" ? "audio" : "video", quality: type === "audio" ? "mp3" : "720p", key: decrypted.key }
      )
      if (!downloadData?.data?.data?.downloadUrl) return { status: false, code: 500, error: "No se pudo obtener link de descarga" }
      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "",
          author: decrypted.channel || "",
          views: decrypted.viewCount || "",
          timestamp: decrypted.lengthSeconds || "",
          ago: decrypted.uploadedAt || "",
          format: type === "audio" ? "mp3" : "mp4",
          download: downloadData.data.data.downloadUrl,
          thumbnail: decrypted.thumbnail || ""
        }
      }
    } catch (error) {
      return { status: false, code: 500, error: error.message }
    }
  }
}

const handler = async (m, { conn, text, command }) => {
  await m.react("⌛")
  if (!text?.trim()) return conn.reply(m.chat, "Dame el link de YouTube o el nombre XD", m)
  try {
    let url, title, thumbnail
    if (savetube.isUrl(text)) {
      const id = savetube.youtube(text)
      const search = await yts({ videoId: id })
      url = text
      title = search.title || ""
      thumbnail = search.thumbnail
    } else {
      const search = await yts.search({ query: text, pages: 1 })
      if (!search.videos.length) return m.reply("❌ ¡Ni con el radar del dragón encontré ese video!")
      const videoInfo = search.videos[0]
      url = videoInfo.url
      title = videoInfo.title
      thumbnail = videoInfo.thumbnail
    }
    const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300)
    const res3 = await fetch("https://qu.ax/xCgVW.jpg")
    const thumb3 = Buffer.from(await res3.arrayBuffer())
    const fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        documentMessage: {
          title: `🎬「 ${title} 」⚡`,
          fileName: `${name}`,
          jpegThumbnail: thumb3
        }
      }
    }
    if (["ytmp4doc"].includes(command)) {
      await m.react("⌛")
      const dl = await savetube.download(url, "video")
      if (!dl.status) {
        await m.react("✖️")
        return m.reply(`❌ Error zorra: ${dl.error}`)
      }
      try {
        const { headers } = await axios.head(dl.result.download)
        const fileSize = parseInt(headers["content-length"] || 0)
        if (fileSize > 629145600) {
          await m.react("✖️")
          return m.reply("⚠️ El archivo supera los 600 MB, no puedo enviarlo.")
        }
      } catch {}
      await conn.sendMessage(
        m.chat,
        {
          document: { url: dl.result.download },
          mimetype: "video/mp4",
          fileName: `${dl.result.title}.mp4`,
          jpegThumbnail: thumbResized,
          caption: `🎬 *${dl.result.title}*`
        },
        { quoted: fkontak }
      )
      await m.react("✅")
      return
    }
    if (["ytmp3"].includes(command)) {
      await m.react("✅")
      const dl = await savetube.download(url, "audio")
      if (!dl.status) return m.reply(`❌ Error zorra: ${dl.error}`)
      await conn.sendMessage(
        m.chat,
        { audio: { url: dl.result.download }, mimetype: "audio/mpeg", fileName: `${dl.result.title}.mp3` },
        { quoted: fkontak }
      )
      return
    }
  } catch (error) {
    await m.react("✖️")
    console.error("❌ Error:", error)
    return m.reply(`💢 Error perra: ${error.message}`)
  }
}

handler.command = ["ytmp4doc", "ytmp3"]
handler.help = ["ytmp4doc", "ytmp3"]
handler.tags = ["descargas"]

export default handler