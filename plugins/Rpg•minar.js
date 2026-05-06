//código creado x The Carlos 👑 

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]

  if (!user) {
    global.db.data.users[m.sender] = {}
  }

  if (!user.health) user.health = 100
  if (!user.monedas) user.monedas = 0
  if (!user.exp) user.exp = 0
  if (!user.lastmiming) user.lastmiming = 0
  if (!user.diamond) user.diamond = 0
  if (!user.level) user.level = 0

  const cooldown = 10 * 60 * 1000
  const now = Date.now()

  if (now - user.lastmiming < cooldown) {
    const timeLeft = msToTime(cooldown - (now - user.lastmiming))

    return conn.reply(
      m.chat,
      `⛏️ *MINERÍA EN ENFRIAMIENTO* ⛏️

⏳ Debes esperar:
🕒 *${timeLeft}*

💡 Usa este tiempo para recuperar energía.`,
      m
    )
  }

  if (user.health < 50) {
    return conn.reply(
      m.chat,
      `💢 *ENERGÍA INSUFICIENTE*

❤️ Salud actual: *${user.health} HP*

🍖 Necesitas recuperarte antes de volver a minar.`,
      m
    )
  }

  const minerales = [
    '🪨 Piedra común',
    '⛓️ Hierro',
    '🥈 Plata',
    '🥇 Oro',
    '💎 Diamante',
    '🔥 Rubí',
    '🌌 Mineral Cósmico',
    '⚡ Cristal Energético',
    '☢️ Uranio',
    '🧿 Obsidiana'
  ]

  const mineral = minerales[Math.floor(Math.random() * minerales.length)]

  let monedasGanadas = Math.floor(Math.random() * 5000) + 1000
  let expGanada = pickRandom([200, 300, 400, 500, 600, 700, 800])
  let diamantes = Math.random() < 0.15 ? pickRandom([1, 2, 3]) : 0

  const encontroTesoro = Math.random() < 0.02
  const encontroReliquia = Math.random() < 0.01

  let mensajeExtra = ''

  if (encontroTesoro) {
    monedasGanadas += 1000000
    mensajeExtra += `

👑 *¡ENCONTRASTE EL TESORO DEL REY MAGO!*
💰 *+1,000,000 monedas*`
  }

  if (encontroReliquia) {
    expGanada += 5000
    diamantes += 10
    mensajeExtra += `

🔮 *¡DESCUBRISTE UNA RELIQUIA ANTIGUA!*
✨ *+5,000 EXP*
💎 *+10 Diamantes*`
  }

  user.monedas += monedasGanadas
  user.exp += expGanada
  user.diamond += diamantes
  user.health -= 50
  user.lastmiming = now

  if (user.health < 0) user.health = 0

  if (user.exp >= (user.level + 1) * 1000) {
    user.level += 1

    await conn.reply(
      m.chat,
      `🎉 *¡SUBISTE DE NIVEL!* 🎉

🔝 Nuevo nivel: *${user.level}*`,
      m
    )
  }

  let texto = `
⛏️ *MINA ACTIVADA* ⛏️

🪨 Mineral encontrado:
${mineral}

╭━━━━━━━━━━━━⬣
┃ 💰 Monedas: *+${monedasGanadas.toLocaleString()} 🪙*
┃ ✨ Experiencia: *+${expGanada}*
┃ 💎 Diamantes: *+${diamantes}*
┃ ❤️ Energía restante: *${user.health} HP*
╰━━━━━━━━━━━━⬣

🕒 Próxima minería en:
⏳ *10 minutos*
${mensajeExtra}
`.trim()

  await conn.reply(m.chat, texto, m)

  await conn.sendMessage(
    m.chat,
    {
      react: {
        text: '⛏️',
        key: m.key
      }
    }
  )

  if (encontroTesoro) {
    setTimeout(async () => {
      await conn.reply(
        m.chat,
        '💎 *Escaneando el terreno...*',
        m
      )
    }, 1500)

    setTimeout(async () => {
      await conn.reply(
        m.chat,
        '✨ *Un brillo dorado aparece bajo la tierra...*',
        m
      )
    }, 3000)

    setTimeout(async () => {
      await conn.reply(
        m.chat,
        `👑 *¡HAS DESENTERRADO EL TESORO DEL REY MAGO!* 💰

🪙 Recompensa:
*+1,000,000 monedas*`,
        m
      )
    }, 5000)
  }

  if (encontroReliquia) {
    setTimeout(async () => {
      await conn.reply(
        m.chat,
        `🔮 *La reliquia emite una energía ancestral...*

✨ Tu poder mágico ha aumentado.`,
        m
      )
    }, 4000)
  }
}

handler.help = ['minar']
handler.tags = ['rpg']
handler.command = ['minar']
handler.register = true

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)

  return `${h}h ${m}m ${s}s`
}