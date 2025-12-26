import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { smsg } from '../lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { watchFile, unwatchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'
import ws from 'ws'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
const conn = this
conn.msgqueque ||= []
conn.uptime ||= Date.now()
if (!chatUpdate) return
conn.pushMessage(chatUpdate.messages).catch(console.error)

let m = chatUpdate.messages?.[chatUpdate.messages.length - 1]
if (!m) return
if (!global.db.data) await global.loadDatabase()

const opts = global.opts || {}

try {
try {
m = smsg(conn, m)
} catch {
m = m
}
if (!m) return

global.mconn = m
m.exp = 0
m.monedas = false

let user = global.db.data.users[m.sender]
if (!user || typeof user !== 'object') global.db.data.users[m.sender] = user = {}

Object.assign(user, {
exp: isNumber(user.exp) ? user.exp : 0,
monedas: isNumber(user.monedas) ? user.monedas : 10,
joincount: isNumber(user.joincount) ? user.joincount : 1,
diamond: isNumber(user.diamond) ? user.diamond : 3,
lastadventure: isNumber(user.lastadventure) ? user.lastadventure : 0,
lastclaim: isNumber(user.lastclaim) ? user.lastclaim : 0,
health: isNumber(user.health) ? user.health : 100,
crime: isNumber(user.crime) ? user.crime : 0,
lastcofre: isNumber(user.lastcofre) ? user.lastcofre : 0,
lastdiamantes: isNumber(user.lastdiamantes) ? user.lastdiamantes : 0,
lastpago: isNumber(user.lastpago) ? user.lastpago : 0,
lastcode: isNumber(user.lastcode) ? user.lastcode : 0,
lastcodereg: isNumber(user.lastcodereg) ? user.lastcodereg : 0,
lastduel: isNumber(user.lastduel) ? user.lastduel : 0,
lastmining: isNumber(user.lastmining) ? user.lastmining : 0,
muto: 'muto' in user ? user.muto : false,
premium: 'premium' in user ? user.premium : false,
premiumTime: user.premium ? user.premiumTime || 0 : 0,
registered: 'registered' in user ? user.registered : false,
genre: user.genre || '',
birth: user.birth || '',
marry: user.marry || '',
description: user.description || '',
packstickers: user.packstickers || null,
name: user.name || m.name,
age: isNumber(user.age) ? user.age : -1,
regTime: isNumber(user.regTime) ? user.regTime : -1,
afk: isNumber(user.afk) ? user.afk : -1,
afkReason: user.afkReason || '',
role: user.role || 'Nuv',
banned: 'banned' in user ? user.banned : false,
useDocument: 'useDocument' in user ? user.useDocument : false,
level: isNumber(user.level) ? user.level : 0,
bank: isNumber(user.bank) ? user.bank : 0,
warn: isNumber(user.warn) ? user.warn : 0,
commands: isNumber(user.commands) ? user.commands : 0
})

let chat = global.db.data.chats[m.chat]
if (!chat || typeof chat !== 'object') global.db.data.chats[m.chat] = chat = {}

Object.assign(chat, {
isBanned: 'isBanned' in chat ? chat.isBanned : false,
sAutoresponder: chat.sAutoresponder || '',
welcome: 'welcome' in chat ? chat.welcome : true,
autolevelup: 'autolevelup' in chat ? chat.autolevelup : false,
autoAceptar: 'autoAceptar' in chat ? chat.autoAceptar : true,
autosticker: 'autosticker' in chat ? chat.autosticker : false,
autoRechazar: 'autoRechazar' in chat ? chat.autoRechazar : true,
autoresponder: 'autoresponder' in chat ? chat.autoresponder : false,
detect: 'detect' in chat ? chat.detect : true,
antiBot: 'antiBot' in chat ? chat.antiBot : true,
antiBot2: 'antiBot2' in chat ? chat.antiBot2 : true,
modoadmin: 'modoadmin' in chat ? chat.modoadmin : false,
antiLink: 'antiLink' in chat ? chat.antiLink : true,
reaction: 'reaction' in chat ? chat.reaction : false,
nsfw: 'nsfw' in chat ? chat.nsfw : false,
antifake: 'antifake' in chat ? chat.antifake : false,
delete: 'delete' in chat ? chat.delete : false,
expired: isNumber(chat.expired) ? chat.expired : 0,
primaryBot: chat.primaryBot || null
})

let settings = global.db.data.settings[conn.user.jid] || {}
Object.assign(settings, {
self: 'self' in settings ? settings.self : false,
restrict: 'restrict' in settings ? settings.restrict : true,
jadibotmd: 'jadibotmd' in settings ? settings.jadibotmd : true,
antiPrivate: 'antiPrivate' in settings ? settings.antiPrivate : false,
autoread: 'autoread' in settings ? settings.autoread : false,
status: settings.status || 0
})
global.db.data.settings[conn.user.jid] = settings

if (typeof m.text !== 'string') m.text = ''
globalThis.setting = settings

const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
const isROwner = global.owner.map(v => v[0].replace(/\D/g, '') + detectwhat).includes(m.sender)
const isOwner = isROwner || m.fromMe
const isOwners = isOwner
const isPrems = isROwner || user.premiumTime > 0

if (opts.queque && m.text && !isOwner) {
const queque = conn.msgqueque
const id = m.id || m.key.id
queque.push(id)
setTimeout(() => {
const i = queque.indexOf(id)
if (i !== -1) queque.splice(i, 1)
}, 5000)
}

if (m.isBaileys) return
m.exp += Math.ceil(Math.random() * 10)

async function getLidFromJid(id) {
if (id.endsWith('@lid')) return id
const res = await conn.onWhatsApp(id).catch(() => [])
return res[0]?.lid || id
}

const senderLid = await getLidFromJid(m.sender)
const botLid = await getLidFromJid(conn.user.jid)

const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => null) : null
const participants = groupMetadata?.participants || []

const u = participants.find(p => [p.id, p.jid].includes(senderLid)) || {}
const b = participants.find(p => [p.id, p.jid].includes(botLid)) || {}

const isRAdmin = u.admin === 'superadmin'
const isAdmin = isRAdmin || u.admin === 'admin'
const isBotAdmin = !!b.admin

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), 'plugins')

global.db.data.stats ||= {}

for (let name in global.plugins) {
let plugin = global.plugins[name]
if (!plugin || plugin.disabled) continue
if (typeof plugin.all === 'function') await plugin.all.call(conn, m).catch(console.error)

let _prefix = plugin.customPrefix || conn.prefix || global.prefix
let match = Array.isArray(_prefix)
? _prefix.map(p => new RegExp(p).exec(m.text)).find(Boolean)
: new RegExp(_prefix).exec(m.text)

if (!match) continue
if (typeof plugin !== "function") continue

let usedPrefix = (match[0] || "")[0]
const noPrefix = m.text.replace(usedPrefix, "")
let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
args = args || []
let _args = noPrefix.trim().split(" ").slice(1)
let text = _args.join(" ")
command = (command || "").toLowerCase()
const fail = plugin.fail || global.dfail
const isAccept = plugin.command instanceof RegExp ?
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
typeof plugin.command === "string" ?
plugin.command === command : false
global.comando = command

if (!isOwners && settings.self) return
if ((m.id.startsWith("NJX-") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return

if (global.db.data.chats[m.chat].primaryBot && global.db.data.chats[m.chat].primaryBot !== this.user.jid) {
const primaryBotConn = global.conns.find(conn => conn.user.jid === global.db.data.chats[m.chat].primaryBot && conn.ws?.socket && conn.ws.socket.readyState !== ws.CLOSED)
const participants = m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
const primaryBotInGroup = participants.some(p => p.jid === global.db.data.chats[m.chat].primaryBot)
if (primaryBotConn && primaryBotInGroup || global.db.data.chats[m.chat].primaryBot === global.conn.user.jid) {
throw !1
} else {
global.db.data.chats[m.chat].primaryBot = null
}}

if (!isAccept) continue
m.plugin = name
global.db.data.users[m.sender].commands++

const adminMode = chat.modoadmin || false
const wa = plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || usedPrefix || plugin.command
if (adminMode && !isOwner && m.isGroup && !isAdmin && wa) return

if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
fail("owner", m, this)
continue
}
if (plugin.rowner && !isROwner) {
fail("rowner", m, this)
continue
}
if (plugin.owner && !isOwner) {
fail("owner", m, this)
continue
}
if (plugin.premium && !isPrems) {
fail("premium", m, this)
continue
}
if (plugin.group && !m.isGroup) {
fail("group", m, this)
continue
}
if (plugin.botAdmin && !isBotAdmin) {
fail("botAdmin", m, this)
continue
}
if (plugin.admin && !isAdmin) {
fail("admin", m, this)
continue
}

m.isCommand = true
m.exp += plugin.exp ? parseInt(plugin.exp) : 10

let extra = {
match,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
user,
chat,
settings
}

try {
await plugin.call(this, m, extra)
} catch (err) {
m.error = err
console.error(err)
} finally {
if (typeof plugin.after === "function") {
try {
await plugin.after.call(this, m, extra)
} catch (err) {
console.error(err)
}}}

break
}

} catch (e) {
console.error(e)
} finally {
let u = global.db.data.users[m.sender]
if (u?.muto) await conn.sendMessage(m.chat, { delete: m.key })
u.exp += m.exp
if (m.monedas) u.monedas -= m.monedas

if (m.plugin) {
let stats = global.db.data.stats[m.plugin] || { total: 0, success: 0 }
stats.total++
if (!m.error) stats.success++
global.db.data.stats[m.plugin] = stats
}

    try {
      if (!opts['noprint']) await (await import('../lib/print.js')).default(m, conn)
    } catch (e) {
      console.log(m, m.quoted, e)
    }

    if (opts['autoread']) await conn.readMessages([m.key])
  }
}

global.dfail = (type, m, conn) => {
const msg = {
        rowner: `🛑 *ACCESO RESTRINGIDOΩ*\n\n> Solo el *Creador Supremo* puede ejecutar este protocolo.\n\n🧬 Usuario Autorizado: 👑 𝙏𝙃𝙀 𝘾𝘼𝙍𝙇𝙊𝙎\n🔗 Sistema: root@asTa-bot://omega/core`,
        owner: `⚙️🔒 *MÓDULO DEV: ACCESO BLOQUEADO*\n\n> Esta función está anclada a permisos de *𝙳𝙴𝚂𝙰𝚁𝚁𝙾𝙻𝙻𝙰𝙳𝙾𝚁*.\n\n🧠 Consola de Seguridad: dev@asta.ai/core.sh`,
        premium: `*REQUIERE CUENTA PREMIUM*\n\n> 🚫 Módulo exclusivo para usuarios *𝙑𝙄𝙋 - 𝙋𝙍𝙀𝙈𝙄𝙐𝙈*.\n\n📡 Actualiza tu plan con: */vip*\n⚙️ Estado: denegado`,
        private: `🔒 *SOLO CHAT PRIVADO* 📲\n\n> Este comando no puede ejecutarse en grupos por razones de seguridad.\n\n🧬 Ejecuta este protocolo directamente en el chat privado.`,
        admin: `🛡️ *FUNCIÓN RESTRINGIDA*\n\n> Solo los administradores del *Grupo* tienen acceso.\n\n⚠️ Intento no autorizado.`,
        unreg: `🧾 *NO REGISTRADO EN EL SISTEMA*\n\n> 🚫 *Acceso denegado:* No puedes usar los comandos sin registrarte.\n\n🔐 Regístrate con: */reg nombre.edad*\n📍 Ejemplo: */reg Asta.20*\n\n> 🥷🏻 *Instagram oficial del creador del bot  :*\nhttps://www.instagram.com/_carlitos.zx\n\n📂 *Creador del bot:* The Carlos`,
        restrict: `🚷 *FUNCIÓN GLOBALMENTE BLOQUEADA*\n\n> Este comando fue deshabilitado por el *Operador Global* por motivos de seguridad cibernética.\n\n🔧 Módulo: /xvideos`
        }[type];
if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})