const handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (!user.personajes || user.personajes.length === 0) {
    return m.reply('❌ No tienes personajes comprados')
  }

  let enemigo = m.mentionedJid[0]
  if (!enemigo) return m.reply('❌ Menciona a un rival')

  let user2 = global.db.data.users[enemigo]
  if (!user2 || !user2.personajes || user2.personajes.length === 0) {
    return m.reply('❌ El rival no tiene personajes')
  }

  const getStats = () => ({
    vida: 100,
    energia: 50,
    ataque: Math.floor(Math.random() * 20) + 10
  })

  let pjNombre = user.personajes[0].toLowerCase().trim()
  let rivalNombre = user2.personajes[0].toLowerCase().trim()

  let pj = {
    nombre: pjNombre,
    ...getStats()
  }

  let rival = {
    nombre: rivalNombre,
    ...getStats()
  }

  const frases = {
    default: ['El destino ya está escrito', 'Esto termina aquí'],
    cristo: ['👑 Yo soy el Rey de Reyes', 'No hay salvación'],
    carlos: ['🧠 Todo estaba calculado', 'Estoy adelante'],
    goku: ['¡Kamehameha!', '¡Voy en serio!'],
    naruto: ['¡Dattebayo!', '¡Nunca me rindo!'],
    luffy: ['¡Seré el Rey!', '¡Vamos!']
  }

  function getKey(nombre) {
    if (nombre.includes('cristo')) return 'cristo'
    if (nombre.includes('carlos')) return 'carlos'
    if (nombre.includes('goku')) return 'goku'
    if (nombre.includes('naruto')) return 'naruto'
    if (nombre.includes('luffy')) return 'luffy'
    return 'default'
  }

  function atacar() {
    let daño = pj.ataque + Math.floor(Math.random() * 10)
    rival.vida -= daño
    pj.energia -= 5
    return `💥 ${pj.nombre} hace ${daño} de daño`
  }

  function habilidad() {
    if (pj.energia < 10) return '❌ Sin energía'
    let daño = pj.ataque * 2
    rival.vida -= daño
    pj.energia -= 10
    return `🔥 Habilidad hace ${daño}`
  }

  function defender() {
    pj.vida += 5
    pj.energia += 5
    return `🛡️ Defensa activada`
  }

  async function turno(accion) {
    let texto = ''
    if (accion === 'atacar') texto = atacar()
    if (accion === 'habilidad') texto = habilidad()
    if (accion === 'defender') texto = defender()

    if (rival.vida > 0) {
      let daño = rival.ataque
      pj.vida -= daño
      texto += `\n💢 ${rival.nombre} contraataca (${daño})`
    }

    let key = getKey(pj.nombre)

    let msg =
`⚔️ DUELO ⚔️

"${frases[key][Math.floor(Math.random() * frases[key].length)]}"

${pj.nombre} VS ${rival.nombre}

${texto}

❤️ ${pj.nombre}: ${pj.vida}
⚡ ${pj.energia}

💔 ${rival.nombre}: ${rival.vida}`

    if (pj.vida <= 0) {
      user.personajes = user.personajes.filter(p => p.toLowerCase() !== pj.nombre)
      return conn.sendMessage(m.chat, {
        text: `💀 Perdiste a ${pj.nombre}`,
        mentions: [m.sender]
      })
    }

    if (rival.vida <= 0) {
      user2.personajes = user2.personajes.filter(p => p.toLowerCase() !== rival.nombre)
      return conn.sendMessage(m.chat, {
        text: `🏆 Ganaste, eliminaste a ${rival.nombre}`,
        mentions: [m.sender, enemigo]
      })
    }

    return conn.sendMessage(m.chat, {
      text: msg,
      footer: 'Elige acción',
      buttons: [
        { buttonId: '.turno atacar', buttonText: { displayText: '⚔️ Atacar' } },
        { buttonId: '.turno habilidad', buttonText: { displayText: '🔥 Habilidad' } },
        { buttonId: '.turno defender', buttonText: { displayText: '🛡️ Defender' } }
      ],
      headerType: 1
    })
  }

  global.batallas = global.batallas || {}
  global.batallas[m.sender] = { turno }

  return conn.sendMessage(m.chat, {
    text: `⚔️ DUELO INICIADO ⚔️\n${pj.nombre} VS ${rival.nombre}`,
    footer: 'Elige acción',
    buttons: [
      { buttonId: '.turno atacar', buttonText: { displayText: '⚔️ Atacar' } },
      { buttonId: '.turno habilidad', buttonText: { displayText: '🔥 Habilidad' } },
      { buttonId: '.turno defender', buttonText: { displayText: '🛡️ Defender' } }
    ],
    headerType: 1
  })
}

handler.command = ['duelo']
export default handler