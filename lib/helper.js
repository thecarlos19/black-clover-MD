// @ts-check
import yargs from 'yargs'
import os from 'os'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import fs from 'fs'
import Stream, { Readable } from 'stream'

const __filename = (pathURL = import.meta.url, rmPrefix = os.platform()!== 'win32') => {
    const p = typeof pathURL === 'string'? pathURL : pathURL.url || pathURL
    if (!p) return process.cwd()
    try {
        return rmPrefix && p.startsWith('file://')? fileURLToPath(p) : p
    } catch {
        return p
    }
}

const __dirname = (pathURL = import.meta.url) => {
    const dir = path.dirname(__filename(pathURL, true))
    return dir.replace(/\/$/, '')
}

const __require = (dir = import.meta.url) => createRequire(typeof dir === 'string'? dir : dir.url || dir)

const checkFileExists = async (file) => {
    try {
        await fs.promises.access(file, fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}

const API = (name, path = '/', query = {}, apikeyqueryname) => {
    const base = global.APIs?.[name] || name
    const q = {...query }
    const key = global.APIKeys?.[base] || global.APIKeys?.[name]
    if (apikeyqueryname && key) q[apikeyqueryname] = key
    const queryString = Object.keys(q).length? '?' + new URLSearchParams(q).toString() : ''
    return base + path + queryString
}

const opts = yargs(process.argv.slice(2)).exitProcess(false).parse()

const prefixStr = opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-'
const escapedPrefix = prefixStr.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\-')
const prefix = new RegExp(`^[${escapedPrefix}]`)

const saveStreamToFile = (stream, file) => new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(file)
    stream.once('error', err => {
        writable.destroy()
        reject(err)
    })
    writable.once('error', err => {
        stream.destroy()
        reject(err)
    })
    writable.once('finish', () => resolve())
    stream.pipe(writable)
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
    return!!(stream.destroyed || stream[kDestroyed] || state?.destroyed)
}

const isReadableFinished = (stream, strict) => {
    if (!isReadableNodeStream(stream)) return null
    const rState = stream._readableState
    if (rState?.errored) return false
    return!!(rState?.endEmitted || (strict === false && rState?.ended && rState?.length === 0))
}

const isReadableStream = (stream) => {
    if (typeof Stream.isReadable === 'function') return Stream.isReadable(stream)
    if (stream && stream[kIsReadable]!= null) return stream[kIsReadable]
    if (typeof stream?.readable!== 'boolean') return null
    if (isDestroyed(stream)) return false
    return isReadableNodeStream(stream) &&!!stream.readable &&!isReadableFinished(stream) || stream instanceof fs.ReadStream || stream instanceof Readable
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