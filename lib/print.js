import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'
import moment from 'moment-timezone'

const terminalImage = global.opts?.['img']? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

const ALERT_WORDS = ['@admin', 'error', 'fallo', 'ayuda', 'problema', 'ban', 'spam']
const IGNORE_CHATS = ['status@broadcast']
const IGNORE_COMMANDS = [/^\/ping$/i, /^\/estado$/i, /^\/menu$/i]
const MUTE_USERS = []

const formatSize = (bytes) => {
  if (!bytes) return '0B'
  const units = ['', 'K', 'M', 'G', 'T']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)}${units[i]}B`
}

const getName = (jid, conn) => {
  try {
    if (!jid) return ''
    if (conn.contacts?.[jid]?.name) return conn.contacts[jid].name
    if (conn.contacts?.[jid]?.notify) return conn.contacts[jid].notify
    if (conn.contacts?.[jid]?.verifiedName) return conn.contacts[jid].verifiedName
    if (conn.contacts?.[jid]?.subject) return conn.contacts[jid].subject
    let id = jid.replace(/@.+/, '')
    return PhoneNumber('+' + id).getNumber('international') || id
  } catch {
    return jid.split('@')[0]
  }
}

export default async function (m, conn = { user: {} }) {
  if (IGNORE_CHATS.includes(m.chat) || MUTE_USERS.includes(m.sender)) return
  if (typeof m.text === 'string' && IGNORE_COMMANDS.some(rx => rx.test(m.text))) return

  let _name = getName(m.sender, conn)
  let senderNum = m.sender.replace(/@.+/, '')
  let sender = PhoneNumber('+' + senderNum).getNumber('international') + (_name? ' ~' + _name : '')
  let chat = getName(m.chat, conn)
  let img

  try {
    if (global.opts?.['img'] && /sticker|image/gi.test(m.mtype))
      img = await terminalImage.buffer(await m.download())
  } catch (e) {}

  let filesize = (m.msg?
    m.msg.vcard? m.msg.vcard.length :
    m.msg.fileLength? (m.msg.fileLength.low || m.msg.fileLength) :
    m.msg.axolotlSenderKeyDistributionMessage? m.msg.axolotlSenderKeyDistributionMessage.length :
    m.text? m.text.length : 0
    : m.text? m.text.length : 0) || 0

  let user = global.db?.data?.users?.[m.sender] || {}
  let me = PhoneNumber('+' + (conn.user?.jid || '').replace(/@.+/, '')).getNumber('international')
  let isP = global.conn?.user?.jid === conn.user?.jid
  let uptime = process.uptime()
  let uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`

  const header = `
${chalk.hex('#00FF9F').bold('┈────────────── ꒰ ⚔️ ꒱')}
≡ ✯ ${chalk.cyan(me + ' ➝ ' + (isP? "(Principal)" : "(SubBot)"))}
≡ ✢ ${chalk.black(chalk.bgHex('#FF006E')(moment().tz('America/Mexico_City').format('HH:mm:ss')))}
≡ ⏱ ${chalk.hex('#B4FF00')('Up: ' + uptimeStr)}
≡ ‣ ${chalk.black(chalk.bgHex('#FB5607')(m.messageStubType? WAMessageStubType[m.messageStubType] : 'MSG'))}
≡ ◆ ${chalk.hex('#8338EC')(`${filesize} [${formatSize(filesize)}]`)}

≡ ⎗ ${chalk.hex('#FF006E')(sender)}
≡ ❑ ${chalk.hex('#00FF9F')(`XP: ${user.exp || 0}`)} ${chalk.hex('#FFBE0B')(`💎 ${user.diamond || 0}`)} ${chalk.hex('#FB5607')(`LV: ${user.level || 0}`)}
≡ ✞ ${m.chat.endsWith('@g.us')? chalk.hex('#00F5FF')(chat? chat : m.chat) : chalk.hex('#8338EC')(m.chat)}
≡ ⎙ ${chalk.black(chalk.bgHex('#00FF9F')(m.mtype? m.mtype.replace(/message$/i, '').replace(/^./, v => v.toUpperCase()) : 'TEXT'))}
${chalk.hex('#00FF9F').bold('┈────────────── ꒰ 𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘:꒱')}
`

  console.log(header)
  if (img) console.log(img.trimEnd())

  let log = ''
  if (typeof m.text === 'string' && m.text) {
    log = m.text.replace(/\u200e+/g, '')
    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
    let mdFormat = (depth = 4) => (_, type, text, monospace) => {
      let types = { _: 'italic', '*': 'bold', '~': 'strikethrough' }
      text = text || monospace
      return!types[type] || depth < 1? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
    }

    if (log.length < 2048) log = log.replace(urlRegex, url => chalk.hex('#00F5FF').underline(url))
    log = log.replace(mdRegex, mdFormat(4))

    if (m.mentionedJid?.length) {
      const names = m.mentionedJid.map(jid => getName(jid, conn))
      for (let i = 0; i < m.mentionedJid.length; i++) {
        log = log.replace('@' + m.mentionedJid[i].split`@`[0], chalk.hex('#FF006E')('@' + names[i]))
      }
    }

    const isAlert = ALERT_WORDS.some(word => log.toLowerCase().includes(word.toLowerCase()))
    const isOwner = global.owner?.some(([id]) => m.sender.includes(id))

    if (isAlert) console.log(chalk.bgHex('#FF006E').white.bold('[ALERTA] ') + chalk.hex('#FF006E')(log))
    else if (isOwner) console.log(chalk.bgHex('#00FF9F').black.bold('[OWNER] ') + chalk.hex('#00FF9F')(log))
    else if (m.isCommand) console.log(chalk.hex('#FFBE0B')(log))
    else console.log(chalk.white(log))
  }

  if (/document/i.test(m.mtype)) console.log(chalk.hex('#00F5FF')(`📄 ${m.msg.fileName || m.msg.displayName || 'Document'}`))
  else if (/ContactsArray/i.test(m.mtype)) console.log(chalk.hex('#8338EC')(`👨‍👩‍👧‍👦 Contactos`))
  else if (/contact/i.test(m.mtype)) console.log(chalk.hex('#8338EC')(`👨 ${m.msg.displayName || ''}`))
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds || 0
    console.log(chalk.hex('#FB5607')(`${m.msg.ptt? '🎤 (PTT' : '🎵 (AUDIO'} ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)})`))
  }
  else if (/video/i.test(m.mtype)) console.log(chalk.hex('#FF006E')(`🎥 Video ${m.msg.seconds || 0}s`))
  else if (/sticker/i.test(m.mtype)) console.log(chalk.hex('#FFBE0B')(`🎴 Sticker ${m.msg.isAnimated? 'Animado' : 'Static'}`))

  console.log()
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.hex('#FF006E').bold("Update 'lib/print.js'"))
  import(`${file}?update=${Date.now()}`)
})