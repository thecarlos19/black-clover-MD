// código creado x The Carlos 👑
// comando: listar vip 

let handler = async (m, { conn }) => {
  const emoji = '🌟'
  const now = Date.now()

  global.db.data.users = global.db.data.users || {}

  let vipUsers = Object.entries(global.db.data.users)
    .filter(([jid, user]) =>
      user &&
      user.premium &&
      (
        user.premiumTime === Infinity ||
        user.premiumTime > now
      )
    )
    .sort((a, b) => {
      const timeA = a[1].premiumTime === Infinity ? Infinity : a[1].premiumTime
      const timeB = b[1].premiumTime === Infinity ? Infinity : b[1].premiumTime
      return timeB - timeA
    })

  if (!vipUsers.length) {
    return conn.reply(
      m.chat,
      '🚩 *No hay usuarios VIP/Premium activos.*',
      m
    )
  }

  let totalVip = vipUsers.length
  let premiumPermanente = vipUsers.filter(([_, u]) => u.premiumTime === Infinity).length
  let premiumTemporal = totalVip - premiumPermanente

  let message = `
╭━━━〔 ${emoji} LISTA VIP PREMIUM ${emoji} 〕━━━⬣
┃ 👑 Usuarios Premium: *${totalVip}*
┃ ♾️ Premium Permanente: *${premiumPermanente}*
┃ ⏳ Premium Temporal: *${premiumTemporal}*
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

  for (let i = 0; i < vipUsers.length; i++) {
    const [jid, user] = vipUsers[i]

    let tiempoRestante =
      user.premiumTime === Infinity
        ? Infinity
        : Math.max(user.premiumTime - now, 0)

    let status =
      tiempoRestante > 0 || tiempoRestante === Infinity
        ? '✅ Activo'
        : '❌ Expirado'

    let tiempoTexto = ''

    if (tiempoRestante === Infinity) {
      tiempoTexto = '♾️ Permanente'
    } else {
      let dias = Math.floor(tiempoRestante / 86400000)
      let horas = Math.floor((tiempoRestante % 86400000) / 3600000)
      let minutos = Math.floor((tiempoRestante % 3600000) / 60000)

      tiempoTexto = `${dias}d ${horas}h ${minutos}m`
    }

    let nivel = Number(user.level || 0)
    let exp = Number(user.exp || 0)
    let monedas = Number(user.monedas || 0)

    let insignia =
      tiempoRestante === Infinity
        ? '👑'
        : '💎'

    message += `

╭━━〔 ${insignia} VIP #${i + 1} 〕━━⬣
┃ 👤 Usuario: @${jid.split('@')[0]}
┃ 📊 Estado: *${status}*
┃ ⏳ Tiempo: *${tiempoTexto}*
┃ 🧪 Nivel: *${nivel}*
┃ ✨ Exp: *${exp.toLocaleString()}*
┃ 🪙 Monedas: *${monedas.toLocaleString()}*
╰━━━━━━━━━━━━━━━━⬣`
  }

  message += `

🌟 Gracias por apoyar el Reino Mágico.
💎 Los usuarios Premium poseen beneficios exclusivos.`

  await conn.sendMessage(
    m.chat,
    {
      text: message.trim(),
      mentions: vipUsers.map(([jid]) => jid)
    },
    { quoted: m }
  )
}

handler.help = ['listavip']
handler.tags = ['premium']
handler.command = ['listavip', 'viplist', 'usuariosvip']
handler.register = true
handler.rowner = true

export default handler