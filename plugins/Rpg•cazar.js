let handler = async (m, { conn }) => {
  global.db.data.users = global.db.data.users || {}

  const user = global.db.data.users[m.sender]

  if (!user) {
    return m.reply('❌ Usuario no encontrado en la base de datos.')
  }

  const cooldown = 30 * 60 * 1000
  const now = Date.now()

  user.lastCazar = user.lastCazar || 0

  if (now - user.lastCazar < cooldown) {
    const remaining = cooldown - (now - user.lastCazar)

    const hours = Math.floor(remaining / 3600000)
    const minutes = Math.floor((remaining % 3600000) / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return m.reply(
      `⏳ Debes esperar *${hours}h ${minutes}m ${seconds}s* para volver a usar el comando *.cazar*.`
    )
  }

  const criaturas = [
    { nombre: '🐗 Jabalí', min: 5000, max: 9000, exp: 150 },
    { nombre: '🐍 Serpiente', min: 6000, max: 10000, exp: 200 },
    { nombre: '🐺 Lobo', min: 7000, max: 11000, exp: 250 },
    { nombre: '🐉 Dragón', min: 25000, max: 50000, exp: 1500 },
    { nombre: '🦅 Águila', min: 8000, max: 12000, exp: 300 },
    { nombre: '🐰 Conejo', min: 3000, max: 6000, exp: 100 },
    { nombre: '🦊 Zorro', min: 7000, max: 12000, exp: 280 },
    { nombre: '🦁 León', min: 12000, max: 18000, exp: 450 },
    { nombre: '🐅 Tigre', min: 13000, max: 20000, exp: 500 },
    { nombre: '🦄 Unicornio', min: 20000, max: 35000, exp: 1000 },
    { nombre: '🐉 Wyvern', min: 18000, max: 30000, exp: 850 },
    { nombre: '🦖 Dinosaurio', min: 25000, max: 45000, exp: 1200 },
    { nombre: '🕷️ Araña Gigante', min: 10000, max: 17000, exp: 400 },
    { nombre: '🐉 Dragón de Fuego', min: 30000, max: 60000, exp: 1800 },
    { nombre: '🦦 Nutria Mágica', min: 9000, max: 14000, exp: 320 },
    { nombre: '🐲 Dragón Oriental', min: 35000, max: 70000, exp: 2500 },
    { nombre: '🦈 Tiburón', min: 11000, max: 18000, exp: 500 },
    { nombre: '🐊 Cocodrilo', min: 10000, max: 16000, exp: 450 },
    { nombre: '🦅 Águila Real', min: 15000, max: 22000, exp: 700 }
  ]

  const criatura = criaturas[Math.floor(Math.random() * criaturas.length)]

  const recompensa =
    Math.floor(
      Math.random() * (criatura.max - criatura.min + 1)
    ) + criatura.min

  const experiencia = criatura.exp

  const raro = Math.random() < 0.05

  let bonus = 0

  if (raro) {
    bonus = Math.floor(Math.random() * 20000) + 10000
  }

  user.monedas = Number(user.monedas || 0) + recompensa + bonus
  user.exp = Number(user.exp || 0) + experiencia
  user.lastCazar = now

  let texto = `
🏹 *¡EXPEDICIÓN DE CAZA COMPLETADA!*

🎯 Criatura cazada:
${criatura.nombre}

💰 Recompensa:
*${Number(recompensa).toLocaleString()} monedas* 🪙

✨ Experiencia obtenida:
*${Number(experiencia).toLocaleString()} EXP*
`.trim()

  if (bonus > 0) {
    texto += `

🎁 *BONUS LEGENDARIO*
Has encontrado un tesoro oculto.

🪙 Bonus extra:
*${Number(bonus).toLocaleString()} monedas*
`
  }

  texto += `

📦 Balance actual:
🪙 *${Number(user.monedas).toLocaleString()} monedas*

📈 EXP total:
✨ *${Number(user.exp).toLocaleString()} EXP*`

  return conn.reply(m.chat, texto.trim(), m)
}

handler.command = ['cazar', 'hunt']
handler.tags = ['rpg']
handler.help = ['cazar']
handler.register = true
handler.fail = null

export default handler