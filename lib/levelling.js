export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75

export function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) throw new TypeError('level cannot be negative')
  if (typeof multiplier !== 'number' || multiplier <= 0) multiplier = 1

  level = Math.floor(level)
  const nextLevel = level + 1
  const baseMin = level === 0 ? 0 : Math.pow(level, growth) * multiplier
  const min = level === 0 ? 0 : Math.floor(baseMin) + 1
  const max = Math.floor(Math.pow(nextLevel, growth) * multiplier)
  return {
    min,
    max,
    xp: Math.max(0, max - min + 1)
  }
}

export function findLevel(xp, multiplier = global.multiplier || 1) {
  if (xp === Infinity) return Infinity
  if (isNaN(xp)) return NaN
  if (xp <= 0) return -1
  if (typeof multiplier !== 'number' || multiplier <= 0) multiplier = 1

  if (xp === 0) return 0
  const level = Math.floor(Math.pow(xp / multiplier, 1 / growth))
  const range = xpRange(level, multiplier)
  if (xp > range.max) return level + 1
  if (xp < range.min) return Math.max(0, level - 1)
  return level
}

export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
  if (level < 0) return false
  if (xp === Infinity) return true
  if (isNaN(xp) || xp <= 0) return false
  if (typeof multiplier !== 'number' || multiplier <= 0) multiplier = 1

  const range = xpRange(level + 1, multiplier)
  return xp >= range.min
}