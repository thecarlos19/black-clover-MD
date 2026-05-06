const cooldown = 12 * 60 * 60 * 1000

var handler = async (m, { conn, isPrems }) => {
  global.db.data.users = global.db.data.users || {}

  const user = global.db.data.users[m.sender]

  if (!user) {
    return conn.reply(
      m.chat,
      '❌ Usuario no encontrado en la base de datos.',
      m
    )
  }

  const now = Date.now()

  user.lastclaim = user.lastclaim || 0

  if (now - user.lastclaim < cooldown) {
    const timeLeft = msToTime(
      cooldown - (now - user.lastclaim)
    )

    return conn.reply(
      m.chat,
      `⏳ *Sistema de recompensas bloqueado*\n\n🧬 Vuelve en: *${timeLeft}*`,
      m
    )
  }

  const coin = isPrems
    ? pickRandom([3000, 5000, 7000, 10000, 15000])
    : pickRandom([500, 700, 1000, 1500, 2000, 3000, 5000])

  const exp = isPrems
    ? pickRandom([1500, 2000, 2500, 3000, 4000, 5000])
    : pickRandom([700, 900, 1200, 1500, 1800])

  const diamonds = isPrems
    ? pickRandom([3, 4, 5, 6, 7, 10])
    : pickRandom([1, 2, 3, 4, 5])

  const bonus = Math.random() < 0.08

  let extraCoins = 0
  let extraExp = 0

  if (bonus) {
    extraCoins = Math.floor(Math.random() * 10000) + 5000
    extraExp = Math.floor(Math.random() * 3000) + 1000
  }

  user.monedas = Number(user.monedas || 0) + coin + extraCoins
  user.exp = Number(user.exp || 0) + exp + extraExp
  user.diamond = Number(user.diamond || 0) + diamonds
  user.lastclaim = now

  let txt = `
╔══🎁〔 𝗥𝗘𝗖𝗢𝗠𝗣𝗘𝗡𝗦𝗔 𝗗𝗜𝗔𝗥𝗜𝗔 〕══╗
┃ 🧬 Recompensa generada por el sistema
┃ ⚡ Usuario: *@${m.sender.split("@")[0]}*
┃ 💎 Premium: *${isPrems ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*
╠═══════════════════════
┃ ✨ XP: *+${Number(exp).toLocaleString()}*
┃ 💰 Monedas: *+${Number(coin).toLocaleString()} 🪙*
┃ 💎 Diamantes: *+${Number(diamonds).toLocaleString()}*
╚══════════════════════╝
`.trim()

  if (bonus) {
    txt += `

╔══🌟〔 𝗕𝗢𝗡𝗨𝗦 𝗘𝗦𝗣𝗘𝗖𝗜𝗔𝗟 〕══╗
┃ 🎉 ¡El sistema te recompensó!
┃ 💰 Extra monedas: *+${Number(extraCoins).toLocaleString()}*
┃ ✨ Extra XP: *+${Number(extraExp).toLocaleString()}*
╚══════════════════════╝`
  }

  txt += `

📦 *BALANCE ACTUAL*
🪙 Monedas: *${Number(user.monedas).toLocaleString()}*
✨ XP Total: *${Number(user.exp).toLocaleString()}*
💎 Diamantes: *${Number(user.diamond).toLocaleString()}*

🕐 Reintenta nuevamente en *12 horas*.`

  return conn.reply(
    m.chat,
    txt.trim(),
    m,
    {
      mentions: [m.sender]
    }
  )
}

handler.help = ['daily', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']
handler.register = true
handler.fail = null

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}