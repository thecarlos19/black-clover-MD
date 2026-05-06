//código creado x The Carlos 👑
//no olvides dejar créditos 

let handler = async (m, { conn, args, isPrems }) => {
  global.db.data.users = global.db.data.users || {}

  const user = global.db.data.users[m.sender]

  if (!user) {
    return m.reply('❌ Usuario no encontrado en la base de datos.')
  }

  const ratio = 100000
  const monedasPorIntercambio = isPrems ? 75000 : 50000
  const LIMITE_DIARIO = isPrems ? 6 : 3

  user.exp = Number(user.exp || 0)
  user.monedas = Number(user.monedas || 0)

  if (!user.expcambio) {
    user.expcambio = {
      hoy: 0,
      fecha: new Date().toDateString()
    }
  }

  if (user.expcambio.fecha !== new Date().toDateString()) {
    user.expcambio.hoy = 0
    user.expcambio.fecha = new Date().toDateString()
  }

  if (user.expcambio.hoy >= LIMITE_DIARIO) {
    return m.reply(
      `🚫 Has alcanzado el *límite diario de ${LIMITE_DIARIO} intercambios*.\n\n📆 Intenta nuevamente mañana.`
    )
  }

  if (!args[0]) {
    return m.reply(
      `📌 *USO CORRECTO*\n\n*.cambiarexp <cantidad>*\n\n🎯 Ejemplo:\n*.cambiarexp 100000*\n\n💱 Ratio actual:\n*${ratio.toLocaleString()} EXP = ${monedasPorIntercambio.toLocaleString()} monedas* 🪙`
    )
  }

  let cantidad = parseInt(args[0])

  if (isNaN(cantidad)) {
    return m.reply('❌ Debes ingresar una cantidad válida.')
  }

  if (cantidad <= 0) {
    return m.reply('❌ La cantidad debe ser mayor a 0.')
  }

  if (user.exp < cantidad) {
    return m.reply(
      `❌ No tienes suficiente experiencia.\n\n📊 EXP actual:\n*${user.exp.toLocaleString()}*`
    )
  }

  let veces = Math.floor(cantidad / ratio)

  if (veces <= 0) {
    return m.reply(
      `❌ Debes intercambiar al menos *${ratio.toLocaleString()} EXP* para recibir monedas.`
    )
  }

  if (user.expcambio.hoy + veces > LIMITE_DIARIO) {
    let disponibles = LIMITE_DIARIO - user.expcambio.hoy

    return m.reply(
      `⚠️ Solo puedes hacer *${disponibles}* intercambio(s) más hoy.\n\n📆 Usados hoy:\n*${user.expcambio.hoy}/${LIMITE_DIARIO}*`
    )
  }

  let expUsada = veces * ratio
  let monedasGanadas = veces * monedasPorIntercambio

  let bonus = Math.random() < 0.10

  let bonusCoins = 0

  if (bonus) {
    bonusCoins = Math.floor(Math.random() * 50000) + 10000
  }

  user.exp -= expUsada
  user.monedas += monedasGanadas + bonusCoins
  user.expcambio.hoy += veces

  let txt = `
╭━━〔 🔄 INTERCAMBIO COMPLETADO 〕━━⬣
┃ 🧪 EXP usada:
┃ ➤ *${expUsada.toLocaleString()}*
┃
┃ 🪙 Monedas obtenidas:
┃ ➤ *${monedasGanadas.toLocaleString()}*
`.trim()

  if (bonusCoins > 0) {
    txt += `

┃
┃ 🎁 BONUS ESPECIAL:
┃ ➤ *+${bonusCoins.toLocaleString()} monedas*`
  }

  txt += `

┃
┃ 📆 Intercambios usados:
┃ ➤ *${user.expcambio.hoy}/${LIMITE_DIARIO}*
┃
┃ 💰 Balance actual:
┃ ➤ *${user.monedas.toLocaleString()} monedas*
╰━━━━━━━━━━━━━━━━━━⬣`

  return conn.reply(
    m.chat,
    txt.trim(),
    m
  )
}

handler.help = ['cambiarexp <cantidad>']
handler.tags = ['rpg', 'econ']
handler.command = ['cambiarexp', 'expxmonedas']
handler.register = true
handler.fail = null

export default handler