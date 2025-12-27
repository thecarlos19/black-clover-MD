import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { existsSync, writeFileSync } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import chalk from 'chalk'

console.log(chalk.bold.hex('#00FFFF')('\n✞─ Iniciando Black Clover IA ─✞'))

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
require(join(__dirname, './package.json'))

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

async function barraCargaCyberpunk() {
  const frames = [
    '[⏳] Iniciando Black Clover...',
    '[🔮] Reuniendo maná primitivo...',
    '[💾] Cargando hechizos prohibidos...',
    '[⚡] Sincronizando con demonios...',
    '[🔥] Fusión de magia negra...',
    '[🌌] Apertura del Reino Oscuro...',
    '[✅] ASTA-BOT 100% OPERATIVO.'
  ]
  for (let frame of frames) {
    process.stdout.write('\r' + chalk.cyanBright(frame))
    await new Promise(res => setTimeout(res, 350))
  }
  console.log()
}

async function animacionBlackClover() {
  const frames = [
chalk.hex('#555555')(`
 ╭━┳━╭━╭━╮╮
 ┃   ┣▅╋▅┫┃
 ┃ ┃ ╰━╰━━━━━━╮
 ╰┳╯       ◢▉◣
  ┃        ▉▉▉
  ┃        ◥▉◤
  ┃    ╭━┳━━━━╯
  ┣━━━━━━┫  INICIANDO PROTOCOLO
`),

chalk.hex('#FF0000')(`
 ╭━┳━╭━╭━╮╮
 ┃   ┣▅╋▅┫┃
 ┃ ┃ ╰━╰━━━━━━╮
 ╰┳╯       ◢▉◣
  ┃        ▉▉▉
  ┃        ◥▉◤
  ┃    ╭━┳━━━━╯
  ┣━━━━━━┫  ANTIMAGIA DETECTADA
`),

chalk.hex('#FFD700')(`
　　　　　⣀⠤⠖⠒⠒⠒⠢⠤⣀   
　　　⣠⠊⠁ ⣀　⣀　　⠈⠑⡄ 
　　⢠⠃⣰⠁⠈⣀⣤⣤⡑　⣢⣭⢉⣿ 
　　⢸ ⡏ ⢰⣿⣿⣿⡜　⣿⣿⡇⣿ 
　　⠈⣆⡇ ⠘⠿⣿⡿⠎⣀⡙⠿⠓⢙⡄
　　　⠈⠳⢄⣀⠠⡒⠁⠐⠚⠃ ⢶⠋ 
　　　　　　⢸ ⢇⣮⣥⠼⢬⠼⠞  
　　　　⣠⠶⣮⡆⢸⣟⣀⣐⣺⡆   
`),

chalk.hex('#FF00FF')(`
─────█─▄▀█──█▀▄─█─────
────▐▌──────────▐▌────
────█▌▀▄──▄▄──▄▀▐█────
───▐██──▀▀──▀▀──██▌───
──▄████▄──▐▌──▄████▄──
        NÚCLEO DESPIERTO
`)
  ]

  const duracionTotal = 3000
  const delay = Math.floor(duracionTotal / frames.length)

  for (let i = 0; i < frames.length; i++) {
    console.clear()
    console.log(frames[i])
    await new Promise(res => setTimeout(res, delay))
  }
}

async function iniciarBlackClover() {
  console.clear()

  console.log(chalk.bold.cyanBright('\n⟦ ⌬ ACCESO CONCEDIDO | ASTA-BOT V.777 ⟧'))
  console.log(chalk.gray('⌬ Canalizando acceso mágico...'))
  await new Promise(res => setTimeout(res, 600))

  await animacionBlackClover()

  await barraCargaCyberpunk()
  await new Promise(res => setTimeout(res, 500))

  console.log(chalk.redBright('\n☰✦☰═☰  B  L  A  C  K    C  L  O  V  E  R  ☰═☰✦☰'))
  await new Promise(res => setTimeout(res, 700))

  cfonts.say('El mejor Bot ', {
    font: 'block',
    align: 'center',
    colors: ['#00FFFF', '#FF00FF'],
    letterSpacing: 1
  })

  console.log(chalk.bold.hex('#00FFFF')(`
█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█░░╦─╦╔╗╦─╔╗╔╗╔╦╗╔╗░░█
█░░║║║╠─║─║─║║║║║╠─░░█
█░░╚╩╝╚╝╚╝╚╝╚╝╩─╩╚╝░░█
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
        [ ACCESO CONCEDIDO ]
  `))

  await new Promise(res => setTimeout(res, 800))

  console.log(chalk.bold.hex('#FF00FF')('\n⌬═════════════════════⌬'))
  console.log(chalk.bold.white('      SISTEMA CREO POR: ') + chalk.bold.hex('#FFD700')('The Carlos 👑'))
  console.log(chalk.bold.hex('#FF00FF')('⌬═══════════════════════⌬\n'))

  await new Promise(res => setTimeout(res, 1200))
}

let isRunning = false
function start(file) {
  if (isRunning) return
  isRunning = true
  let args = [join(__dirname, 'núcleo•clover', file), ...process.argv.slice(2)]
  setupMaster({ exec: args[0], args: args.slice(1) })
  let p = fork()
  p.on('exit', (_, code) => {
    isRunning = false
    if (code !== 0) start(file)
  })
}

const archivoArranque = './.arranque-ok'
if (!existsSync(archivoArranque)) {
  await iniciarBlackClover()
  writeFileSync(archivoArranque, 'CARLOS_FINAL')
}

start('start.js')