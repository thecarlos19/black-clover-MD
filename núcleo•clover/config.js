import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import { performance } from 'perf_hooks'
import os from 'os'
import { platform, env } from 'process'

//*─✞─ CONFIGURACIÓN GLOBAL ─✞─*

global.core = {
  name: '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘',
  version: '2.2.0',
  build: '2026.09-RC',
  engine: 'Baileys',
  engineVer: 'V 6.7.9',
  node: process.version,
  mode: env.PREFIX?.includes('com.termux')? 'termux' : 'server',
  arch: platform
}

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

global.botNumber = ''
global.owner = [
  ['5215544876071', '🜲 𝗖𝗿𝗲𝗮𝗱𝗼𝗿 👻', true],
  ['5217971289909'],
  ['5216641784469', 'BrayanOFC', true],
  ['5217971282613', '', false],
  ['573244278232', 'Brayan uchiha 🐦‍⬛', true]
]
global.mods = ['5215544876071']
global.suittag = ['5215544876071']
global.prems = ['5215544876071']

global.libreria = 'Baileys'
global.baileys = 'V 6.7.9'
global.languaje = 'Español'
global.vs = '2.2.0'
global.vsJB = '5.0'
global.nameqr = 'black clover- Bot'
global.sessions = 'blackSession'
global.jadi = 'blackJadiBot'
global.blackJadibts = true
global.build = '2026.09-RC'

global.packsticker = `𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ᚲ 𝐓𝐡𝐞 𝐂𝐚𝐫𝐥𝐨𝐬`
global.packname = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘'
global.author = `♾`

global.wm = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘'
global.titulowm = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘'
global.igfg = 'ᥫ𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒'
global.botname = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘'
global.dev = '© ⍴᥆ᥕᥱrᥱძ ᑲᥡ the Legends ⚡'
global.textbot = '𝑩𝑳𝑨𝑪𝑲 𝑪𝑳𝑶𝑽𝑬𝑹 : 𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒'
global.gt = '͟͞𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘͟͞'
global.namechannel = '𝑩𝑳𝑨𝑪𝑲 𝑪𝑳𝑶𝑽𝑬𝑹 / 𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒'
global.monedas = 'monedas'

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

global.gp1 = 'https://chat.whatsapp.com/IbADO35sBSC4G1FBTGbHIE?mode=ac_t'
global.gp2 = 'https://chat.whatsapp.com/FiBcPMYEO7mG4m16gBbwpP?mode=ac_t'
global.comunidad1 = 'https://chat.whatsapp.com/FgQ4q11AjaO8ddyc1LvK4r?mode=ac_t'
global.channel = 'https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04'
global.cn = global.channel
global.yt = 'https://www.youtube.com/@ElCarlos.87'
global.md = 'https://github.com/thecarlos19/black-clover-MD'
global.correo = 'thecarlospcok@gmail.com'
global.redes = global.channel

global.catalogo = fs.existsSync(new URL('../src/catalogo.jpg', import.meta.url))? fs.readFileSync(new URL('../src/catalogo.jpg', import.meta.url)) : null
global.photoSity = global.catalogo? [global.catalogo] : []
global.icons = global.catalogo
global.thumb = global.catalogo

global.estilo = {
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
  },
  message: {
    interactiveMessage: {
      body: { text: global.packname },
      footer: { text: global.dev },
      header: { title: '', hasMediaAttachment:!!global.catalogo }
    }
  }
}

global.estilo2 = {
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
  },
  message: {
    orderMessage: {
      itemCount : -999999,
      status: 1,
      surface : 1,
      message: global.packname,
      orderTitle: 'Bang',
      thumbnail: global.catalogo,
      sellerJid: '0@s.whatsapp.net'
    }
  }
}

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

global.ch = { ch1: "120363419782804545@newsletter" }
global.rcanal = global.ch.ch1

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment
global.performance = performance
global.os = os

global.multiplier = 69
global.maxwarn = 3
global.emojis = ['⚔️', '🔥', '☘️', '👑', '✨', '💀', '🗡️', '🛡️']

global.getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`
}

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

global.formatSize = (bytes) => {
  if (!bytes) return '0B'
  const units = ['', 'K', 'M', 'G', 'T']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)}${units[i]}B`
}

global.isOwner = (jid) => {
  return global.owner.some(([id]) => jid.includes(id))
}

global.isMod = (jid) => {
  return global.mods.includes(jid.replace('@s.whatsapp.net', ''))
}

global.isPrems = (jid) => {
  return global.prems.includes(jid.replace('@s.whatsapp.net', ''))
}

global.sysStats = () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    node: process.version,
    uptime: global.runtime(process.uptime()),
    ram: global.formatSize(os.totalmem() - os.freemem()),
    totalRam: global.formatSize(os.totalmem()),
    cpu: os.cpus()[0].model,
    cores: os.cpus().length
  }
}

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.hex('#00FF9F').bold("Update 'núcleo•clover/config.js'"))
  import(`${file}?update=${Date.now()}`)
})

console.log(chalk.hex('#00FF9F').bold(`${global.core.name} v${global.core.version} | Build ${global.core.build}`))
console.log(chalk.hex('#B4FF00')(`[ ENGINE ] ${global.core.engine} ${global.core.engineVer} | Node ${global.core.node}`))
console.log(chalk.hex('#FF006E').bold(`[ MODE ] ${global.core.mode.toUpperCase()} | Arch: ${global.core.arch}`))