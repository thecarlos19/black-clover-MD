//Código creado x The Carlos 👑 
const COOLDOWN = 2 * 60 * 60 * 1000
const MAX_EXPLORACIONES = 8

const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  user.personajes = user.personajes || []
  user.lastExplorar = user.lastExplorar || 0
  user.exploracionesHoy = user.exploracionesHoy || 0
  user.monedas = user.monedas || 0
  user.fragmentos = user.fragmentos || 0

  const now = Date.now()

  if (user.exploracionesHoy >= MAX_EXPLORACIONES) {
    const restante = Math.ceil((COOLDOWN - (now - user.lastExplorar)) / 60000)
    if (restante > 0) {
      return conn.reply(m.chat, `🚫 Has alcanzado el límite de ${MAX_EXPLORACIONES} exploraciones. Descansa ${restante} minuto(s) antes de volver a explorar.`, m)
    } else {
      user.exploracionesHoy = 0
    }
  }

  if (now - user.lastExplorar < COOLDOWN && user.exploracionesHoy === MAX_EXPLORACIONES) {
    const restante = Math.ceil((COOLDOWN - (now - user.lastExplorar)) / 60000)
    return conn.reply(m.chat, `⏳ Debes esperar ${restante} minuto(s) antes de explorar de nuevo.`, m)
  }

  const dimensiones = [
    'Dimensión de Hielo', 'Bosque Prohibido', 'Reino de Sombra', 'Cráter de Lava',
    'Caverna de Ilusión', 'Templo Abandonado', 'Ruinas del Tiempo', 'Abismo Cuántico',
    'Ciudad Fantasma', 'Laberinto de Cristal', 'Pantano Sombrío', 'Montañas del Eco',
    'Desierto Carmesí', 'Valle de los Susurros', 'Isla Perdida', 'Santuario Celestial',
    'Fortaleza Abisal', 'Cielo Eterno', 'Bosque de los Lamentos', 'Lago de la Eternidad',
    'Cuevas del Olvido', 'Templo del Dragón', 'Mansión Embrujada', 'Ruinas Subterráneas',
    'Campos de Ceniza', 'Torres de Acero', 'Caverna de Fuego', 'Jardín Prohibido',
    'Arena del Tiempo', 'Labios del Vacío'
  ]

  const eventos = [
    'enemigo', 'personaje', 'monedas', 'nada', 'trampa', 'item',
    'puzzle', 'tesoro', 'aliado', 'portal', 'hechizo', 'maldición',
    'gemas', 'mapa', 'ruido', 'eco', 'criatura', 'arma', 'armadura',
    'fragmento', 'sello', 'misterio', 'reliquia', 'espíritu', 'monstruo',
    'dragón', 'vampiro', 'golem', 'quimera', 'elemental', 'espectro', 'lich',
    'troll', 'ogro', 'cazador', 'bárbaro', 'tiburón abisal'
  ]

  const dimension = dimensiones[Math.floor(Math.random() * dimensiones.length)]
  const evento = eventos[Math.floor(Math.random() * eventos.length)]

  let respuesta = `🌌 *${dimension}*\n\n`

  switch (evento) {
    case 'enemigo':
      respuesta += `👁 Te has encontrado con un *${evento}* peligroso...\n`
      const suerte = Math.random()
      if (suerte < 0.5) {
        respuesta += '💀 ¡Perdiste 15,000 monedas!\n'
        user.monedas = Math.max(0, user.monedas - 15000)
      } else {
        respuesta += '🛡 Lograste escapar sin daños.'
      }
      break

    case 'personaje':
      const posibles = [...(global.personajesNormales || [])]
      const nuevo = posibles[Math.floor(Math.random() * posibles.length)]
      if (nuevo) {
        respuesta += `🎁 ¡Encontraste un personaje oculto! → *${nuevo.nombre}*\n`
        if (!user.personajes.includes(nuevo.nombre.toLowerCase())) {
          user.personajes.push(nuevo.nombre.toLowerCase())
          respuesta += '🧩 Añadido a tu colección.'
        } else {
          respuesta += '📦 Ya lo tenías, recibiste 10,000 monedas.'
          user.monedas += 10000
        }
      } else {
        respuesta += '📛 No se pudo generar personaje.'
      }
      break

    case 'monedas':
      const ganancia = Math.floor(Math.random() * 25000) + 5000
      user.monedas += ganancia
      respuesta += `💰 Has encontrado *${ganancia.toLocaleString()} monedas* 🪙 escondidas.`
      break

    case 'item':
      user.fragmentos += 1
      respuesta += '🔮 Encontraste un *Fragmento de Magia Prohibida* escondido entre ruinas.'
      break

    case 'trampa':
      respuesta += '☠️ Caíste en una trampa mágica...\n'
      if (user.personajes.length > 0) {
        const quitado = user.personajes.splice(Math.floor(Math.random() * user.personajes.length), 1)[0]
        respuesta += `😢 Perdiste a *${quitado}* de tu colección.`
      } else {
        respuesta += '🌀 Pero no tenías personajes para perder.'
      }
      break

    case 'nada':
    default:
      respuesta += '🌫 Nada ocurrió... pero sentiste una presencia oscura.'
      break
  }

  user.lastExplorar = now
  user.exploracionesHoy += 1

  conn.reply(m.chat, respuesta, m)
}

handler.help = ['explorar']
handler.tags = ['rpg']
handler.command = ['explorar']
handler.register = true

export default handler