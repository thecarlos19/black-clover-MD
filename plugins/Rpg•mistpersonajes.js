// codigo creado por The Carlos 

function precioAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const personajesTop = [
  { nombre: 'Cristo rey 👑', precio: 20000000 },
  { nombre: 'Arcangel Supremo 😇', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'The Carlos 🧠', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'Dios del Tiempo ⏳', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'Dragón Ancestral 🐉', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'Samurai de la Sombra ⚔️', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'Dios Guerrero 🪖', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'Hechicero Supremo 🧙‍♂️', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'Titán del Infinito 👹', precio: precioAleatorio(5000000, 9999999) },
  { nombre: 'Alma del Vacío 👻', precio: precioAleatorio(5000000, 9999999) }
]

const nombresComunes = [
  'Goku', 'Naruto', 'Sasuke', 'Luffy', 'Zoro', 'Sanji', 'Sakura', 'Hinata',
  'Tanjiro', 'Nezuko', 'Levi', 'Eren', 'Itachi', 'Madara', 'Kakashi',
  'Ichigo', 'Rukia', 'Byakuya', 'Saitama', 'Genos', 'Batman', 'Superman',
  'Iron Man', 'Spider-Man', 'Thanos', 'Deadpool', 'Shrek', 'Donkey', 'Elsa',
  'Anna', 'Simba', 'Scar', 'Woody', 'Buzz', 'Pikachu', 'Kirby', 'Link',
  'Zelda', 'Ash', 'Charizard', 'Mewtwo', 'Deku', 'Bakugo', 'Todoroki', 'All Might',
  'Gojo', 'Sukuna', 'Yuji', 'Megumi', 'Nobara', 'Asta', 'Yuno', 'Noelle', 'Yami',
  'Rem', 'Emilia', 'Subaru', 'Inuyasha', 'Sesshomaru', 'Sango', 'Kagome', 'Kirito',
  'Asuna', 'Sinon', 'Leafa', 'Jotaro', 'Dio', 'Josuke', 'Joseph', 'Polnareff',
  'Shinobu', 'Rengoku', 'Giyu', 'Akaza', 'Muzan', 'Eula', 'Diluc',
  'Klee', 'Zhongli', 'Venti', 'Raiden', 'Nahida', 'Albedo', 'Kazuha', 'Itto',
  'Xiao', 'Yoimiya', 'Ayaka', 'Tartaglia', 'Scaramouche', 'Furina', 'Clorinde',
  'Freminet', 'Cyno', 'Nilou', 'Baizhu', 'Alhaitham', 'Lynette', 'Lyney', 'Cheems'
].slice(0, 100)

const personajesNormales = nombresComunes.map(nombre => ({
  nombre,
  precio: precioAleatorio(20000, 100000)
}))

const handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (!user) {
    global.db.data.users[m.sender] = {}
    user = global.db.data.users[m.sender]
  }

  if (!user.personajes) user.personajes = []
  if (!user.exp) user.exp = 0
  if (!user.level) user.level = 0
  if (!user.monedas) user.monedas = 0

  if (user.personajes.length === 0) {
    return conn.reply(
      m.chat,
      `
🔒 *NO TIENES PERSONAJES TODAVÍA*

✨ Usa:
*.comprar <nombre>*

🎴 Ejemplo:
*.comprar Goku*

🛒 También puedes usar:
*.pjs*
para ver la tienda completa.
`.trim(),
      m
    )
  }

  const personajesDisponibles = [...personajesTop, ...personajesNormales]

  const buscarDatos = (nombre) => {
    const match = personajesDisponibles.find(
      p => p.nombre.toLowerCase() === nombre.toLowerCase()
    )

    const precio = match?.precio || 100000

    const rareza = match
      ? personajesTop.some(
          p => p.nombre.toLowerCase() === nombre.toLowerCase()
        )
        ? '👑 TOP'
        : precio >= 80000
        ? '💎 Elite'
        : precio >= 60000
        ? '⚔️ Medio'
        : '🌱 Básico'
      : '🌱 Básico'

    return { precio, rareza }
  }

  let totalGastado = 0

  const personajesConDatos = user.personajes.map(nombre => {
    const { precio, rareza } = buscarDatos(nombre)

    totalGastado += precio

    return {
      nombre,
      precio,
      rareza
    }
  })

  personajesConDatos.sort((a, b) => b.precio - a.precio)

  const conteo = {
    '👑 TOP': 0,
    '💎 Elite': 0,
    '⚔️ Medio': 0,
    '🌱 Básico': 0
  }

  personajesConDatos.forEach(p => {
    conteo[p.rareza]++
  })

  const repetidos = {}

  user.personajes.forEach(p => {
    repetidos[p] = (repetidos[p] || 0) + 1
  })

  const lista = personajesConDatos.map((p, i) => {
    const cantidad = repetidos[p.nombre] > 1
      ? ` x${repetidos[p.nombre]}`
      : ''

    return `🎴 ${i + 1}. ${p.nombre}${cantidad}
💰 ${p.precio.toLocaleString()} monedas
🏷️ ${p.rareza}`
  }).join('\n\n')

  const personajeMasCaro = personajesConDatos[0]

  const mensaje = `
〔 🎟️ INVENTARIO MÁGICO 〕

${lista}

┣━━━━━━━━━━━━━━
┣ 📦 Total personajes:
┃ ✦ *${user.personajes.length}*

┣ 💰 Valor total:
┃ ✦ *${totalGastado.toLocaleString()} monedas*

┣ ✨ Nivel:
┃ ✦ *${user.level.toLocaleString()}*

┣ 🧪 Experiencia:
┃ ✦ *${user.exp.toLocaleString()}*

┣ 🪙 Monedas:
┃ ✦ *${user.monedas.toLocaleString()}*

┣━━━━━━━━━━━━━━━⬣
┣ 👑 TOP: *${conteo['👑 TOP']}*
┣ 💎 Elite: *${conteo['💎 Elite']}*
┣ ⚔️ Medio: *${conteo['⚔️ Medio']}*
┣ 🌱 Básico: *${conteo['🌱 Básico']}*
┣━━━━━━━━━━━━━━━⬣

🏆 Personaje más valioso:
${personajeMasCaro.nombre}

💸 Valor:
*${personajeMasCaro.precio.toLocaleString()} monedas*

〔 📂 FIN DEL INVENTARIO 〕━━━⬣
`.trim()

  await conn.reply(m.chat, mensaje, m)
}

handler.help = ['mispersonajes', 'mispjs', 'inventario']
handler.tags = ['rpg', 'economia']
handler.command = ['mispersonajes', 'mispjs', 'inventario']
handler.register = true

export default handler