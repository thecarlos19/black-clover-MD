//Código creado x The Carlos 👑 

const COOLDOWN = 2 * 60 * 60 * 1000
const MAX_EXPLORACIONES = 8

const handler = async (m, { conn, isPrems }) => {
  global.db.data.users = global.db.data.users || {}

  const user = global.db.data.users[m.sender]

  if (!user) {
    return conn.reply(
      m.chat,
      '❌ Usuario no encontrado en la base de datos.',
      m
    )
  }

  user.personajes = Array.isArray(user.personajes)
    ? user.personajes
    : []

  user.lastExplorar = Number(user.lastExplorar || 0)
  user.exploracionesHoy = Number(user.exploracionesHoy || 0)
  user.monedas = Number(user.monedas || 0)
  user.fragmentos = Number(user.fragmentos || 0)
  user.exp = Number(user.exp || 0)

  const now = Date.now()

  if (!user.fechaExploracion) {
    user.fechaExploracion = new Date().toDateString()
  }

  if (user.fechaExploracion !== new Date().toDateString()) {
    user.exploracionesHoy = 0
    user.fechaExploracion = new Date().toDateString()
  }

  const limite = isPrems
    ? MAX_EXPLORACIONES + 4
    : MAX_EXPLORACIONES

  if (user.exploracionesHoy >= limite) {
    const restante = COOLDOWN - (now - user.lastExplorar)

    if (restante > 0) {
      return conn.reply(
        m.chat,
        `🚫 Has alcanzado el límite diario de *${limite} exploraciones*.\n\n⏳ Descansa *${msToTime(restante)}* antes de volver a explorar.`,
        m
      )
    }

    user.exploracionesHoy = 0
  }

  const dimensiones = [
    'Dimensión de Hielo',
    'Bosque Prohibido',
    'Reino de Sombra',
    'Cráter de Lava',
    'Caverna de Ilusión',
    'Templo Abandonado',
    'Ruinas del Tiempo',
    'Abismo Cuántico',
    'Ciudad Fantasma',
    'Laberinto de Cristal',
    'Pantano Sombrío',
    'Montañas del Eco',
    'Desierto Carmesí',
    'Valle de los Susurros',
    'Isla Perdida',
    'Santuario Celestial',
    'Fortaleza Abisal',
    'Cielo Eterno',
    'Bosque de los Lamentos',
    'Lago de la Eternidad',
    'Cuevas del Olvido',
    'Templo del Dragón',
    'Mansión Embrujada',
    'Ruinas Subterráneas',
    'Campos de Ceniza',
    'Torres de Acero',
    'Caverna de Fuego',
    'Jardín Prohibido',
    'Arena del Tiempo',
    'Labios del Vacío'
  ]

  const eventos = [
    'enemigo',
    'personaje',
    'monedas',
    'nada',
    'trampa',
    'item',
    'tesoro',
    'exp',
    'legendario',
    'misterio',
    'portal',
    'hechizo'
  ]

  const dimension =
    dimensiones[Math.floor(Math.random() * dimensiones.length)]

  const evento =
    eventos[Math.floor(Math.random() * eventos.length)]

  let respuesta = `🌌 *${dimension}*\n`

  switch (evento) {

    case 'enemigo': {
      respuesta += `\n👁 Te encontraste con una criatura hostil.\n`

      const perdida = Math.floor(Math.random() * 15000) + 5000
      const suerte = Math.random()

      if (suerte < 0.5) {
        user.monedas = Math.max(0, user.monedas - perdida)

        respuesta += `💀 La criatura robó *${perdida.toLocaleString()} monedas* 🪙`
      } else {
        respuesta += `🛡️ Lograste escapar sin recibir daños.`
      }
      break
    }

    case 'personaje': {
      const posibles = [...(global.personajesNormales || [])]

      const nuevo =
        posibles[Math.floor(Math.random() * posibles.length)]

      if (nuevo) {
        respuesta += `\n🎁 Encontraste un personaje oculto:\n*${nuevo.nombre}*`

        if (!user.personajes.includes(nuevo.nombre.toLowerCase())) {
          user.personajes.push(nuevo.nombre.toLowerCase())

          respuesta += `\n🧩 Añadido a tu colección.`
        } else {
          user.monedas += 10000

          respuesta += `\n📦 Ya lo tenías.\n💰 Recibiste *10,000 monedas*.`
        }
      } else {
        respuesta += `\n📛 No se pudo generar personaje.`
      }

      break
    }

    case 'monedas': {
      const ganancia =
        Math.floor(Math.random() * 25000) + 5000

      user.monedas += ganancia

      respuesta += `\n💰 Encontraste un tesoro escondido.\n🪙 Ganaste *${ganancia.toLocaleString()} monedas*.`

      break
    }

    case 'item': {
      const fragmentos = Math.floor(Math.random() * 3) + 1

      user.fragmentos += fragmentos

      respuesta += `\n🔮 Encontraste *${fragmentos} Fragmento(s) de Magia Prohibida*.`

      break
    }

    case 'trampa': {
      respuesta += `\n☠️ Caíste en una trampa ancestral.\n`

      if (user.personajes.length > 0) {
        const quitado =
          user.personajes.splice(
            Math.floor(Math.random() * user.personajes.length),
            1
          )[0]

        respuesta += `😢 Perdiste a *${quitado}* de tu colección.`
      } else {
        respuesta += `🌀 No tenías personajes para perder.`
      }

      break
    }

    case 'tesoro': {
      const recompensa =
        Math.floor(Math.random() * 50000) + 15000

      user.monedas += recompensa

      respuesta += `\n🏆 Descubriste un tesoro legendario.\n🪙 Ganaste *${recompensa.toLocaleString()} monedas*.`

      break
    }

    case 'exp': {
      const exp =
        Math.floor(Math.random() * 10000) + 3000

      user.exp += exp

      respuesta += `\n✨ Absorbiste energía ancestral.\n🧪 Ganaste *${exp.toLocaleString()} EXP*.`

      break
    }

    case 'legendario': {
      const recompensa =
        Math.floor(Math.random() * 100000) + 50000

      user.monedas += recompensa
      user.fragmentos += 5
      user.exp += 15000

      respuesta += `

🌟 ¡EVENTO LEGENDARIO!

👑 Encontraste una reliquia antigua.

🪙 Monedas:
*${recompensa.toLocaleString()}*

🔮 Fragmentos:
*+5*

✨ EXP:
*+15,000*`

      break
    }

    case 'portal': {
      const bonus =
        Math.floor(Math.random() * 30000) + 10000

      user.monedas += bonus

      respuesta += `\n🌀 Un portal mágico te transportó hacia una cámara secreta.\n💰 Recolectaste *${bonus.toLocaleString()} monedas*.`

      break
    }

    case 'hechizo': {
      const exp =
        Math.floor(Math.random() * 8000) + 2000

      user.exp += exp

      respuesta += `\n📜 Encontraste un antiguo hechizo.\n✨ Obtienes *${exp.toLocaleString()} EXP*.`

      break
    }

    case 'misterio':
    case 'nada':
    default: {
      respuesta += `\n🌫️ Nada ocurrió...\nPero sentiste una presencia observándote desde las sombras.`
      break
    }
  }

  user.lastExplorar = now
  user.exploracionesHoy += 1

  respuesta += `

╭━━〔 📊 ESTADO DE EXPLORACIÓN 〕━━⬣
┃ 🌍 Exploraciones:
┃ ➤ *${user.exploracionesHoy}/${limite}*
┃
┃ 🪙 Monedas:
┃ ➤ *${user.monedas.toLocaleString()}*
┃
┃ ✨ EXP:
┃ ➤ *${user.exp.toLocaleString()}*
┃
┃ 🔮 Fragmentos:
┃ ➤ *${user.fragmentos.toLocaleString()}*
╰━━━━━━━━━━━━━━━━━━⬣`

  return conn.reply(
    m.chat,
    respuesta.trim(),
    m
  )
}

handler.help = ['explorar']
handler.tags = ['rpg']
handler.command = ['explorar']
handler.register = true
handler.fail = null

export default handler

function msToTime(duration) {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)

  return `${hours}h ${minutes}m`
}