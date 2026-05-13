const handler = async (m, { conn, command }) => {
  let user = global.db.data.users[m.sender]

  if (!user.vida) user.vida = 100
  if (!user.monedas) user.monedas = 0
  if (!user.exp) user.exp = 0

  if (user.vida <= 0) {
    return m.reply(`💀 Estás sin vida.\nUsa un comando de curación antes de continuar.`)
  }

  const aventuras = [
    { nombre: 'Bosque Oscuro', min: 50, max: 150, daño: 20 },
    { nombre: 'Cueva Misteriosa', min: 80, max: 200, daño: 30 },
    { nombre: 'Ruinas Antiguas', min: 100, max: 250, daño: 40 }
  ]

  const criaturas = [
    { nombre: 'Lobo Salvaje', min: 40, max: 120, daño: 15 },
    { nombre: 'Goblin', min: 60, max: 140, daño: 20 },
    { nombre: 'Dragón Pequeño', min: 100, max: 300, daño: 35 }
  ]

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  if (command === 'aventura') {
    let lugar = aventuras[Math.floor(Math.random() * aventuras.length)]
    let recompensa = rand(lugar.min, lugar.max)
    let daño = rand(5, lugar.daño)

    user.monedas += recompensa
    user.exp += recompensa / 2
    user.vida -= daño

    if (user.vida < 0) user.vida = 0

    return m.reply(
`🗺️ AVENTURA

Exploraste: ${lugar.nombre}

💰 Ganaste:
➤ ${recompensa} monedas

⚔️ Daño recibido:
➤ ${daño} ❤️

📊 Estado:
❤️ Vida: ${user.vida}
✨ EXP: ${Math.floor(user.exp)}
🪙 Monedas: ${user.monedas}`
    )
  }

  if (command === 'hunt') {
    let enemigo = criaturas[Math.floor(Math.random() * criaturas.length)]
    let recompensa = rand(enemigo.min, enemigo.max)
    let daño = rand(5, enemigo.daño)

    user.monedas += recompensa
    user.exp += recompensa / 2
    user.vida -= daño

    if (user.vida < 0) user.vida = 0

    return m.reply(
`🐺 CACERÍA

Enfrentaste a: ${enemigo.nombre}

💰 Recompensa:
➤ ${recompensa} monedas

⚔️ Daño recibido:
➤ ${daño} ❤️

📊 Estado:
❤️ Vida: ${user.vida}
✨ EXP: ${Math.floor(user.exp)}
🪙 Monedas: ${user.monedas}`
    )
  }
}

handler.help = ['aventura', 'hunt']
handler.tags = ['rpg']
handler.command = ['aventura', 'hunt']

export default handler