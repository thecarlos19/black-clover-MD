const handler = async (m, { conn }) => {
  if (!global.db.data.users) global.db.data.users = {}
  const db = global.db.data.users

  const personajesTop = [
    { nombre: 'Cristo rey 👑', precio: 20000000 },
    { nombre: 'Arcangel Supremo 😇', precio: 9000000 },
    { nombre: 'The Carlos 🧠', precio: 8500000 },
    { nombre: 'Dios del Tiempo ⏳', precio: 9100000 },
    { nombre: 'Dragón Ancestral 🐉', precio: 8700000 },
    { nombre: 'Samurai de la Sombra ⚔️', precio: 8900000 },
    { nombre: 'Dios Guerrero 🪖', precio: 9300000 },
    { nombre: 'Hechicero Supremo 🧙‍♂️', precio: 8800000 },
    { nombre: 'Titán del Infinito 👹', precio: 8600000 },
    { nombre: 'Alma del Vacío 👻', precio: 9400000 }
  ]

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

  const personajesComunes = nombresComunes.map(nombre => ({
    nombre,
    precio: 50000
  }))

  const todos = [...personajesTop, ...personajesComunes]

  const normalizar = text =>
    text?.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()

  let ranking = Object.entries(db)
    .filter(([_, u]) => {
      if (!u) return false
      if (!Array.isArray(u.personajes)) u.personajes = []
      return u.personajes.length > 0
    })
    .map(([jid, u]) => {
      if (!u.personajes) u.personajes = []
      if (!u.monedas) u.monedas = 0
      if (!u.level) u.level = 0

      let total = 0

      const rarezas = {
        '👑 TOP': 0,
        '💎 Elite': 0,
        '⚔️ Medio': 0,
        '🌱 Básico': 0
      }

      const inventario = {}

      for (const nombreGuardado of u.personajes) {
        if (!nombreGuardado) continue

        const personajeReal = todos.find(
          p => normalizar(p.nombre) === normalizar(nombreGuardado)
        )

        const precio = personajeReal?.precio || 50000

        const rareza = personajesTop.some(
          p => normalizar(p.nombre) === normalizar(nombreGuardado)
        )
          ? '👑 TOP'
          : precio >= 80000
            ? '💎 Elite'
            : precio >= 60000
              ? '⚔️ Medio'
              : '🌱 Básico'

        total += precio
        rarezas[rareza]++

        inventario[nombreGuardado] =
          (inventario[nombreGuardado] || 0) + 1
      }

      return {
        jid,
        cantidad: u.personajes.length,
        gastado: total,
        rarezas,
        inventario,
        nivel: u.level,
        monedas: u.monedas
      }
    })
    .sort((a, b) => {
      if (b.cantidad !== a.cantidad) {
        return b.cantidad - a.cantidad
      }
      return b.gastado - a.gastado
    })
    .slice(0, 10)

  if (!ranking.length) {
    return conn.reply(m.chat, '❌ Aún no hay coleccionistas registrados.', m)
  }

  let texto = `
╭━━━〔 👾 TOP COLECCIONISTAS 👾 〕━━━⬣
┃
┃ 🏆 Ranking oficial del Reino Mágico
┃ 📦 Basado en personajes obtenidos
╰━━━━━━━━━━━━━━━━━━━━━━⬣`.trim()

  let menciones = []

  for (let i = 0; i < ranking.length; i++) {
    const data = ranking[i]

    let nombre = '@' + data.jid.split('@')[0]

    try {
      nombre = await conn.getName(data.jid)
    } catch {}

    const medalla =
      i === 0 ? '🥇'
      : i === 1 ? '🥈'
      : i === 2 ? '🥉'
      : '🔹'

    const personajeFavorito =
      Object.entries(data.inventario)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ninguno'

    texto += `

${medalla} *${i + 1}. ${nombre}*
┃ 🧩 Personajes: *${data.cantidad}*
┃ 💰 Valor total: *${data.gastado.toLocaleString('es-MX')} monedas*
┃ ✨ Nivel: *${data.nivel}*
┃ 🪙 Monedas: *${data.monedas.toLocaleString('es-MX')}*
┃ 🎴 Favorito: *${personajeFavorito}*
┃
┃ 👑 TOP: *${data.rarezas['👑 TOP']}*
┃ 💎 Elite: *${data.rarezas['💎 Elite']}*
┃ ⚔️ Medio: *${data.rarezas['⚔️ Medio']}*
┃ 🌱 Básico: *${data.rarezas['🌱 Básico']}*
┃━━━━━━━━━━━━━━━━━━⬣`

    menciones.push(data.jid)
  }

  texto += `

📈 *Sigue coleccionando personajes para subir posiciones.*
🛒 Usa *.comprar <nombre>* para conseguir nuevos héroes.
🎁 Usa *.invocacion* para obtener personajes especiales.`

  await conn.reply(m.chat, texto.trim(), m, { mentions: menciones })

  await conn.sendMessage(m.chat, {
    react: { text: '🏆', key: m.key }
  })
}

handler.help = ['toppersonajes']
handler.tags = ['rpg', 'ranking']
handler.command = ['toppersonajes', 'topchars', 'toppsj']
handler.register = true

export default handler