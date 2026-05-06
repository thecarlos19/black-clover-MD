const handler = async (m, { conn }) => {
  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = {}
  }

  const user = global.db.data.users[m.sender]

  user.monedas = Number(user.monedas || 0)
  user.exp = Number(user.exp || 0)
  user.level = Number(user.level || 0)
  user.fragmentos = Number(user.fragmentos || 0)
  user.diamond = Number(user.diamond || 0)
  user.personajes = user.personajes || []

  const monedas = user.monedas
  const xp = user.exp
  const nivel = user.level
  const fragmentos = user.fragmentos
  const diamantes = user.diamond
  const personajes = user.personajes.length

  function obtenerRango(level) {
    if (level >= 100) return '👑 Rey Mago'
    if (level >= 80) return '⚜️ Emperador Arcano'
    if (level >= 60) return '🛡️ Capitán Supremo'
    if (level >= 40) return '🔮 Gran Hechicero'
    if (level >= 25) return '⚔️ Caballero Mágico'
    if (level >= 15) return '✨ Mago Avanzado'
    if (level >= 5) return '📘 Aprendiz'
    return '🌱 Novato'
  }

  function barra(valor, max, tamaño = 10) {
    const progreso = Math.min(valor / max, 1)
    const llenos = Math.round(progreso * tamaño)
    const vacios = tamaño - llenos
    return '█'.repeat(llenos) + '░'.repeat(vacios)
  }

  const xpActual = xp % 1000
  const xpNecesaria = 1000

  const barraXp = barra(xpActual, xpNecesaria)

  const rango = obtenerRango(nivel)

  const mensaje = `
╔══════════════════════╗
      📊 PERFIL RPG 📊
╚══════════════════════╝

👤 Usuario:
➤ @${m.sender.split('@')[0]}

━━━━━━━━━━━━━━━━━━

🪙 Monedas:
➤ ${monedas.toLocaleString()}

✨ Experiencia:
➤ ${xp.toLocaleString()}

📈 Nivel:
➤ ${nivel.toLocaleString()}

🎖️ Rango:
➤ ${rango}

💎 Diamantes:
➤ ${diamantes.toLocaleString()}

🧩 Fragmentos:
➤ ${fragmentos.toLocaleString()}

🎴 Personajes:
➤ ${personajes}

━━━━━━━━━━━━━━━━━━

📚 Progreso de nivel

${barraXp}

➤ ${xpActual}/${xpNecesaria} XP

━━━━━━━━━━━━━━━━━━

🌟 Sigue avanzando para desbloquear
nuevos rangos y recompensas.
`.trim()

  return conn.sendMessage(
    m.chat,
    {
      text: mensaje,
      mentions: [m.sender]
    },
    { quoted: m }
  )
}

handler.help = ['miestatus', 'mimonedas', 'miexp', 'perfil']
handler.tags = ['rpg', 'economia']
handler.command = ['miestatus', 'mismonedas', 'miexp', 'perfil']
handler.register = true

export default handler