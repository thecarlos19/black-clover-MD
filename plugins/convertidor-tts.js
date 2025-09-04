import gtts from 'node-gtts'
import { readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { exec } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultLang = 'es'

const handler = async (m, { conn, args }) => {
  let lang = args[0]
  let text = args.slice(1).join(' ')

  if ((args[0] || '').length !== 2) {
    lang = defaultLang
    text = args.join(' ')
  }

  if (!text && m.quoted?.text) text = m.quoted.text
  if (!text) throw `*シ︎ Te Faltó Un Texto*\n\nEjemplo:\n- !tts Hola mundo\n- !tts en Hello world`

  try {
    const audioBuffer = await tts(text, lang)
    const wavPath = join(tmpdir(), `${Date.now()}.wav`)
    const opusPath = join(tmpdir(), `${Date.now()}.opus`)

    writeFileSync(wavPath, audioBuffer)

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -y -i "${wavPath}" -c:a libopus -b:a 64k "${opusPath}"`, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    const opusBuffer = readFileSync(opusPath)

    await conn.sendMessage(m.chat, {
      audio: opusBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m })

    unlinkSync(wavPath)
    unlinkSync(opusPath)
  } catch (e) {
    m.reply(`Error generando el TTS: ${e.message}`)
  }
}

handler.help = ['tts <lang> <texto>']
handler.tags = ['tools']
handler.group = true
handler.register = false
handler.command = ['tts']
export default handler

function tts(text, lang = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const tts = gtts(lang)
      const filePath = join(tmpdir(), `${Date.now()}.wav`)
      tts.save(filePath, text, () => {
        const buffer = readFileSync(filePath)
        unlinkSync(filePath)
        resolve(buffer)
      })
    } catch (e) {
      reject(e)
    }
  })
}