process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js'
import cluster from 'cluster'
const { setupMaster, fork } = cluster
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import {createRequire} from 'module'
import {fileURLToPath, pathToFileURL} from 'url'
import {platform} from 'process'
import * as ws from 'ws'
import fs, {readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch} from 'fs'
import yargs from 'yargs';
import {spawn} from 'child_process'
import lodash from 'lodash'
import { blackJadiBot } from '../plugins/jadibot-serbot.js';
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import {tmpdir} from 'os'
import {format} from 'util'
import boxen from 'boxen'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import {Boom} from '@hapi/boom'
import {makeWASocket, protoType, serialize} from '../lib/simple.js'
import {Low, JSONFile} from 'lowdb'
import {mongoDB, mongoDBV2} from '../lib/mongoDB.js'
import store from '../lib/store.js'
const {proto} = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const {DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser} = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const {CONNECTING} = ws
const {chain} = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
protoType()
serialize()
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#/!.]');

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('./src/database/database.json'));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1000)
    );
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

const { state, saveState, saveCreds } = await useMultiFileAuthState(global.sessions);
const msgRetryCounterMap = (MessageRetryMap) => {};
const msgRetryCounterCache = new NodeCache();
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = global.botNumber;

const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");

const theme = {
  banner: chalk.bgGreen.black,
  accent: chalk.bold.yellowBright,
  highlight: chalk.bold.greenBright,
  text: chalk.bold.white,
  prompt: chalk.bold.magentaBright
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) opcion = '1';

const credsExist = fs.existsSync(`./${sessions}/creds.json`);

if (!methodCodeQR && !methodCode && !credsExist) {
  do {
    opcion = await question(
      theme.banner('⌬ Elija una opción:\n') +
      theme.highlight('1. Con código QR\n') +
      theme.text('2. Con código de texto de 8 dígitos\n--> ')
    );

    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`✞ No se permiten numeros que no sean 1 o 2, tampoco letras o símbolos especiales.`));
    }
  } while ((opcion !== '1' && opcion !== '2') || credsExist);
}

console.info = () => {};
console.debug = () => {};

const printQR = opcion === '1' || methodCodeQR;
const browserName = printQR ? `${nameqr}` : 'Ubuntu';
const browserProduct = 'Edge';
const browserVersion = printQR ? '20.0.04' : '110.0.1587.56';

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: printQR,
  mobile: MethodMobile,
  browser: [browserName, browserProduct, browserVersion],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async (clave) => {
    const jid = jidNormalizedUser(clave.remoteJid);
    const msg = await store.loadMessage(jid, clave.id);
    return msg?.message || "";
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version,
};

global.conn = makeWASocket(connectionOptions);

if (!credsExist) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {
      let addNumber;
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '');
      } else {
        do {
          phoneNumber = await question(theme.prompt(`✞ Por favor, Ingrese el número de WhatsApp.\n---> `));
          phoneNumber = phoneNumber.replace(/\D/g, '');
          if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`;
        } while (!await isValidPhoneNumber(phoneNumber));
        rl.close();
        addNumber = phoneNumber.replace(/\D/g, '');
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber);
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
          console.log(chalk.bold.white(theme.banner(`✞ Código:`)), chalk.bold.white(chalk.white(codeBot)));
        }, 3000);
      }
    }
  }
}


conn.isInit = false;
conn.well = false;

conn.logger.info(` ✞ H E C H O\n`);

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      try {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp'] && (global.support || {}).find) {
          const tmpDirs = [os.tmpdir(), 'tmp', `${jadi}`];
          tmpDirs.forEach((dir) => cp.spawn('find', [dir, '-amin', '3', '-type', 'f', '-delete']));
        }
      } catch (e) {
        console.error(e);
      }
    }, 30000);
  }
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update;
  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  global.stopped = connection;

  if (isNewLogin) conn.isInit = true;
  if (!global.db.data) loadDatabase();

  if ((qr && qr !== '0') || methodCodeQR) {
    if (opcion === '1' || methodCodeQR) {
      console.log(chalk.bold.yellow(`\n❐ ESCANEA EL CÓDIGO QR - EXPIRA EN 45 SEGUNDOS`));
    }
  }

  if (connection === 'open') {
    console.log(chalk.bold.green('\n🧙‍♂️ BLACK CLOVER BOT CONECTADO ✞'));
  }

  if (connection === 'close') {
    switch (reason) {
      case DisconnectReason.badSession:
      case DisconnectReason.loggedOut:
        console.log(chalk.bold.redBright(`\n⚠︎ SESIÓN INVÁLIDA O CERRADA, BORRA LA CARPETA ${global.sessions} Y ESCANEA EL CÓDIGO QR ⚠︎`));
        break;
      case DisconnectReason.connectionClosed:
        console.log(chalk.bold.magentaBright(`\n⚠︎ CONEXIÓN CERRADA, REINICIANDO...`));
        break;
      case DisconnectReason.connectionLost:
        console.log(chalk.bold.blueBright(`\n⚠︎ CONEXIÓN PERDIDA, RECONECTANDO...`));
        break;
      case DisconnectReason.connectionReplaced:
        console.log(chalk.bold.yellowBright(`\n⚠︎ CONEXIÓN REEMPLAZADA, OTRA SESIÓN INICIADA`));
        return;
      case DisconnectReason.restartRequired:
        console.log(chalk.bold.cyanBright(`\n☑ REINICIANDO SESIÓN...`));
        break;
      case DisconnectReason.timedOut:
        console.log(chalk.bold.yellowBright(`\n⚠︎ TIEMPO AGOTADO, REINTENTANDO CONEXIÓN...`));
        break;
      default:
        console.log(chalk.bold.redBright(`\n⚠︎ DESCONEXIÓN DESCONOCIDA (${reason || 'Desconocido'})`));
        break;
    }

    if (conn?.ws?.socket === null) {
      await global.reloadHandler(true).catch(console.error);
      global.timestamp.connect = new Date();
    }
  }
}
process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js')
global.reloadHandler = async function(restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e);
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try {
      global.conn.ws.close()
    } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, {chats: oldChats})
    isInit = true
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }
  conn.handler = handler.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)
  const currentDateTime = new Date()
  const messageDateTime = new Date(conn.ev)
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
  }
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
};


global.rutaJadiBot = join(__dirname, '../núcleo•clover/blackJadiBot')

if (global.blackJadibts) {
  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true }) 
    console.log(chalk.bold.cyan(`La carpeta: ${jadi} se creó correctamente.`))
  } else {
    console.log(chalk.bold.cyan(`La carpeta: ${jadi} ya está creada.`)) 
  }

  const readRutaJadiBot = readdirSync(global.rutaJadiBot)
  if (readRutaJadiBot.length > 0) {
    const creds = 'creds.json'
    for (const gjbts of readRutaJadiBot) {
      const botPath = join(global.rutaJadiBot, gjbts)
      const readBotPath = readdirSync(botPath)
      if (readBotPath.includes(creds)) {
        blackJadiBot({ pathblackJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot'})
      }
    }
  }
}

const pluginFolder = global.__dirname(join(__dirname, '../plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`)
      else {
        conn.logger.warn(`deleted plugin - '${filename}'`)
        return delete global.plugins[filename]
      }
    } else conn.logger.info(`new plugin - '${filename}'`);
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`error require plugin '${filename}\n${format(e)}`)
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
      }
    }
  }
}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })
    ]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
  Object.freeze(global.support);
}

function clearTmp() {
  const tmpDir = join(process.cwd(), 'tmp')
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })
  const filenames = readdirSync(tmpDir)
  filenames.forEach(file => {
    const filePath = join(tmpDir, file)
    unlinkSync(filePath)
  })
}

function purgeSession() {
  let prekey = []
  let directorio = readdirSync(`./${sessions}`)
  let filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'))
  prekey = [...prekey, ...filesFolderPreKeys]
  filesFolderPreKeys.forEach(files => unlinkSync(`./${sessions}/${files}`))
} 

function purgeSessionSB() {
  try {
    const listaDirectorios = readdirSync(global.rutaJadiBot);
    listaDirectorios.forEach(directorio => {
      if (statSync(join(global.rutaJadiBot, directorio)).isDirectory()) {
        const DSBPreKeys = readdirSync(join(global.rutaJadiBot, directorio)).filter(fileInDir => fileInDir.startsWith('pre-key-'))
        DSBPreKeys.forEach(fileInDir => {
          if (fileInDir !== 'creds.json') unlinkSync(join(global.rutaJadiBot, directorio, fileInDir))
        })
      }
    })
  } catch (err) {
    console.log(chalk.bold.red(`Error eliminando pre-keys de SB:\n${err}`))
  }
}

function purgeOldFiles() {
  const directories = [`./${sessions}/`, global.rutaJadiBot]
  directories.forEach(dir => {
    try {
      readdirSync(dir).forEach(file => {
        if (file !== 'creds.json') {
          unlinkSync(join(dir, file))
          console.log(chalk.bold.cyanBright(`\n╭» ❍ ARCHIVOS ❍\n│→ ${file} ELIMINADO\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
        }
      })
    } catch (err) {
      console.log(chalk.bold.red(`\n╭» ❍ ERROR ❍\n│→ No se pudo eliminar archivos en ${dir}\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ✘\n` + err))
    }
  })
}

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      try {
        if (global.db.data) await global.db.write()
        if (opts['autocleartmp'] && (global.support || {}).find) {
          const tmpDirs = [os.tmpdir(), join(process.cwd(), 'tmp'), `${jadi}`]
          tmpDirs.forEach(dir => cp.spawn('find', [dir, '-amin', '3', '-type', 'f', '-delete']))
        }
      } catch (e) {
        console.error(e)
      }
    }, 30000)
  }
}

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await clearTmp()
  console.log(chalk.bold.cyanBright(`\n╭» ❍ MULTIMEDIA ❍\n│→ ARCHIVOS DE LA CARPETA TMP ELIMINADOS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 4)

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeSession()
  console.log(chalk.bold.cyanBright(`\n╭» ❍ ${global.sessions} ❍\n│→ SESIONES NO ESENCIALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 10)

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeSessionSB()
}, 1000 * 60 * 10)

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeOldFiles()
}, 1000 * 60 * 10)

_quickTest().then(() => conn.logger.info(chalk.bold(`✞ H E C H O\n`.trim()))).catch(console.error)

let stopped

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return
  const _uptime = process.uptime() * 1000
  const uptime = clockString(_uptime)
  const bio = `🦠 Black-clover-MD |「🕒」Aᥴ𝗍і᥎o: ${uptime}`
  await conn?.updateProfileStatus(bio).catch(_ => _)
  if (global.rutaJadiBot) {
    const bots = readdirSync(global.rutaJadiBot)
    for (const bot of bots) {
      const credsPath = join(global.rutaJadiBot, bot, 'creds.json')
      if (existsSync(credsPath)) {
        try {
          await conn?.updateProfileStatus(bio).catch(_ => _)
        } catch {}
      }
    }
  }
}, 60000)

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, 'd ', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('')
}

async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
    if (number.startsWith('+521')) number = number.replace('+521', '+52')
    else if (number.startsWith('+52') && number[4] === '1') number = number.replace('+52 1', '+52')
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch {
    return false
  }
}