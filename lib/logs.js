let stdouts = []

/**
 * Modifica stdout para capturar todo lo que se imprime
 * @param {number} maxLength - Máximo número de entradas a almacenar
 * @returns {{ disable: () => void, isModified: boolean }}
 */
export default function captureStdout(maxLength = 200) {
  const oldWrite = process.stdout.write.bind(process.stdout)
  let isModified = true

  const disable = () => {
    isModified = false
    process.stdout.write = oldWrite
  }

  process.stdout.write = (chunk, encoding, callback) => {
    stdouts.push(Buffer.from(chunk, encoding))
    oldWrite(chunk, encoding, callback)
    if (stdouts.length > maxLength) stdouts.shift()
  }

  return { disable, get isModified() { return isModified } }
}

/**
 * Retorna true si stdout está modificado
 */
export let isModified = false

/**
 * Retorna todos los logs capturados como un Buffer
 * @returns {Buffer}
 */
export function logs() {
  return Buffer.concat(stdouts)
}