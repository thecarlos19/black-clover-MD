import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/**
 * Subir archivo efímero a file.io
 * Expira en 1 día, 100MB max
 * @param {Buffer} buffer 
 * @returns {Promise<string>} URL del archivo subido
 */
const fileIO = async buffer => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {}
  if (!ext || !mime) throw new Error('No se pudo detectar el tipo de archivo')

  const form = new FormData()
  const blob = new Blob([buffer.toString('binary')], { type: mime })
  form.append('file', blob, 'tmp.' + ext)

  const res = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form
  })
  const json = await res.json()
  if (!json.success) throw new Error(JSON.stringify(json))
  return json.link
}

/**
 * Subir archivo a storage.restfulapi.my.id
 * @param {Buffer|ReadableStream|(Buffer|ReadableStream)[]} inp 
 * @returns {Promise<string|string[]>} URL o array de URLs
 */
const RESTfulAPI = async inp => {
  const form = new FormData()
  const buffers = Array.isArray(inp) ? inp : [inp]

  for (let buffer of buffers) {
    const blob = new Blob([buffer instanceof Buffer ? buffer : Buffer.from(buffer)], { type: 'application/octet-stream' })
    form.append('file', blob)
  }

  const res = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form
  })

  let json = await res.text()
  try {
    json = JSON.parse(json)
    if (!Array.isArray(inp)) return json.files[0].url
    return json.files.map(f => f.url)
  } catch (e) {
    throw new Error('Error parseando respuesta de RESTfulAPI: ' + json)
  }
}

/**
 * Intenta subir usando RESTfulAPI primero, luego fileIO
 * @param {Buffer} inp 
 * @returns {Promise<string>}
 */
export default async function uploadFile(inp) {
  let lastErr
  for (let upload of [RESTfulAPI, fileIO]) {
    try {
      return await upload(inp)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}