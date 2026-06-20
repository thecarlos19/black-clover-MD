import { xpRange } from '../lib/levelling.js'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const charset = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
const textCyberpunk = t => t.replace(/[a-z]/gi, c => charset[c.toLowerCase()] || c)

const tags = {
  main: textCyberpunk('sistema'),
  group: textCyberpunk('grupos'),
  serbot: textCyberpunk('sub bots'),
  rpg: textCyberpunk('rpg'),
  downloader: textCyberpunk('descargas'),
  tools: textCyberpunk('herramientas'),
  game: textCyberpunk('juegos'),
  fun: textCyberpunk('diversión'),
  anime: textCyberpunk('anime'),
  owner: textCyberpunk('creador')
}

const defaultMenu = {
  before: `
🟢 *The Carlos* ✓ • *Estado*
—͟͟͞͞ ♱ *Menu Clover MD 2* »
> 🪐 𝙉𝙤𝙢𝙗𝙧𝙚 » %name
> ⚡ 𝙀𝙭𝙥 » %exp / %maxexp
> 🌐 𝙈𝙤𝙙𝙤 » %mode
> ⏳ 𝘼𝙘𝙩𝙞𝙫𝙤 » %muptime
> 👥 𝙐𝙨𝙪𝙖𝙧𝙞𝙤𝙨 » %totalreg

> Repositorio oficial del bot 
https://github.com/thecarlos19/black-clover-MD

%readmore
`.trim(),
  header: '\n⧼⋆꙳•〔 ♱ %category 〕⋆꙳•⧽',
  body: '> 𖣘 %cmd',
  footer: '╰⋆꙳•❅‧*₊⋆꙳︎‧*❆₊⋆╯',
  after: '\n⌬ 𝗖𝗬𝗕𝗘𝗥 𝗠𝗘𝗡𝗨 🧬 - Sistema ejecutado con éxito.'
}

const menuDir = './media/menu'
fs.mkdirSync(menuDir, { recursive: true })

const getMenuMediaFile = jid =>
  path.join(menuDir, `menuMedia_${jid.replace(/[:@.]/g, '_')}.json`)

const loadMenuMedia = jid => {
  try {
    return JSON.parse(fs.readFileSync(getMenuMediaFile(jid)))
  } catch { return {} }
}

const fetchBuffer = url => fetch(url).then(r => r.arrayBuffer()).then(b => Buffer.from(b))

const defaultVid = await fetchBuffer('https://tmpfiles.org/dl/wPwKTUEL9IQr/file.mp4')

let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, { react: { text: '⚔️', key: m.key } })

  const botJid = conn.user.jid
  const menuMedia = loadMenuMedia(botJid)
  const menu = global.subBotMenus?.[botJid] || defaultMenu

  const user = global.db.data.users[m.sender] || { level: 0, exp: 0 }
  const { min, xp } = xpRange(user.level, global.multiplier)

  const replace = {
    name: await conn.getName(m.sender),
    level: user.level,
    exp: user.exp - min,
    maxexp: xp,
    totalreg: Object.keys(global.db.data.users).length,
    mode: global.opts.self? 'Privado' : 'Público',
    muptime: clockString(process.uptime() * 1000),
    readmore: String.fromCharCode(8206).repeat(4001)
  }

  const plugins = Object.values(global.plugins || {}).filter(p =>!p.disabled)

  const help = plugins.map(p => ({
    help: [].concat(p.help || []),
    tags: [].concat(p.tags || []),
    prefix: 'customPrefix' in p
  }))

  help.forEach(({ tags: tg }) =>
    tg.forEach(t => t &&!tags[t] && (tags[t] = textCyberpunk(t)))
  )

  const text = [
    menu.before,
   ...Object.keys(tags).map(tag => {
      const cmds = help
       .filter(p => p.tags.includes(tag))
       .flatMap(p => p.help.map(c =>
          menu.body.replace('%cmd', p.prefix? c : usedPrefix + c)
        )).join('\n')
      if (!cmds) return null
      return `${menu.header.replace('%category', tags[tag])}\n${cmds}\n${menu.footer}`
    }).filter(Boolean),
    menu.after
  ].join('\n').replace(/%(\w+)/g, (_, k) => replace[k]?? '')

  const thumb = menuMedia.video && fs.existsSync(menuMedia.video)
   ? fs.readFileSync(menuMedia.video)
    : defaultVid

  await conn.sendMessage(m.chat, {
    video: thumb,
    caption: text,
    footer: '🧠 BLACK CLOVER SYSTEM ☘️',
    buttons: [
      {
        buttonId: `${usedPrefix}menurpg`,
        buttonText: { displayText: '🏛️ M E N U R P G' }
      },
      {
        buttonId: `${usedPrefix}code`,
        buttonText: { displayText: '🕹 ＳＥＲＢＯＴ' }
      },
      {
        buttonId: 'canal_oficial',
        buttonText: { displayText: '📢 CANAL OFICIAL' },
        type: 1,
        urlButton: {
          displayText: '📢 CANAL OFICIAL',
          url: 'https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04'
        }
      }
    ],
    headerType: 5,
    mentions: [m.sender]
  })
}

handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'menú2']
handler.register = true
export default handler

const clockString = ms =>
  [3600000, 60000, 1000].map((v, i) =>
    String(Math.floor(ms / v) % (i? 60 : 99)).padStart(2, '0')
  ).join(':')