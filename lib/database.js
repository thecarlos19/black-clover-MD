import { resolve, dirname as _dirname } from 'path'
import _fs, { existsSync, readFileSync } from 'fs'
const { promises: fs } = _fs

const parseJSON = (str, reviver) => {
  try {
    return JSON.parse(str, (key, value) => {
      if (
        value !== null &&
        typeof value === 'object' &&
        value.type === 'Buffer' &&
        Array.isArray(value.data)
      ) {
        return Buffer.from(value.data)
      }
      return reviver ? reviver(key, value) : value
    })
  } catch {
    return {}
  }
}

class Database {
  constructor(filepath, ...args) {
    this.file = resolve(filepath)
    this.logger = console
    this._jsonargs = args.length ? args : [null, 0]
    this._state = false
    this._queue = []
    this._data = {}
    this._saving = null
    this._loaded = false
    this._load()
    this._interval = setInterval(() => this._processQueue(), 50)
  }

  get data() {
    return this._data
  }

  set data(value) {
    this._data = value
    this.save()
  }

  async load() {
    if (this._loaded) return this._data
    return new Promise(resolve => {
      this._queue.push({ action: '_load', resolve })
    })
  }

  save() {
    if (!this._queue.some(q => q.action === '_save')) {
      this._queue.push({ action: '_save' })
    }
  }

  async _processQueue() {
    if (this._state || !this._queue.length) return
    const task = this._queue.shift()
    try {
      this._state = true
      const result = await this[task.action]()
      task.resolve?.(result)
    } catch (err) {
      this.logger.error(`[Database:${task.action}]`, err)
      task.reject?.(err)
    } finally {
      this._state = false
    }
  }

  _load() {
    try {
      this._data = existsSync(this.file)
        ? parseJSON(readFileSync(this.file, 'utf8'))
        : {}
      this._loaded = true
      return this._data
    } catch (err) {
      this.logger.error('[Database:_load]', err)
      this._data = {}
      this._loaded = true
      return this._data
    }
  }

  async _save() {
    if (this._saving) return this._saving
    this._saving = (async () => {
      try {
        const dir = _dirname(this.file)
        await fs.mkdir(dir, { recursive: true })
        const tempFile = `${this.file}.${Date.now()}.tmp`
        await fs.writeFile(tempFile, JSON.stringify(this._data, ...this._jsonargs))
        await fs.rename(tempFile, this.file)
        return this.file
      } catch (err) {
        this.logger.error('[Database:_save]', err)
        throw err
      } finally {
        this._saving = null
      }
    })()
    return this._saving
  }

  close() {
    clearInterval(this._interval)
    return this._saving || Promise.resolve()
  }
}

export default Database