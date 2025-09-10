import mongoose from 'mongoose'

const { Schema, connect, model } = mongoose
const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true }

export class mongoDB {
  constructor(url, options = defaultOptions) {
    this.url = url
    this.options = options
    this.data = {}
    this._data = null
    this._model = null
    this.db = connect(this.url, this.options).catch(console.error)
  }

  async read() {
    await this.db
    const schema = new Schema({
      data: { type: Object, required: true, default: {} }
    })
    this._model = mongoose.models['data'] || model('data', schema)
    this._data = await this._model.findOne({})

    if (!this._data) {
      this.data = {}
      this._data = await new this._model({ data: this.data }).save()
    } else {
      this.data = this._data.data
    }
    return this.data
  }

  async write(data) {
    if (!data) throw new TypeError('Data cannot be empty')
    if (!this._data) return new this._model({ data }).save()

    this._data.data = data
    this.data = data
    return this._data.save()
  }
}

export class mongoDBV2 {
  constructor(url, options = defaultOptions) {
    this.url = url
    this.options = options
    this.models = []
    this.data = {}
    this.list = null
    this.lists = null
    this.db = connect(this.url, this.options).catch(console.error)
  }

  async read() {
    await this.db
    const schema = new Schema({ data: [{ name: String }] })
    this.list = mongoose.models['lists'] || model('lists', schema)
    this.lists = await this.list.findOne({})

    if (!this.lists || !this.lists.data) {
      await this.list.create({ data: [] })
      this.lists = await this.list.findOne({})
    }

    const garbage = []
    this.data = {}

    for (const { name } of this.lists.data) {
      let collection
      try {
        collection = mongoose.models[name] || model(name, new Schema({ data: Array }))
      } catch (e) {
        console.error(e)
        garbage.push(name)
        continue
      }

      this.models.push({ name, model: collection })
      const docs = await collection.find({})
      this.data[name] = Object.fromEntries(docs.map(d => d.data))
    }

    // limpiar colecciones basura
    if (garbage.length) {
      this.lists.data = this.lists.data.filter(v => !garbage.includes(v.name))
      await this.lists.save()
    }

    return this.data
  }

  async write(data) {
    if (!this.lists || !data) throw new TypeError('No lists or data provided')

    const listDoc = []

    for (const key of Object.keys(data)) {
      let modelObj = this.models.find(v => v.name === key)
      let doc

      if (!modelObj) {
        doc = mongoose.models[key] || model(key, new Schema({ data: Array }))
        this.models.push({ name: key, model: doc })
      } else {
        doc = modelObj.model
        await doc.deleteMany().catch(console.error)
      }

      // Insertar datos
      const bulkData = Object.entries(data[key]).map(([k, v]) => ({ data: [k, v] }))
      if (bulkData.length) await doc.insertMany(bulkData).catch(console.error)
      listDoc.push({ name: key })
    }

    // actualizar lista principal
    this.lists.data = listDoc
    await this.lists.save()
    return true
  }
}