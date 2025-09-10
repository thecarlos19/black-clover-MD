import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      const tmp = join(__dirname, '../tmp', `${Date.now()}.${ext}`)
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

      proc.on('error', err => reject(new Error(`Fallo al ejecutar ffmpeg: ${err.message}`)))

      proc.on('close', async code => {
        try {
          await fs.unlink(tmp).catch(() => {}) // limpiar tmp aunque falle
          if (code !== 0) {
            return reject(new Error(`ffmpeg salió con código ${code}\n${stderr}`))
          }
          const data = await fs.readFile(out)
          resolve({
            data,
            filename: out,
            delete() {
              return fs.unlink(out)
            }
          })
        } catch (err) {
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
    '-vbr', 'on'
  ], ext, 'ogg')
}

function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus')
}

function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4')
}

export { ffmpeg, toAudio, toPTT, toVideo }