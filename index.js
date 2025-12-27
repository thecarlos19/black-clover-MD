import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile, existsSync, writeFileSync } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'

console.log(chalk.bold.hex('#00FF00')('\n── AGENTE DE INICIO CARGADO ──'))

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { name, description, author, version } = require(join(__dirname, './package.json'))
const rl = createInterface(process.stdin, process.stdout)

async function animarTextoCyberpunk(texto, delay = 40, glitch = true) {
  const efectos = '⚔️🔥⚡🩸🔱🧿🌀🪬⛓️💠'
  let resultado = ''
  for (let i = 0; i < texto.length; i++) {
    resultado += texto[i]
    let linea = resultado
    if (glitch && Math.random() > 0.8) {
      const ruido = efectos[Math.floor(Math.random() * efectos.length)]
      linea += chalk.white(ruido)
    }
    process.stdout.write('\r' + chalk.bold.hex('#FF0055')(linea))
    await new Promise(res => setTimeout(res, delay))
  }
  console.log()
}

async function barraMistica() {
  const simbolos = ['⚡', '🔥', '🌀', '🩸', '🔱', '✨']
  for (let i = 0; i <= 10; i++) {
    const carga = '█'.repeat(i) + '░'.repeat(10 - i)
    const simb = simbolos[i % simbolos.length]
    process.stdout.write(`\r${chalk.hex('#00FFFF')('        [')} ${chalk.hex('#FF00FF')(carga)} ${chalk.hex('#00FFFF')(']')} ${chalk.bold.white(i * 10 + '%')} ${simb}`)
    await new Promise(res => setTimeout(res, 200))
  }
  console.log()
}

async function animacionAstaDemon() {
  const demonFrames = [
    `
       ⚔️  [ MODO ANTIPRE-MAGIA ]  ⚔️
            ⚡   ◢▇◣   ⚡
               👹  😈  👹
            ◥████████◤
               ◢██◣
    `,
    `
       🔥  [ LIBERANDO DEMONIO ]  🔥
            ✨   ◢▇◣   ✨
               🔴  💀  🔴
            ◥████████◤
               ◢██◣
    `
  ]
  for (let i = 0; i < 6; i++) {
    console.clear()
    console.log(chalk.bold.hex(i % 2 === 0 ? '#FF0000' : '#8B0000')(demonFrames[i % demonFrames.length]))
    await new Promise(res => setTimeout(res, 300))
  }
}

async function iniciarBlackClover() {
  console.clear()

  cfonts.say('MY BOT', {
    font: 'block',
    align: 'center',
    colors: ['#FF0000', '#000000'],
    background: 'transparent',
    letterSpacing: 1
  })

  console.log(chalk.bold.hex('#FFD700')('\n\t   ─── ❖ ── ✦ ── ⚔️ ── ✦ ── ❖ ───'))
  console.log(chalk.bold.white('\t      SISTEMA DE ASALTO: BLACK CLOVER'))
  console.log(chalk.bold.hex('#FFD700')('\t   ─── ❖ ── ✦ ── ⚔️ ── ✦ ── ❖ ───\n'))

  await new Promise(res => setTimeout(res, 800))

  await animarTextoCyberpunk('🔱 Iniciando protocolo de resurrección de mana...', 40)
  await barraMistica()

  console.log(chalk.bold.hex('#00FFFF')('\n[💠] IDENTIFICANDO PROPIETARIO...'))
  cfonts.say('THE CARLOS', {
    font: 'chrome',
    align: 'center',
    colors: ['candy', 'system'],
    letterSpacing: 2
  })
  
  await new Promise(res => setTimeout(res, 1000))
  await animacionAstaDemon()

  console.log(chalk.bold.hex('#FF0000')('\n  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
  console.log(chalk.bold.white('    🔥 ESTADO: ') + chalk.bold.hex('#00FF00')('ONLINE'))
  console.log(chalk.bold.white('    ⚔️ ARMA: ') + chalk.bold.hex('#FF0055')('ESPADA DE DANMA'))
  console.log(chalk.bold.white('    👑 LIDER: ') + chalk.bold.hex('#FFD700')('THE CARLOS'))
  console.log(chalk.bold.hex('#FF0000')('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))

  await animarTextoCyberpunk('\n⛓️ Rompiendo sellos de seguridad del Reino del Trébol...', 30)
  
  console.log(chalk.bold.hex('#FF4500')('\n「 💢 ¡MI MAGIA ES NO RENDIRME NUNCA! 💢 」'))
  console.log(chalk.bold.gray('\n      Sincronización completa... ¡A la batalla! ⚔️\n'))
  
  await new Promise(res => setTimeout(res, 1500))
}

const frases = [
  '\n🔱 Grimorio abierto. ⛓️ Black Clover despertando...\n',
  '\n⚡ Rayo Negro detectado. ⚔️ Sistema listo.\n',
  '\n💀 Las sombras obedecen a The Carlos.\n'
]

function fraseAleatoria() {
  return chalk.bold.hex('#FF00FF')(frases[Math.floor(Math.random() * frases.length)])
}

let isRunning = false
function start(file) {
  if (isRunning) return
  isRunning = true
  let args = [join(__dirname, 'núcleo•clover', file), ...process.argv.slice(2)]
  setupMaster({ exec: args[0], args: args.slice(1) })
  let p = fork()
  p.on('message', data => {
    if (data === 'reset') { p.process.kill(); isRunning = false; start(file) }
  })
  p.on('exit', (_, code) => {
    isRunning = false
    if (code !== 0) {
        console.error(chalk.red('🚩 FALLO EN EL REINO:'), code)
        process.exit()
    }
  })
}

const archivoArranque = './.arranque-ok'
if (!existsSync(archivoArranque)) {
  await iniciarBlackClover()
  console.log(chalk.hex('#FF0000')(`
 　　　　⢀⣤⣶⣶⣖⣦⣄⡀        
　　　⢀⣾⡟⣉⣽⣿⢿⡿⣿⣿⣆       
　　⢠⣿⣿⣿⡗⠋⠙⡿⣷⢌⣿⣿       
⣷⣄⣀⣿⣿⣿⣿⣷⣦⣤⣾⣿⣿⣿⡿       
⠈⠙⠛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀ ⢀    
　　⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠻⠿⠿⠋    
　　　⠹⣿⣿⣿⣿⣿⣿⣿⣿⡇        
　　　　⠈⢿⣿⣿⣿⣿⣿⣿⣇       ⡄
　　　　　⠙⢿⣿⣿⣿⣿⣿⣆    ⢀⡾ 
　　　　　　⠈⠻⣿⣿⣿⣿⣷⣶⣴⣾⠏  
　　　　　　　　⠈⠉⠛⠛⠛⠋⠁  [ ASTA-BOT V7 ]
  `))
  writeFileSync(archivoArranque, 'CARLOS_POWER')
} else {
  console.log(fraseAleatoria())
}

start('start.js')