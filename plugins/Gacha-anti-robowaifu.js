//código creado x The Carlos 👑 

let handler = async (m, { conn, args }) => {
  const userId = m.sender

  global.db.data.users = global.db.data.users || {}
  let user = global.db.data.users[userId] = global.db.data.users[userId] || {}

  user.monedas = Number(user.monedas || 0)
  user.antirobo = Number(user.antirobo || 0)

  const tipo = (args[0] || '').toLowerCase()

  const config = {
    hora: { costo: 30000, duracion: 60 * 60 * 1000, nombre: '1 Hora' },
    dia: { costo: 500000, duracion: 24 * 60 * 60 * 1000, nombre: '1 Día' },
    semana: { costo: 2000000, duracion: 7 * 24 * 60 * 60 * 1000, nombre: '1 Semana' },
    mes: { costo: 5000000, duracion: 30 * 24 * 60 * 60 * 1000, nombre: '1 Mes' }
  }

  if (!config[tipo]) {
    let texto = `✘ *Uso incorrecto*\n\n`
    texto += `*Precios AntiRobo:*\n`
    texto += `➤ Hora: 30,000 monedas\n`
    texto += `➤ Día: 500,000 monedas\n`
    texto += `➤ Semana: 2,000,000 monedas\n`
    texto += `➤ Mes: 5,000,000 monedas\n\n`
    texto += `*Ejemplo:* #antirobo hora`

    if (user.antirobo > Date.now()) {
      let restante = user.antirobo - Date.now()
      let dias = Math.floor(restante / (24 * 60 * 60 * 1000))
      let horas = Math.floor((restante % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      let min = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000))
      texto += `\n🛡️ *Protección activa*\nExpira en: ${dias}d ${horas}h ${min}m`
    }

    return conn.reply(m.chat, texto, m)
  }

  const { costo, duracion, nombre } = config[tipo]

  if (user.monedas < costo) {
    return conn.reply(
      m.chat,
      `✘ *Monedas insuficientes*\n\nNecesitas: *${costo.toLocaleString()}* monedas\nTienes: *${user.monedas.toLocaleString()}* monedas\n\nTe faltan: *${(costo - user.monedas).toLocaleString()}* monedas`,
      m
    )
  }

  user.monedas -= costo

  if (user.antirobo > Date.now()) {
    user.antirobo += duracion
  } else {
    user.antirobo = Date.now() + duracion
  }

  let expira = new Date(user.antirobo).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })

  await conn.reply(
    m.chat,
    `✅ *AntiRobo Activado*\n\n📦 Plan: *${nombre}*\n💰 Costo: *${costo.toLocaleString()}* monedas\n🛡️ Expira: *${expira}*\n\nTu dinero está protegido contra robos`,
    m
  )
}

handler.help = ['antirobo <hora|dia|semana|mes>']
handler.tags = ['rpg', 'economia']
handler.command = ['antirobo']
handler.register = true

export default handler