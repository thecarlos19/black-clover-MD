let handler = async (m, { conn, usedPrefix, command }) => {
  let uptime = process.uptime()
  let runtime = `『${global.packname || 'Bot'}』

⏳ *Tiempo Activo:* ${rTime(uptime)}`

  await conn.sendMessage(
    m.chat,
    {
      text: runtime,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: false,
          title: global.packname || 'Black-clover-MD',
          body: global.dev || '✡︎ Dev • The Carlos',
          mediaType: 2,
          thumbnail: global.icons ? { url: global.icons } : null,
          sourceUrl: global.channel || 'https://github.com/thecarlos19'
        }
      }
    },
    { quoted: m }
  )
}

handler.help = ['runtime']
handler.tags = ['main']
handler.command = ['uptime', 'runtime']

export default handler

function rTime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const dDisplay = d > 0 ? `${d} ${d === 1 ? 'Día, ' : 'Días, '}` : ''
  const hDisplay = h > 0 ? `${h} ${h === 1 ? 'Hora, ' : 'Horas, '}` : ''
  const mDisplay = m > 0 ? `${m} ${m === 1 ? 'Minuto, ' : 'Minutos, '}` : ''
  const sDisplay = s > 0 ? `${s} ${s === 1 ? 'Segundo' : 'Segundos'}` : ''

  return dDisplay + hDisplay + mDisplay + sDisplay
}