const COSTO_POR_HORA = 10000

const handler = async (m, { conn, args, usedPrefix, command }) => {
  global.db.data.users = global.db.data.users || {}

  let user = global.db.data.users[m.sender]

  const now = Date.now()

  if (!user) {
    global.db.data.users[m.sender] = {
      monedas: 0,
      shieldUntil: 0
    }

    user = global.db.data.users[m.sender]
  }

  user.monedas = Number(user.monedas || 0)
  user.shieldUntil = Number(user.shieldUntil || 0)

  if (user.shieldUntil > now) {
    const tiempoRestante = msToTime(user.shieldUntil - now)

    return conn.reply(
      m.chat,
      `🛡️ Tu escudo ya está activo.\n\n⏳ Tiempo restante: *${tiempoRestante}*\n\n✨ Mientras tengas el escudo activo, tus monedas estarán protegidas contra robos.`,
      m
    )
  }

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `🛡️ *TIENDA DE ESCUDOS MÁGICOS*

💰 Costo por hora:
*${Number(COSTO_POR_HORA).toLocaleString()} monedas* 🪙

📌 Uso:
*${usedPrefix + command} <horas>*

📖 Ejemplos:
• *${usedPrefix + command} 1*
• *${usedPrefix + command} 6*
• *${usedPrefix + command} 24*

✨ El escudo protege tus monedas contra robos.`,
      m
    )
  }

  const horas = parseInt(args[0])

  if (isNaN(horas) || horas <= 0) {
    return conn.reply(
      m.chat,
      '❌ Ingresa una cantidad válida de horas.',
      m
    )
  }

  if (horas > 720) {
    return conn.reply(
      m.chat,
      '❌ No puedes comprar más de 720 horas de protección.',
      m
    )
  }

  const costo = horas * COSTO_POR_HORA

  if (user.monedas < costo) {
    return conn.reply(
      m.chat,
      `❌ No tienes suficientes monedas 🪙.\n\n💰 Necesitas *${Number(costo).toLocaleString()} monedas* para comprar *${horas} hora(s)* de escudo.`,
      m
    )
  }

  user.monedas -= costo
  user.shieldUntil = now + horas * 60 * 60 * 1000

  const tiempoTotal = msToTime(user.shieldUntil - now)

  return conn.reply(
    m.chat,
    `✅ *ESCUDO ACTIVADO*

🛡️ Protección comprada:
*${horas} hora(s)*

⏳ Duración:
*${tiempoTotal}*

💸 Monedas gastadas:
*${Number(costo).toLocaleString()} 🪙*

💰 Balance restante:
*${Number(user.monedas).toLocaleString()} 🪙*

✨ Ahora tus monedas estarán protegidas contra robos.`,
    m
  )
}

handler.help = ['escudo <horas>']
handler.tags = ['rpg']
handler.command = ['escudo', 'comprar-escudo']
handler.register = true
handler.fail = null

export default handler

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days} Día(s) ${hours} Hora(s)`
  }

  if (hours > 0) {
    return `${hours} Hora(s) ${minutes} Minuto(s)`
  }

  return `${minutes} Minuto(s) ${seconds} Segundo(s)`
}