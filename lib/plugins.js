import { readdirSync, existsSync, readFileSync, watch, statSync } from 'fs'
import { join, resolve } from 'path'
import { format } from 'util'
import syntaxerror from 'syntax-error'
import importFile from './import.js'
import Helper from './helper.js'

const __dirname = Helper.__dirname(import.meta)
const defaultPluginFolder = join(__dirname, '../plugins')
const pluginFilter = filename => /\.(mc)?js$/.test(filename)

const watcher = {}
const plugins = {}
const pluginFolders = []

async function filesInit(folderPath = defaultPluginFolder, filter = pluginFilter, conn) {
  const folder = resolve(folderPath)
  if (pluginFolders.includes(folder)) return plugins
  if (!existsSync(folder)) return plugins

  pluginFolders.push(folder)

  const files = readdirSync(folder).filter(filter)
  await Promise.all(
    files.map(async filename => {
      try {
        const file = Helper.__filename(join(folder, filename))
        const module = await importFile(file)
        if (module) plugins[filename] = module
      } catch (e) {
        conn?.logger?.error(`[plugin:${filename}]`, e)
        Reflect.deleteProperty(plugins, filename)
      }
    })
  )

  try {
    const watching = watch(folder, (ev, filename) => {
      if (filename) reload(conn, folder, filter, ev, filename).catch(e => conn?.logger?.error(e))
    })
    watching.on('error', err => conn?.logger?.error(`[watcher:${folder}]`, err))
    watching.on('close', () => deletePluginFolder(folder, true))
    watcher[folder] = watching
  } catch (e) {
    conn?.logger?.error(`[watcher]`, e)
    const idx = pluginFolders.indexOf(folder)
    if (idx!== -1) pluginFolders.splice(idx, 1)
  }

  return plugins
}

function deletePluginFolder(folder, isAlreadyClosed = false) {
  const resolved = resolve(folder)
  if (!(resolved in watcher)) return
  try {
    if (!isAlreadyClosed) watcher[resolved].close()
  } catch {}
  Reflect.deleteProperty(watcher, resolved)
  const idx = pluginFolders.indexOf(resolved)
  if (idx!== -1) pluginFolders.splice(idx, 1)
}

async function reload(conn, pluginFolder, filter, _ev, filename) {
  if (!filter(filename)) return
  const fullPath = join(pluginFolder, filename)
  const dir = Helper.__filename(fullPath, true)

  if (filename in plugins) {
    if (existsSync(dir)) {
      conn?.logger?.info(`updated plugin - '${filename}'`)
    } else {
      conn?.logger?.warn(`deleted plugin - '${filename}'`)
      Reflect.deleteProperty(plugins, filename)
      return
    }
  } else {
    conn?.logger?.info(`new plugin - '${filename}'`)
  }

  if (!existsSync(dir)) return

  let source
  try {
    source = readFileSync(dir, 'utf8')
  } catch (e) {
    return conn?.logger?.error(`read error '${filename}'\n${format(e)}`)
  }

  const err = syntaxerror(source, filename, {
    sourceType: 'module',
    allowAwaitOutsideFunction: true
  })
  if (err) return conn?.logger?.error(`syntax error in '${filename}'\n${format(err)}`)

  try {
    const module = await importFile(dir)
    if (module) {
      plugins[filename] = module
      const sortedKeys = Object.keys(plugins).sort((a, b) => a.localeCompare(b))
      const sorted = {}
      for (const key of sortedKeys) sorted[key] = plugins[key]
      for (const key of Object.keys(plugins)) Reflect.deleteProperty(plugins, key)
      Object.assign(plugins, sorted)
    }
  } catch (e) {
    conn?.logger?.error(`error loading plugin '${filename}'\n${format(e)}`)
    Reflect.deleteProperty(plugins, filename)
  }
}

export { defaultPluginFolder as pluginFolder, pluginFilter, plugins, watcher, pluginFolders, filesInit, deletePluginFolder, reload }