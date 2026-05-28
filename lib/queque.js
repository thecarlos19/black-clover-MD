import EventEmitter from 'events'

const isNumber = x => typeof x === 'number' &&!isNaN(x)
const delay = ms => isNumber(ms)? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()

const DEFAULT_QUEUE_DELAY = 5000

export default class Queue extends EventEmitter {
  #queue = new Set()
  #delayTime = DEFAULT_QUEUE_DELAY
  #timeouts = new Map()

  constructor(delayTime = DEFAULT_QUEUE_DELAY) {
    super()
    this.setMaxListeners(0)
    if (isNumber(delayTime)) this.#delayTime = delayTime
  }

  add(item) {
    if (item == null) throw new TypeError('Item cannot be null/undefined')
    this.#queue.add(item)
  }

  has(item) {
    return this.#queue.has(item)
  }

  delete(item) {
    this.#clearTimeout(item)
    return this.#queue.delete(item)
  }

  first() {
    return this.#queue.values().next().value
  }

  last() {
    let last
    for (const item of this.#queue) last = item
    return last
  }

  isFirst(item) {
    return this.first() === item
  }

  isLast(item) {
    return this.last() === item
  }

  getIndex(item) {
    return [...this.#queue].indexOf(item)
  }

  getSize() {
    return this.#queue.size
  }

  isEmpty() {
    return this.getSize() === 0
  }

  unqueue(item) {
    const target = item ?? this.first()
    if (target == null) return false
    if (!this.has(target)) return false
    if (!this.isFirst(target)) throw new Error('Item is not first in queue')

    this.delete(target)
    this.emit(target)
    return true
  }

  #clearTimeout(item) {
    const t = this.#timeouts.get(item)
    if (t) {
      clearTimeout(t)
      this.#timeouts.delete(item)
    }
  }

  waitQueue(item, timeout = 30000) {
    return new Promise((resolve, reject) => {
      if (!this.has(item)) return reject(new Error('Item not found'))

      const cleanup = () => {
        this.#clearTimeout(item)
        this.removeListener(item, onItem)
      }

      const onTimeout = () => {
        cleanup()
        this.delete(item)
        reject(new Error('Queue timeout'))
      }

      const processItem = async () => {
        cleanup()
        await delay(this.#delayTime)
        this.unqueue(item)
        resolve()
      }

      const onItem = () => {
        if (this.isFirst(item)) processItem()
      }

      if (this.isFirst(item)) {
        processItem()
      } else {
        this.once(item, onItem)
        if (timeout > 0) {
          this.#timeouts.set(item, setTimeout(onTimeout, timeout))
        }
      }
    })
  }

  clear() {
    for (const t of this.#timeouts.values()) clearTimeout(t)
    this.#timeouts.clear()
    this.removeAllListeners()
    this.#queue.clear()
  }
}