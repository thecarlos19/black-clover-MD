
// Respeten credito xddddd (ratas inmundas)

const img = 'https://files.catbox.moe/d3ynrg.jpg'

function obtenerRango(level) {
  if (level >= 100000) return '🌟 Rey Mago'
  if (level >= 70) return '👑 Mago Real'
  if (level >= 50) return '⚔️ Capitán de Escuadrón'
  if (level >= 40) return '🔮 Alto Mago'
  if (level >= 30) return '🥇 Caballero Mágico de Oro'
  if (level >= 20) return '🥈 Caballero Mágico de Plata'
  if (level >= 10) return '🥉 Caballero Mágico de Bronce'
  if (level >= 5) return '🌱 Mago Novato'
  return '📘 Aprendiz de Grimorio'
}

let handler = async (m, { conn }) => {
  try {
    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

    if (!who) return

    if (who === conn?.user?.id) return m.react('✖️')

    global.db.data.users = global.db.data.users || {}

    if (!global.db.data.users[who]) {
      return m.reply('📕 *El grimorio de este usuario aún no ha sido registrado en el Reino Mágico.*')
    }

    let user = global.db.data.users[who]

    let name = ''
    try {
      name = await conn.getName(who)
    } catch {
      name = who.split('@')[0]
    }

    let rangoMagico = obtenerRango(Number(user.level || 0))

    let nombreParaMostrar =
      who === m.sender
        ? name
        : '@' + who.split('@')[0]

    let txt = `
𝙂𝙍𝙄𝙈𝙊𝙍𝙄𝙊 𝙁𝙄𝙉𝘼𝙉𝘾𝙄𝙀𝙍𝙊 👑
🧙‍♂️ ᴍᴀɢᴏ: ${nombreParaMostrar}
🪙 ᴍᴏɴᴇᴅᴀs: *${Number(user.monedas || 0).toLocaleString()}*
📚 ᴇxᴘᴇʀɪᴇɴᴄɪᴀ ᴀᴄᴜᴍᴜʟᴀᴅᴀ: *${Number(user.exp || 0).toLocaleString()}*
📈 ɴɪᴠᴇʟ ᴅᴇ ᴍᴀɢɪᴀ: *${Number(user.level || 0).toLocaleString()}*
🎖️ ʀᴀɴɢᴏ ᴍáɢɪᴄᴏ: *${rangoMagico}*
🕰️ ꜰᴇᴄʜᴀ: *${new Date().toLocaleString('es-ES')}*
📘━━━━━━━━━━━━━━━━📘
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        image: { url: img },
        caption: txt,
        mentions: [who]
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply('❎ Ocurrió un error al obtener el grimorio.')
  }
}

handler.help = ['bank', 'banco']
handler.tags = ['rpg']
handler.command = ['bank', 'banco']
handler.register = true

export default handler