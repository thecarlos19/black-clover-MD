import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { ffmpeg } from './converter.js'
import fluent_ffmpeg from 'fluent-ffmpeg'
import uploadFile from './uploadFile.js'
import uploadImage from './uploadImage.js'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import fetch from 'node-fetch'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmp = path.join(__dirname, '../tmp')

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
  return await res.buffer()
}

// --- Sticker Methods ---
async function sticker1(img, url) {
  url = url ? url : await uploadImage(img)
  const { mime } = url ? { mime: 'image/jpeg' } : await fileTypeFromBuffer(img)
  const sc = `
    let im = await loadImg('data:${mime};base64,'+(await window.loadToDataURI('${url}')))
    c.width = c.height = 512
    let max = Math.max(im.width, im.height)
    let w = 512 * im.width / max
    let h = 512 * im.height / max
    ctx.drawImage(im, 256 - w / 2, 256 - h / 2, w, h)
  `
  return await canvas(sc, 'webp')
}

async function sticker2(img, url) {
  if (url) img = await fetchBuffer(url)
  const inp = path.join(tmp, `${Date.now()}.jpeg`)
  await fs.promises.writeFile(inp, img)
  const bufs = []

  const ff = spawn('ffmpeg', [
    '-y', '-i', inp,
    '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
    '-f', 'png', '-'
  ])

  ff.stdout.on('data', chunk => bufs.push(chunk))
  ff.on('close', async () => await fs.promises.unlink(inp).catch(()=>{}))

  return new Promise((resolve, reject) => {
    ff.on('error', reject)
    ff.on('close', () => resolve(Buffer.concat(bufs)))
  })
}

async function sticker3(img, url, packname, author) {
  url = url ? url : await uploadFile(img)
  const query = new URLSearchParams({ url, packname, author })
  const res = await fetch(`https://api.xteam.xyz/sticker/wm?${query}`)
  return await res.buffer()
}

async function sticker4(img, url) {
  if (url) img = await fetchBuffer(url)
  return await ffmpeg(img, [
    '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
  ], 'jpeg', 'webp')
}

async function sticker5(img, url, packname, author, categories = [''], extra = {}) {
  const { Sticker } = await import('wa-sticker-formatter')
  const stickerMetadata = { type: 'default', pack: packname, author, categories, ...extra }
  return (new Sticker(img || url, stickerMetadata)).toBuffer()
}

async function sticker6(img, url) {
  if (url) img = await fetchBuffer(url)
  const type = await fileTypeFromBuffer(img) || { mime: 'application/octet-stream', ext: 'bin' }
  if (type.ext === 'bin') throw new Error('Unsupported file type')

  const tmpFile = path.join(tmp, `${Date.now()}.${type.ext}`)
  const outFile = tmpFile + '.webp'
  await fs.promises.writeFile(tmpFile, img)

  return new Promise((resolve, reject) => {
    let proc = /video/i.test(type.mime)
      ? fluent_ffmpeg(tmpFile).inputFormat(type.ext)
      : fluent_ffmpeg(tmpFile).input(tmpFile)

    proc
      .on('error', async (err) => {
        await fs.promises.unlink(tmpFile).catch(()=>{})
        reject(err)
      })
      .on('end', async () => {
        await fs.promises.unlink(tmpFile).catch(()=>{})
        resolve(await fs.promises.readFile(outFile))
      })
      .addOutputOptions([
        '-vcodec', 'libwebp',
        '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
      ])
      .toFormat('webp')
      .save(outFile)
  })
}

async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': categories,
    ...extra
  }
  const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

// --- Unified Sticker Handler ---
async function sticker(img, url, ...args) {
  const methods = [sticker3, sticker6, sticker5, sticker4, sticker2, sticker1].filter(Boolean)
  let lastError

  for (const func of methods) {
    try {
      const st = await func(img, url, ...args)
      if (Buffer.isBuffer(st) && st.includes('WEBP')) {
        try { return await addExif(st, ...args) } catch { return st }
      }
      return st
    } catch (err) { lastError = err }
  }

  throw lastError
}

// --- Supported Tools ---
const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false,
  find: false
}

export {
  sticker, sticker1, sticker2, sticker3, sticker4, sticker6,
  addExif, support
}