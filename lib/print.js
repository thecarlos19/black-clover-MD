import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { appendFileSync, watchFile } from 'fs'
import { join } from 'path'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

const LOG_PATH = join(process.cwd(), 'logs.txt')
const ALERT_WORDS = ['@admin', 'error', 'fallo', 'ayuda', 'problema']
const IGNORE_CHATS = ['status@broadcast','55123456789-111111@g.us']
const IGNORE_COMMANDS = [/^\/ping$/i, /^\/estado$/i]

export default async function (m, conn = { user: {} }) {
  if (IGNORE_CHATS.includes(m.chat)) return
  if (typeof m.text === 'string' && IGNORE_COMMANDS.some(rx => rx.test(m.text))) return

  let _name = await conn.getName(m.sender)
  let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '')
  let chat = await conn.getName(m.chat)
  let img
  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) { console.error(e) }

  let filesize = (m.msg ?
    m.msg.vcard ? m.msg.vcard.length :
    m.msg.fileLength ? (m.msg.fileLength.low || m.msg.fileLength) :
    m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length :
    m.text ? m.text.length : 0
    : m.text ? m.text.length : 0) || 0

  let user = global.DATABASE.data.users[m.sender]
  let me = PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international')
  let isP = global.conn.user.jid === conn.user.jid

  const header = `
${chalk.hex('#00ff00').bold('┈────────────── ꒰ ⚔️ ꒱')}
≡ ✯ ${chalk.cyan(me + ' ➝ ' + (isP ? "(Bot Principal)" : "(Subbot)"))}
≡ ✢ ${chalk.black(chalk.bgRed(new Date().toLocaleTimeString()))}
≡ ‣ ${chalk.black(chalk.bgGreen(m.messageStubType ? WAMessageStubType[m.messageStubType] : ''))}
≡ ◆ ${chalk.magenta(`${filesize} [${filesize === 0 ? 0 : (filesize / 1009 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1)}${['', ...'KMGTP'][Math.floor(Math.log(filesize) / Math.log(1000))] || ''}B]`)}

≡ ⎗ ${chalk.redBright(sender)}
≡ ❑ ${chalk.green(m.exp || '?')} ${chalk.yellow('en')} |${user?.exp || '?'}|${user?.diamond || '?'}|${user?.level || '?'}
≡ ✞ ${m.chat.endsWith('@g.us') ? chalk.green(m.chat + (chat ? ' ~ ' + chat : '')) : chalk.cyan(m.chat + (chat ? ' ~ ' + chat : ''))}
≡ ⎙ ${chalk.black(chalk.bgGreen(m.mtype ? m.mtype.replace(/message$/i, '').replace(/^./, v => v.toUpperCase()) : ''))}
${chalk.hex('#00ff00').bold('┈────────────── ꒰ 𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘:꒱')}
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
      return !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
    }

    if (log.length < 1024) log = log.replace(urlRegex, url => chalk.blueBright(url))
    log = log.replace(mdRegex, mdFormat(4))

    if (m.mentionedJid) {
      const names = await Promise.all(m.mentionedJid.map(jid => conn.getName(jid)))
      for (let i = 0; i < m.mentionedJid.length; i++) {
        log = log.replace('@' + m.mentionedJid[i].split`@`[0], chalk.magenta('@' + names[i]))
      }
    }

    const isAlert = ALERT_WORDS.some(word => log.toLowerCase().includes(word.toLowerCase()))
    if (isAlert) console.log(chalk.bgRed.white.bold('[ALERTA] ') + chalk.redBright(log))
    else if (m.isCommand) console.log(chalk.yellow(log))
    else console.log(chalk.white(log))

    appendFileSync(LOG_PATH, `[${new Date().toLocaleString()}] ${sender} > ${log}\n`)
  }

  if (/document/i.test(m.mtype)) console.log(`📄 ${m.msg.fileName || m.msg.displayName || 'Document'}`)
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦`)
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`)
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds
    console.log(`${m.msg.ptt ? '🎤 (PTT ' : '🎵 ('}AUDIO) ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`)
  }

  console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => console.log(chalk.redBright("Update 'lib/print.js'")))