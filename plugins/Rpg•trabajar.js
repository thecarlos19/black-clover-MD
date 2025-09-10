const COOLDOWN = 60 * 60 * 1000 // 1 hora
const MIN_REWARD = 1000
const MAX_REWARD = 5000

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const now = Date.now()

  if (!user.lastWork) user.lastWork = 0

  const tiempoRestante = COOLDOWN - (now - user.lastWork)

  if (tiempoRestante > 0) {
    let time = msToTime(tiempoRestante)
    return conn.reply(m.chat, `⏳ Ya trabajaste recientemente. Vuelve en *${time}* para ganar más monedas.`, m)
  }

  const trabajos = [
    'Programador 💻', 'Hacker 🕶️', 'Repartidor 🚴', 'Panadero 🥖',
    'Guerrero ⚔️', 'Hechicero 🔮', 'Cazador 🏹', 'Minero ⛏️',
    'Streamer 🎥', 'Chef 👨‍🍳', 'Mercenario 💣', 'Astronauta 🚀',
    'Pirata 🏴‍☠️', 'Músico 🎸', 'Artista 🎨', 'Bombero 🚒',
    'Policía 👮', 'Detective 🕵️', 'Magistrado ⚖️', 'Bailarín 💃',
    'Ingeniero 🏗️', 'Escritor ✍️', 'Fotógrafo 📸', 'Vendedor 🛍️'
  ]
  const trabajoElegido = trabajos[Math.floor(Math.random() * trabajos.length)]
  const recompensa = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD

  user.monedas = (user.monedas || 0) + recompensa
  user.lastWork = now

  return conn.reply(m.chat, `✅ *Has trabajado como ${trabajoElegido}* y ganaste *${recompensa.toLocaleString()} monedas 🪙*.\n💼 ¡Vuelve en 1 hora para seguir trabajando!`, m)
}

handler.help = ['trabajar', 'work']
handler.tags = ['rpg', 'economia']
handler.command = ['trabajar', 'work', 'ganardinero']
handler.register = true

export default handler

function msToTime(duration) {
  const minutes = Math.floor((duration / 1000 / 60) % 60)
  const hours = Math.floor((duration / 1000 / 60 / 60) % 24)
  return `${hours}h ${minutes}m`
}