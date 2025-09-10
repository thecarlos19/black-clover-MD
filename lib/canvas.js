import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Genera una imagen de "level up"
 * @param {String} teks - Texto a mostrar
 * @param {Number} level - Nivel alcanzado
 * @returns {Promise<Buffer>}
 */
export function levelup(teks, level) {
    return new Promise((resolve, reject) => {
        if (!(global.support?.convert || global.support?.magick || global.support?.gm)) {
            return reject(new Error('ImageMagick/GraphicsMagick no soportado en este entorno.'))
        }

        const fontDir = join(__dirname, '../src/font')
        const fontLevel = join(fontDir, 'level_c.otf')
        const fontTexts = join(fontDir, 'texts.otf')
        const template = join(__dirname, '../src/lvlup_template.jpg')

        // Validar archivos
        for (let file of [fontLevel, fontTexts, template]) {
            if (!existsSync(file)) return reject(new Error(`Archivo requerido no encontrado: ${file}`))
        }

        // Posición dinámica del texto según nivel
        let anotations = '+1385+260'
        if (level > 2) anotations = '+1370+260'
        if (level > 10) anotations = '+1330+260'
        if (level > 50) anotations = '+1310+260'
        if (level > 100) anotations = '+1260+260'

        const [_spawnprocess, ..._spawnargs] = [
            ...(global.support.gm ? ['gm'] : global.support.magick ? ['magick'] : []),
            'convert',
            template,
            '-font', fontTexts,
            '-fill', '#0F3E6A',
            '-size', '1024x784',
            '-pointsize', '68',
            '-interline-spacing', '-7.5',
            '-annotate', '+153+200', teks,
            '-font', fontLevel,
            '-fill', '#0A2A48',
            '-size', '1024x784',
            '-pointsize', '140',
            '-interline-spacing', '-1.2',
            '-annotate', anotations, String(level),
            '-append',
            'jpg:-'
        ]

        let bufs = []
        const proc = spawn(_spawnprocess, _spawnargs)

        proc.stdout.on('data', chunk => bufs.push(chunk))
        proc.stderr.on('data', err => console.error('Error en convert:', err.toString()))
        proc.on('error', reject)
        proc.on('close', code => {
            if (code !== 0) return reject(new Error(`Proceso falló con código ${code}`))
            resolve(Buffer.concat(bufs))
        })
    })
}