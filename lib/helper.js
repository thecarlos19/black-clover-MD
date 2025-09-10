// @ts-check
import yargs from 'yargs'
import os from 'os'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import fs from 'fs'
import Stream, { Readable } from 'stream'

/** @param {ImportMeta | string} pathURL */
const __filename = (pathURL = import.meta, rmPrefix = os.platform() !== 'win32') => {
    const p = typeof pathURL === 'string' ? pathURL : pathURL.url
    if (rmPrefix && p.startsWith('file:///')) return fileURLToPath(p)
    return p
}

/** @param {ImportMeta | string} pathURL */
const __dirname = (pathURL = import.meta) => {
    const dir = path.dirname(__filename(pathURL, true))
    return dir.replace(/\/$/, '')
}

/** @param {ImportMeta | string} dir */
const __require = (dir = import.meta) => createRequire(typeof dir === 'string' ? dir : dir.url)

/** @param {string} file */
const checkFileExists = async (file) => {
    try {
        await fs.promises.access(file, fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}

/**
 * Construye URL con query y API Key
 * @param {string} name 
 * @param {string} path 
 * @param {Object} query 
 * @param {string} apikeyqueryname 
 * @returns {string}
 */
const API = (name, path = '/', query = {}, apikeyqueryname) => {
    const base = global.APIs?.[name] || name
    const q = { ...query }
    if (apikeyqueryname && global.APIKeys?.[name]) q[apikeyqueryname] = global.APIKeys[name]
    const queryString = Object.keys(q).length ? '?' + new URLSearchParams(q).toString() : ''
    return base + path + queryString
}

/** @type {ReturnType<yargs.Argv['parse']>} */
const opts = yargs(process.argv.slice(2)).exitProcess(false).parse()

const prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

/** @param {Readable} stream @param {string} file */
const saveStreamToFile = (stream, file) => new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(file)
    stream.pipe(writable)
    writable.once('finish', () => resolve())
    writable.once('error', (err) => reject(err))
})

const kDestroyed = Symbol('kDestroyed')
const kIsReadable = Symbol('kIsReadable')

const isReadableNodeStream = (obj, strict = false) =>
    !!(obj && typeof obj.pipe === 'function' && typeof obj.on === 'function' &&
        (!strict || (typeof obj.pause === 'function' && typeof obj.resume === 'function')))

const isNodeStream = (obj) =>
    obj && (obj._readableState || obj._writableState || typeof obj.write === 'function' && typeof obj.on === 'function' || typeof obj.pipe === 'function' && typeof obj.on === 'function')

const isDestroyed = (stream) => {
    if (!isNodeStream(stream)) return null
    const state = stream._readableState || stream._writableState
    return !!(stream.destroyed || stream[kDestroyed] || state?.destroyed)
}

const isReadableFinished = (stream, strict) => {
    if (!isReadableNodeStream(stream)) return null
    const rState = stream._readableState
    if (rState?.errored) return false
    return !!(rState.endEmitted || (strict === false && rState.ended && rState.length === 0))
}

const isReadableStream = (stream) => {
    if (typeof Stream.isReadable === 'function') return Stream.isReadable(stream)
    if (stream && stream[kIsReadable] != null) return stream[kIsReadable]
    if (typeof stream?.readable !== 'boolean') return null
    if (isDestroyed(stream)) return false
    return isReadableNodeStream(stream) && !!stream.readable && !isReadableFinished(stream) || stream instanceof fs.ReadStream || stream instanceof Readable
}

export default {
    __filename,
    __dirname,
    __require,
    checkFileExists,
    API,
    saveStreamToFile,
    isReadableStream,
    opts,
    prefix
}