const ZOMBIES_TOTALES = 2000
const COOLDOWN = 15 * 60 * 1000 // 15 minutos

global.zombiesActuales = global.zombiesActuales ?? ZOMBIES_TOTALES
global.zombiesJefesInvocados = global.zombiesJefesInvocados ?? 0
global.zombiesJefesEliminados = global.zombiesJefesEliminados ?? 0
global.eventoZombieActivo = global.eventoZombieActivo ?? false

const handler = async (m, { conn, usedPrefix, isPrems }) => {
  try {
    const user = global.db.data.users[m.sender]

    if (!user) {
      global.db.data.users[m.sender] = {}
    }

    user.personajes = user.personajes || []
    user.monedas = user.monedas || 0
    user.exp = user.exp || 0
    user.lastZombie = user.lastZombie || 0
    user.zombiesKills = user.zombiesKills || 0

    const now = Date.now()

    if (now - user.lastZombie < COOLDOWN) {
      return conn.reply(
        m.chat,
        `⏳ *Debes descansar antes de otra batalla.*\n🕐 Regresa en: *${msToTime(COOLDOWN - (now - user.lastZombie))}*`,
        m
      )
    }

    if (user.personajes.length === 0) {
      return conn.reply(
        m.chat,
        `🚫 *No tienes personajes.*\n🛒 Usa *${usedPrefix}pjs* para ver los disponibles.`,
        m
      )
    }

    const frasesMuerte = [
      '☠️ fue consumido por la horda...',
      '☠️ cayó luchando valientemente...',
      '☠️ desapareció entre la oscuridad...',
      '☠️ fue rodeado sin escapatoria...',
      '☠️ sacrificó su vida por el reino...',
      '☠️ no sobrevivió al ataque final...',
      '☠️ fue destruido por el jefe zombie...'
    ]

    const frasesAtaque = [
      '⚔️ lanzó un ataque devastador.',
      '🔥 usó su habilidad definitiva.',
      '💥 atravesó hordas completas.',
      '☄️ destruyó enemigos sin piedad.',
      '🌀 liberó energía sobrenatural.',
      '⚡ atacó a velocidad extrema.',
      '🧿 invocó un poder prohibido.'
    ]

    const frasesJefe = [
      '🧟‍♂️ *¡El Rey Zombie ha despertado!*',
      '🧟‍♂️ *¡La oscuridad dominará el reino!*',
      '🧟‍♂️ *¡No podrán detenerme!*',
      '🧟‍♂️ *¡Todos caerán esta noche!*'
    ]

    const personajesTop = [
      'Cristo rey 👑',
      'Arcangel Supremo 😇',
      'The Carlos 🧠',
      'Dios del Tiempo ⏳',
      'Dragón Ancestral 🐉'
    ]

    const personajesElite = [
      'Samurai de la Sombra ⚔️',
      'Dios Guerrero 🪖',
      'Hechicero Supremo 🧙‍♂️',
      'Titán del Infinito 👹',
      'Alma del Vacío 👻'
    ]

    let personaje = pickRandom(user.personajes)

    let zombiesMatados = 0
    let monedas = 0
    let exp = 0
    let probabilidadMuerte = 0

    // Poder según rareza
    if (personajesTop.includes(personaje)) {
      zombiesMatados = random(40, 80)
      monedas = random(30000, 70000)
      exp = random(3000, 7000)
      probabilidadMuerte = personaje === 'Cristo rey 👑' ? 0 : 10
    } else if (personajesElite.includes(personaje)) {
      zombiesMatados = random(20, 45)
      monedas = random(15000, 35000)
      exp = random(1500, 4000)
      probabilidadMuerte = 20
    } else {
      zombiesMatados = random(5, 20)
      monedas = random(5000, 15000)
      exp = random(500, 1500)
      probabilidadMuerte = 40
    }

    // Bonus premium
    if (isPrems) {
      monedas += 10000
      exp += 1000
    }

    // Evento raro
    let eventoEspecial = ''

    if (Math.random() < 0.05) {
      const bonus = 100000
      monedas += bonus

      eventoEspecial =
`\n🎁 *EVENTO ESPECIAL*
💰 Encontraste un almacén oculto.
🪙 Bonus: *${bonus.toLocaleString()} monedas*`
    }

    // Daño global
    global.zombiesActuales -= zombiesMatados

    if (global.zombiesActuales < 0) {
      global.zombiesActuales = 0
    }

    // Aplicar recompensas
    user.monedas += monedas
    user.exp += exp
    user.zombiesKills += zombiesMatados
    user.lastZombie = now

    // Probabilidad de muerte
    let muerto = Math.random() * 100 < probabilidadMuerte

    let resultado = `
╭━━━〔 🧟 INVASIÓN ZOMBIE 🧟‍♂️ 〕━━━⬣

🎖️ Personaje:
✨ *${personaje}*

⚔️ Acción:
${pickRandom(frasesAtaque)}

☠️ Zombies eliminados:
*${zombiesMatados}*

💰 Recompensas:
🪙 *+${monedas.toLocaleString()} monedas*
✨ *+${exp.toLocaleString()} exp*

🧟 Zombies restantes:
*${global.zombiesActuales.toLocaleString()}*
`.trim()

    if (muerto) {
      user.personajes.splice(user.personajes.indexOf(personaje), 1)

      resultado += `

💀 *${personaje}* ${pickRandom(frasesMuerte)}`
    } else {
      resultado += `

🛡️ *${personaje} sobrevivió a la batalla.*`
    }

    // Sistema de jefe
    const umbralJefe = 150
    const zombiesEliminados = ZOMBIES_TOTALES - global.zombiesActuales
    const jefesEsperados = Math.floor(zombiesEliminados / umbralJefe)

    while (global.zombiesJefesInvocados < jefesEsperados) {
      global.zombiesJefesInvocados++

      resultado += `

🌀⚠️ *¡UN JEFE ZOMBIE APARECIÓ!* ⚠️
${pickRandom(frasesJefe)}

✅ *El jefe fue derrotado.*`

      global.zombiesJefesEliminados++
    }

    // Final del evento
    if (global.zombiesActuales <= 0) {
      const recompensaFinal = 6000000

      user.monedas += recompensaFinal

      resultado += `

👑━━━━━━━━━━━━━━━━━━👑
💀 *¡EL REY ZOMBIE HA CAÍDO!* 💀

🎉 Recompensa final:
🪙 *${recompensaFinal.toLocaleString()} monedas*

🏆 Jefes derrotados:
*${global.zombiesJefesEliminados}*
👑━━━━━━━━━━━━━━━━━━👑`

      // Reiniciar evento
      global.zombiesActuales = ZOMBIES_TOTALES
      global.zombiesJefesInvocados = 0
      global.zombiesJefesEliminados = 0
    }

    resultado += `

📊 ESTADÍSTICAS
☠️ Tus kills: *${user.zombiesKills.toLocaleString()}*
🧟 Jefes invocados: *${global.zombiesJefesInvocados}*
⚔️ Jefes derrotados: *${global.zombiesJefesEliminados}*
${eventoEspecial}
╰━━━━━━━━━━━━━━━━━━⬣`

    await conn.reply(m.chat, resultado, m)

    await conn.sendMessage(m.chat, {
      react: {
        text: '🧟',
        key: m.key
      }
    })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Ocurrió un error en la invasión zombie.', m)
  }
}

handler.help = ['invasionzombie']
handler.tags = ['rpg']
handler.command = ['invasionzombie']
handler.register = true

export default handler

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function msToTime(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)

  return `${h}h ${m}m ${s}s`
}