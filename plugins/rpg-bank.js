const img = 'https://raw.githubusercontent.com/JTxs00/uploads/main/1780717405556.jpeg'

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
    let who = ''
    if (m.mentionedJid && m.mentionedJid.length > 0) who = m.mentionedJid[0]
    else if (m.quoted && m.quoted.sender) who = m.quoted.sender
    else who = m.sender

    if (!who) return
    if (who === conn.user?.jid || who === conn.user?.id) return m.react('✖️')

    global.db.data.users = global.db.data.users || {}

    if (!global.db.data.users[who]) {
      global.db.data.users[who] = {
        monedas: 0,
        exp: 0,
        level: 0
      }
    }

    let user = global.db.data.users[who]
    user.monedas = Number(user.monedas || 0)
    user.exp = Number(user.exp || 0)
    user.level = Number(user.level || 0)

    let name = ''
    try {
      name = await conn.getName(who)
    } catch {
      name = who.split('@')[0]
    }

    let rangoMagico = obtenerRango(user.level)

    let nombreParaMostrar = who === m.sender? name : '@' + who.split('@')[0]

    let txt = `𝙂𝙍𝙄𝙈𝙊𝙍𝙄𝙊 𝙁𝙄𝙉𝘼𝙉𝘾𝙄𝙀𝙍𝙊 👑
🧙‍♂️ ᴍᴀɢᴏ: ${nombreParaMostrar}
🪙 ᴍᴏɴᴇᴅᴀs: *${user.monedas.toLocaleString()}*
📚 ᴇxᴘᴇʀɪᴇɴᴄɪᴀ ᴀᴄᴜᴍᴜʟᴀᴅᴀ: *${user.exp.toLocaleString()}*
📈 ɴɪᴠᴇʟ ᴅᴇ ᴍᴀɢɪᴀ: *${user.level.toLocaleString()}*
🎖️ ʀᴀɴɢᴏ ᴍáɢɪᴄᴏ: *${rangoMagico}*
🕰️ ꜰᴇᴄʜᴀ: *${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}*
📘━━━━━━━━━━━━━━━━📘`.trim()

    await conn.sendMessage(
      m.chat,
      {
        image: { url: img },
        caption: txt,
        mentions: who!== m.sender? [who] : []
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
