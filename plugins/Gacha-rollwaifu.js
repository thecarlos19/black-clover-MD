import fs from 'fs/promises'
import { existsSync } from 'fs'

const charsFile = './src/database/characters.json'
const haremFile = './src/database/harem.json'

let cd = {}

const ensureFile = async (file) => {
  if (!existsSync(file)) {
    await fs.mkdir('./src/database', { recursive: true })
    await fs.writeFile(file, '[]')
  }
}

const loadChars = async () => {
  try {
    await ensureFile(charsFile)
    let data = await fs.readFile(charsFile, 'utf8')
    let parsed = JSON.parse(data || '[]')
    return Array.isArray(parsed)? parsed : []
  } catch {
    return []
  }
}

const saveChars = async (data) => {
  await fs.writeFile(charsFile, JSON.stringify(data, null, 2))
}

const loadHarem = async () => {
  try {
    await ensureFile(haremFile)
    let data = await fs.readFile(haremFile, 'utf8')
    let parsed = JSON.parse(data || '[]')
    return Array.isArray(parsed)? parsed : []
  } catch {
    return []
  }
}

const saveHarem = async (data) => {
  await fs.writeFile(haremFile, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, usedPrefix }) => {
  let user = m.sender
  let now = Date.now()

  if (cd[user] && cd[user] > now) {
    let t = Math.ceil((cd[user] - now) / 1000)
    let mnt = Math.floor(t / 60)
    let sec = t % 60
    return conn.sendMessage(m.chat, {
      text: `⏳ Espera ${mnt}m ${sec}s para volver a rolear`
    }, { quoted: m })
  }

  try {
    let chars = await loadChars()
    if (!chars.length) return conn.reply(m.chat, '📕 No hay personajes registrados en el grimorio', m)

    let r = chars[Math.floor(Math.random() * chars.length)]
    if (!r ||!r.id ||!r.name) return conn.reply(m.chat, '❌ Error al elegir personaje', m)

    let img = Array.isArray(r.img) && r.img.length? r.img[Math.floor(Math.random() * r.img.length)] : r.img
    if (!img) return conn.reply(m.chat, '⚠️ Personaje sin imagen', m)

    let harem = await loadHarem()
    let inHarem = harem.find(v => v.characterId === r.id)

    let status = 'Libre ✅'
    let mentions = []
    let isTaken = false

    if (r.user) {
      status = `Reclamado por @${r.user.split('@')[0]}`
      mentions.push(r.user)
      isTaken = true
    } else if (inHarem?.userId) {
      status = `Reclamado por @${inHarem.userId.split('@')[0]}`
      mentions.push(inHarem.userId)
      isTaken = true
    }

    let text = `✦ *${r.name}*

✦ Género: *${r.gender || 'N/A'}*
✦ Valor: *${Number(r.value || 0).toLocaleString()}*
✦ Estado: ${status}
✦ ID: *${r.id}*`

    let buttons = [
      { buttonId: `${usedPrefix}rw`, buttonText: { displayText: '🎲 Siguiente' }, type: 1 }
    ]

    if (!isTaken) {
      buttons.unshift({ buttonId: `${usedPrefix}claim ${r.id}`, buttonText: { displayText: '💍 Reclamar' }, type: 1 })
    }

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: text,
      footer: 'Black Clover RPG 2026',
      buttons: buttons,
      headerType: 4,
      mentions
    }, { quoted: m })

    cd[user] = now + (2 * 60 * 1000)

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❎ Error al sacar personaje del grimorio', m)
  }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler