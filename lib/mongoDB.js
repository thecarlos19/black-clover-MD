import mongoose from 'mongoose'

const { Schema, connect, model } = mongoose
const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
}

export class mongoDB {
  constructor(url, options = defaultOptions) {
    this.url = url
    this.options = options
    this.data = {}
    this._data = null
    this._model = null
    this._ready = null
    this._schema = new Schema({
      data: { type: Schema.Types.Mixed, required: true, default: {} }
    }, { minimize: false })
  }

  async _connect() {
    if (this._ready) return this._ready
    this._ready = (async () => {
      await connect(this.url, this.options)
      this._model = mongoose.models['data'] || model('data', this._schema)
    })()
    return this._ready
  }

  async read() {
    await this._connect()
    this._data = await this._model.findOne({}).lean(false)

    if (!this._data) {
      this._data = await this._model.create({ data: {} })
      this.data = {}
    } else {
      this.data = this._data.data || {}
    }
    return this.data
  }

  async write(data) {
    if (!data || typeof data!== 'object') throw new TypeError('Data must be an object')
    await this._connect()

    if (!this._data) {
      this._data = await this._model.create({ data })
    } else {
      this._data.data = data
      await this._data.save()
    }
    this.data = data
    return true
  }
}

export class mongoDBV2 {
  constructor(url, options = defaultOptions) {
    this.url = url
    this.options = options
    this.data = {}
    this._ready = null
    this._listModel = null
    this._collectionSchema = new Schema({ data: Array }, { minimize: false })
    this._listSchema = new Schema({ data: [{ name: String }] }, { minimize: false })
  }

  async _connect() {
    if (this._ready) return this._ready
    this._ready = (async () => {
      await connect(this.url, this.options)
      this._listModel = mongoose.models['lists'] || model('lists', this._listSchema)
    })()
    return this._ready
  }

  async read() {
    await this._connect()
    let listDoc = await this._listModel.findOne({})

    if (!listDoc) {
      listDoc = await this._listModel.create({ data: [] })
    }

    this.data = {}
    const garbage = []

    for (const { name } of listDoc.data || []) {
      if (!name || typeof name!== 'string') continue
      try {
        const coll = mongoose.models[name] || model(name, this._collectionSchema)
        const docs = await coll.find({}).lean()
        this.data[name] = Object.fromEntries(docs.map(d => d.data).filter(Array.isArray))
      } catch {
        garbage.push(name)
      }
    }

    if (garbage.length) {
      listDoc.data = listDoc.data.filter(v =>!garbage.includes(v.name))
      await listDoc.save()
    }

    return this.data
  }

  async write(data) {
    if (!data || typeof data!== 'object') throw new TypeError('Data must be an object')
    await this._connect()

    const session = await mongoose.startSession()
    try {
      await session.withTransaction(async () => {
        const listDoc = await this._listModel.findOne({}).session(session)
        if (!listDoc) throw new Error('Lists document not found')

        const listData = []

        for (const [key, value] of Object.entries(data)) {
          if (typeof value!== 'object') continue

          const coll = mongoose.models[key] || model(key, this._collectionSchema)
          await coll.deleteMany({}, { session })

          const bulkData = Object.entries(value).map(([k, v]) => ({ data: [k, v] }))
          if (bulkData.length) await coll.insertMany(bulkData, { session })

          listData.push({ name: key })
        }

        listDoc.data = listData
        await listDoc.save({ session })
      })

      this.data = data
      return true
    } finally {
      await session.endSession()
    }
  }
}