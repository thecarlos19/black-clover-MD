import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/**
 * Subir archivo a qu.ax
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
const uploadQuAx = async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {}
  if (!ext || !mime) throw new Error('No se pudo detectar el tipo de archivo')

  const form = new FormData()
  const blob = new Blob([buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)], { type: mime })
  form.append('files[]', blob, 'tmp.' + ext)

  const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form })
  const result = await res.json()
  if (result && result.success && result.files?.length) {
    return result.files[0].url
  } else {
    throw new Error('Failed to upload the file to qu.ax')
  }
}

/**
 * Subir archivo a Telegra.ph
 * Solo soporta imágenes
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
const uploadTelegraPh = async (buffer) => {
  const { ext } = await fileTypeFromBuffer(buffer) || {}
  if (!ext || !['jpg','jpeg','png','gif'].includes(ext)) throw new Error('Telegra.ph solo soporta imágenes')

  const form = new FormData()
  const blob = new Blob([buffer], { type: 'image/' + ext })
  form.append('file', blob, 'tmp.' + ext)

  const res = await fetch('https://telegra.ph/upload', { method: 'POST', body: form })
  const result = await res.json()
  if (result?.error) throw new Error(result.error)
  return 'https://telegra.ph' + result[0].src
}

/**
 * Función principal: intenta qu.ax primero, luego Telegra.ph
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
export default async function uploadFile(buffer) {
  let lastError
  for (const uploader of [uploadQuAx, uploadTelegraPh]) {
    try {
      return await uploader(buffer)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}