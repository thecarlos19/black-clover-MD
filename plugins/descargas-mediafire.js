import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  const user = global.db.data.users[m.sender] || {}
  const emoji = '🌟'

  if (!user.premium || (user.premiumTime && user.premiumTime < Date.now())) {
    return conn.reply(
      m.chat,
      `🚩 Este comando es exclusivo para usuarios VIP.\n\n${emoji} Usa *vip* para obtener acceso.`,
      m
    )
  }

  if (!text) return m.reply(`${emoji} Por favor, ingresa un link de mediafire.`)
  
  await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })
  let ouh = await fetch(`https://api.agatz.xyz/api/mediafire?url=${text}`)
  let gyh = await ouh.json()
  
  await conn.sendFile(
    m.chat,
    gyh.data[0].link,
    gyh.data[0].nama,
    `乂  *¡MEDIAFIRE - DESCARGAS!*  乂\n\n✩ *Nombre* : ${gyh.data[0].nama}\n✩ *Peso* : ${gyh.data[0].size}\n✩ *MimeType* : ${gyh.data[0].mime}\n> ${dev}`,
    m
  )

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}

handler.help = ['mediafire']
handler.tags = ['descargas']
handler.command = ['mf', 'mediafire']
handler.register = true
handler.group = true

export default handler