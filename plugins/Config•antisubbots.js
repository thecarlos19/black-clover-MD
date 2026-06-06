//código creado x The Carlos 👑 
//no quiten créditos 

import { areJidsSameUser } from '@whiskeysockets/baileys'

export async function before(m, { participants, conn }) {
  try {
    if (!m.isGroup) return

    const chat = global?.db?.data?.chats?.[m.chat]
    if (!chat?.antiBot2) return
    if (chat.__antiBot2Leaving) return

    const mainConn = global.mainBot?.user?.jid ? global.mainBot : global.conn
    if (!mainConn?.user?.jid || !conn?.user?.jid) return

    const mainJid = mainConn.user.jid
    const thisJid = conn.user.jid

    if (areJidsSameUser(mainJid, thisJid)) return

    const list = Array.isArray(participants) && participants.length
     ? participants
      : (await conn.groupMetadata(m.chat).catch(() => null))?.participants || []

    const isMainBotPresent = list.some(p => areJidsSameUser(p?.id, mainJid))
    if (!isMainBotPresent) return

    chat.__antiBot2Leaving = true

    await conn.sendMessage(m.chat, {
      text: '✦ Bot principal detectado.\nMe retiro para evitar conflicto.'
    }).catch(() => {})

    setTimeout(async () => {
      try {
        await conn.groupLeave(m.chat)
      } catch {} finally {
        if (chat) chat.__antiBot2Leaving = false
      }
    }, 3000)

  } catch (err) {
    console.error('antiBot2 error:', err)
    const chat = global?.db?.data?.chats?.[m.chat]
    if (chat) chat.__antiBot2Leaving = false
  }
}