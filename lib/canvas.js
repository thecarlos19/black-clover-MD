import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function sanitizeText(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

export function levelup(teks = '', level = 0) {
    return new Promise((resolve, reject) => {
        if (!(global.support?.convert || global.support?.magick || global.support?.gm)) {
            return reject(new Error('ImageMagick/GraphicsMagick no soportado en este entorno.'))
        }

        const fontDir = join(__dirname, '../src/font')
        const fontLevel = join(fontDir, 'level_c.otf')
        const fontTexts = join(fontDir, 'texts.otf')
        const template = join(__dirname, '../src/lvlup_template.jpg')

        for (const file of [fontLevel, fontTexts, template]) {
            if (!existsSync(file)) return reject(new Error(`Archivo requerido no encontrado: ${file}`))
        }

        const lvl = Number(level) || 0
        const text = sanitizeText(teks).slice(0, 200)
        
        let anotations = '+1385+260'
        if (lvl > 2) anotations = '+1370+260'
        if (lvl > 10) anotations = '+1330+260'
        if (lvl > 50) anotations = '+1310+260'
        if (lvl > 100) anotations = '+1260+260'
        if (lvl > 999) anotations = '+1210+260'

        const baseCmd = global.support.gm ? ['gm'] : global.support.magick ? ['magick'] : []
        const args = [
            ...baseCmd,
            'convert',
            template,
            '-font', fontTexts,
            '-fill', '#0F3E6A',
            '-size', '1024x784',
            '-pointsize', '68',
            '-interline-spacing', '-7.5',
            '-annotate', '+153+200', text,
            '-font', fontLevel,
            '-fill', '#0A2A48',
            '-size', '1024x784',
            '-pointsize', '140',
            '-interline-spacing', '-1.2',
            '-annotate', anotations, String(lvl),
            '-append',
            'jpg:-'
        ]

        const [cmd, ...spawnArgs] = args
        const proc = spawn(cmd, spawnArgs, { stdio: ['ignore', 'pipe', 'pipe'] })
        
        const bufs = []
        const errs = []
        
        proc.stdout.on('data', chunk => bufs.push(chunk))
        proc.stderr.on('data', chunk => errs.push(chunk))
        proc.on('error', err => reject(new Error(`Error ejecutando ${cmd}: ${err.message}`)))
        proc.on('close', code => {
            if (code !== 0) {
                const stderr = Buffer.concat(errs).toString().trim()
                return reject(new Error(`Proceso falló con código ${code}: ${stderr || 'sin output'}`))
            }
            if (!bufs.length) return reject(new Error('No se generó imagen'))
            resolve(Buffer.concat(bufs))
        })
    })
}