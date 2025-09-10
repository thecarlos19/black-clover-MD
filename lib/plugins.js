import { readdirSync, existsSync, readFileSync, watch } from 'fs'
import { join, resolve } from 'path'
import { format } from 'util'
import syntaxerror from 'syntax-error'
import importFile from './import.js'
import Helper from './helper.js'

const __dirname = Helper.__dirname(import.meta)
const defaultPluginFolder = join(__dirname, '../plugins/index')
const pluginFilter = filename => /\.(mc)?js$/.test(filename)

const watcher = {}
const plugins = {}
const pluginFolders = []

/**
 * Inicializa los plugins desde una carpeta
 * @param {string} folderPath
 * @param {(filename: string) => boolean} filter
 * @param {object} conn
 */
async function filesInit(folderPath = defaultPluginFolder, filter = pluginFilter, conn) {
  const folder = resolve(folderPath)
  if (pluginFolders.includes(folder)) return plugins
  pluginFolders.push(folder)

  // Cargar todos los plugins inicialmente
  await Promise.all(
    readdirSync(folder)
      .filter(filter)
      .map(async filename => {
        try {
          const file = Helper.__filename(join(folder, filename))
          const module = await importFile(file)
          if (module) plugins[filename] = module
        } catch (e) {
          conn?.logger?.error(e)
          Reflect.deleteProperty(plugins, filename)
        }
      })
  )

  // Watch para recargar plugins dinámicamente
  const watching = watch(folder, (ev, filename) => reload(conn, folder, filter, ev, filename))
  watching.on('close', () => deletePluginFolder(folder, true))
  watcher[folder] = watching

  return plugins
}

/**
 * Elimina una carpeta del watcher
 * @param {string} folder
 * @param {boolean} isAlreadyClosed
 */
function deletePluginFolder(folder, isAlreadyClosed = false) {
  const resolved = resolve(folder)
  if (!(resolved in watcher)) return
  if (!isAlreadyClosed) watcher[resolved].close()
  delete watcher[resolved]
  const idx = pluginFolders.indexOf(resolved)
  if (idx !== -1) pluginFolders.splice(idx, 1)
}

/**
 * Recarga un plugin específico cuando cambia
 */
async function reload(conn, pluginFolder, filter, _ev, filename) {
  if (!filter(filename)) return
  const dir = Helper.__filename(join(pluginFolder, filename), true)

  if (filename in plugins) {
    if (existsSync(dir)) conn?.logger?.info(`updated plugin - '${filename}'`)
    else {
      conn?.logger?.warn(`deleted plugin - '${filename}'`)
      return Reflect.deleteProperty(plugins, filename)
    }
  } else conn?.logger?.info(`new plugin - '${filename}'`)

  const err = syntaxerror(readFileSync(dir), filename, {
    sourceType: 'module',
    allowAwaitOutsideFunction: true
  })
  if (err) return conn?.logger?.error(`syntax error in '${filename}'\n${format(err)}`)

  try {
    const module = await importFile(dir)
    if (module) plugins[filename] = module
  } catch (e) {
    conn?.logger?.error(`error loading plugin '${filename}'\n${format(e)}`)
  } finally {
    // Ordenar plugins alfabéticamente
    Object.keys(plugins)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key, idx, arr) => arr[idx] = plugins[key])
  }
}

export { defaultPluginFolder as pluginFolder, pluginFilter, plugins, watcher, pluginFolders, filesInit, deletePluginFolder, reload }