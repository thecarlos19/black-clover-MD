import { resolve, dirname as _dirname } from 'path'
import _fs, { existsSync, readFileSync } from 'fs'
const { promises: fs } = _fs

class Database {
  constructor(filepath, ...args) {
    this.file = resolve(filepath)
    this.logger = console

    this._jsonargs = args
    this._state = false
    this._queue = []
    this._data = {}

    // Cargar datos al inicio
    this._load()

    // Procesar la cola cada segundo
    this._interval = setInterval(async () => {
      if (!this._state && this._queue && this._queue[0]) {
        const action = this._queue.shift()
        try {
          this._state = true
          await this[action]()
        } catch (err) {
          this.logger.error(`[Database:${action}]`, err)
        } finally {
          this._state = false
        }
      }
    }, 1000)
  }

  get data() {
    return this._data
  }

  set data(value) {
    this._data = value
    this.save()
  }

  load() {
    this._queue.push('_load')
  }

  save() {
    // Evitar duplicados innecesarios en la cola
    if (!this._queue.includes('_save')) {
      this._queue.push('_save')
    }
  }

  _load() {
    try {
      this._data = existsSync(this.file)
        ? JSON.parse(readFileSync(this.file, 'utf8'))
        : {}
      return this._data
    } catch (err) {
      this.logger.error('[Database:_load]', err)
      this._data = {}
      return this._data
    }
  }

  async _save() {
    try {
      const dirname = _dirname(this.file)
      if (!existsSync(dirname)) {
        await fs.mkdir(dirname, { recursive: true })
      }
      await fs.writeFile(
        this.file,
        JSON.stringify(this._data, ...this._jsonargs)
      )
      return this.file
    } catch (err) {
      this.logger.error('[Database:_save]', err)
    }
  }

  close() {
    clearInterval(this._interval)
  }
}

export default Database