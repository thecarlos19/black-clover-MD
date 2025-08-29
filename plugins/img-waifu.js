import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.waifu.pics/sfw/waifu')
    if (!res.ok) throw new Error('No se pudo obtener la imagen')
    
    let json = await res.json()
    if (!json.url) throw new Error('Respuesta sin URL')
    
    await conn.sendFile(m.chat, json.url, 'waifu.jpg', 'Aquí tienes tu waifu 💖', m)
  } catch (e) {
    console.error('Error en comando waifu:', e)
    m.reply('❌ Hubo un problema al obtener la imagen. Intenta de nuevo más tarde.')
  }
}

handler.help = ['waifu']
handler.tags = ['img']
handler.command = ['waifu']
handler.register = true

export default handler