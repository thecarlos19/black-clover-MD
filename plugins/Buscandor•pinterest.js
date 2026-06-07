import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '⚠️'
  const rwait = '⏳'
  const done = '✅'
  const error = '❌'
  const dev = 'by The Carlos 👑'

  const text = args.join(' ').trim()

  if (!text) {
    return conn.reply(m.chat, `${emoji} Ingresa un término de búsqueda en Pinterest.\n\nEj: *${usedPrefix + command} black clover*`, m)
  }

  await m.react(rwait)

  try {
    const res = await fetch(
      `https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(text)}&apikey=freeApikey`,
      { timeout: 15000 }
    )

    const json = await res.json()

    if (!json.success ||!json.data?.result?.length) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji} Sin resultados para: ${text}`, m)
    }

    const results = json.data.result
    const pin = results[Math.floor(Math.random() * results.length)]

    const imageUrl =
      pin.images?.['736x']?.url ||
      pin.images?.['345x']?.url ||
      pin.images?.['236x']?.url

    if (!imageUrl) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji} No se pudo obtener la imagen.`, m)
    }

    let txt = `乂 *P I N T E R E S T* 乂\n\n`
    txt += `*» Búsqueda* : ${text}\n`
    if (pin.description) txt += `*» Descripción* : ${pin.description.slice(0, 100)}\n`
    if (pin.native_creator?.full_name) txt += `*» Autor* : ${pin.native_creator.full_name}\n`
    if (pin.aggregated_pin_data?.aggregated_stats?.saves) txt += `*» Guardados* : ${pin.aggregated_pin_data.aggregated_stats.saves}\n`
    if (pin.created_at) txt += `*» Fecha* : ${pin.created_at}\n`
    txt += `\n> *${dev}*`

    const buttons = [
      { buttonId: `${usedPrefix + command} ${text}`, buttonText: { displayText: '🔄 Otra imagen' }, type: 1 },
      { buttonId: `${usedPrefix}pinmore ${text}`, buttonText: { displayText: '📸 Ver 5 más' }, type: 1 },
      { buttonId: `${usedPrefix}pindl ${imageUrl}`, buttonText: { displayText: '⬇️ Descargar HD' }, type: 1 }
    ]

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption: txt,
        footer: '𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 | 𝕳𝖆𝖐 v777 🥷🏻',
        buttons: buttons,
        headerType: 4
      },
      { quoted: m }
    )

    await m.react(done)

  } catch (e) {
    console.error(e)
    await m.react(error)
    conn.reply(m.chat, `${emoji} Error:\n${e.message}`, m)
  }
}

handler.pinmore = async (m, { conn, args }) => {
  const text = args.join(' ').trim()
  if (!text) return m.reply('❌ Usa el botón o escribe la búsqueda')

  await m.react('⏳')
  try {
    const res = await fetch(`https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(text)}&apikey=freeApikey`)
    const json = await res.json()

    if (!json.success ||!json.data?.result?.length) {
      return m.reply('❌ Sin resultados')
    }

    const images = json.data.result.slice(0, 5)

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i].images?.['736x']?.url || images[i].images?.['345x']?.url
      if (!imageUrl) continue
      
      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `📸 *Imagen ${i + 1}/5*\n🔍 ${text}`
      }, { quoted: m })
      await new Promise(r => setTimeout(r, 1000))
    }
    await m.react('✅')
  } catch {
    await m.react('❌')
    m.reply('❌ Error al cargar más imágenes')
  }
}

handler.pindl = async (m, { conn, args }) => {
  const url = args[0]
  if (!url) return m.reply('❌ URL inválida')

  await m.react('⏳')
  try {
    await conn.sendMessage(m.chat, {
      document: { url: url },
      mimetype: 'image/jpeg',
      fileName: `pinterest_${Date.now()}.jpg`,
      caption: '⬇️ *Descarga HD*\n\n> by The Carlos 👑'
    }, { quoted: m })
    await m.react('✅')
  } catch {
    await m.react('❌')
    m.reply('❌ Error al descargar')
  }
}

handler.before = async (m, { conn }) => {
  if (m.text?.startsWith('.pinmore ')) {
    const args = m.text.slice(9).split(' ')
    return handler.pinmore(m, { conn, args, usedPrefix: '.' })
  }
  if (m.text?.startsWith('.pindl ')) {
    const args = m.text.slice(7).split(' ')
    return handler.pindl(m, { conn, args })
  }
}

handler.help = ['pinterest <búsqueda>', 'pin <búsqueda>']
handler.tags = ['search']
handler.command = ['pinterest', 'pin','pindl', 'pinmore']
handler.limit = true

export default handler