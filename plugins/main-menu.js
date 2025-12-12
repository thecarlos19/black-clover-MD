import { xpRange } from '../lib/levelling.js'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import Jimp from 'jimp'

const textCyberpunk = (text) => {
  const charset = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
  return text.toLowerCase().split('').map(c => charset[c] || c).join('')
}

let tags = {
  'main': textCyberpunk('sistema'),
  'group': textCyberpunk('grupos'),
  'serbot': textCyberpunk('sub bots')
}

const defaultMenu = {
  before: `
⎯͟͞͞★ 🎄 𝙐𝙎𝙀𝙍 𝙎𝙏𝘼𝙏𝙐𝙎 🎄 ★͟͞͞⎯
> 🪐 𝙉𝙤𝙢𝙗𝙧𝙚   » %name  
> ⚙️ 𝙉𝙞𝙫𝙚𝙡     » %level  
> ⚡ 𝙀𝙭𝙥        » %exp / %maxexp  
> 🌐 𝙈𝙤𝙙𝙤      » %mode  
> ⏳ 𝘼𝙘𝙩𝙞𝙫𝙤   » %muptime  
> 👥 𝙐𝙨𝙪𝙖𝙧𝙞𝙤𝙨 » %totalreg  
⋆꙳•̩̩͙❅*̩̩•̩̩͙͙‧‧₊˚🎄✩ ₊˚🦌⊹♡͙ •̩̩͙‧͙*̩̩͙❆˚₊⋆


🎁 » 𝐌𝐄𝐍𝐔 𝐃𝐄 𝐍𝐀𝐕𝐈𝐃𝐀𝐃 🎅🏻 «  
👑 » 𝗢𝗽𝗲𝗿𝗮𝗱𝗼𝗿:—͟͟͞͞ 𝐓𝐡𝐞 𝐂𝐚𝐫𝐥𝐨𝐬 𖣘 «
%readmore
`.trimStart(),

  header: '\n⧼⋆꙳•〔 🎅🏻 %category 〕⋆꙳•⧽',
  body: '> ☃️ %cmd\n',
  footer: '╰⋆꙳•❅‧*₊⋆☃︎‧*❆₊⋆⋆꙳•❅‧*₊⋆☃︎‧*❆₊⋆╯',
  after: '\n⌬ 𝗖𝗬𝗕𝗘𝗥 𝗠𝗘𝗡𝗨 ❄️ - Sistema ejecutado con éxito.'
}

const menuDir = './media/menu'
if (!fs.existsSync(menuDir)) fs.mkdirSync(menuDir, { recursive: true })

function getMenuMediaFile(botJid) {
  const botId = botJid.replace(/[:@.]/g, '_')
  return path.join(menuDir, `menuMedia_${botId}.json`)
}

function loadMenuMedia(botJid) {
  const file = getMenuMediaFile(botJid)
  if (fs.existsSync(file)) {
    try { return JSON.parse(fs.readFileSync(file)) } catch (e) {
      console.warn('Error leyendo menuMedia JSON:', e)
      return {}
    }
  }
  return {}
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '☃️', key: m.key } })

    const botJid = conn.user.jid
    const menuMedia = loadMenuMedia(botJid)
    const subBotMenu = global.subBotMenus?.[botJid] || defaultMenu
    const { before, header, body, footer, after } = subBotMenu

    const { exp, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)
    const _uptime = process.uptime() * 1000
    const muptime = clockString(_uptime)
    const totalreg = Object.keys(global.db.data.users).length
    const mode = global.opts["self"] ? "Privado" : "Público"

    const help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
      limit: p.limit,
      premium: p.premium,
      enabled: !p.disabled
    }))

    for (let plugin of help) {
      if (plugin.tags) {
        for (let t of plugin.tags) {
          if (!(t in tags) && t) tags[t] = textCyberpunk(t)
        }
      }
    }

    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        const cmds = help
          .filter(menu => menu.tags.includes(tag))
          .map(menu => menu.help.map(cmd => body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)).join('\n'))
          .join('\n')
        return `${header.replace(/%category/g, tags[tag])}\n${cmds}\n${footer}`
      }),
      after
    ].join('\n')

    const replace = {
      '%': '%',
      name,
      level,
      exp: exp - min,
      maxexp: xp,
      totalreg,
      mode,
      muptime,
      readmore: String.fromCharCode(8206).repeat(4001)
    }

    const text = _text.replace(/%(\w+)/g, (_, key) => replace[key] || '')

    let thumbBuffer
    if (menuMedia.thumbnail && fs.existsSync(menuMedia.thumbnail)) {
      thumbBuffer = fs.readFileSync(menuMedia.thumbnail)
    } else {
      thumbBuffer = await fetch('https://files.catbox.moe/c5hat3.jpg').then(res => res.arrayBuffer()).then(Buffer.from)
    }

    const uniqueThumb = Buffer.concat([thumbBuffer, Buffer.from(conn.user.jid)])

    let mediaMessage
    if (menuMedia.video && fs.existsSync(menuMedia.video)) {
      mediaMessage = { video: fs.readFileSync(menuMedia.video), jpegThumbnail: uniqueThumb, gifPlayback: true }
    } else {
      const defaultVideo = await fetch('https://files.catbox.moe/kku6hy.mp4').then(res => res.arrayBuffer()).then(Buffer.from)
      mediaMessage = { video: defaultVideo, jpegThumbnail: uniqueThumb, gifPlayback: true }
    }

    const menuTitle = menuMedia.menuTitle || '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 | 𝕳𝖆𝖐 v777 🎅🏻'

    await conn.sendMessage(m.chat, {
      ...mediaMessage,
      caption: text,
      footer: '🧠 BLACK CLOVER SYSTEM ☘️',
      buttons: [
        { buttonId: `${_p}menurpg`, buttonText: { displayText: '🏛️ M E N U R P G' }, type: 1 },
        { buttonId: `${_p}code`, buttonText: { displayText: '🕹 ＳＥＲＢＯＴ' }, type: 1 }
      ],
      contextInfo: {
        externalAdReply: {
          title: menuTitle,
          body: 'ִ┊࣪ ˖𝐃𝐞𝐯 • 𝐓𝐡𝐞 𝐂𝐚𝐫𝐥𝐨𝐬 ♱',
          thumbnail: uniqueThumb,
          sourceUrl: 'https://github.com/thecarlos19/black-clover-MD',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❎ Error al generar el menú del sistema.', m)
  }
}

handler.help = ['menu', 'menú']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'ayuda']
handler.register = true
export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}