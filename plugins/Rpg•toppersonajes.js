const handler = async (m, { conn }) => {
  const db = global.db.data.users
  const user = db[m.sender]

  // 💎 
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
    'Goku','Naruto','Sasuke','Luffy','Zoro','Sanji','Sakura','Hinata','Tanjiro','Nezuko',
    'Levi','Eren','Itachi','Madara','Kakashi','Ichigo','Rukia','Byakuya','Saitama','Genos',
    'Batman','Superman','Iron Man','Spider-Man','Thanos','Deadpool','Shrek','Donkey',
    'Elsa','Anna','Simba','Scar','Woody','Buzz','Pikachu','Kirby','Link','Zelda','Ash',
    'Charizard','Mewtwo','Deku','Bakugo','Todoroki','All Might','Gojo','Sukuna','Yuji',
    'Megumi','Nobara','Asta','Yuno','Noelle','Yami','Rem','Emilia','Subaru','Inuyasha',
    'Sesshomaru','Sango','Kagome','Kirito','Asuna','Sinon','Leafa','Jotaro','Dio','Josuke',
    'Joseph','Polnareff','Shinobu','Rengoku','Giyu','Akaza','Muzan','Eula','Diluc','Klee',
    'Zhongli','Venti','Raiden','Nahida','Albedo','Kazuha','Itto','Xiao','Yoimiya','Ayaka',
    'Tartaglia','Scaramouche','Furina','Clorinde','Freminet','Cyno','Nilou','Baizhu',
    'Alhaitham','Lynette','Lyney','Cheems'
  ].slice(0, 100)

  const personajesComunes = nombresComunes.map(nombre => ({
    nombre,
    precio: 50000 // precio fijo o puedes usar uno aleatorio si prefieres
  }))

  const todos = [...personajesTop, ...personajesComunes]
  const normalizar = str => str.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()

  // 🔍 Ranking
  let ranking = Object.entries(db)
    .filter(([_, u]) => Array.isArray(u.personajes) && u.personajes.length > 0)
    .map(([jid, u]) => {
      let total = 0
      const rarezas = { '👑 TOP': 0, '💎 Elite': 0, '⚔️ Medio': 0, '🌱 Básico': 0 }

      for (let nombreGuardado of u.personajes) {
        const personajeReal = todos.find(p => normalizar(p.nombre) === normalizar(nombreGuardado))
        const precio = personajeReal?.precio || 50000
        const rareza = personajesTop.includes(personajeReal)
          ? '👑 TOP'
          : precio >= 80000 ? '💎 Elite'
          : precio >= 60000 ? '⚔️ Medio'
          : '🌱 Básico'

        rarezas[rareza]++
        total += precio
      }

      return {
        jid,
        cantidad: u.personajes.length,
        gastado: total,
        rarezas
      }
    })
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10)

  if (ranking.length === 0) {
    return m.reply('❌ Aún nadie ha comprado personajes.')
  }

  let texto = `╭═〔 👾 𝗧𝗢𝗣 𝗖𝗢𝗟𝗘𝗖𝗖𝗜𝗢𝗡𝗜𝗦𝗧𝗔𝗦 〕═⬣\n│\n`
  let menciones = []

  for (let i = 0; i < ranking.length; i++) {
    const { jid, cantidad, gastado, rarezas } = ranking[i]
    let name = 'Usuario'
    try {
      name = await conn.getName(jid)
    } catch {
      name = '@' + jid.split('@')[0]
    }

    const medalla = i === 0 ? '🥇'
      : i === 1 ? '🥈'
      : i === 2 ? '🥉'
      : '🔹'

    texto += `│ ${medalla} *${i + 1}.* ${name}\n`
    texto += `│    🧩 Personajes: *${cantidad}*\n`
    texto += `│    💰 Gastado: *${gastado.toLocaleString('es-MX')} monedas*\n`
    texto += `│    👑 ${rarezas['👑 TOP']}  💎 ${rarezas['💎 Elite']}  ⚔️ ${rarezas['⚔️ Medio']}  🌱 ${rarezas['🌱 Básico']}\n│\n`

    menciones.push(jid)
  }

  texto += '╰══════════════════════⬣\n'
  texto += '\n📈 *Sigue comprando para subir en el ranking.*\n🛒 Usa *.comprar <nombre>*'

  conn.reply(m.chat, texto.trim(), m, { mentions: menciones })
}

handler.help = ['toppersonajes']
handler.tags = ['rpg', 'ranking']
handler.command = ['toppersonajes', 'topchars', 'toppsj']
handler.register = true

export default handler