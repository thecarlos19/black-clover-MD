import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const handler = async (m, { conn, command, participants, isAdmin, isBotAdmin, usedPrefix }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const memberIds = participants.map(u => u.id)
  const now = Date.now()
  let ghosts = []
  let semiGhosts = []

  for (let userId of memberIds) {
    if (userId === conn.user.jid) continue

    const userDb = global.db.data.users[userId] || {}
    const participant = participants.find(u => u.id === userId)
    const isUserAdmin = participant?.admin

    const lastSeen = userDb.lastseen || userDb.lastMessage || 0
    const daysInactive = (now - lastSeen) / 86400000
    const msgCount = userDb.chat || 0

    if (!isUserAdmin && userDb.whitelist!== true) {
      if (msgCount === 0 || daysInactive > 30) {
        ghosts.push({ id: userId, days: Math.floor(daysInactive), msgs: msgCount })
      } else if (daysInactive > 14 && msgCount < 5) {
        semiGhosts.push({ id: userId, days: Math.floor(daysInactive), msgs: msgCount })
      }
    }
  }

  if (ghosts.length === 0 && semiGhosts.length === 0) {
    return conn.reply(m.chat, '🎌 Este grupo no tiene fantasmas activos.', m)
  }

  const listGhosts = ghosts.map((v, i) => `${i + 1}. @${v.id.split('@')[0]} - ${v.days}d - ${v.msgs}msg`).join('\n')
  const listSemi = semiGhosts.map((v, i) => `${i + 1}. @${v.id.split('@')[0]} - ${v.days}d - ${v.msgs}msg`).join('\n')

  let text = `💥 *REVISIÓN DE FANTASMAS*\n\n`
  if (ghosts.length) {
    text += `⚠️ *Inactivos +30 días / 0 mensajes:*\n${listGhosts}\n\n`
  }
  if (semiGhosts.length) {
    text += `👻 *Semi-fantasmas +14 días / <5 mensajes:*\n${listSemi}\n\n`
  }
  text += `📌 Total: ${ghosts.length + semiGhosts.length}/${participants.length}\n`
  text += `📌 Nota: detección basada en última actividad`

  const mentions = [...ghosts.map(v => v.id),...semiGhosts.map(v => v.id)]

  const buttons = [
    { buttonId: `${usedPrefix}kickfantasmas`, buttonText: { displayText: '🗑️ Kick fantasmas' }, type: 1 },
    { buttonId: `${usedPrefix}whitelistghost`, buttonText: { displayText: '✅ Ver whitelist' }, type: 1 },
    { buttonId: `${usedPrefix}exportghosts`, buttonText: { displayText: '📋 Exportar lista' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: text,
    footer: 'Ghost Scanner 2026',
    buttons: buttons,
    headerType: 1,
    mentions: mentions,
  })

  if (command === 'fantasmas') return

  if (command === 'kickfantasmas') {
    if (!isBotAdmin) {
      return conn.reply(m.chat, '🤖 Necesito ser admin para eliminar usuarios.', m)
    }

    if (!isAdmin) return m.reply('❌ Solo admins pueden usar esto')

    if (ghosts.length === 0) {
      return conn.reply(m.chat, '✅ No hay fantasmas para eliminar.', m)
    }

    await conn.reply(m.chat, `🚨 Eliminando ${ghosts.length} fantasmas...`, m)

    const usersToKick = ghosts.map(v => v.id).filter(u =>!areJidsSameUser(u, conn.user.jid))

    let kicked = 0
    let failed = 0

    for (let user of usersToKick) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        kicked++
        await delay(3000)
      } catch (e) {
        failed++
        console.log('No se pudo expulsar:', user)
      }
    }

    await conn.reply(m.chat, `✅ *Proceso terminado*\n\nEliminados: ${kicked}\nFallidos: ${failed}`, m)
  }
}

handler.whitelistghost = async (m, { conn, participants }) => {
  const whitelist = []
  for (let p of participants) {
    const userDb = global.db.data.users[p.id]
    if (userDb?.whitelist === true) whitelist.push(p.id)
  }

  if (!whitelist.length) return m.reply('✅ No hay usuarios en whitelist')

  const list = whitelist.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n')
  await conn.sendMessage(m.chat, {
    text: `✅ *WHITELIST ACTIVA*\n\n${list}\n\nEstos usuarios no serán detectados como fantasmas`,
    mentions: whitelist
  }, { quoted: m })
}

handler.exportghosts = async (m, { conn, participants }) => {
  const now = Date.now()
  let data = 'ID,Nombre,Dias_Inactivo,Mensajes\n'

  for (let p of participants) {
    const userDb = global.db.data.users[p.id] || {}
    const lastSeen = userDb.lastseen || userDb.lastMessage || 0
    const daysInactive = Math.floor((now - lastSeen) / 86400000)
    const name = await conn.getName(p.id)
    data += `${p.id},${name},${daysInactive},${userDb.chat || 0}\n`
  }

  await conn.sendMessage(m.chat, {
    document: Buffer.from(data),
    mimetype: 'text/csv',
    fileName: `fantasmas_${m.chat.split('@')[0]}.csv`,
    caption: '📋 *Lista completa de actividad*\n\n> Ghost Scanner 2026'
  }, { quoted: m })
}

handler.before = async (m, { conn }) => {
  if (m.text === '.whitelistghost') {
    const groupMetadata = await conn.groupMetadata(m.chat)
    return handler.whitelistghost(m, { conn, participants: groupMetadata.participants })
  }
  if (m.text === '.exportghosts') {
    const groupMetadata = await conn.groupMetadata(m.chat)
    return handler.exportghosts(m, { conn, participants: groupMetadata.participants })
  }
}

handler.tags = ['grupo']
handler.command = ['fantasmas', 'whitelistghost', 'kickfantasmas', 'exportghosts']
handler.group = true
handler.admin = true

export default handler