const handler = async (m, { conn, usedPrefix, participants }) => {
  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = {}
  }

  const user = global.db.data.users[m.sender]

  user.monedas = Number(user.monedas || 0)
  user.exp = Number(user.exp || 0)
  user.level = Number(user.level || 0)
  user.fragmentos = Number(user.fragmentos || 0)
  user.personajes = user.personajes || []
  user.health = Number(user.health || 100)
  user.mp = Number(user.mp || 100)
  user.atq = Number(user.atq || 50)
  user.def = Number(user.def || 50)
  user.bank = Number(user.bank || 0)

  const monedas = user.monedas
  const xp = user.exp
  const nivel = user.level
  const fragmentos = user.fragmentos
  const personajes = user.personajes.length
  const vida = user.health
  const mana = user.mp
  const ataque = user.atq
  const defensa = user.def
  const banco = user.bank

  function obtenerRango(level) {
    if (level >= 200) return '🔱 Dios Arcano'
    if (level >= 150) return '👑 Rey Mago'
    if (level >= 100) return '⚜️ Emperador Arcano'
    if (level >= 80) return '🛡️ Capitán Supremo'
    if (level >= 60) return '🔮 Gran Hechicero'
    if (level >= 40) return '⚔️ Caballero Mágico'
    if (level >= 25) return '✨ Mago Avanzado'
    if (level >= 10) return '📘 Aprendiz'
    return '🌱 Novato'
  }

  function barra(valor, max, tamaño = 12, icono = '█') {
    const progreso = Math.min(valor / max, 1)
    const llenos = Math.round(progreso * tamaño)
    const vacios = tamaño - llenos
    return icono.repeat(llenos) + '░'.repeat(vacios)
  }

  function xpParaSiguiente(level) {
    return 1000 + (level * 100)
  }

  const xpNecesaria = xpParaSiguiente(nivel)
  const xpActual = xp
  const porcentaje = ((xpActual / xpNecesaria) * 100).toFixed(1)

  const barraXp = barra(xpActual, xpNecesaria, 12, '🟩')
  const barraVida = barra(vida, 100, 10, '❤️')
  const barraMana = barra(mana, 100, 10, '💙')

  const rango = obtenerRango(nivel)
  const totalRiqueza = monedas + banco

  const rank = Object.entries(global.db.data.users)
  .sort((a, b) => b[1].level - a[1].level)
  .findIndex(([id]) => id === m.sender) + 1

  let texto = `╔═════════╗\n`
  texto += ` 📊 PERFIL RPG 📊\n`
  texto += ` ╚══════════╝\n\n`
  texto += `👤 *Usuario:*\n`
  texto += `➤ @${m.sender.split('@')[0]}\n`
  texto += `➤ Rango: ${rango}\n`
  texto += `➤ Top: #${rank}\n\n`
  texto += `━━━━━━━━━━━━━━━━━━\n\n`
  texto += `💰 *ECONOMÍA*\n`
  texto += `➤ Monedas: ${monedas.toLocaleString()}\n`
  texto += `➤ Banco: ${banco.toLocaleString()}\n`
  texto += `➤ Total: ${totalRiqueza.toLocaleString()}\n\n`
  texto += `━━━━━━━━━━━━━━━━━━\n\n`
  texto += `⚔️ *STATS COMBATE*\n`
  texto += `➤ Nivel: ${nivel}\n`
  texto += `➤ Vida: ${vida}/100\n${barraVida}\n`
  texto += `➤ Mana: ${mana}/100\n${barraMana}\n`
  texto += `➤ Ataque: ${ataque}\n`
  texto += `➤ Defensa: ${defensa}\n\n`
  texto += `━━━━━━━━━━━━━━━━━━\n\n`
  texto += `🎴 *COLECCIÓN*\n`
  texto += `➤ Personajes: ${personajes}\n`
  texto += `➤ Fragmentos: ${fragmentos.toLocaleString()}\n\n`
  texto += `━━━━━━━━━━━━━━━━━━\n\n`
  texto += `📚 *PROGRESO*\n`
  texto += `${barraXp}\n`
  texto += `➤ ${xpActual.toLocaleString()}/${xpNecesaria.toLocaleString()} XP (${porcentaje}%)\n\n`
  texto += `━━━━━━━━━━━━━━━━━━\n\n`
  texto += `🌟 Sigue avanzando para desbloquear\n`
  texto += `nuevos rangos y recompensas.`

  const buttons = [
    { buttonId: `${usedPrefix}inventario`, buttonText: { displayText: '🎒 Inventario' }, type: 1 },
    { buttonId: `${usedPrefix}banco3`, buttonText: { displayText: '🏦 Banco' }, type: 1 },
    { buttonId: `${usedPrefix}top`, buttonText: { displayText: '🏆 Top' }, type: 1 }
  ]

  return conn.sendMessage(
    m.chat,
    {
      text: texto,
      footer: 'Black Clover RPG 2026',
      buttons: buttons,
      headerType: 1,
      mentions: [m.sender]
    },
    { quoted: m }
  )
}

handler.help = ['miestatus', 'mimonedas', 'miexp']
handler.tags = ['rpg', 'economia','Inventario','banco3','top']
handler.command = ['miestatus', 'mismonedas', 'miexp','balance','Inventario','banco3','top']
handler.register = true

export default handler