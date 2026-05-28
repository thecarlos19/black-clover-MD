import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { randomBytes } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmpDir = join(__dirname, '../tmp')

async function ensureTmpDir() {
  try {
    await fs.mkdir(tmpDir, { recursive: true })
  } catch {}
}

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureTmpDir()
      const id = `${Date.now()}_${randomBytes(6).toString('hex')}`
      const tmp = join(tmpDir, `${id}.${ext}`)
      const out = `${tmp}.${ext2}`

      await fs.writeFile(tmp, buffer)

      const proc = spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ])

      let stderr = ''
      proc.stderr.on('data', chunk => stderr += chunk.toString())

      proc.on('error', async err => {
        await fs.unlink(tmp).catch(() => {})
        reject(new Error(`Fallo al ejecutar ffmpeg: ${err.message}`))
      })

      proc.on('close', async code => {
        await fs.unlink(tmp).catch(() => {})
        if (code !== 0) {
          await fs.unlink(out).catch(() => {})
          return reject(new Error(`ffmpeg salió con código ${code}\n${stderr}`))
        }
        try {
          const data = await fs.readFile(out)
          resolve({
            data,
            filename: out,
            delete() {
              return fs.unlink(out).catch(() => {})
            }
          })
        } catch (err) {
          await fs.unlink(out).catch(() => {})
          reject(err)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-application', 'voip'
  ], ext, 'ogg')
}

function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on'
  ], ext, 'opus')
}

function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-crf', '28',
    '-preset', 'veryfast'
  ], ext, 'mp4')
}

export { ffmpeg, toAudio, toPTT, toVideo }