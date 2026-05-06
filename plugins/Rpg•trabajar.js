const COOLDOWN = 60 * 60 * 1000 // 1 hora
const MIN_REWARD = 1000
const MAX_REWARD = 5000

const trabajos = [
  'Programador 💻',
  'Hacker 🕶️',
  'Repartidor 🚴',
  'Panadero 🥖',
  'Guerrero ⚔️',
  'Hechicero 🔮',
  'Cazador 🏹',
  'Minero ⛏️',
  'Streamer 🎥',
  'Chef 👨‍🍳',
  'Mercenario 💣',
  'Astronauta 🚀',
  'Pirata 🏴‍☠️',
  'Músico 🎸',
  'Artista 🎨',
  'Bombero 🚒',
  'Policía 👮',
  'Detective 🕵️',
  'Magistrado ⚖️',
  'Bailarín 💃',
  'Ingeniero 🏗️',
  'Escritor ✍️',
  'Fotógrafo 📸',
  'Vendedor 🛍️'
]

const eventos = [
  '📈 Tu jefe quedó impresionado con tu trabajo.',
  '💼 Completaste tareas extra y recibiste un bono.',
  '⭐ Fuiste reconocido como el mejor empleado del día.',
  '🎉 Tus clientes dejaron excelentes propinas.',
  '🔥 Trabajaste duro y aumentaste tu reputación.',
  '🚀 Tu productividad fue increíble hoy.',
  '💎 Descubriste una oportunidad secreta mientras trabajabas.',
  '⚡ Tus habilidades mejoraron con la experiencia.'
]

let handler = async (m, { conn, isPrems }) => {
  try {
    const user = global.db.data.users[m.sender]
    const now = Date.now()

    if (!user) {
      global.db.data.users[m.sender] = {}
    }

    user.lastWork = user.lastWork || 0
    user.monedas = user.monedas || 0
    user.exp = user.exp || 0
    user.level = user.level || 0

    const tiempoRestante = COOLDOWN - (now - user.lastWork)

    if (tiempoRestante > 0) {
      return conn.reply(
        m.chat,
        `⏳ *Ya trabajaste recientemente*\n\n🕐 Regresa en: *${msToTime(tiempoRestante)}*`,
        m
      )
    }

    const trabajoElegido = pickRandom(trabajos)

    let recompensa = random(MIN_REWARD, MAX_REWARD)
    let exp = random(150, 500)

    // Bonus premium
    if (isPrems) {
      recompensa += 2500
      exp += 300
    }

    // Bonus aleatorio raro
    let bonus = 0
    let eventoExtra = ''

    if (Math.random() < 0.10) {
      bonus = random(5000, 15000)
      recompensa += bonus
      eventoExtra = '\n🎁 *BONO ESPECIAL ACTIVADO*'
    }

    // Evento ultra raro
    let ultra = ''
    if (Math.random() < 0.02) {
      const ultraCoins = 100000
      recompensa += ultraCoins
      ultra = `\n\n👑 *¡EVENTO LEGENDARIO!* 👑\n💰 Encontraste un contrato secreto y ganaste *${ultraCoins.toLocaleString()} monedas* extra.`
    }

    const evento = pickRandom(eventos)

    user.monedas += recompensa
    user.exp += exp
    user.lastWork = now

    const mensaje = `
╭━━━〔 💼 𝗧𝗥𝗔𝗕𝗔𝗝𝗢 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗔𝗗𝗢 〕━━━⬣
┃ 👤 Trabajaste como:
┃ ✨ *${trabajoElegido}*
┃
┃ 💰 Ganancias:
┃ 🪙 Monedas: *+${recompensa.toLocaleString()}*
┃ ✨ Exp: *+${exp.toLocaleString()}*
┃
┃ 🌟 Premium:
┃ ${isPrems ? '✅ Bonus Premium aplicado' : '❌ Sin bonus'}
╰━━━━━━━━━━━━━━━━━━⬣

${evento}${eventoExtra}${ultra}

🕐 Puedes volver a trabajar en *1 hora*.
`.trim()

    await conn.reply(m.chat, mensaje, m)

    await conn.sendMessage(m.chat, {
      react: {
        text: '💼',
        key: m.key
      }
    })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Ocurrió un error al trabajar.', m)
  }
}

handler.help = ['trabajar', 'work', 'ganardinero']
handler.tags = ['rpg', 'economia']
handler.command = ['trabajar', 'work', 'ganardinero']
handler.register = true

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function msToTime(duration) {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}