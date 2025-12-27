import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile, existsSync, writeFileSync } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const rl = createInterface(process.stdin, process.stdout)

async function iniciarBlackClover() {
  console.clear()

  cfonts.say('MY BOT', {
    font: 'block',
    align: 'center',
    colors: ['green', 'yellow'], 
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
  })
  
  cfonts.say('CARLOS', { font: 'tiny', align: 'center', colors: ['magenta'] })
  
  console.log(chalk.bold.magenta(`\n[ ⚡ ASTA-BOT BY: THE CARLOS 👑 ]`))
  console.log(chalk.gray('──────────────────────────────────'))

  const pasos = [
    ' Invocando grimorio...',
    ' Canalizando antimagia...',
    ' Conectando al núcleo...'
  ]

  for (let paso of pasos) {
    process.stdout.write(chalk.cyan(`\r⌬ ${paso}`))
    await new Promise(res => setTimeout(res, 800))
  }

  console.log(chalk.greenBright('\n\n✅ SISTEMA OPERATIVO | CAPITÁN: CARLOS'))
  console.log(chalk.gray('──────────────────────────────────\n'))
}

const frases = ['\n⚡ Black Clover listo.\n', '\n⚔️ Asta-Bot Online.\n']
const fraseAleatoria = () => frases[Math.floor(Math.random() * frases.length)]

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
  writeFileSync(archivoArranque, 'OK')
} else {
  console.log(chalk.magenta(fraseAleatoria()))
  console.log(chalk.magenta('═══ Creado por: Carlos ═══\n'))
}

start('start.js')