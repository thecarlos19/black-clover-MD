const COOLDOWN = 2 * 60 * 60 * 1000
const MIN_ROB = 2000
const MAX_ROB = 50000

const frases = [
  "💰 Te llevaste un buen botín de @TARGET.",
  "🪙 Robaste monedas con sigilo a @TARGET.",
  "🚀 ¡Éxito total! @TARGET ni se dio cuenta.",
  "🏴‍☠️ Como un verdadero pirata, robaste a @TARGET.",
  "🎯 Acertaste justo en el bolsillo de @TARGET.",
  "🕵️‍♂️ Sigilosamente tomaste monedas de @TARGET.",
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

const fails = [
  "🚨 @TARGET te atrapó intentando robar.",
  "💥 Fallaste el robo y escapaste corriendo.",
  "👮‍♂️ La guardia mágica casi te captura.",
  "⚠️ Tu plan salió mal y perdiste monedas.",
  "😵 Tropezaste mientras robabas a @TARGET.",
  "🪤 Caíste en una trampa mágica.",
  "☠️ @TARGET protegió su tesoro correctamente."
]

const handler = async (m, { conn }) => {
  let userData = global.db.data.users[m.sender]

  if (!userData) {
    global.db.data.users[m.sender] = {}
    userData = global.db.data.users[m.sender]
  }

  if (!userData.monedas) userData.monedas = 0
  if (!userData.exp) userData.exp = 0
  if (!userData.lastrob2) userData.lastrob2 = 0

  const now = Date.now()

  if (now - userData.lastrob2 < COOLDOWN) {
    const timeLeft = msToTime(COOLDOWN - (now - userData.lastrob2))

    return conn.reply(
      m.chat,
      `🚩 *ROBO EN ENFRIAMIENTO*

⏳ Debes esperar:
🕒 *${timeLeft}*

💰 Planea mejor tu próximo robo.`,
      m
    )
  }

  let target

  if (m.isGroup) {
    target = m.mentionedJid?.[0]
      ? m.mentionedJid[0]
      : m.quoted?.sender
  } else {
    target = m.chat
  }

  if (!target) {
    return conn.reply(
      m.chat,
      `🚩 Debes mencionar o responder a alguien para robar.`,
      m
    )
  }

  if (!(target in global.db.data.users)) {
    return conn.reply(
      m.chat,
      `🚩 El usuario no está registrado en la base de datos.`,
      m
    )
  }

  if (target === m.sender) {
    return conn.reply(
      m.chat,
      `🚩 No puedes robarte a ti mismo.`,
      m
    )
  }

  const targetData = global.db.data.users[target]

  if (!targetData.monedas) targetData.monedas = 0
  if (!targetData.exp) targetData.exp = 0

  if (targetData.shieldUntil && targetData.shieldUntil > now) {
    return conn.reply(
      m.chat,
      `🛡️ @${target.split('@')[0]} tiene un escudo mágico activo.

❌ No puedes robarle por ahora.`,
      m,
      { mentions: [target] }
    )
  }

  if (targetData.monedas < MIN_ROB) {
    return conn.reply(
      m.chat,
      `😔 @${target.split("@")[0]} tiene menos de *${MIN_ROB.toLocaleString()} monedas* 🪙.

🚫 No robes a alguien pobre.`,
      m,
      { mentions: [target] }
    )
  }

  const probabilidadFallo = 0.30

  if (Math.random() < probabilidadFallo) {
    const perdida = Math.floor(Math.random() * 10000) + 1000

    userData.monedas = Math.max(0, userData.monedas - perdida)
    userData.lastrob2 = now

    const failText = fails[Math.floor(Math.random() * fails.length)]
      .replace("@TARGET", `@${target.split("@")[0]}`)

    return conn.reply(
      m.chat,
      `${failText}

💸 Perdiste:
*${perdida.toLocaleString()} monedas* 🪙`,
      m,
      { mentions: [target] }
    )
  }

  let robbedAmount

  if (Math.random() < 0.01) {
    robbedAmount = targetData.monedas
  } else {
    robbedAmount = Math.floor(
      Math.random() * (MAX_ROB - MIN_ROB + 1)
    ) + MIN_ROB

    if (robbedAmount > targetData.monedas) {
      robbedAmount = targetData.monedas
    }
  }

  const bonus = Math.random() < 0.10
  let expGanada = Math.floor(Math.random() * 500) + 100

  if (bonus) {
    robbedAmount *= 2
    expGanada += 1000
  }

  userData.monedas += robbedAmount
  targetData.monedas -= robbedAmount
  userData.exp += expGanada
  userData.lastrob2 = now

  const frase = frases[
    Math.floor(Math.random() * frases.length)
  ].replace("@TARGET", `@${target.split("@")[0]}`)

  let mensaje = `
${frase}

╭━━━━━━━━━━━━⬣
┃ 💰 Robaste:
┃ *${robbedAmount.toLocaleString()} monedas* 🪙
┃
┃ ✨ Experiencia:
┃ *+${expGanada} XP*
╰━━━━━━━━━━━━⬣
`.trim()

  if (bonus) {
    mensaje += `

🎰 *¡ROBO LEGENDARIO!*
🔥 El botín fue duplicado automáticamente.`
  }

  if (Math.random() < 0.05) {
    const extra = Math.floor(Math.random() * 50000) + 10000

    userData.monedas += extra

    mensaje += `

👑 *BONO DEL REY MAGO*
🪙 Ganaste *${extra.toLocaleString()} monedas* extra.`
  }

  return conn.reply(
    m.chat,
    mensaje,
    m,
    { mentions: [target] }
  )
}

handler.help = ['robar2 @tag']
handler.tags = ['rpg']
handler.command = ['robar2', 'rob2']
handler.register = true

export default handler

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor(duration / (1000 * 60 * 60))

  return `${hours} Hora(s) ${minutes} Minuto(s) ${seconds} Segundo(s)`
}