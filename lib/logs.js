const activeCaptures = new Set()

export default function captureStdout(maxLength = 200) {
  if (maxLength < 1) maxLength = 1
  const stdouts = []
  const oldWrite = process.stdout.write.bind(process.stdout)
  let isActive = true

  const writeWrapper = function(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding
      encoding = 'utf8'
    }
    
    try {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), encoding)
      stdouts.push(buf)
      if (stdouts.length > maxLength) stdouts.shift()
    } catch {}
    
    return oldWrite(chunk, encoding, callback)
  }

  const disable = () => {
    if (!isActive) return
    isActive = false
    process.stdout.write = oldWrite
    activeCaptures.delete(writeWrapper)
  }

  process.stdout.write = writeWrapper
  activeCaptures.add(writeWrapper)

  return {
    disable,
    get isModified() { return isActive },
    logs() {
      return Buffer.concat(stdouts)
    },
    clear() {
      stdouts.length = 0
    }
  }
}

export function logs() {
  const all = []
  for (const capture of activeCaptures) {
    try {
      all.push(capture.logs())
    } catch {}
  }
  return Buffer.concat(all)
}

export function isModified() {
  return activeCaptures.size > 0
}