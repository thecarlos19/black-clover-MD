async function handler(m, { conn: stars, usedPrefix, isOwner }) {
  const conns = Array.isArray(global.conns)? global.conns : []
  
  const isConnOpen = (c) => c?.ws?.socket?.readyState === 1 ||!!c?.user?.id
  
  const gruposMap = new Map()
  
  for (const c of conns) {
    if (!c?.user ||!isConnOpen(c)) continue
    try {
      const chats = await c.groupFetchAllParticipating().catch(() => ({}))
      const botNum = (c.user.jid || c.user.id || '').replace(/@.+/, '')
      const botName = c.user?.name || c.user?.pushName || 'Sub-Bot'
      
      for (const jid in chats) {
        if (!gruposMap.has(jid)) {
          gruposMap.set(jid, {
            nombre: chats[jid].subject || 'Sin nombre',
            miembros: chats[jid].participants?.length || 0,
            bots: []
          })
        }
        gruposMap.get(jid).bots.push({ num: botNum, name: botName })
      }
    } catch {}
  }
  
  const grupos = [...gruposMap.entries()]
  const totalGrupos = grupos.length
  const totalBots = conns.filter(c => isConnOpen(c)).length
  
  let txt = `*GRUPOS CON SUBBOTS ACTIVOS*\n\n`
  txt += `Total grupos: *${totalGrupos}*\n`
  txt += `Total subbots: *${totalBots}*\n\n`
  
  if (totalGrupos === 0) {
    txt += `No hay subbots en ningún grupo.`
  } else {
    txt += grupos.map(([jid, data], i) => {
      const botsList = data.bots.map(b => `> @${b.num} (${b.name})`).join('\n')
      return `*${i + 1}.* ${data.nombre}\n> Miembros: ${data.miembros}\n> Bots: ${data.bots.length}\n${botsList}`
    }).join('\n\n')
  }
  
  const mentions = [...new Set((txt.match(/@(\d{5,16})/g) || []).map(v => v.replace('@', '') + '@s.whatsapp.net'))]
  
  await stars.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
}

handler.command = ['vergp', 'versubgrupos', 'gruposbot']
handler.help = ['vergp']
handler.tags = ['jadibot']
handler.owner = true

export default handler