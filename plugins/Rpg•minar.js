//código creado x The Carlos 👑 
let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const cooldown = 10 * 60 * 1000
  const now = Date.now()

  if (!user.health) user.health = 100
  if (!user.monedas) user.monedas = 0
  if (!user.exp) user.exp = 0

  if (user.lastmiming && now - user.lastmiming < cooldown) {
    const timeLeft = msToTime(cooldown - (now - user.lastmiming))
    return conn.reply(m.chat, `⛏️ *Minería en enfriamiento*\n⏳ Vuelve en: *${timeLeft}*`, m)
  }

  if (user.health < 50) return conn.reply(m.chat, '💢 Estás muy débil para minar. Recupera energía primero.', m)

  let monedasGanadas = 500
  let expGanada = pickRandom([200, 300, 400, 500, 600])
  const encontroTesoro = Math.random() < 0.02
  let mensajeExtra = ''

  if (encontroTesoro) {
    monedasGanadas += 1000000
    mensajeExtra = '\n👑 *¡Encontraste el TESORO DEL REY MAGO!* 💰\n*+1,000,000* monedas extra'
  }

  user.monedas += monedasGanadas
  user.exp += expGanada
  user.health -= 50
  user.lastmiming = now

  let msg = `
⛏️ *MINA ACTIVADA*

⚠️ Excavación completada:
💰 Monedas: *+${monedasGanadas.toLocaleString()} 🪙*
✨ Experiencia: *+${expGanada}*

❤️ Energía: -50 HP
📅 Tiempo de espera: *10 minutos*
${mensajeExtra}
`.trim()

  await conn.reply(m.chat, msg, m)
  await conn.sendMessage(m.chat, { react: { text: '⛏️', key: m.key } })

  if (encontroTesoro) {
    setTimeout(() => {
      conn.reply(m.chat, '💎 *Escaneando el terreno...*', m)
    }, 1500)

    setTimeout(() => {
      conn.reply(m.chat, '✨ *Un brillo dorado aparece bajo la tierra...*', m)
    }, 3000)

    setTimeout(() => {
      conn.reply(m.chat, '👑 *¡HAS DESENTERRADO EL TESORO DEL REY MAGO!* 💰\n\n¡Ganas *1,000,000* monedas extra! 🪙', m)
    }, 5000)
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