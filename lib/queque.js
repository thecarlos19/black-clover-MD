import EventEmitter from 'events'

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()

const DEFAULT_QUEUE_DELAY = 5000 // 5 segundos

export default class Queue extends EventEmitter {
  #queue = new Set()
  #delayTime = DEFAULT_QUEUE_DELAY

  constructor(delayTime = DEFAULT_QUEUE_DELAY) {
    super()
    if (isNumber(delayTime)) this.#delayTime = delayTime
  }

  add(item) {
    this.#queue.add(item)
  }

  has(item) {
    return this.#queue.has(item)
  }

  delete(item) {
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

  /**
   * Remueve un item de la cola, emitiendo su evento
   */
  unqueue(item) {
    let target = item ?? this.first()
    if (!target) return

    if (!this.isFirst(target)) {
      throw new Error('Item is not first in queue')
    }

    this.delete(target)
    this.emit(target)
  }

  /**
   * Espera su turno en la cola
   * @param {*} item 
   */
  waitQueue(item) {
    return new Promise((resolve, reject) => {
      if (!this.has(item)) return reject(new Error('Item not found'))

      const processItem = async (removeSelf = false) => {
        await delay(this.#delayTime)
        if (removeSelf) this.unqueue(item)
        if (!this.isEmpty()) this.unqueue()
        resolve()
      }

      if (this.isFirst(item)) {
        processItem(true)
      } else {
        this.once(item, processItem)
      }
    })
  }
}