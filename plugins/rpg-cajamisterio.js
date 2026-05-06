
// Respeten credito xddddd (ratas inmundas)

let handler = async (m, { conn }) => {
  global.db.data.users = global.db.data.users || {}

  const user = global.db.data.users[m.sender]

  if (!user) {
    return m.reply('❎ Tu perfil RPG aún no está registrado.')
  }

  const cooldown = 1000 * 60 * 30
  const tiempoRestante = cooldown - (Date.now() - (user.lastbox || 0))

  if (tiempoRestante > 0) {
    let minutos = Math.floor(tiempoRestante / 60000)
    let segundos = Math.floor((tiempoRestante % 60000) / 1000)

    return m.reply(
      `⏳ Espera *${minutos}m ${segundos}s* para abrir otra caja misteriosa.`
    )
  }

  let especial = Math.random() < 0.01

  let premio = 0

  if (especial) {
    premio = 500000

    await m.reply(
      `✨🎉 *¡¡¡FELICIDADES, ELEGIDO DEL DESTINO!!!* 🎉✨\n\n` +
      `Has desbloqueado la *Caja Misteriosa Legendaria* y ganado:\n\n` +
      `💰 *${Number(premio).toLocaleString()} monedas* 🪙\n\n` +
      `🌟 ¡Que la fortuna y la suerte te acompañen en tus próximas aventuras! 🌟`
    )

  } else {
    premio = Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000

    await m.reply(
      `🎁 *¡Has abierto una Caja Misteriosa!*\n` +
      `💰 Has ganado: *${Number(premio).toLocaleString()} monedas* 🪙`
    )
  }

  user.monedas = Number(user.monedas || 0) + premio
  user.lastbox = Date.now()
}

handler.help = ['cajamisteriosa']
handler.tags = ['juegos', 'economia', 'rpg']
handler.command = ['cajamisteriosa', 'box', 'suerte']
handler.register = true
handler.fail = null

export default handler