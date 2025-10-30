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
    const buffer = await fetch(url).then(res => res.arrayBuffer()).then(Buffer.from)
    fs.writeFileSync(filePath, buffer)
  }
  return filePath
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  if (user.registered === true) {
    return conn.sendMessage(
      m.chat,
      { text: `⚠️ Ya estás registrado, guerrero del Reino.\n\nUsa *${usedPrefix}perfil* para ver tu grimorio.` },
      { quoted: m }
    )
  }

  const regex = /^([a-zA-ZÀ-ÿñÑ\s]+)\.(\d{1,2})$/i
  if (!regex.test(text)) {
    return conn.sendMessage(
      m.chat,
      { text: `⚠️ Formato incorrecto. Usa:\n*${usedPrefix + command} Nombre.Edad*\n\nEjemplo:\n*${usedPrefix + command} Asta.18*` },
      { quoted: m }
    )
  }

  let [_, name, age] = text.match(regex)
  age = parseInt(age)
  if (age < 5 || age > 100) {
    return conn.sendMessage(
      m.chat,
      { text: `⚠️ Edad no válida. Debe estar entre 5 y 100 años.` },
      { quoted: m }
    )
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

  const registroImg = await ensureImage('grimorio.jpg', 'https://qu.ax/AfutJ.jpg')
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
  responseMessage += `> *!* 🕯️ 𝑬𝒍 𝒗í𝒏𝒄𝒖𝒍𝒐 𝒎á𝒈𝒊𝒄𝒐 𝒔𝒆 𝒉𝒂 𝒆𝒔𝒕𝒂𝒃𝒍𝒆𝒄𝒊𝒅𝒐.\n`
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
      title: `📜 registro clover`,
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
        mentions: [...new Set((responseMessage.match(/@(\d{5,16})/g) || []).map(v => v.replace('@', '') + '@s.whatsapp.net'))],
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