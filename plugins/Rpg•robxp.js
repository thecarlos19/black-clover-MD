const ROBO_MAXIMO = 3000
const COOLDOWN = 2 * 60 * 60 * 1000

const frases = [
  '🥷 Robaste XP sin ser detectado.',
  '⚡ Ataque rápido y preciso.',
  '🕶️ Nadie notó el robo de experiencia.',
  '💀 Absorbiste energía mágica del enemigo.',
  '🔥 El grimorio oscuro funcionó perfectamente.',
  '🪄 Tomaste parte del poder mágico rival.',
  '👁️‍🗨️ Tu robo fue completamente silencioso.',
  '🧬 Has drenado experiencia exitosamente.',
  '🎯 Robo de XP completado.',
  '🏴‍☠️ Como un verdadero ladrón mágico.'
]

const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const now = Date.now()

  if (!user) return m.reply('❌ Usuario no encontrado.')

  if (!user.lastrob) user.lastrob = 0
  if (!user.exp) user.exp = 0

  if (now - user.lastrob < COOLDOWN) {
    const restante = msToTime(COOLDOWN - (now - user.lastrob))
    return conn.reply(
      m.chat,
      `⏳ Ya realizaste un robo recientemente.\n🕐 Debes esperar: *${restante}*`,
      m
    )
  }

  let target

  if (m.isGroup) {
    target = m.mentionedJid?.[0]
      ? m.mentionedJid[0]
      : m.quoted
        ? m.quoted.sender
        : false
  } else {
    target = m.chat
  }

  if (!target) {
    return conn.reply(
      m.chat,
      '⚠️ Debes mencionar o responder al mensaje de un usuario.',
      m
    )
  }

  if (target === m.sender) {
    return conn.reply(
      m.chat,
      '🚫 No puedes robarte experiencia a ti mismo.',
      m
    )
  }

  if (!(target in global.db.data.users)) {
    return conn.reply(
      m.chat,
      '❌ El usuario no está registrado en la base de datos.',
      m
    )
  }

  const victim = global.db.data.users[target]

  if (!victim.exp) victim.exp = 0

  if (victim.exp < ROBO_MAXIMO) {
    return conn.reply(
      m.chat,
      `😔 @${target.split('@')[0]} tiene menos de *${ROBO_MAXIMO.toLocaleString()} XP*.\nNo robes a alguien tan débil.`,
      m,
      { mentions: [target] }
    )
  }

  let xpRobada

  const roboLegendario = Math.random() < 0.02

  if (roboLegendario) {
    xpRobada = Math.floor(victim.exp * 0.5)
  } else {
    xpRobada = Math.floor(Math.random() * ROBO_MAXIMO) + 500
  }

  if (xpRobada > victim.exp) xpRobada = victim.exp

  user.exp += xpRobada
  victim.exp -= xpRobada
  user.lastrob = now

  const frase = frases[Math.floor(Math.random() * frases.length)]

  let mensaje = `
🥷 *ROBO DE EXPERIENCIA COMPLETADO*

${frase}

🧪 XP robada: *${xpRobada.toLocaleString()}*
👤 Víctima: @${target.split('@')[0]}

📈 Tu XP actual: *${user.exp.toLocaleString()}*
`.trim()

  if (roboLegendario) {
    mensaje += `

👑 *¡¡¡ROBO LEGENDARIO ACTIVADO!!!*
💥 Has drenado el *50%* de la experiencia del enemigo.`
  }

  await conn.reply(
    m.chat,
    mensaje,
    m,
    { mentions: [target] }
  )

  await conn.sendMessage(m.chat, {
    react: {
      text: '🥷',
      key: m.key
    }
  })
}

handler.help = ['robar @user', 'rob @user']
handler.tags = ['rpg']
handler.command = ['robar', 'rob']
handler.register = true

export default handler

function msToTime(duration) {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${hours} Hora(s) ${minutes} Minuto(s) ${seconds} Segundo(s)`
}