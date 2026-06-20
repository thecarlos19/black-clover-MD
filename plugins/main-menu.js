import { xpRange } from '../lib/levelling.js'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const charset = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
const textCyberpunk = t => t.replace(/[a-z]/gi, c => charset[c.toLowerCase()] || c)

const fontBold = { A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳' }
const textBold = t => t.replace(/[a-z]/gi, c => fontBold[c] || c)

const tags = {
  main: '⚙️ ' + textCyberpunk('sistema'),
  group: '👥 ' + textCyberpunk('grupos'),
  serbot: '🤖 ' + textCyberpunk('sub bots'),
  rpg: '🏛️ ' + textCyberpunk('rpg'),
  downloader: '📥 ' + textCyberpunk('descargas'),
  tools: '🛠️ ' + textCyberpunk('herramientas'),
  game: '🎮 ' + textCyberpunk('juegos'),
  fun: '🎉 ' + textCyberpunk('diversión'),
  anime: '🌸 ' + textCyberpunk('anime'),
  owner: '👑 ' + textCyberpunk('creador')
}

const defaultMenu = {
  before: `
 —͟͟͞͞ ♱ *Menu Clover MD* »
${textBold('👤')} @%name
${textBold('Rango')} » %rank
${textBold('Nivel')} » %level | ${textBold('Exp')} » %maxexp
${textBold('Comandos')} » %totalcmd
${textBold('Modo')} » %mode
${textBold('Activo')} » %muptime
${textBold('Usuarios')} » %totalreg

`.trim(),
  after: `${textBold('⋆꙳•❅‧*₊⋆♱*❆₊⋆')} | ${textBold('꙳•❅‧₊⋆♱︎‧*❆₊⋆')} ︎`
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

const defaultThumb = await fetchBuffer('https://raw.githubusercontent.com/JTxs00/uploads/main/1780717405556.jpeg')

const getRank = (level) => {
  if (level >= 100) return textBold('Rey Mago') + ' 👑'
  if (level >= 80) return textBold('Gran Caballero') + ' 🔱'
  if (level >= 60) return textBold('Caballero Superior') + ' ⚜️'
  if (level >= 40) return textBold('Caballero Intermedio') + ' 🛡️'
  if (level >= 20) return textBold('Caballero') + ' ⚔️'
  if (level >= 10) return textBold('Junior') + ' 🌟'
  return textBold('Novato') + ' 🌱'
}

let handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, { react: { text: '☘️', key: m.key } })

  const botJid = conn.user.jid
  const menuMedia = loadMenuMedia(botJid)
  const menu = global.subBotMenus?.[botJid] || defaultMenu
  const user = global.db.data.users[m.sender] || { level: 0, exp: 0 }
  const { min, xp } = xpRange(user.level, global.multiplier)
  const plugins = Object.values(global.plugins || {}).filter(p =>!p.disabled)
  const totalCmd = plugins.reduce((a, b) => a + (b.help?.length || 0), 0)

  const replace = {
    name: await conn.getName(m.sender),
    level: user.level,
    exp: user.exp - min,
    maxexp: xp,
    rank: getRank(user.level),
    totalreg: Object.keys(global.db.data.users).length,
    totalcmd: totalCmd,
    mode: global.opts.self? textBold('Privado') + ' 🔒' : textBold('Público') + ' 🌍',
    muptime: clockString(process.uptime() * 1000),
    readmore: String.fromCharCode(8206).repeat(4001)
  }

  const seenCommands = new Set()
  const help = plugins.map(p => ({
    help: [].concat(p.help || []).filter(h => {
      const cmd = p.prefix? h : usedPrefix + h
      if (seenCommands.has(cmd)) return false
      seenCommands.add(cmd)
      return true
    }),
    tags: [].concat(p.tags || []),
    prefix: 'customPrefix' in p
  })).filter(p => p.help.length)

  help.forEach(({ tags: tg }) => tg.forEach(t => t &&!tags[t] && (tags[t] = '🔥 ' + textCyberpunk(t))))

  const text = [
    menu.before.replace(/%(\w+)/g, (_, k) => replace[k]?? ''),
    menu.after
  ].join('\n')

  const thumb = menuMedia.thumbnail && fs.existsSync(menuMedia.thumbnail)
  ? fs.readFileSync(menuMedia.thumbnail)
    : defaultThumb

  const sections = Object.keys(tags).map(tag => {
    const cmds = help
   .filter(p => p.tags.includes(tag))
   .flatMap(p => p.help.map(c => ({
        header: textCyberpunk(c.split(' ')[0]),
        title: p.prefix? c : usedPrefix + c,
        description: textBold('Nivel') + ` ${user.level}+`,
        id: p.prefix? c : usedPrefix + c
      })))
    if (!cmds.length) return null
    return {
      title: tags[tag],
      highlight_label: textBold('NUEVO 2026'),
      rows: cmds.slice(0, 25)
    }
  }).filter(Boolean)

  sections.unshift({
    title: '🌟 ' + textBold('FUNCIONES NUEVAS'),
    highlight_label: textBold('NUEVO 2026'),
    rows: [
      { header: textCyberpunk('Menu lista'), title: `${usedPrefix}menu2`, description: textBold('Sistema de menú completo'), id: `${usedPrefix}menu2` },
      { header: textCyberpunk('subbot'), title: `${usedPrefix}code`, description: textBold('Obtén tu sub bot'), id: `${usedPrefix}code` },
      { header: textCyberpunk('premium'), title: `${usedPrefix}premium`, description: textBold('VIP'), id: `${usedPrefix}premium` },
      { header: textCyberpunk('claim'), title: `${usedPrefix}claim`, description: textBold('Mana diario'), id: `${usedPrefix}claim` },
      { header: textCyberpunk('owner'), title: `${usedPrefix}owner`, description: textBold('Rey Mago'), id: `${usedPrefix}owner` }
    ]
  })

  await conn.sendMessage(m.chat, {
    image: thumb,
    caption: text,
    footer: textBold('Black clover') + ' ︎ | ' + textBold('Sistema 2026'),
    buttons: [
      {
        buttonId: 'grimorio_2026',
        buttonText: { displayText: '☘️ ' + textBold('ABRIR GRIMORIO') },
        type: 4,
        nativeFlowInfo: {
          name: 'single_select',
          paramsJson: JSON.stringify({
            title: '⌬ ' + textBold('MENU COMPLETO') + ' 🧬',
            sections
          })
        }
      }
    ],
    headerType: 4,
    mentions: [m.sender]
  })
}

handler.help = ['menu', 'menú']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'ayuda']
handler.register = true
export default handler

const clockString = ms => [3600000, 60000, 1000].map((v, i) => String(Math.floor(ms / v) % (i? 60 : 99)).padStart(2, '0')).join(':')