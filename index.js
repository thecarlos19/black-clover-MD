import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile, existsSync, writeFileSync } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'

console.log(chalk.bold.hex('#00FFFF')('\n✞─ Iniciando Black Clover IA ─✞'))

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { name, description, author, version } = require(join(__dirname, './package.json'))

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

async function barraCargaCyberpunk() {
  const frames = [
    '[⏳] Iniciando Black clover...',
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

async function animarTextoCyberpunk(texto, delay = 40) {
  for (let i = 0; i < texto.length; i++) {
    process.stdout.write(chalk.bold.hex('#FF0055')(texto[i]))
    await new Promise(res => setTimeout(res, delay))
  }
  console.log()
}

async function iniciarBlackClover() {
  console.clear()

  cfonts.say('El mejor Bot ', {
    font: 'block',
    align: 'center',
    colors: ['#00FFFF', '#FF00FF'],
    letterSpacing: 1
  })

  console.log(chalk.bold.hex('#00FFFF')(`
    ╭━┳━╭━╭━╮╮
    ┃   ┣▅╋▅┫┃
    ┃ ┃ ╰━╰━━━━━━╮
    ╰┳╯       ◢▉◣
     ┃        ▉▉▉
     ┃        ◥▉◤
     ┃    ╭━┳━━━━╯
     ┣━━━━━━┫  [ ACCESO CONCEDIDO ]
  `))

  await animarTextoCyberpunk('>> Cargando núcleo del sistema...', 30)
  await new Promise(res => setTimeout(res, 800))

  console.log(chalk.bold.hex('#FF0000')(`
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
　　　　　　　　⠈⠉⠛⠛⠛⠋⠁
  `))
  
  await animarTextoCyberpunk('>> Sincronizando con The Carlos (Capitán de los toros negros)...', 30)
  await new Promise(res => setTimeout(res, 1000))

  console.log(chalk.bold.hex('#FFD700')(`
　　　　　⣀⠤⠖⠒⠒⠒⠢⠤⣀   
　　　　⣠⠊⠁ ⣀　⣀　　⠈⠑⡄ 
　　　⢠⠃⣰⠁⠈⣀⣤⣤⡑　⣢⣭⢉⣿ 
　　　⢸ ⡏ ⢰⣿⣿⣿⡜　⣿⣿⡇⣿ 
　　　⠈⣆⡇ ⠘⠿⣿⡿⠎⣀⡙⠿⠓⢙⡄
　　　　⠈⠳⢄⣀⠠⡒⠁⠐⠚⠃ ⢶⠋ 
　　　　　　⢸ ⢇⣮⣥⠼⢬⠼⠞  
　　　　⣠⠶⣮⡆⢸⣟⣀⣐⣺⡆   
　　　⡸⠈⣾⢿⢿⡦⡉⠁⠁⣩⠇   
　　　⣰⢁⠞⣔⣷⡏⡳⡽⠉⠉⠁    
　　⢀⡴⠁⢮⣷⣾⣽⢾⣇⡧⠤⠒⣒⣶⣿⣿⡆
　　⠸⣋⠚⠓⣒⣩ ⢻⡟⠿⡯⠿⢧⣽⡞⠙⠋
　　⡔⢉⠉ ⠋⡤⡜⣿⡤⠷⠃ ⠈⠉⠁  
　　⢳⢬⠈⣀⣤⢍⣰⡇         
　　⠈⠻⡍⢹ ⢳⡌⢣         
　　　⣹⠸⡄ ⢻⡄⢧⡀       
　　　⢸⣅⣀⡷ ⢰⣥⢄⡗       
　　⢀⡾⣡⠃ ⡰⣣⢯⠊        
　　⣾⢡⠋ ⣼⠝⡱⠁         
⢀⣼⣃⣯ ⣜⡷⠾⠗⣶⣄        
⠈⢷⣂⢫⢽⣦⠉⠁⠘⠚⠚        
  ⠙⡷⠾⠋
  `))

  console.log(chalk.bold.hex('#FF00FF')('\n⌬═════════════════════⌬'))
  console.log(chalk.bold.white('      SISTEMA CARGADO POR: ') + chalk.bold.hex('#FFD700')('The Carlos 👑'))
  console.log(chalk.bold.hex('#FF00FF')('⌬═══════════════════════⌬\n'))
  
  await new Promise(res => setTimeout(res, 1200))
}

const frases = [
  '\n✠ Black Clover reiniciado. ⚙️ Cargando sistemas...\n',
  '\n✠ Reinicio completado. ⚡ Black Clover listo.\n',
  '\n✠ Sistema Black Clover: ⚙️ Online.\n',
  '\n✠ Black Clover revive desde las sombras. ⛓️\n',
  '\n✠ Reboot: Black Clover ⚔️\n'
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
  p.on('exit', (_, code) => {
    isRunning = false
    if (code !== 0) start(file)
  })
}

const archivoArranque = './.arranque-ok'
if (!existsSync(archivoArranque)) {
  await iniciarBlackClover()
  writeFileSync(archivoArranque, 'CARLOS_FINAL')
} else {
  console.log(fraseAleatoria())
}

start('start.js')