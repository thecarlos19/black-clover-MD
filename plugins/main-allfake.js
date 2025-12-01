import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
  }

  async function getRandomChannel() {
    let randomIndex = Math.floor(Math.random() * canalIdM.length)
    let id = canalIdM[randomIndex]
    let name = canalNombreM[randomIndex]
    return { id, name }
  }

  global.getBuffer = async function getBuffer(url, options) {
    try {
      options ? options : {}
      var res = await axios({
        method: "get",
        url,
        headers: {
          'DNT': 1,
          'User-Agent': 'GoogleBot',
          'Upgrade-Insecure-Request': 1
        },
        ...options,
        responseType: 'arraybuffer'
      })
      return res.data
    } catch (e) {
      console.log(`Error : ${e}`)
    }
  }

  global.creador = 'Wa.me/525544876071'
  global.ofcbot = `${conn?.user?.jid?.split('@')[0] || ''}`
  global.asistencia = 'Wa.me/525544876071'
  global.namechannel = '⏤͟͞㋡ 𝐓𝐇𝐄 𝐋𝐄𝐆𝐄𝐍𝐃𝐒 '
  global.namegrupo = ' 𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘︎'
  global.namecomu = '𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 ⏤͟͞ 𝐓𝐇𝐄 𝐋𝐄𝐆𝐄𝐍𝐃𝐒 '
  global.listo = '⚔️ *Aquí tienes perra*'

  //Ids channel
  global.canalIdM = ["120363419782804545@newsletter", "120363419782804545@newsletter"]
  global.canalNombreM = ["⏤͟͞㋡ 𝐓𝐇𝐄 𝐋𝐄𝐆𝐄𝐍𝐃𝐒 ", "㋡ 𝐓𝐇𝐄 𝐋𝐄𝐆𝐄𝐍𝐃𝐒 "]
  global.idchannel = canalIdM[0]
  global.channelRD = await getRandomChannel()

  global.d = new Date(Date.now() + 3600000)
  global.locale = 'es'
  global.dia = global.d.toLocaleDateString(global.locale, { weekday: 'long' })
  global.fecha = global.d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
  global.mes = global.d.toLocaleDateString('es', { month: 'long' })
  global.año = global.d.toLocaleDateString('es', { year: 'numeric' })
  global.tiempo = global.d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })

  //Reacciones De Comandos.!
  global.rwait = '⏳'
  global.done = '✅'
  global.error = '✖️'

  //Emojis determinado de black clover 
  global.emoji = '🥷'
  global.emoji2 = '👻'
  global.emoji3 = '⚔️'
  global.emoji4 = '🍭'
  global.emojis = pickRandom([global.emoji, global.emoji2, global.emoji3, global.emoji4])

  //Enlaces
  var canal = 'https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04'  
  let canal2 = 'https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04'
  var git = 'https://github.com/thecarlos19' 
  var youtube = '' 
  var github = 'https://github.com/thecarlos19/black-clover-MD' 
  let correo = 'carloscristobal30@gmail.com'
  global.redes = pickRandom([canal, git, github, correo])

  let category = "imagen"
  const db = './src/database/db.json'
  const db_ = JSON.parse(fs.readFileSync(db))
  const random = Math.floor(Math.random() * db_.links[category].length)
  const randomlink = db_.links[category][random]
  const response = await fetch(randomlink)
  const rimg = await response.buffer()
  global.icons = rimg

  var ase = new Date()
  var hour = ase.getHours()
  switch (hour) {
    case 0: case 1: case 2: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break;
    case 3: case 4: case 5: case 6: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break;
    case 7: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌅'; break;
    case 8: case 9: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break;
    case 10: case 11: case 12: case 13: hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'; break;
    case 14: case 15: case 16: case 17: hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'; break;
    default: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
  }
  global.saludo = hour

  global.nombre = m.pushName || 'Anónimo'
  global.taguser = '@' + m.sender.split("@s.whatsapp.net")
  var more = String.fromCharCode(8206)
  global.readMore = more.repeat(850)

  global.fkontak = { key: { participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `6285600793871-1614953337@g.us` } : {}) }, message: { 'contactMessage': { 'displayName': `${nombre}`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${nombre},;;;\nFN:${nombre},\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': null, thumbnail: null, sendEphemeral: true } } }

  global.fake = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, newsletterName: channelRD.name, serverMessageId: -1 }, quoted: m } }

  global.icono = pickRandom([
    'https://files.catbox.moe/9mtsqf.jpg',
  ])

  global.rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: 100, newsletterName: channelRD.name }, externalAdReply: { showAdAttribution: true, title: "𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘", body: "𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒", mediaUrl: null, description: null, previewType: "PHOTO", thumbnailUrl: icono, sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }, } }

}

export default handler