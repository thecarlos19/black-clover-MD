import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const txt_owner = `
𝙷𝙾𝙻𝙰, 𝙴𝚂𝚃𝙴 𝙴𝚂 𝙴𝙻 𝙽𝚄𝙼𝙴𝚁𝙾 𝙳𝙴 𝙼𝙸 𝙲𝚁𝙴𝙰𝙳𝙾𝚁. 
𝐓𝐇𝐄 𝐂𝐀𝐑𝐋𝐎𝐒: +525544876071

Cualquier falla o si quieres agregar el bot a tu grupo, puedes contactarlo.
`

  try {
    const res = await fetch("https://qu.ax/egfjW.jpg")
    if (!res.ok) throw new Error('No se pudo descargar la imagen')
    const buffer = await res.arrayBuffer()
    await conn.sendFile(
      m.chat, 
      Buffer.from(buffer), 
      'thumbnail.jpg', 
      txt_owner, 
      m
    )
  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo enviar la imagen del creador. Intenta más tarde.')
  }
}

handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño']

export default handler