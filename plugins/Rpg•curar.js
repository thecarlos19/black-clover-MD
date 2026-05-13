const handler = async (m, { args, command }) => {
  let user = global.db.data.users[m.sender]

  if (!user.vida) user.vida = 100
  if (!user.monedas) user.monedas = 0
  if (!user.pociones) user.pociones = 0

  const precioPocion = 100
  const curacion = 40

  if (command === 'comprarpocion') {
    let cantidad = parseInt(args[0]) || 1

    if (cantidad < 1) return m.reply('❌ Cantidad inválida.')

    let total = cantidad * precioPocion

    if (user.monedas < total) {
      return m.reply(`❌ No tienes suficientes monedas.\n💰 Necesitas: ${total}`)
    }

    user.monedas -= total
    user.pociones += cantidad

    return m.reply(
`🛒 COMPRA EXITOSA

🧪 Pociones compradas:
➤ ${cantidad}

💰 Gastaste:
➤ ${total}

🧪 Total en inventario:
➤ ${user.pociones}

🪙 Monedas restantes:
➤ ${user.monedas}`
    )
  }

  if (command === 'curar') {
    if (user.pociones < 1) {
      return m.reply('❌ No tienes pociones. Usa "comprarpocion".')
    }

    if (user.vida >= 100) {
      return m.reply('❤️ Ya tienes la vida completa.')
    }

    user.pociones -= 1
    user.vida += curacion

    if (user.vida > 100) user.vida = 100

    return m.reply(
`🧪 CURACIÓN

❤️ Recuperaste:
➤ ${curacion} vida

📊 Estado actual:
❤️ Vida: ${user.vida}
🧪 Pociones: ${user.pociones}
🪙 Monedas: ${user.monedas}`
    )
  }
}

handler.help = ['comprarpocion <cantidad>', 'curar']
handler.tags = ['rpg']
handler.command = ['comprarpocion', 'curar']

export default handler