const handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (!user.fragmentos) user.fragmentos = 0
  if (!user.personajes) user.personajes = []
  if (!user.invocaciones) user.invocaciones = 0
  if (!user.lastInvocacion) user.lastInvocacion = 0
  if (!user.monedas) user.monedas = 0
  if (!user.exp) user.exp = 0

  const cooldown = 5 * 60 * 1000
  const now = Date.now()

  if (now - user.lastInvocacion < cooldown) {
    const restante = cooldown - (now - user.lastInvocacion)
    const minutos = Math.floor(restante / 60000)
    const segundos = Math.floor((restante % 60000) / 1000)

    return conn.reply(
      m.chat,
      `⏳ Debes esperar *${minutos}m ${segundos}s* para volver a invocar.`,
      m
    )
  }

  const costo = 5

  if (user.fragmentos < costo) {
    return conn.reply(
      m.chat,
      `❌ *No tienes suficientes fragmentos mágicos para invocar.*\n🧩 Necesitas *${costo} fragmentos*\n📦 Fragmentos actuales: *${user.fragmentos}*`,
      m
    )
  }

  user.fragmentos -= costo
  user.lastInvocacion = now
  user.invocaciones += 1

  const comunes = [
    "Naruto 🍜",
    "Goku 🐉",
    "Luffy ☠️",
    "Ichigo 🗡️",
    "Tanjiro 🐗",
    "Saitama 👊",
    "Levi ⚔️",
    "Itachi 🌒",
    "Gojo 🌀",
    "Deku ⚡",
    "Mikasa 💥",
    "Natsu 🔥",
    "Gray ❄️",
    "Erza 🛡️",
    "Yusuke 👊",
    "Kenshin ⚔️",
    "Edward Elric ⚗️",
    "Light 💡",
    "Lelouch 👑",
    "Spike 💥"
  ]

  const elite = [
    "Giorno Giovanna 💎",
    "Jotaro Kujo 🌊",
    "Dio Brando 🧛‍♂️",
    "Asta 🌟",
    "Rimuru 💧",
    "Meliodas 🗡️",
    "Zoro 🗡️",
    "Killua ⚡",
    "Gon 🎯",
    "Kenpachi ⚔️"
  ]

  const legendarios = [
    "Cristo Rey 👑",
    "Arcángel 🕊️",
    "The Carlos 👑",
    "Rey Demonio 🔥",
    "Dios Dragón 🐉"
  ]

  const secretos = [
    "☄️ Shadow Monarch",
    "🌌 Dios del Vacío",
    "⚡ Emperador Celestial"
  ]

  const rand = Math.random()

  let personaje = ''
  let rareza = ''
  let recompensa = 0

  if (rand < 0.60) {
    personaje = comunes[Math.floor(Math.random() * comunes.length)]
    rareza = "⭐ Común"
    recompensa = 5000
  } else if (rand < 0.90) {
    personaje = elite[Math.floor(Math.random() * elite.length)]
    rareza = "🌟 Élite"
    recompensa = 15000
  } else if (rand < 0.99) {
    personaje = legendarios[Math.floor(Math.random() * legendarios.length)]
    rareza = "💎 Legendario"
    recompensa = 50000
  } else {
    personaje = secretos[Math.floor(Math.random() * secretos.length)]
    rareza = "🔥 SECRETO"
    recompensa = 150000
  }

  const yaExiste = user.personajes.includes(personaje)

  if (!yaExiste) {
    user.personajes.push(personaje)
  } else {
    recompensa *= 2
  }

  user.monedas += recompensa
  user.exp += Math.floor(recompensa / 2)

  const animacion = [
    "🧩 Canalizando fragmentos mágicos...",
    "🔮 Iniciando invocación...",
    "✨ Abriendo portal dimensional...",
    "⚡ Energía condensándose...",
    "🌌 Detectando presencia mágica...",
    "💥 ¡Invocación completada!"
  ]

  for (let texto of animacion) {
    await conn.sendMessage(
      m.chat,
      { text: texto },
      { quoted: m }
    )

    await new Promise(r => setTimeout(r, 400))
  }

  const resumen = {}

  for (let pj of user.personajes) {
    resumen[pj] = (resumen[pj] || 0) + 1
  }

  const topInventario = Object.entries(resumen)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const inventario = topInventario
    .map(([nombre, cantidad]) => `┃ ✦ ${nombre} x${cantidad}`)
    .join('\n')

  const total = user.personajes.length

  let bonus = yaExiste
    ? `\n♻️ Ya tenías este personaje.\n💰 Recompensa duplicada aplicada.`
    : `\n🆕 Nuevo personaje añadido a tu colección.`

  conn.reply(
    m.chat,
    `
   『 🔮 INVOCACIÓN MÁGICA 🔮 』

🎴 Personaje obtenido:
✧ *${personaje}*

🏷️ Rareza:
✧ ${rareza}

🧩 Fragmentos restantes:
✧ ${user.fragmentos}

💰 Recompensa:
✧ +${recompensa.toLocaleString()} monedas

✨ Experiencia:
✧ +${Math.floor(recompensa / 2).toLocaleString()} EXP

📊 Invocaciones realizadas:
✧ ${user.invocaciones}

${bonus}

╠══════════════════╣
📦 Inventario actual (${total})

${inventario}

╚═══════════════════╝
`.trim(),
    m
  )
}

handler.command = ['invocacion']
handler.help = ['invocacion']
handler.tags = ['rpg']
handler.register = true

export default handler