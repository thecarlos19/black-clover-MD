const handler = async (m, { conn, args }) => {
  const user = global.db.data.users[m.sender]

  if (!user) {
    return m.reply('❌ Usuario no encontrado en la base de datos.')
  }

  user.personajes = user.personajes || []
  user.fragmentos = user.fragmentos || 0

  if (!args[0]) {
    return conn.reply(
      m.chat,
      '⚠️ Usa correctamente el comando.\n📌 Ejemplo:\n*.sacrificar Naruto*',
      m
    )
  }

  const nombre = args.join(' ').toLowerCase().trim()

  const index = user.personajes.findIndex(
    p => p.toLowerCase() === nombre
  )

  if (index < 0) {
    return conn.reply(
      m.chat,
      '❌ No tienes ese personaje en tu colección.',
      m
    )
  }

  const personajesTop = global.personajesTop || []
  const personajesNormales = global.personajesNormales || []

  const listaCompleta = [
    ...personajesTop,
    ...personajesNormales
  ]

  const pj = listaCompleta.find(
    p => p.nombre.toLowerCase() === nombre
  )

  const precio = pj?.precio || 100000

  let rareza = '🌱 Básico'
  let fragmentos = 1

  if (
    personajesTop.some(
      p => p.nombre.toLowerCase() === nombre
    )
  ) {
    rareza = '👑 TOP'
    fragmentos = 10
  } else if (precio >= 80000) {
    rareza = '💎 Elite'
    fragmentos = 5
  } else if (precio >= 60000) {
    rareza = '⚔️ Medio'
    fragmentos = 3
  }

  const bonus = Math.random() < 0.15
  let bonusTexto = ''

  if (bonus) {
    fragmentos += 2
    bonusTexto = '\n🎁 *BONUS OSCURO ACTIVADO* → +2 Fragmentos extra.'
  }

  const eliminado = user.personajes.splice(index, 1)[0]

  user.fragmentos += fragmentos

  const totalRestante = user.personajes.length

  let mensaje = `
💀 *SACRIFICIO COMPLETADO*

🔥 Personaje sacrificado:
🎴 *${eliminado}*

🏷️ Rareza: *${rareza}*
🔮 Fragmentos obtenidos: *${fragmentos}*

🧩 Fragmentos actuales: *${user.fragmentos}*
📦 Personajes restantes: *${totalRestante}*
${bonusTexto}
`.trim()

  if (rareza === '👑 TOP') {
    mensaje += `

⚠️ *Has sacrificado un personaje legendario.*
🌌 Una energía prohibida invade el reino mágico...`
  }

  await conn.reply(m.chat, mensaje, m)

  await conn.sendMessage(m.chat, {
    react: {
      text: '💀',
      key: m.key
    }
  })
}

handler.help = ['sacrificar <nombre>']
handler.tags = ['rpg']
handler.command = ['sacrificar']
handler.register = true

export default handler