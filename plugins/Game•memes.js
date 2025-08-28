import hispamemes from 'hispamemes'

let handler = async (m, { conn }) => {
  try {
    const meme = await hispamemes.meme()

    await conn.sendMessage(m.chat, {
      image: { url: meme },
      caption: '🤣 Aquí tienes un meme aleatorio'
    }, { quoted: m })

    if (typeof m.react === 'function') m.react('🤣')
  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error al obtener el meme: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['meme']
handler.tags = ['fun']
handler.command = ['meme', 'memes']
handler.cookies = 1
handler.register = true

export default handler