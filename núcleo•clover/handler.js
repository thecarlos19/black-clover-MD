import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { smsg } from '../lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import ws from 'ws';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(() => resolve(), ms));

export async function handler(chatUpdate) {
  this.msgqueque ||= [];
  this.uptime ||= Date.now();
  if (!chatUpdate) return;
  this.pushMessage(chatUpdate.messages).catch(console.error);

  let m = chatUpdate.messages[chatUpdate.messages.length - 1];
  if (!m) return;
  if (!global.db.data) await global.loadDatabase();

  try {
    m = smsg(this, m) || m;
    if (!m) return;
    global.mconn = m;
    m.exp = 0;
    m.monedas = false;

    try {
      let user = global.db.data.users[m.sender];
      if (!user || typeof user !== 'object') global.db.data.users[m.sender] = user = {};

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
        warn: isNumber(user.warn) ? user.warn : 0
      });

      let chat = global.db.data.chats[m.chat];
      if (!chat || typeof chat !== 'object') global.db.data.chats[m.chat] = chat = {};
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
        expired: isNumber(chat.expired) ? chat.expired : 0
      });

      var settings = global.db.data.settings[this.user.jid] || {};
      Object.assign(settings, {
        self: 'self' in settings ? settings.self : false,
        restrict: 'restrict' in settings ? settings.restrict : true,
        jadibotmd: 'jadibotmd' in settings ? settings.jadibotmd : true,
        antiPrivate: 'antiPrivate' in settings ? settings.antiPrivate : false,
        autoread: 'autoread' in settings ? settings.autoread : false,
        status: settings.status || 0
      });
      global.db.data.settings[this.user.jid] = settings;

    } catch (e) { console.error(e); }

    if (typeof m.text !== "string") m.text = "";
    globalThis.setting = global.db.data.settings[this.user.jid];

    const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net';
    const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/\D/g, "") + detectwhat).includes(m.sender);
    const isOwner = isROwner || m.fromMe;
    const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0;

    if (opts["queque"] && m.text && !isMods) {
      const queque = this.msgqueque;
      const previousID = queque[queque.length - 1];
      queque.push(m.id || m.key.id);
      setInterval(async () => { if (!queque.includes(previousID)) clearInterval(this); await delay(5000); }, 5000);
    }
    if (m.isBaileys) return;
    m.exp += Math.ceil(Math.random() * 10);
    let usedPrefix;
    let _user = global.db.data.users[m.sender];

    async function getLidFromJid(id, conn) { 
      if (id.endsWith('@lid')) return id;
      const res = await conn.onWhatsApp(id).catch(() => []);
      return res[0]?.lid || id;
    }

    const senderLid = await getLidFromJid(m.sender, conn);
    const botLid = await getLidFromJid(conn.user.jid, conn);
    const senderJid = m.sender;
    const botJid = conn.user.jid;

    const groupMetadata = m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(() => null)) : {};
    const participants = m.isGroup && groupMetadata ? groupMetadata.participants || [] : [];

    const user = participants.find(p => [p?.id, p?.jid].includes(senderLid) || [p?.id, p?.jid].includes(senderJid)) || {};
    const bot = participants.find(p => [p?.id, p?.jid].includes(botLid) || [p?.id, p?.jid].includes(botJid)) || {};

    const isRAdmin = user.admin === 'superadmin';
    const isAdmin = isRAdmin || user.admin === 'admin';
    const isBotAdmin = !!bot.admin;

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
    for (let name in global.plugins) {
      let plugin = global.plugins[name];
      if (!plugin || plugin.disabled) continue;
      const __filename = join(___dirname, name);

      if (typeof plugin.all === 'function') await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }).catch(console.error);
      if (!opts['restrict'] && plugin.tags?.includes('admin')) continue;

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      let _prefix = plugin.customPrefix || conn.prefix || global.prefix;
      let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ? _prefix.map(p => [p instanceof RegExp ? p.exec(m.text) : new RegExp(str2Regex(p)).exec(m.text), p instanceof RegExp ? p : new RegExp(str2Regex(p))]) :
        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
      ).find(p => p[1]);

      if (typeof plugin.before === 'function' && await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename })) continue;
      if (typeof plugin !== 'function') continue;

      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '');
        let [command, ...args] = noPrefix.trim().split` `.filter(Boolean);
        args = args || [];
        let _args = noPrefix.trim().split` `.slice(1);
        let text = _args.join` `;
        command = (command || '').toLowerCase();
        let fail = plugin.fail || global.dfail;
        let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
          Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
          plugin.command === command;

        global.comando = command;
        if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return;
        if (!isAccept) continue;

        m.plugin = name;
        let chat = global.db.data.chats[m.chat];
        let user = global.db.data.users[m.sender];
        if (!['grupo-unbanchat.js', 'owner-exec.js', 'owner-exec2.js'].includes(name) && chat?.isBanned && !isROwner) return;
        if (m.text && user.banned && !isROwner) { 
          m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`);
          return;
        }

        let adminMode = global.db.data.chats[m.chat].modoadmin;
        let mini = `${plugins.botAdmin || plugins.admin || plugins.group || plugins || noPrefix || hl || m.text.slice(0, 1) == hl || plugins.command}`;
        if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return;
        if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail('owner', m, this); continue; }
        if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue; }
        if (plugin.owner && !isOwner) { fail('owner', m, this); continue; }
        if (plugin.mods && !isMods) { fail('mods', m, this); continue; }
        if (plugin.premium && !isPrems) { fail('premium', m, this); continue; }
        if (plugin.group && !m.isGroup) { fail('group', m, this); continue; }
        if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue; }
        if (plugin.admin && !isAdmin) { fail('admin', m, this); continue; }
        if (plugin.private && m.isGroup) { fail('private', m, this); continue; }
        if (plugin.register && !_user.registered) { fail('unreg', m, this); continue; }

        m.isCommand = true;
        let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10;
        m.exp += xp;
        if (!isPrems && plugin.monedas && _user.monedas < plugin.monedas) {
          conn.reply(m.chat, `❮✦❯ Se agotaron tus ${monedas}`, m);
          continue;
        }
        if (plugin.level > _user.level) {
          conn.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m);
          continue;
        }

        let extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename };
        try {
          await plugin.call(this, m, extra);
          if (!isPrems) m.monedas = m.monedas || plugin.monedas || false;
        } catch (e) {
          m.error = e;
          let text = format(e);
          for (let key of Object.values(global.APIKeys)) text = text.replace(new RegExp(key, 'g'), 'Administrador');
          m.reply(text);
        } finally {
          if (typeof plugin.after === 'function') await plugin.after.call(this, m, extra).catch(console.error);
          if (m.monedas) conn.reply(m.chat, `❮✦❯ Utilizaste ${+m.monedas} ${monedas}`, m);
        }
        break;
      }
    }

  } catch (e) { console.error(e); } finally {
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id);
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1);
    }

    if (m) {
      let utente = global.db.data.users[m.sender];
      if (utente.muto) await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant }});
      utente.exp += m.exp;
      utente.monedas -= m.monedas;
    }

    let stats = global.db.data.stats;
    if (m.plugin) {
      let now = +new Date();
      let stat = stats[m.plugin] || { total: 0, success: 0, last: 0, lastSuccess: 0 };
      stat.total += 1;
      stat.last = now;
      if (!m.error) { stat.success += 1; stat.lastSuccess = now; }
      stats[m.plugin] = stat;
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
        unreg: `🧾 *NO REGISTRADO EN EL SISTEMA*\n\n> 🚫 *Acceso denegado:* No puedes usar los comandos sin registrarte.\n\n🔐 Regístrate con: */reg nombre.edad*\n📍 Ejemplo: */reg Asta.20*\n\n> 🥷🏻 *Instagram oficial del creador del bot  :*\nhttps://www.instagram.com/_carlitos.zx\n\n📂 *Creador del bot:* The Carlos`,
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