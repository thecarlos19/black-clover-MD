import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { smsg } from '../lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'
import ws from 'ws'

const { proto } = (await import('@whiskeysockets/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
  this.msgqueque ||= []
  this.uptime ||= Date.now()
  if (!chatUpdate?.messages?.length) return

  this.pushMessage(chatUpdate.messages).catch(() => {})

  let m = chatUpdate.messages.at(-1)
  if (!m) return

  if (!global.db?.data) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return

    global.mconn = m
    m.exp = 0
    m.monedas = false

    let user = global.db.data.users[m.sender] ||= {}

    user.exp = isNumber(user.exp) ? user.exp : 0
    user.monedas = isNumber(user.monedas) ? user.monedas : 10
    user.joincount = isNumber(user.joincount) ? user.joincount : 1
    user.diamond = isNumber(user.diamond) ? user.diamond : 3
    user.lastadventure = isNumber(user.lastadventure) ? user.lastadventure : 0
    user.lastclaim = isNumber(user.lastclaim) ? user.lastclaim : 0
    user.health = isNumber(user.health) ? user.health : 100
    user.crime = isNumber(user.crime) ? user.crime : 0
    user.lastcofre = isNumber(user.lastcofre) ? user.lastcofre : 0
    user.lastdiamantes = isNumber(user.lastdiamantes) ? user.lastdiamantes : 0
    user.lastpago = isNumber(user.lastpago) ? user.lastpago : 0
    user.lastcode = isNumber(user.lastcode) ? user.lastcode : 0
    user.lastcodereg = isNumber(user.lastcodereg) ? user.lastcodereg : 0
    user.lastduel = isNumber(user.lastduel) ? user.lastduel : 0
    user.lastmining = isNumber(user.lastmining) ? user.lastmining : 0

    if (!('muto' in user)) user.muto = false
    if (!('premium' in user)) user.premium = false
    if (!('registered' in user)) user.registered = false
    if (!('banned' in user)) user.banned = false
    if (!('useDocument' in user)) user.useDocument = false

    user.premiumTime = user.premium ? (user.premiumTime || 0) : 0

    user.genre ||= ''
    user.birth ||= ''
    user.marry ||= ''
    user.description ||= ''
    user.packstickers ||= null
    user.name ||= m.name

    user.age = isNumber(user.age) ? user.age : -1
    user.regTime = isNumber(user.regTime) ? user.regTime : -1
    user.afk = isNumber(user.afk) ? user.afk : -1
    user.afkReason ||= ''

    user.role ||= 'Nuv'
    user.level = isNumber(user.level) ? user.level : 0
    user.bank = isNumber(user.bank) ? user.bank : 0
    user.warn = isNumber(user.warn) ? user.warn : 0

    let chat = global.db.data.chats[m.chat] ||= {}

    if (!('isBanned' in chat)) chat.isBanned = false
    chat.sAutoresponder ||= ''
    if (!('welcome' in chat)) chat.welcome = true
    if (!('autolevelup' in chat)) chat.autolevelup = false
    if (!('autoAceptar' in chat)) chat.autoAceptar = true
    if (!('autosticker' in chat)) chat.autosticker = false
    if (!('autoRechazar' in chat)) chat.autoRechazar = true
    if (!('autoresponder' in chat)) chat.autoresponder = false
    if (!('detect' in chat)) chat.detect = true
    if (!('antiBot' in chat)) chat.antiBot = true
    if (!('antiBot2' in chat)) chat.antiBot2 = true
    if (!('modoadmin' in chat)) chat.modoadmin = false
    if (!('antiLink' in chat)) chat.antiLink = true
    if (!('reaction' in chat)) chat.reaction = false
    if (!('nsfw' in chat)) chat.nsfw = false
    if (!('antifake' in chat)) chat.antifake = false
    if (!('delete' in chat)) chat.delete = false
    chat.expired = isNumber(chat.expired) ? chat.expired : 0

    let settings = global.db.data.settings[this.user.jid] ||= {}

    if (!('self' in settings)) settings.self = false
    if (!('restrict' in settings)) settings.restrict = true
    if (!('jadibotmd' in settings)) settings.jadibotmd = true
    if (!('antiPrivate' in settings)) settings.antiPrivate = false
    if (!('autoread' in settings)) settings.autoread = false
    settings.status = isNumber(settings.status) ? settings.status : 0

  } catch (e) { console.error(e) }

  if (typeof m.text !== 'string') m.text = ''
  globalThis.setting = global.db.data.settings[this.user.jid]

  try {

  const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'

  const ownerNumbers = global.owner.map(([n]) => n.replace(/\D/g, '') + detectwhat)
  const isROwner = ownerNumbers.includes(m.sender)
  const isOwner = isROwner || m.fromMe
  const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0

  if (opts['queque'] && m.text && !global.mods?.includes(m.sender)) {
    const queque = this.msgqueque
    const id = m.id || m.key.id
    const prev = queque[queque.length - 1]

    queque.push(id)

    const interval = setInterval(async () => {
      if (!queque.includes(prev)) return clearInterval(interval)
      await delay(5000)
    }, 5000)
  }

  if (m.isBaileys) return

  m.exp += (Math.random() * 10 + 1) | 0

  let usedPrefix
  let _user = global.db.data.users[m.sender]

  async function getLidFromJid(id, conn) { 
    if (id.endsWith('@lid')) return id
    const res = await conn.onWhatsApp(id).catch(() => [])
    return res[0]?.lid || id
  }

  const [senderLid, botLid] = await Promise.all([
    getLidFromJid(m.sender, this),
    getLidFromJid(this.user.jid, this)
  ])

  const senderJid = m.sender
  const botJid = this.user.jid

  const groupMetadata = m.isGroup
    ? (this.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(() => null))
    : null

  const participants = groupMetadata?.participants || []

  const user = participants.find(p =>
    p && ([p.id, p.jid].includes(senderLid) || [p.id, p.jid].includes(senderJid))
  ) || {}

  const bot = participants.find(p =>
    p && ([p.id, p.jid].includes(botLid) || [p.id, p.jid].includes(botJid))
  ) || {}

  const isRAdmin = user.admin === 'superadmin'
  const isAdmin = isRAdmin || user.admin === 'admin'
  const isBotAdmin = !!bot.admin

  const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

  for (const name in global.plugins) {
    const plugin = global.plugins[name]
    if (!plugin || plugin.disabled) continue

    const __filename = join(___dirname, name)

    if (typeof plugin.all === 'function') {
      await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }).catch(() => {})
    }

    if (!opts['restrict'] && plugin.tags?.includes('admin')) continue

    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

    const _prefix = plugin.customPrefix || this.prefix || global.prefix

    const match = (_prefix instanceof RegExp
      ? [[_prefix.exec(m.text), _prefix]]
      : Array.isArray(_prefix)
        ? _prefix.map(p => {
            const re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
            return [re.exec(m.text), re]
          })
        : (() => {
            const re = new RegExp(str2Regex(_prefix))
            return [[re.exec(m.text), re]]
          })()
    ).find(v => v[0])

    if (!match) continue

    if (typeof plugin.before === 'function') {
      const res = await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename })
      if (res) continue
    }

    if (typeof plugin !== 'function') continue

    if ((usedPrefix = (match[0] || [''])[0])) {
      const noPrefix = m.text.slice(usedPrefix.length)
      let [command, ...args] = noPrefix.trim().split(/\s+/)
      const _args = noPrefix.trim().split(/\s+/).slice(1)
      const text = _args.join(' ')
      command = (command || '').toLowerCase()

      const fail = plugin.fail || global.dfail

      const isAccept =
        plugin.command instanceof RegExp
          ? plugin.command.test(command)
          : Array.isArray(plugin.command)
            ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
            : plugin.command === command

      global.comando = command

      if (
        m.id.startsWith('NJX-') ||
        (m.id.startsWith('BAE5') && m.id.length === 16) ||
        (m.id.startsWith('B24E') && m.id.length === 20)
      ) return

      if (!isAccept) continue

      m.plugin = name

      const chat = global.db.data.chats[m.chat]
      const user = global.db.data.users[m.sender]

      if (!['grupo-unbanchat.js', 'owner-exec.js', 'owner-exec2.js'].includes(name) && chat?.isBanned && !isAdmin && !isOwner && !isROwner) return

      if (m.text && user.banned && !isROwner) {
        m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`)
        return
      }

      const adminMode = chat.modoadmin
      const mini = plugin.command || noPrefix

      if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return

      if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail('owner', m, this); continue }
      if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
      if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
      if (plugin.mods && !(global.mods || []).includes(m.sender)) { fail('mods', m, this); continue }
      if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
      if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
      if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
      if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
      if (plugin.private && m.isGroup) { fail('private', m, this); continue }
      if (plugin.register && !_user.registered) { fail('unreg', m, this); continue }

      m.isCommand = true

      const xp = plugin.exp ? parseInt(plugin.exp) : 10
      m.exp += xp

      if (!isPrems && plugin.monedas && _user.monedas < plugin.monedas) {
        this.reply(m.chat, `❮✦❯ Se agotaron tus monedas`, m)
        continue
      }

      if (plugin.level > _user.level) {
        this.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m)
        continue
      }

      const extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }

      try {
        await plugin.call(this, m, extra)
        if (!isPrems) m.monedas ||= plugin.monedas || 0
      } catch (e) {
        m.error = e
        let txt = format(e)
        for (const key of Object.values(global.APIKeys || {})) {
          txt = txt.replace(new RegExp(key, 'g'), 'Administrador')
        }
        m.reply(txt)
      } finally {
        if (typeof plugin.after === 'function') {
          await plugin.after.call(this, m, extra).catch(() => {})
        }
        if (m.monedas) this.reply(m.chat, `❮✦❯ Utilizaste ${+m.monedas} monedas`, m)
      }

      break
    }
  }

  } catch (e) { console.error(e) } finally {

    if (opts['queque'] && m.text) {
      const i = this.msgqueque.indexOf(m.id || m.key.id)
      if (i !== -1) this.msgqueque.splice(i, 1)
    }

    if (m) {
      const u = global.db.data.users[m.sender]
      if (u.muto) {
        await this.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        })
      }
      u.exp += m.exp
      u.monedas -= m.monedas || 0
    }

    const stats = global.db.data.stats ||= {}

    if (m.plugin) {
      const now = Date.now()
      const stat = stats[m.plugin] ||= { total: 0, success: 0, last: 0, lastSuccess: 0 }

      stat.total++
      stat.last = now

      if (!m.error) {
        stat.success++
        stat.lastSuccess = now
      }
    }

    try { if (!opts['noprint']) await (await import('../lib/print.js')).default(m, this); } catch (e) { console.log(m, m.quoted, e); }
    if (opts['autoread']) await this.readMessages([m.key]);
  }
}

  global.dfail = (type, m, usedPrefix, command, conn) => {
    const msg = {
        rowner: `🛑 *ACCESO RESTRINGIDOΩ*\n\n> Solo el *Creador Supremo* puede ejecutar este protocolo.\n\n🧬 Usuario Autorizado: 👑 𝙏𝙃𝙀 𝘾𝘼𝙍𝙇𝙊𝙎\n🔗 Sistema: root@asTa-bot://omega/core`,
        owner: `⚙️🔒 *MÓDULO DEV: ACCESO BLOQUEADO*\n\n> Esta función está anclada a permisos de *𝙳𝙴𝚂𝙰𝚁𝚁𝙾𝙻𝙻𝙰𝙳𝙾𝚁*.\n\n🧠 Consola de Seguridad: dev@asta.ai/core.sh`,
        premium: `*REQUIERE CUENTA PREMIUM*\n\n> 🚫 Módulo exclusivo para usuarios *𝙑𝙄𝙋 - 𝙋𝙍𝙀𝙈𝙄𝙐𝙈*.\n\n📡 Actualiza tu plan con: */vip*\n⚙️ Estado: denegado`,
        private: `🔒 *SOLO CHAT PRIVADO* 📲\n\n> Este comando no puede ejecutarse en grupos por razones de seguridad.\n\n🧬 Ejecuta este protocolo directamente en el chat privado.`,
        admin: `🛡️ *FUNCIÓN RESTRINGIDA*\n\n> Solo los administradores del *Grupo* tienen acceso.\n\n⚠️ Intento no autorizado.`,
        unreg: `📑 *NO REGISTRADO EN EL SISTEMA*\n\n> 🚫 *Acceso denegado:* No puedes usar los comandos sin registrarte.\n\n🔐 Regístrate con: */reg nombre.edad*\n📍 Ejemplo: */reg Asta.20*\n\n> 🥷🏻 *Instagram oficial del creador del bot  :*\nhttps://www.instagram.com/_carlitos.zx\n\n📂 *Creador del bot:* The Carlos`,
        restrict: `🚷 *FUNCIÓN GLOBALMENTE BLOQUEADA*\n\n> Este comando fue deshabilitado por el *Operador Global* por motivos de seguridad cibernética.\n\n🔧 Módulo: /xvideos`
        }[type];
if (msg) return m.reply(msg).then(_ => m.react('✖️'))}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))

if (global.conns && global.conns.length > 0 ) {
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
for (const userr of users) {
userr.subreloadHandler(false)
}}})