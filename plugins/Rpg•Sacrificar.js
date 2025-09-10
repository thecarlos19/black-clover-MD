const handler = async (m, { conn, args }) => {
  const user = global.db.data.users[m.sender]
  if (!args[0]) return m.reply('⚠️ Usa: *.sacrificar <nombre>*')
  const nombre = args.join(' ').toLowerCase()

  const index = user.personajes?.findIndex(p => p.toLowerCase() === nombre)
  if (index === -1 || index === undefined) return m.reply('❌ No tienes ese personaje.')

  const obtenerDatosPj = (nombre) => {
    const lista = [...(global.personajesTop || []), ...(global.personajesNormales || [])]
    const pj = lista.find(p => p.nombre.toLowerCase() === nombre.toLowerCase())
    const rareza = global.personajesTop?.some(p => p.nombre.toLowerCase() === nombre.toLowerCase())
      ? '👑 TOP'
      : pj?.precio >= 80000 ? '💎 Elite' : pj?.precio >= 60000 ? '⚔️ Medio' : '🌱 Básico'
    return { pj, rareza, precio: pj?.precio || 100000 }
  }

  const datos = obtenerDatosPj(nombre)
  const fragmentos = datos.precio >= 80000 ? 3 : datos.precio >= 60000 ? 2 : 1

  user.personajes.splice(index, 1)
  user.fragmentos = (user.fragmentos || 0) + fragmentos

  return conn.reply(m.chat, `💀 Has sacrificado a *${datos.pj?.nombre || nombre}*...\n🔮 Obtuviste *${fragmentos} Fragmento(s) de Magia Prohibida.*`, m)
}

handler.help = ['sacrificar <nombre>']
handler.tags = ['rpg']
handler.command = ['sacrificar']
handler.register = true
export default handler