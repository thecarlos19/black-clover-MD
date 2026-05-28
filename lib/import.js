import { pathToFileURL } from 'url'
import { resolve } from 'path'
import { existsSync } from 'fs'
import Helper from './helper.js'

export default async function importLoader(modulePath) {
  try {
    if (typeof modulePath !== 'string') throw new TypeError('module debe ser una cadena de texto')
    
    const absPath = resolve(Helper.__filename(modulePath))
    
    if (!existsSync(absPath)) throw new Error(`Módulo no encontrado: ${absPath}`)
    
    const fileUrl = pathToFileURL(absPath).href
    const module_ = await import(`${fileUrl}?id=${Date.now()}`)
    
    return module_?.default ?? module_
  } catch (err) {
    console.error('[importLoader]', err.message || err)
    throw err
  }
}