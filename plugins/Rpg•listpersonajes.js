if (!global.rpgData) global.rpgData = {}

function precioAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

if (!global.rpgData.personajesTop) {
  global.rpgData.personajesTop = [
    {
      nombre: 'Cristo rey 👑',
      precio: 20000000,
      habilidad: '✝️ Resurrección divina y control absoluto del universo.'
    },
    {
      nombre: 'Arcangel Supremo 😇',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🛡 Protección celestial y fuego purificador.'
    },
    {
      nombre: 'The Carlos 🧠',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '💻 Maestro del código y hacker de grimorios.'
    },
    {
      nombre: 'Dios del Tiempo ⏳',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🌀 Controla el tiempo y altera el destino.'
    },
    {
      nombre: 'Dragón Ancestral 🐉',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🔥 Fuego que consume dimensiones enteras.'
    },
    {
      nombre: 'Samurai de la Sombra ⚔️',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🌑 Técnica prohibida bajo luna sangrienta.'
    },
    {
      nombre: 'Dios Guerrero 🪖',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🩸 Poder berserker infinito.'
    },
    {
      nombre: 'Hechicero Supremo 🧙‍♂️',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🔮 Magia absoluta del caos.'
    },
    {
      nombre: 'Titán del Infinito 👹',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🏔 Destruye mundos con un golpe.'
    },
    {
      nombre: 'Alma del Vacío 👻',
      precio: precioAleatorio(5000000, 9999999),
      habilidad: '🌫 Intangibilidad y oscuridad cósmica.'
    }
  ]
}

const nombresComunes = [
  'Goku','Naruto','Sasuke','Luffy','Zoro','Sanji','Sakura','Hinata',
  'Tanjiro','Nezuko','Levi','Eren','Itachi','Madara','Kakashi',
  'Ichigo','Rukia','Byakuya','Saitama','Genos','Batman','Superman',
  'Iron Man','Spider-Man','Thanos','Deadpool','Shrek','Donkey',
  'Elsa','Anna','Simba','Scar','Woody','Buzz','Pikachu','Kirby',
  'Link','Zelda','Ash','Charizard','Mewtwo','Deku','Bakugo',
  'Todoroki','All Might','Gojo','Sukuna','Yuji','Megumi','Nobara',
  'Asta','Yuno','Noelle','Yami','Rem','Emilia','Subaru',
  'Inuyasha','Sesshomaru','Sango','Kagome','Kirito','Asuna',
  'Sinon','Leafa','Jotaro','Dio','Josuke','Joseph','Polnareff',
  'Shinobu','Rengoku','Giyu','Akaza','Muzan','Eula','Diluc',
  'Klee','Zhongli','Venti','Raiden','Nahida','Albedo','Kazuha',
  'Itto','Xiao','Yoimiya','Ayaka','Tartaglia','Scaramouche',
  'Furina','Clorinde','Freminet','Cyno','Nilou','Baizhu',
  'Alhaitham','Lynette','Lyney','Cheems'
].slice(0, 100)

if (!global.rpgData.personajesComunes) {
  global.rpgData.personajesComunes = nombresComunes.map(nombre => ({
    nombre,
    precio: precioAleatorio(20000, 100000)
  }))
}

const personajesTop = global.rpgData.personajesTop
const personajesComunes = global.rpgData.personajesComunes

const normalize = txt => txt.toLowerCase().replace(/[^\w\s]/g, '').trim()

const handler = async (m, { conn, args, command }) => {
  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = {}
  }

  const user = global.db.data.users[m.sender]

  if (!Array.isArray(user.personajes)) user.personajes = []
  if (typeof user.monedas !== 'number') user.monedas = 0

  // =========================
  // 📜 COMANDO LISTA
  // =========================
  if (['listarpersonajes', 'personajes', 'pjs', 'chars'].includes(command)) {

    const yaTiene = nombre =>
      user.personajes.includes(nombre.toLowerCase()) ? '✅' : ''

    const topTexto = personajesTop.map((p, index) =>
`╭━━〔 👑 TOP ${index + 1} 〕━━⬣
┃ 🎖️ ${p.nombre} ${yaTiene(p.nombre)}
┃ 💰 ${p.precio.toLocaleString()} monedas
┃ 🧠 ${p.habilidad}
╰━━━━━━━━━━━━⬣`
    ).join('\n\n')

    const comunesAgrupados = {
      '💎 Elite (80k - 100k)': [],
      '⚔️ Rango Medio (50k - 79k)': [],
      '🌱 Básico (20k - 49k)': []
    }

    for (const p of personajesComunes) {
      const tiene = yaTiene(p.nombre)

      const linea =
`┃ • ${p.nombre} ${tiene}
┃ 💰 ${p.precio.toLocaleString()} monedas`

      if (p.precio >= 80000) {
        comunesAgrupados['💎 Elite (80k - 100k)'].push(linea)
      } else if (p.precio >= 50000) {
        comunesAgrupados['⚔️ Rango Medio (50k - 79k)'].push(linea)
      } else {
        comunesAgrupados['🌱 Básico (20k - 49k)'].push(linea)
      }
    }

    let comunesTexto = ''

    for (const [rango, lista] of Object.entries(comunesAgrupados)) {
      comunesTexto += `
╭━━〔 ${rango} 〕━━⬣
${lista.join('\n')}
╰━━━━━━━━━━━━⬣
`
    }

    const totalPersonajes = user.personajes.length
    const porcentajeColeccion = (
      (totalPersonajes / (personajesTop.length + personajesComunes.length)) * 100
    ).toFixed(1)

    const texto = `
╔══════════════════╗
   🛡️ PERSONAJES RPG 🧬
╚══════════════════╝

👤 Coleccionista:
➤ @${m.sender.split('@')[0]}

📦 Personajes obtenidos:
➤ ${totalPersonajes}

💰 Tus monedas:
➤ ${user.monedas.toLocaleString()} 🪙

📊 Progreso de colección:
➤ ${porcentajeColeccion}%

━━━━━━━━━━━━━━━

👑 TOP PERSONAJES ÉPICOS 👑

${topTexto}

━━━━━━━━━━━━━━━

🎭 PERSONAJES COMUNES 🎭

${comunesTexto}

━━━━━━━━━━━━━━

📌 Usa:
➤ *.comprar <nombre>*

✅ = Ya desbloqueado
`.trim()

    return conn.sendMessage(
      m.chat,
      { text: texto, mentions: [m.sender] },
      { quoted: m }
    )
  }

  // =========================
  // 💰 COMANDO COMPRAR
  // =========================
  if (['comprar', 'buy', 'buychar'].includes(command)) {

    const nombre = args.join(' ').trim()
    if (!nombre) {
      return conn.reply(m.chat, '❌ Escribe el nombre del personaje.', m)
    }

    const todos = [...personajesTop, ...personajesComunes]

    const personaje = todos.find(p =>
      normalize(p.nombre) === normalize(nombre)
    )

    if (!personaje) {
      return conn.reply(m.chat, `❌ El personaje "${nombre}" no existe.`, m)
    }

    if (user.personajes.includes(personaje.nombre.toLowerCase())) {
      return conn.reply(m.chat, `⚠️ Ya tienes a ${personaje.nombre}.`, m)
    }

    if (user.monedas < personaje.precio) {
      return conn.reply(
        m.chat,
        `❌ No tienes suficientes monedas.\n💰 Necesitas: ${personaje.precio.toLocaleString()}`,
        m
      )
    }

    user.monedas -= personaje.precio
    user.personajes.push(personaje.nombre.toLowerCase())

    return conn.reply(
      m.chat,
`✅ COMPRA EXITOSA

🎭 ${personaje.nombre}
💰 -${personaje.precio.toLocaleString()} monedas

🪙 Te quedan:
➤ ${user.monedas.toLocaleString()}`,
      m
    )
  }
}

handler.help = ['personajes', 'comprar <nombre>']
handler.tags = ['rpg']
handler.command = ['personajes', 'listarpersonajes', 'pjs', 'chars', 'comprar', 'buy', 'buychar']
handler.register = true

export default handler