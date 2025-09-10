//código creado x The Carlos 👑 
//no quiten créditos 
let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  if (!m.chat.endsWith('@g.us')) return false

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat || !chat.autoRechazar) return false
  if (!isBotAdmin) return true

  try {
    const pending = await conn.groupRequestParticipantsList(m.chat)
    if (!Array.isArray(pending) || pending.length === 0) return false

    const prefixes = ['6', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '49', '2', '91', '48']

    const toReject = pending
      .filter(p => prefixes.some(prefix => p.id.replace(/[^0-9]/g, '').startsWith(prefix)))
      .map(p => p.id)

    if (toReject.length > 0) {
      await conn.groupRequestParticipantsUpdate(m.chat, toReject, 'reject')
      // Si deseas avisar al grupo, descomenta esta línea:
      // await conn.sendMessage(m.chat, { text: `🚫 Se han rechazado ${toReject.length} solicitudes.` }, { quoted: m })
    }
  } catch (err) {
    console.error('Error en autoRechazar:', err)
  }

  return false
}

export default handler