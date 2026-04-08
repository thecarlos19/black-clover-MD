//código creado x The Carlos 👑
//no olvides dejar créditos 

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const tmpDir = './tmp'
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

async function ensureImage(filename, url) {
  const filePath = path.join(tmpDir, filename)
  if (!fs.existsSync(filePath)) {
    const res = await fetch(url)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)
  }
  return filePath
}

const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID || ''
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || ''

async function verificaInstagram(username) {
  if (!INSTAGRAM_USER_ID || !IG_ACCESS_TOKEN) return true
  try {
    const url = `https://graph.instagram.com/${INSTAGRAM_USER_ID}/followers?access_token=${IG_ACCESS_TOKEN}`
    const req = await fetch(url)
    const json = await req.json()
    if (!json || !json.data) return true
    return json.data.some(f => f.username && username && f.username.toLowerCase() === username.toLowerCase())
  } catch (e) {
    return true
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  const followKey = 'siguiendo'

  if (user.followed) {
    const igUser = (m.pushName || '').replace(/\s+/g, '').toLowerCase()
    const sigue = await verificaInstagram(igUser)
    if (!sigue) {
      user.followed = false
      return conn.sendMessage(m.chat, { text: `⚠️ Has dejado de seguir a mi creador en Instagram.\nPor favor síguelo nuevamente:\n👉 https://www.instagram.com/_carlitos.zx\n\nLuego escribe:\n*${usedPrefix + command} ${followKey}*` }, { quoted: m })
    }
  }

  if (!user.followed) {
    if ((text || '').toLowerCase() === followKey) {
      const igUser = (m.pushName || '').replace(/\s+/g, '').toLowerCase()
      const sigue = await verificaInstagram(igUser)
      if (!sigue) {
        return conn.sendMessage(m.chat, { text: `❌ No detecto que sigas a mi creador\n\n👉 https://www.instagram.com/_carlitos.zx\n\nCuando lo sigas escribe:\n*${usedPrefix + command} ${followKey}*` }, { quoted: m })
      }
      user.followed = true
      return conn.sendMessage(m.chat, { text: `✅ ¡Perfecto! Verificado que sigues a TheCarlosZX.\nAhora puedes usar *${usedPrefix + command} Nombre.Edad* para registrarte.` }, { quoted: m })
    }

    return conn.sendMessage(m.chat, { text: `⚠️ Para poder usar el bot primero debes seguir a mi creador en Instagram:\n\n👉 https://www.instagram.com/_carlitos.zx\n\nDespués de seguirlo, escribe:\n\n*${usedPrefix + command} ${followKey}*` }, { quoted: m })
  }

  if (user.registered === true) {
    return conn.sendMessage(m.chat, { text: `⚠️ Ya estás registrado.\nUsa *${usedPrefix}perfil* para ver tu grimorio.` }, { quoted: m })
  }

  const regex = /^([a-zA-ZÀ-ÿñÑ\s]+)\.(\d{1,2})$/i
  if (!regex.test(text)) {
    return conn.sendMessage(m.chat, { text: `⚠️ Formato incorrecto. Usa:\n*${usedPrefix + command} Nombre.Edad*\n\nEjemplo:\n*${usedPrefix + command} Asta.18*` }, { quoted: m })
  }

  let match = text.match(regex)
  let name = match[1]
  let age = parseInt(match[2])

  if (age < 5 || age > 100) {
    return conn.sendMessage(m.chat, { text: `⚠️ Edad no válida (entre 5 y 100 años).` }, { quoted: m })
  }

  const paises = ['Clover', 'Diamond', 'Spade', 'Heart']
  const afinidades = ['🔥 Fuego', '💧 Agua', '🌪️ Viento', '🌱 Tierra', '⚡ Rayo', '🌑 Oscuridad', '🌞 Luz']

  const country = paises[Math.floor(Math.random() * paises.length)]
  const afinidad = afinidades[Math.floor(Math.random() * afinidades.length)]
  const nivelMagico = Math.floor(Math.random() * 10) + 1
  const grimorioColor = '📖 Grimorio Mágico'

  user.name = name.trim()
  user.age = age
  user.country = country
  user.registered = true
  user.regTime = +new Date()
  user.afinidad = afinidad
  user.nivelMagico = nivelMagico

  let profilePic
  try {
    profilePic = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    profilePic = 'https://qu.ax/AfutJ.jpg'
  }

  const registroImg = await ensureImage('perfil.jpg', profilePic)
  const thumbnailBuffer = fs.readFileSync(await ensureImage('registro_completo.jpg', 'https://qu.ax/AfutJ.jpg'))

  let responseMessage = `> *🌿!**R E G I S T R O  M Á G I C O*\n\n`
  responseMessage += `> *!* ✧──『 ⚜️ 𝗗𝗔𝗧𝗢𝗦 ⚜️ 』\n`
  responseMessage += `> *!* 🧙‍♂️ *Nombre:* ${name}\n`
  responseMessage += `> *!* 🎂 *Edad:* ${age} años\n`
  responseMessage += `> *!* 🌍 *Reino:* ${country}\n`
  responseMessage += `> *!* 🌌 *Afinidad:* ${afinidad}\n`
  responseMessage += `> *!* 💠 *Nivel Mágico:* ${nivelMagico}\n`
  responseMessage += `> *!* 📖 *Grimorio:* ${grimorioColor}\n`
  responseMessage += `> *!* ✧────────────────✧\n\n`
  responseMessage += `> *!* 🕯️ 𝑬𝒍 𝒗í𝒏𝒄𝒖𝒍𝒐 𝒎á𝒈𝒊𝒄𝒐 𝒔𝒆 𝒉⟮ 𝒆𝒔𝒕𝒂𝒃𝒍𝒆𝒄𝒊𝒅𝒐.\n`
  responseMessage += `> *🌿!* ⚔️ 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒊𝒅𝒐, *${name.toUpperCase()}* 𝒅𝒆𝒍 𝑹𝒆𝒊𝒏𝒐 ${country}.\n`
  responseMessage += `> *!* ☘️ ¡𝑬𝒍 𝒅𝒆𝒔𝒕𝒊𝒏𝒐 𝒕𝒆 𝒂𝒈𝒖𝒂𝒓𝒅𝒂!`

  const newsletterId = '120363419782804545@newsletter'
  const newsletterName = 'The Legends'

  const contextInfo = {
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
      newsletterJid: newsletterId,
      newsletterName: newsletterName,
      serverMessageId: 100
    },
    externalAdReply: {
      showAdAttribution: false,
      title: `📜 Registro clover`,
      body: `✡︎ Black-clover-MD • The Carlos`,
      mediaType: 2,
      sourceUrl: global.redes || '',
      thumbnail: global.icons || thumbnailBuffer
    }
  }

  try {
    await conn.sendMessage(
      m.chat,
      {
        image: { url: registroImg },
        caption: responseMessage,
        mentions: [...new Set(((responseMessage.match(/@(\d{5,16})/g)) || []).map(v => v.replace('@', '') + '@s.whatsapp.net'))],
        contextInfo
      },
      { quoted: m }
    )
  } catch (e) {
    await conn.sendMessage(m.chat, { text: responseMessage }, { quoted: m })
  }
}

handler.command = ['registrarme', 'registrar', 'reg']
export default handler