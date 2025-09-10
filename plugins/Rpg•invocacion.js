const handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  // Inicializar si no existe
  if (!user.fragmentos) user.fragmentos = 0
  if (!user.personajes) user.personajes = []

  const costo = 5
  if (user.fragmentos < costo) {
    return conn.reply(m.chat, `❌ *No tienes suficientes fragmentos mágicos para invocar.*\n🧩 Necesitas *${costo} fragmentos*\n📦 Fragmentos actuales: *${user.fragmentos}*`, m)
  }

  user.fragmentos -= costo

  const comunes = [
    "Naruto 🍜", "Goku 🐉", "Luffy ☠️", "Ichigo 🗡️", "Tanjiro 🐗", "Saitama 👊", "Levi ⚔️", "Itachi 🌒", "Gojo 🌀",
    "Deku ⚡", "Mikasa 💥", "Natsu 🔥", "Gray ❄️", "Erza 🛡️", "Yusuke 👊", "Kenshin ⚔️", "Edward Elric ⚗️",
    "Light 💡", "Lelouch 👑", "Spike 💥"
  ]

  const elite = [
    "Giorno Giovanna 💎", "Jotaro Kujo 🌊", "Dio Brando 🧛‍♂️", "Asta 🌟", "Rimuru 💧", "Meliodas 🗡️",
    "Zoro 🗡️", "Killua ⚡", "Gon 🎯", "Kenpachi ⚔️"
  ]

  const top = ["Cristo Rey 👑", "Arcángel 🕊️", "The Carlos 👑"]

  const rand = Math.random()
  let personaje, rareza

  if (rand < 0.5) {
    personaje = comunes[Math.floor(Math.random() * comunes.length)]
    rareza = "⭐ Común"
  } else if (rand < 0.9) {
    personaje = elite[Math.floor(Math.random() * elite.length)]
    rareza = "🌟 Élite"
  } else {
    personaje = top[Math.floor(Math.random() * top.length)]
    rareza = "💎 ULTRA RARO"
  }

  user.personajes.push(personaje)

  // Animación estilo consola
  const animacion = [
    "🧩 Canalizando fragmentos mágicos...",
    "🔮 Iniciando invocación...",
    "✨ Abriendo portal dimensional...",
    "⚡️ Energía condensándose...",
    "💥 ¡Invocación completada!"
  ]

  for (let texto of animacion) {
    await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
    await new Promise(r => setTimeout(r, 300))
  }

  // Resumen de inventario
  const resumen = {}
  for (let pj of user.personajes) {
    resumen[pj] = (resumen[pj] || 0) + 1
  }

  const inventario = Object.entries(resumen)
    .map(([nombre, cantidad]) => `- ${nombre} x${cantidad}`)
    .join("\n")

  const total = user.personajes.length

  conn.reply(m.chat, `
🎴 *Personaje obtenido:* ${personaje}
🏷️ Rareza: ${rareza}
🧩 Fragmentos restantes: *${user.fragmentos}*

📦 *Inventario actual (${total}):*
${inventario}
`.trim(), m)
}

handler.command = ['invocacion']
handler.help = ['invocacion']
handler.tags = ['rpg']
handler.register = true

export default handler