import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs'; 
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

//*─✞─ CONFIGURACIÓN GLOBAL ─✞─*

// BETA: Número del bot
global.botNumber = ''; // Ejemplo: 525568138672
//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*
global.owner = [
  ['5215544876071', '🜲 𝗖𝗿𝗲𝗮𝗱𝗼𝗿 👻', true],
  ['5217971289909'],
  ['5217971282613', '', false], // Espacios opcionales
  ['', '', false],
  ['', '', false]
];
global.mods = ['5215544876071'];
global.suittag = ['5215544876071'];
global.prems = ['5215544876071'];

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*
global.libreria = 'Baileys';
global.baileys = 'V 6.7.9';
global.languaje = 'Español';
global.vs = '2.2.0';
global.vsJB = '5.0';
global.nameqr = 'black clover- Bot';
global.sessions = 'blackSession';
global.jadi = 'blackJadiBot';
global.blackJadibts = true;

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*
global.packsticker = `
  𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ᚲ 𝐓𝐡𝐞 𝐂𝐚𝐫𝐥𝐨𝐬`;

global.packname = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘';

global.author = `
♾━━━━━━━━━━━━━━━♾`;
//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*
global.wm = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘';
global.titulowm = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘';
global.igfg = 'ᥫ𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒'
global.botname = '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘'
global.dev = '© ⍴᥆ᥕᥱrᥱძ ᑲᥡ the Legends ⚡'
global.textbot = '𝑩𝑳𝑨𝑪𝑲 𝑪𝑳𝑶𝑽𝑬𝑹  : 𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒'
global.gt = '͟͞𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 ☘͟͞';
global.namechannel = '𝑩𝑳𝑨𝑪𝑲 𝑪𝑳𝑶𝑽𝑬𝑹 / 𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒'
// Moneda interna
global.monedas = 'monedas';

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*
global.gp1 = 'https://chat.whatsapp.com/IbADO35sBSC4G1FBTGbHIE?mode=ac_t';
global.gp2 = 'https://chat.whatsapp.com/FiBcPMYEO7mG4m16gBbwpP?mode=ac_t';
global.comunidad1 = 'https://chat.whatsapp.com/FgQ4q11AjaO8ddyc1LvK4r?mode=ac_t';
global.channel = 'https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04';
global.cn = global.channel;
global.yt = 'https://www.youtube.com/@ElCarlos.87';
global.md = 'https://github.com/thecarlos19/black-clover-MD';
global.correo = 'thecarlospcok@gmail.com';

global.catalogo = fs.readFileSync(new URL('../src/catalogo.jpg', import.meta.url));
global.photoSity = [global.catalogo];

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

global.estilo = { 
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
};

global.ch = { ch1: "120363419782804545@newsletter" };
global.rcanal = global.ch.ch1;

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

global.cheerio = cheerio;
global.fs = fs;
global.fetch = fetch;
global.axios = axios;
global.moment = moment;

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*

global.multiplier = 69;
global.maxwarn = 3;

//*─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─✞─ׄ─ׅ─ׄ─*
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'núcleo•clover/config.js\''));
  import(`${file}?update=${Date.now()}`);
});
