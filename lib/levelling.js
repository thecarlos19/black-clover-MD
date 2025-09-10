export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75

/**
 * Calcula el rango de XP para un nivel
 * @param {number} level
 * @param {number} [multiplier=1]
 * @returns {{min:number, max:number, xp:number}}
 */
export function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) throw new TypeError('level cannot be negative')
  if (typeof multiplier !== 'number' || multiplier <= 0) multiplier = 1

  level = Math.floor(level)
  const nextLevel = level + 1
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  const max = Math.round(Math.pow(nextLevel, growth) * multiplier)
  return {
    min,
    max,
    xp: max - min
  }
}

/**
 * Encuentra el nivel basado en XP
 * @param {number} xp
 * @param {number} [multiplier=1]
 * @returns {number}
 */
export function findLevel(xp, multiplier = global.multiplier || 1) {
  if (xp === Infinity) return Infinity
  if (isNaN(xp)) return NaN
  if (xp <= 0) return -1
  if (typeof multiplier !== 'number' || multiplier <= 0) multiplier = 1

  let level = 0
  while (xpRange(level, multiplier).min <= xp) level++
  return level - 1
}

/**
 * Determina si el usuario puede subir de nivel
 * @param {number} level
 * @param {number} xp
 * @param {number} [multiplier=1]
 * @returns {boolean}
 */
export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
  if (level < 0) return false
  if (xp === Infinity) return true
  if (isNaN(xp) || xp <= 0) return false
  if (typeof multiplier !== 'number' || multiplier <= 0) multiplier = 1

  return level < findLevel(xp, multiplier)
}