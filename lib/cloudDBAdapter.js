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
      const res = await this.client.get(this.url, {
        headers: { Accept: 'application/json;q=0.9,text/plain' },
        responseType: 'text'
      })
      return this.deserialize(res.body)
    } catch (err) {
      console.error('[CloudDBAdapter:read]', err.message || err)
      return null
    }
  }

  async write(obj) {
    try {
      const res = await this.client.post(this.url, {
        headers: { 'Content-Type': 'application/json' },
        body: this.serialize(obj)
      })
      return res.body
    } catch (err) {
      console.error('[CloudDBAdapter:write]', err.message || err)
      throw err
    }
  }
}

export default CloudDBAdapter