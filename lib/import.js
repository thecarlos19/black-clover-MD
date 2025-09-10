import Helper from './helper.js'

/**
 * Carga dinámicamente un módulo ESM, evitando cache
 * @template T
 * @param {string} module - Ruta al módulo
 * @returns {Promise<T>}
 */
export default async function importLoader(module) {
  try {
    if (typeof module !== 'string') throw new TypeError('module debe ser una cadena de texto')
    
    // Convertir ruta relativa a absoluta
    module = Helper.__filename(module)

    // Import dinámico evitando cache
    const module_ = await import(`${module}?id=${Date.now()}`)

    // Retornar default si existe
    return module_ && 'default' in module_ ? module_.default : module_
  } catch (err) {
    console.error('[importLoader]', err)
    throw err
  }
}