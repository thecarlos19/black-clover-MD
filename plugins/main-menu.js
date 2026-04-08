import { xpRange } from '../lib/levelling.js'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const charset = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
const textCyberpunk = t => t.toLowerCase().replace(/[a-z]/g, c => charset[c])

const tags = {
  main: textCyberpunk('sistema'),
  group: textCyberpunk('grupos'),
  serbot: textCyberpunk('sub bots')
}

const defaultMenu = {
  before: `
—͟͟͞͞♱ *Registro Clover MD* »
> 🪐 𝙉𝙤𝙢𝙗𝙧𝙚   » %name
> ⚙️ 𝙉𝙞𝙫𝙚𝙡     » %level
> ⚡ 𝙀𝙭𝙥        » %exp / %maxexp
> 🌐 𝙈𝙤𝙙𝙤      » %mode
> ⏳ 𝘼𝙘𝙩𝙞𝙫𝙤   » %muptime
> 👥 𝙐𝙨𝙪𝙖𝙧𝙞𝙤𝙨 » %totalreg

🤖 » 𝐌𝐄𝐍𝐔 𝐁𝐋𝐀𝐂𝐊 𝐂𝐋𝐎𝐕𝐄𝐑 «
👑 » 𝗢𝗽𝗲𝗿𝗮𝗱𝗼𝗿:—͟͟͞͞ 𝐓𝐡𝐞 𝐂𝐚𝐫𝐥𝐨𝐬 𖣘 «
%readmore
`.trimStart(),
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
  const file = getMenuMediaFile(jid)
  if (!fs.existsSync(file)) return {}
  try { return JSON.parse(fs.readFileSync(file)) } catch { return {} }
}

const fetchBuffer = async url =>
  Buffer.from(await (await fetch(url)).arrayBuffer())

const defaultThumb = await fetchBuffer('https://qu.ax/a3EAp')
const defaultVideo = await fetchBuffer('https://files.catbox.moe/0ln7v3.mp4')

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
    mode: global.opts.self ? 'Privado' : 'Público',
    muptime: clockString(process.uptime() * 1000),
    readmore: String.fromCharCode(8206).repeat(4001)
  }

  const help = Object.values(global.plugins || {})
    .filter(p => !p.disabled)
    .map(p => ({
      help: [].concat(p.help || []),
      tags: [].concat(p.tags || []),
      prefix: 'customPrefix' in p
    }))

  for (const { tags: tg } of help)
    for (const t of tg)
      if (t && !tags[t]) tags[t] = textCyberpunk(t)

  const text = [
    menu.before,
    ...Object.keys(tags).map(tag => {
      const cmds = help
        .filter(p => p.tags.includes(tag))
        .flatMap(p => p.help.map(c =>
          menu.body.replace('%cmd', p.prefix ? c : usedPrefix + c)
        )).join('\n')
      return `${menu.header.replace('%category', tags[tag])}\n${cmds}\n${menu.footer}`
    }),
    menu.after
  ].join('\n').replace(/%(\w+)/g, (_, k) => replace[k] ?? '')

  const thumb = menuMedia.thumbnail && fs.existsSync(menuMedia.thumbnail)
    ? fs.readFileSync(menuMedia.thumbnail)
    : defaultThumb

  const video = menuMedia.video && fs.existsSync(menuMedia.video)
    ? fs.readFileSync(menuMedia.video)
    : defaultVideo

  const uniqueThumb = Buffer.concat([thumb, Buffer.from(botJid)])

  await conn.sendMessage(m.chat, {
    video,
    gifPlayback: true,
    jpegThumbnail: uniqueThumb,
    caption: text,
    footer: '🧠 BLACK CLOVER SYSTEM ☘️',
    buttons: [
      { buttonId: `${usedPrefix}menurpg`, buttonText: { displayText: '🏛️ M E N U R P G' }, type: 1 },
      { buttonId: `${usedPrefix}code`, buttonText: { displayText: '🕹 ＳＥＲＢＯＴ' }, type: 1 }
    ],
    contextInfo: {
      externalAdReply: {
        title: menuMedia.menuTitle || '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 | 𝕳𝖆𝖐 v777 🥷🏻',
        body: 'ִ┊࣪ ˖𝐃𝐞𝐯 • 𝐓𝐡𝐞 𝐂𝐚𝐫𝐥𝐨𝐬 ♱',
        thumbnail: uniqueThumb,
        sourceUrl: 'https://github.com/thecarlos19/black-clover-MD',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['menu', 'menú']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'ayuda']
handler.register = true
export default handler

const clockString = ms =>
  [3600000, 60000, 1000].map((v, i) =>
    String(Math.floor(ms / v) % (i ? 60 : 99)).padStart(2, '0')
  ).join(':')