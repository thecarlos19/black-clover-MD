import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isAdmin }) => {
  if (!args[0] || isNaN(args[0])) {
    return conn.reply(
      m.chat,
      `🚩 Ingresa un prefijo de país válido.\nEjemplo: ${usedPrefix + command} 58`,
      m
    )
  }

  const prefix = args[0].replace(/[+]/g, '')
  const botSettings = global.db.data.settings[conn.user.jid] || {}
  const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net'
  const superAdmin = participants.find(p => p.admin === 'superadmin')?.id

  const usersWithPrefix = participants
   .map(u => u.id)
   .filter(v => {
      if (!v || v === conn.user.jid) return false
      if (v === ownerGroup || v === superAdmin) return false
      if (v === global.owner?.[0]?.[0] + '@s.whatsapp.net') return false
      if (global.db.data.users[v]?.whitelist === true) return false
      return v.startsWith(prefix)
    })

  if (!usersWithPrefix.length) {
    return conn.reply(
      m.chat,
      `🚩 *No hay números con el prefijo +${prefix} en este grupo*\n\n> Nota: Admins y whitelist excluidos`,
      m
    )
  }

  const mentionsList = usersWithPrefix.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n▢ ')
  const totalMembers = participants.length
  const percentage = ((usersWithPrefix.length / totalMembers) * 100).toFixed(1)

  switch (command) {

    case 'listanum':
    case 'listnum': {
      let text = `🚩 *PREFIJO +${prefix} EN ${groupMetadata.subject}*\n\n`
      text += `▢ Encontrados: ${usersWithPrefix.length}/${totalMembers} (${percentage}%)\n`
      text += `▢ Admins excluidos: Sí\n`
      text += `▢ Whitelist excluidos: Sí\n\n`
      text += `┌─⊷ *USUARIOS*\n`
      text += `▢ ${mentionsList}\n`
      text += `└───────────`

      const buttons = [
        { buttonId: `${usedPrefix}kicknum ${prefix}`, buttonText: { displayText: '🗑️ Expulsar todos' }, type: 1 },
        { buttonId: `${usedPrefix}addwhitelist ${prefix}`, buttonText: { displayText: '✅ Whitelist prefijo' }, type: 1 },
        { buttonId: `${usedPrefix}exportnum ${prefix}`, buttonText: { displayText: '📋 Exportar CSV' }, type: 1 }
      ]

      return conn.sendMessage(m.chat, {
        text: text,
        footer: 'Num Filter 2026',
        buttons: buttons,
        headerType: 1,
        mentions: usersWithPrefix
      }, { quoted: m })
    }

    case 'kicknum': {
      if (!botSettings.restrict) {
        return conn.reply(
          m.chat,
          '🚩 *Este comando está deshabilitado por el propietario del bot*',
          m
        )
      }

      if (!isBotAdmin) {
        return conn.reply(
          m.chat,
          `🤖 *EL BOT NO ES ADMIN*\n\n> Necesito permisos de administrador para ejecutar esta acción.`,
          m
        )
      }

      if (!isAdmin) return m.reply('❌ Solo admins pueden usar esto')

      await conn.reply(
        m.chat,
        `🚩 *Iniciando expulsión de ${usersWithPrefix.length} usuarios con prefijo +${prefix}...*\n\n> Delay: 5s por usuario`,
        m
      )

      let kicked = 0
      let failed = 0
      let skipped = 0

      for (const user of usersWithPrefix) {
        try {
          await delay(2000)
          const res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

          if (res?.[0]?.status === '200') {
            kicked++
          } else if (res?.[0]?.status === '404') {
            skipped++
          } else {
            failed++
          }

        } catch (e) {
          failed++
          console.log('Error expulsando:', user)
        }

        await delay(3000)
      }

      let result = `✅ *PROCESO TERMINADO +${prefix}*\n\n`
      result += `▢ Eliminados: ${kicked}\n`
      result += `▢ Ya no estaban: ${skipped}\n`
      result += `▢ Fallidos: ${failed}\n`
      result += `▢ Total: ${usersWithPrefix.length}`

      return conn.reply(m.chat, result, m)
    }
  }
}

handler.addwhitelist = async (m, { conn, args, participants }) => {
  const prefix = args[0]?.replace(/[+]/g, '')
  if (!prefix || isNaN(prefix)) return m.reply('❌ Prefijo inválido')

  let count = 0
  for (const p of participants) {
    if (p.id.startsWith(prefix)) {
      global.db.data.users[p.id] = global.db.data.users[p.id] || {}
      global.db.data.users[p.id].whitelist = true
      count++
    }
  }

  await m.reply(`✅ *WHITELIST +${prefix}*\n\nUsuarios protegidos: ${count}\n\nYa no serán detectados por kicknum`)
}

handler.exportnum = async (m, { conn, args, participants, groupMetadata }) => {
  const prefix = args[0]?.replace(/[+]/g, '')
  if (!prefix || isNaN(prefix)) return m.reply('❌ Prefijo inválido')

  let data = 'ID,Nombre,Numero,Admin\n'
  const filtered = participants.filter(p => p.id.startsWith(prefix))

  for (const p of filtered) {
    const name = await conn.getName(p.id)
    const num = p.id.split('@')[0]
    const admin = p.admin? 'Sí' : 'No'
    data += `${p.id},${name},${num},${admin}\n`
  }

  await conn.sendMessage(m.chat, {
    document: Buffer.from(data),
    mimetype: 'text/csv',
    fileName: `prefijo_${prefix}_${groupMetadata.subject}.csv`,
    caption: `📋 *EXPORT PREFIJO +${prefix}*\n\nTotal: ${filtered.length} usuarios`
  }, { quoted: m })
}

handler.before = async (m, { conn }) => {
  if (m.text?.startsWith('.addwhitelist ')) {
    const args = m.text.slice(13).split(' ')
    const groupMetadata = await conn.groupMetadata(m.chat)
    return handler.addwhitelist(m, { conn, args, participants: groupMetadata.participants })
  }
  if (m.text?.startsWith('.exportnum ')) {
    const args = m.text.slice(11).split(' ')
    const groupMetadata = await conn.groupMetadata(m.chat)
    return handler.exportnum(m, { conn, args, participants: groupMetadata.participants, groupMetadata })
  }
}

handler.command = ['kicknum','addwhitelist','exportnum', 'listnum', 'listanum']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler