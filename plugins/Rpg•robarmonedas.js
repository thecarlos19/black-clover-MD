const COOLDOWN = 2 * 60 * 60 * 1000
const MIN_ROB = 2000
const MAX_ROB = 50000

const frases = [
  "💰 Te llevaste un buen botín de @TARGET.",
  "🪙 Robaste monedas con sigilo a @TARGET.",
  "🚀 Éxito total! @TARGET ni se dio cuenta.",
  "🏴‍☠️ Como un verdadero pirata, robaste a @TARGET.",
  "🎯 Acertaste justo en el bolsillo de @TARGET.",
  "🕵️‍♂️ Sigiloso, tomaste monedas de @TARGET.",
  "🔥 Robaste rápido antes de que @TARGET reaccionara.",
  "💸 Monedas volando a tu bolsillo desde @TARGET.",
  "⚡ Robo relámpago completado sobre @TARGET.",
  "🎉 Fortuna momentánea obtenida de @TARGET.",
  "👀 Nadie vio cómo robaste a @TARGET.",
  "💎 Tomaste valiosas monedas de @TARGET.",
  "🥷 Hábilmente robaste a @TARGET sin dejar rastro.",
  "🏹 Tu robo a @TARGET fue impecable.",
  "🛡️ Robaste monedas mientras @TARGET estaba distraído."
]

const handler = async (m, { conn }) => {
  const userData = global.db.data.users[m.sender]
  const now = Date.now()

  if (userData.lastrob2 && now - userData.lastrob2 < COOLDOWN) {
    const timeLeft = msToTime(COOLDOWN - (now - userData.lastrob2))
    return conn.reply(m.chat, `🚩 Espera ${timeLeft} para volver a robar.`, m)
  }

  let target
  if (m.isGroup) {
    target = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted?.sender
  } else {
    target = m.chat
  }

  if (!target) return conn.reply(m.chat, `🚩 Debes mencionar a alguien para robar.`, m)
  if (!(target in global.db.data.users)) return conn.reply(m.chat, `🚩 El usuario no está registrado en la base de datos.`, m)
  if (target === m.sender) return conn.reply(m.chat, `🚩 No puedes robarte a ti mismo.`, m)

  const targetData = global.db.data.users[target]

  if (!targetData.monedas || targetData.monedas < MIN_ROB) {
    return conn.reply(m.chat, `😔 @${target.split("@")[0]} tiene menos de ${MIN_ROB} monedas 🪙, no robes a alguien pobre.`, m, { mentions: [target] })
  }

  let robbedAmount
  if (Math.random() < 0.01) {
    robbedAmount = targetData.monedas
  } else {
    robbedAmount = Math.floor(Math.random() * (MAX_ROB - MIN_ROB + 1)) + MIN_ROB
    if (robbedAmount > targetData.monedas) robbedAmount = targetData.monedas
  }

  userData.monedas = (userData.monedas || 0) + robbedAmount
  targetData.monedas -= robbedAmount
  userData.lastrob2 = now

  const frase = frases[Math.floor(Math.random() * frases.length)].replace("@TARGET", `@${target.split("@")[0]}`)
  return conn.reply(m.chat, `${frase}\n🚩 Robaste *${robbedAmount}* monedas 🪙.`, m, { mentions: [target] })
}

handler.help = ['rob2']
handler.tags = ['rpg']
handler.command = ['robar2', 'rob2']
export default handler

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor(duration / (1000 * 60 * 60))
  return `${hours} Hora(s) ${minutes} Minuto(s) ${seconds} Segundo(s)`
}