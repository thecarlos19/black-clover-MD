let cooldowns = {}

// Función para bloquear comandos si el usuario tiene deuda
function checkDeuda(users, m, conn) {
  if (!users) return false
  if (users.bloqueado) {
    // Solo permitir comando del banco
    const isBancoCommand = m.text && m.text.toLowerCase().startsWith('banco')
    if (!isBancoCommand) {
      conn.reply(m.chat, `🚫 No puedes usar este comando mientras tengas deuda pendiente. Usa *banco pagar <cantidad>* para pagar tu préstamo.`, m)
      return true // Bloquea el comando
    }
  }
  return false // Permitir el comando
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users[m.sender]

  // Bloqueo por deuda
  if (checkDeuda(users, m, conn)) return

  let tiempoEspera = 10

  if (!users.monedas || users.monedas <= 0) {
    return conn.reply(m.chat, `🚩 No tienes monedas para apostar.`, m)
  }

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `🚩 Ya has iniciado una apuesta recientemente, espera *⏱ ${tiempoRestante}* para apostar nuevamente`, m)
    return
  }

  cooldowns[m.sender] = Date.now()

  if (!text) return conn.reply(m.chat, `🚩 Debes ingresar una cantidad de *💰 Monedas* y apostar a un color, por ejemplo: *${usedPrefix + command} 20 black*`, m)

  let args = text.trim().split(" ")
  if (args.length !== 2) return conn.reply(m.chat, `🚩 Formato incorrecto. Debes ingresar una cantidad de *💰 Monedas* y apostar a un color, por ejemplo: *${usedPrefix + command} 20 black*`, m)

  let monedas = parseInt(args[0])
  let color = args[1].toLowerCase()

  if (isNaN(monedas) || monedas <= 0) return conn.reply(m.chat, `🚩 Por favor, ingresa una cantidad válida para la apuesta.`, m)
  if (!(color === 'black' || color === 'red')) return conn.reply(m.chat, "🚩 Debes apostar a un color válido: *black* o *red*.", m)
  if (monedas > users.monedas) return conn.reply(m.chat, "🚩 No tienes suficientes *💰 Monedas* para realizar esa apuesta.", m)

  await conn.reply(m.chat, `🚩 Apostaste ${monedas} *💰 Monedas* al color ${color}. Espera *⏱ 10 segundos* para conocer el resultado.`, m)

  setTimeout(() => {
    // Regla especial: apuesta de 2000 o más pierde automáticamente
    if (monedas >= 2000) {
      users.monedas -= monedas
      conn.reply(m.chat, `💥 Apostaste ${monedas} monedas y automáticamente perdiste la apuesta por ser demasiado grande. Total: ${users.monedas} *💰 Monedas*.`, m)
      return
    }

    let resultado = Math.random()

    // Premio mayor 1%
    if (resultado < 0.01) {
      users.monedas += 1000000
      users.premium = Date.now() + 2 * 24 * 60 * 60 * 1000 // 2 días en ms
      conn.reply(m.chat, `🎉 ¡FELICIDADES! Obtuviste el premio mayor: 1.000.000 *💰 Monedas* y Premium por 2 días! Total: ${users.monedas} *💰 Monedas*.`, m)
      return
    }

    // Ganancia normal 50/50
    let win = false
    if (resultado < 0.505) {
      win = color === 'black'
    } else {
      win = color === 'red'
    }

    if (win) {
      let ganancia = monedas * 2
      users.monedas += ganancia
      conn.reply(m.chat, `🚩 ¡Ganaste! Obtuviste ${ganancia} *💰 Monedas*. Total: ${users.monedas} *💰 Monedas*.`, m)
    } else {
      users.monedas -= monedas
      conn.reply(m.chat, `🚩 Perdiste. Se restaron ${monedas} *💰 Monedas*. Total: ${users.monedas} *💰 Monedas*.`, m)
    }

  }, 10000)
}

handler.tags = ['fun']
handler.help = ['ruleta *<cantidad> <color>*']
handler.command = ['ruleta', 'roulette', 'rt']
handler.register = true
handler.group = true 
export default handler

function segundosAHMS(segundos) {
  let min = Math.floor(segundos / 60)
  let sec = segundos % 60
  return `${min > 0 ? min + " min " : ""}${sec} seg`
}