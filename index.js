import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import cluster from 'cluster'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import cfonts from 'cfonts'
import chalk from 'chalk'
import web from './lib/web.js'

console.log(chalk.bold.hex('#00FFFF')('\n✞─ Iniciando Black Clover IA ─✞'))

try {
  console.log(chalk.bold.hex('#FFD700')('\n[ INFO ] :: Web Iniciada.'))
  web(null)
} catch (e) {
  console.log(chalk.bold.hex('#FFD700')('\n[ WARN ] :: Error iniciando web.'))
}

const __dirname = dirname(fileURLToPath(import.meta.url))

const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))

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
    for (const frame of frames) {
        process.stdout.write('\r' + chalk.cyanBright(frame))
        await new Promise(res => setTimeout(res, 350))
    }
    console.log()
}

async function animacionBlackClover() {
    const frames = [
        chalk.hex('#555555')(`
        ───────█████████████████████
────████▀─────────────────▀████
──███▀───────────────────────▀███
─██▀───────────────────────────▀██
█▀───────────────────────────────▀█
█─────────────────────────────────█
█─────────────────────────────────█
█─────────────────────────────────█
█───█████─────────────────█████───█
█──██▓▓▓███─────────────███▓▓▓██──█
█──██▓▓▓▓▓██───────────██▓▓▓▓▓██──█
█──██▓▓▓▓▓▓██─────────██▓▓▓▓▓▓██──█
█▄──████▓▓▓▓██───────██▓▓▓▓████──▄█
▀█▄───▀███▓▓▓██─────██▓▓▓███▀───▄█▀
──█▄────▀█████▀─────▀█████▀────▄█
─▄██───────────▄█─█▄───────────██▄
─███───────────██─██───────────███
─███───────────────────────────███
──▀██──██▀██──█──█──█──██▀██──██▀
───▀████▀─██──█──█──█──██─▀████▀
────▀██▀──██──█──█──█──██──▀██▀
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
──────────██──█──█──█──██
───────────█▄▄█▄▄█▄▄█▄▄█

`),

        chalk.hex('#FF0000')(`
────────────█───────────────█
────────────██─────────────██
─────────────███████████████
────────────█████████████████
───────────███████████████████
──────────████──█████████──████
─────────███████████████████████
────────█████████████████████████
────────█████████████████████████
───███──▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒──███
──█████─█████████████████████████─█████
──█████─████████████████──███████─█████
──█████─██████────────█──█────███─█████
──█████─█████─▓▓▓▓▓▓▓█──█▓▓─▓─███─█████
──█████─███─█─▓▓▓▓▓▓█──█▓▓─▓▓─███─█████
──█████─██──█─▓▓▓▓▓█──█▓▓─▓▓▓─███─█████
──█████─███─█─▓▓▓▓█──█▓▓─▓▓▓▓─███─█████
──█████─█████────█──█─────────███─█████
──█████─█████████──██████████████─█████
───███──████████──███████████████──███
────────█████████████████████████
─────────███████████████████████
──────────█████████████████████
─────────────██████───██████
─────────────██████───██████
─────────────██████───██████
─────────────██████───██████
──────────────████─────████

`),

        chalk.hex('#FFD700')(`
███████████████████████████████
████╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬████
██╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬██
█╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬█
█╬╬╬███████╬╬╬╬╬╬╬╬╬███████╬╬╬█
█╬╬██╬╬╬╬███╬╬╬╬╬╬╬███╬╬╬╬██╬╬█
█╬██╬╬╬╬╬╬╬██╬╬╬╬╬██╬╬╬╬╬╬╬██╬█
█╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬█
█╬╬╬╬█████╬╬╬╬╬╬╬╬╬╬╬█████╬╬╬╬█
█╬╬█████████╬╬╬╬╬╬╬█████████╬╬█
█╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬█
█╬╬╬╬╬╬╬╬╬╬╬╬╬╬█╬╬╬╬╬╬╬╬╬╬╬╬╬╬█
█╬╬╬╬╬╬╬╬╬╬╬╬╬╬█╬╬╬╬╬╬╬╬╬╬╬╬╬╬█
█╬╬╬╬╬╬╬╬╬╬╬╬╬╬█╬╬╬╬╬╬╬╬╬╬╬╬╬╬█
█╬╬╬▓▓▓▓╬╬╬╬╬╬╬█╬╬╬╬╬╬╬▓▓▓▓╬╬╬█
█╬╬▓▓▓▓▓▓╬╬█╬╬╬█╬╬╬█╬╬▓▓▓▓▓▓╬╬█
█╬╬╬▓▓▓▓╬╬██╬╬╬█╬╬╬██╬╬▓▓▓▓╬╬╬█
█╬╬╬╬╬╬╬╬██╬╬╬╬█╬╬╬╬██╬╬╬╬╬╬╬╬█
█╬╬╬╬╬████╬╬╬╬███╬╬╬╬████╬╬╬╬╬█
█╬╬╬╬╬╬╬╬╬╬╬╬╬███╬╬╬╬╬╬╬╬╬╬╬╬╬█
██╬╬█╬╬╬╬╬╬╬╬█████╬╬╬╬╬╬╬╬█╬╬██
██╬╬██╬╬╬╬╬╬███████╬╬╬╬╬╬██╬╬██
██╬╬▓███╬╬╬████╬████╬╬╬███▓╬╬██
███╬╬▓▓███████╬╬╬███████▓▓╬╬███
███╬╬╬╬▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╬╬╬╬███
████╬╬╬╬╬╬╬╬╬╬███╬╬╬╬╬╬╬╬╬╬████
█████╬╬╬╬╬╬╬╬╬╬█╬╬╬╬╬╬╬╬╬╬█████
██████╬╬╬╬╬╬╬╬███╬╬╬╬╬╬╬╬██████
███████╬╬╬╬╬╬╬███╬╬╬╬╬╬╬███████
████████╬╬╬╬╬╬███╬╬╬╬╬╬████████
█████████╬╬╬╬╬███╬╬╬╬╬█████████
███████████╬╬╬╬█╬╬╬╬███████████
███████████████████████████████

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

    console.log(chalk.redBright('\n☰✦☰═☰ B L A C K C L O V E R ☰═☰✦☰'))
    await new Promise(res => setTimeout(res, 700))

    cfonts.say('El mejor Bot', {
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
    console.log(chalk.bold.white(' SISTEMA CREADO POR: ') + chalk.bold.hex('#FFD700')('The Carlos 👑'))
    console.log(chalk.bold.hex('#FF00FF')('⌬═══════════════════════⌬\n'))

    await new Promise(res => setTimeout(res, 1200))
}

let isRunning = false
let currentWorker = null

function start(file) {
    if (isRunning) return
    isRunning = true

    const args = [join(__dirname, 'núcleo•clover', file),...process.argv.slice(2)]

    if (cluster.isPrimary) {
        cluster.setupPrimary({ exec: args[0], args: args.slice(1) })
        currentWorker = cluster.fork()

        currentWorker.on('exit', (code, signal) => {
            isRunning = false
            currentWorker = null
            if (code!== 0 && signal!== 'SIGTERM') {
                console.log(chalk.bold.red(`black clover murió: ${code || signal}. Reiniciando...`))
                setTimeout(() => start(file), 1000)
            } else {
                process.exit(0)
            }
        })

        process.on('SIGINT', () => {
            if (currentWorker) currentWorker.kill('SIGTERM')
            process.exit(0)
        })
    }
}

const archivoArranque = './.arranque-ok'
if (!existsSync(archivoArranque)) {
    await iniciarBlackClover()
    writeFileSync(archivoArranque, `CARLOS_FINAL_${packageJson.version}`)
}

start('start.js')