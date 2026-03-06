let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0] || isNaN(args[0])) return m.reply(`🚩 Ingresa un número que represente el número de días.\n\n*Ejemplo:*\n*${usedPrefix + command}* 30`)

    let who
    if (m.isGroup) who = args[1] ? args[1] : m.chat
    else who = args[1] ? args[1] : m.chat

    global.db.data.chats[who] ||= {}

    let nDays = 86400000 * parseInt(args[0])
    let now = Date.now()

    if (now < (global.db.data.chats[who].expired || 0)) global.db.data.chats[who].expired += nDays
    else global.db.data.chats[who].expired = now + nDays

    let teks = `🚩 Se estableció los días de vencimiento para \n*${await conn.getName(who)}* \n\n*Durante:* ${args[0]} Días\n\n*Cuenta regresiva :* ${msToDate(global.db.data.chats[who].expired - now)}`
    
    m.reply(teks)
}

handler.help = ['expired <días>']
handler.tags = ['owner']
handler.command = ['expire','addexpired']
handler.rowner = true

export default handler

function msToDate(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, ' *Días*\n ', h, ' *Horas*\n ', m, ' *Minutos*\n ', s, ' *Segundos* '].map(v => v.toString().padStart(2, 0)).join('')
}