import got from 'got'

const stringify = obj => JSON.stringify(obj, null, 2)
const parse = str => JSON.parse(str, (_, v) => {
  if (
    v !== null &&
    typeof v === 'object' &&
    v.type === 'Buffer' &&
    Array.isArray(v.data)
  ) {
    return Buffer.from(v.data)
  }
  return v
})

class CloudDBAdapter {
  constructor(
    url,
    {
      serialize = stringify,
      deserialize = parse,
      fetchOptions = {}
    } = {}
  ) {
    if (!url) throw new Error('CloudDBAdapter necesita una URL válida')
    this.url = url
    this.serialize = serialize
    this.deserialize = deserialize
    this.client = got.extend(fetchOptions)
  }

  async read() {
    try {
      const res = await this.client(this.url, {
        method: 'GET',
        headers: { Accept: 'application/json;q=0.9,text/plain' }
      })
      if (res.statusCode !== 200) {
        throw new Error(`Error al leer: ${res.statusCode} ${res.statusMessage}`)
      }
      return this.deserialize(res.body)
    } catch (err) {
      console.error('[CloudDBAdapter:read]', err.message || err)
      return null
    }
  }

  async write(obj) {
    try {
      const res = await this.client(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: this.serialize(obj)
      })
      if (res.statusCode !== 200) {
        throw new Error(`Error al escribir: ${res.statusCode} ${res.statusMessage}`)
      }
      return res.body
    } catch (err) {
      console.error('[CloudDBAdapter:write]', err.message || err)
      throw err
    }
  }
}

export default CloudDBAdapter