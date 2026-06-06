let handler = async (m, { conn, text, command }) => {
  let [id,...reason] = text.split(' ')
  id = id? id : m.chat
  let motivo = reason.join(' ') || 'Sin razón especificada'

  let chat = global.db.data.chats[id]

  if (!chat) {
    global.db.data.chats[id] = {}
    chat = global.db.data.chats[id]
  }

  chat.welcome = false
  chat.leaving = true

  try {
    await conn.sendMessage(id, {
      text: `《✧》 *Black Clover* abandona el grupo.\n\n📝 Razón: ${motivo}\n\nFue genial estar aquí ⚔️`
    })

    await conn.sendMessage(m.chat, {
      text: `✅ Saliendo de ${id.includes('@g.us')? 'grupo' : 'chat'} en 3s...\nRazón: ${motivo}`
    })

    setTimeout(async () => {
      try {
        await conn.groupLeave(id)

        if (global.db.data.chats[id]) {
          delete global.db.data.chats[id].welcome
          delete global.db.data.chats[id].leaving
        }

        await conn.sendMessage(m.chat, {
          text: `✅ Salí correctamente de ${id}`
        })

      } catch (e) {
        console.error('Error al salir:', e)
        await m.reply(`❌ No pude salir del grupo\n\nError: ${e.message}`)
        if (chat) {
          chat.welcome = true
          delete chat.leaving
        }
      }
    }, 3000)

  } catch (e) {
    console.error(e)
    await m.reply('❌ Error al ejecutar el comando')
    if (chat) {
      chat.welcome = true
      delete chat.leaving
    }
  }
}

handler.command = ['leave', 'leavegc', 'salir']
handler.group = false
handler.rowner = true

export default handler