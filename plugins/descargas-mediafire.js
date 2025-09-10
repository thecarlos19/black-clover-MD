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

  try {
    let res = await fetch(`https://delirius-apiofc.vercel.app/download/mediafire?url=${text}`)
    if (!res.ok) throw new Error(`❌ Error en la API (${res.status})`)

    let data = await res.json()

    // Verificar que la API trajo datos válidos
    if (!data || !data.data || !data.data[0]) {
      return m.reply(`❌ No se pudo obtener información del enlace.\nVerifica que sea un link válido de *mediafire*.`)
    }

    let file = data.data[0]

    await conn.sendFile(
      m.chat,
      file.link,
      file.nama || 'archivo',
      `乂  *¡MEDIAFIRE - DESCARGAS!*  乂
      
✩ *Nombre* : ${file.nama || 'Desconocido'}
✩ *Peso* : ${file.size || 'N/A'}
✩ *MimeType* : ${file.mime || 'N/A'}
`, m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    m.reply(`⚠️ Ocurrió un error al descargar:\n${e.message}`)
  }
}

handler.help = ['mediafire']
handler.tags = ['descargas']
handler.command = ['mf', 'mediafire']
handler.register = true
handler.group = true

export default handler