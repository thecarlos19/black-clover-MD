const handler = async (m, { conn, args }) => {
  const db = global.db.data
  const user = db.users[m.sender]
  user.personajes = user.personajes || []

  if (!user.personajes.length) {
    return m.reply('⚠️ Necesitas tener personajes para competir en el reinado.')
  }

  if (!db.reinado) db.reinado = {}

  const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
  const isOwner = [...global.owner.map(([number]) => number)]
    .map(v => v.replace(/[^0-9]/g, '') + detectwhat)
    .includes(m.sender)

  if (args[0] === 'reset') {
    if (!isOwner) return m.reply('❌ No tienes permiso para resetear el reinado.')
    db.reinado = {}
    return m.reply('✅ Reinado mágico reseteado.')
  }

  const personajesGlobal = [...(global.personajesTop || []), ...(global.personajesNormales || [])]

  const poder = user.personajes.reduce((acc, nombrePj) => {
    const pj = personajesGlobal.find(p => p.nombre.toLowerCase() === nombrePj.toLowerCase())
    return acc + (pj?.precio || 100000)
  }, 0) + Math.floor(Math.random() * 50000)

  db.reinado[m.sender] = poder

  const ranking = Object.entries(db.reinado)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const textoRanking = await Promise.all(ranking.map(async ([jid, poder], i) => {
    const isJidOwner = [...global.owner.map(([number]) => number)]
      .map(v => v.replace(/[^0-9]/g, '') + (jid.includes('@lid') ? '@lid' : '@s.whatsapp.net'))
      .includes(jid)

    let nombre
    if (isJidOwner) {
      nombre = '👑 REY MAGO (Owner)'
    } else {
      try {
        nombre = await conn.getName(jid)
      } catch {
        nombre = '@' + jid.split('@')[0]
      }
    }

    const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹'
    return `${medalla} *${i + 1}.* ${nombre} — Poder: *${poder.toLocaleString()}*`
  }))

  const posUsuario = ranking.findIndex(([jid]) => jid === m.sender)
  const texto = `
👑 *REINADO MÁGICO - TOP 10 DOMINIO ARCANO*

${textoRanking.join('\n')}

📌 Tu posición: *${posUsuario + 1 || 'Fuera del top'}*
🔮 Tu poder mágico total: *${poder.toLocaleString()}*

💡 Usa este poder para demostrar tu supremacía mágica.
`.trim()

  return conn.reply(m.chat, texto, m)
}

async function recompensarTopReinado() {
  const db = global.db.data
  if (!db.reinado) return

  const ranking = Object.entries(db.reinado)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  for (let i = 0; i < ranking.length; i++) {
    const [jid] = ranking[i]
    const isJidOwner = [...global.owner.map(([number]) => number)]
      .map(v => v.replace(/[^0-9]/g, '') + (jid.includes('@lid') ? '@lid' : '@s.whatsapp.net'))
      .includes(jid)
    if (isJidOwner) continue

    const user = db.users[jid]
    if (!user) continue

    let premio = 0
    switch (i) {
      case 0: premio = 50000; break
      case 1: premio = 30000; break
      case 2: premio = 15000; break
    }

    user.money = (user.money || 0) + premio
  }
}

handler.help = ['reinado', 'reinado reset']
handler.tags = ['rpg', 'ranking']
handler.command = ['reinado']
handler.register = true

export default handler
export { recompensarTopReinado }