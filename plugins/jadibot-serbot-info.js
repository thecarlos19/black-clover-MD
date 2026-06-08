// código creado x The Carlos 👑

import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

async function handler(m, { conn: stars, usedPrefix, isOwner }) {
  try {
    const maxSubBots = 500
    const conns = Array.isArray(global.conns) ? global.conns : []

    const isConnOpen = (c) => {
      try {
        return c?.ws?.socket?.readyState === 1
      } catch {
        return !!c?.user?.id
      }
    }

    const unique = new Map()
    const tiempos = []

    for (const c of conns) {
      if (!c?.user) continue
      if (!isConnOpen(c)) continue

      const jidRaw = c.user.jid || c.user.id || ''
      if (!jidRaw) continue

      unique.set(jidRaw, c)
      if (c.uptime) tiempos.push(Date.now() - c.uptime)
    }

    const users = [...unique.values()]
    const totalUsers = users.length
    const availableSlots = Math.max(0, maxSubBots - totalUsers)
    const porcentaje = ((totalUsers / maxSubBots) * 100).toFixed(1)
    const uptimePromedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0

    function formatUptime(ms) {
      const s = Math.floor(ms / 1000)
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      const seg = s % 60
      return `${h}h ${m}m ${seg}s`
    }

    const barra = (pct) => {
      const total = 10
      const filled = Math.round((pct / 100) * total)
      return '█'.repeat(filled) + '░'.repeat(total - filled)
    }

    let responseMessage = `˚₊·—̳͟͞͞✞ *Subbots Black-clover-MD 🥷🏻*\n\n`
    responseMessage += `✞ *Estado General*\n`
    responseMessage += `> ⤿ 🔢 Conectados: *${totalUsers}/${maxSubBots}*\n`
    responseMessage += `> ⤿ 📊 Ocupado: *${porcentaje}%* [${barra(porcentaje)}]\n`
    responseMessage += `> ⤿ 🟢 Disponibles: *${availableSlots}*\n`
    responseMessage += `> ⤿ ⏱️ Uptime promedio: *${formatUptime(uptimePromedio)}*\n\n`

    if (totalUsers === 0) {
      responseMessage += `✞ *Detalle*\n> ⤿ No hay *subbots conectados* por ahora.`
    } else if (totalUsers <= 20) {
      const listado = users
        .map((v, i) => {
          const num = (v?.user?.jid || v?.user?.id || '').replace(/[^0-9]/g, '')
          const nombre = v?.user?.name || v?.user?.pushName || '👤 Sub-Bot'
          const waLink = `https://wa.me/${num}`
          const uptime = v.uptime ? formatUptime(Date.now() - v.uptime) : 'Desconocido'
          const estado = isConnOpen(v) ? '🟢' : '🔴'

          return `✞ Subbot #${i + 1} ${estado}
> ⤿ 👾 ${num}
> ⤿ 🌐 ${waLink}
> ⤿ 🧠 ${nombre}
> ⤿ ⏰ ${uptime}`
        })
        .join('\n\n')

      responseMessage += `✞ *Listado*\n\n${listado}`
    } else {
      const activos = users.filter(v => isConnOpen(v)).length
      responseMessage += `✞ *Resumen*\n`
      responseMessage += `> ⤿ 🟢 Activos: *${activos}*\n`
      responseMessage += `> ⤿ 🔴 Caídos: *${totalUsers - activos}*\n\n`
      responseMessage += `ᥫ᭡ *Nota:*\n> ⤿ Hay demasiados subbots conectados.\n> ⤿ Usa *${usedPrefix}bots full* para ver todos.`
    }

    if (m.text.toLowerCase().includes('full') && isOwner && totalUsers > 20) {
      const listadoCompleto = users
        .map((v, i) => {
          const num = (v?.user?.jid || v?.user?.id || '').replace(/[^0-9]/g, '')
          return `${i + 1}. ${num} - ${isConnOpen(v) ? '🟢' : '🔴'}`
        })
        .join('\n')
      
      responseMessage = `˚₊·—̳͟͞͞✞ *Lista Completa de Subbots*\n\n${listadoCompleto}\n\n📂 *Total: ${totalUsers}*`
    }

    responseMessage += `\n\n📂 *Creador del Bot:* The Carlos 👑`

    const imgDir = path.resolve('./src/img')
    let images = []

    try {
      images = fs.readdirSync(imgDir).filter(file => /\.(jpe?g|png|webp)$/i.test(file))
    } catch {
      images = []
    }

    const randomImage = images.length
     ? path.join(imgDir, images[Math.floor(Math.random() * images.length)])
      : null

    let imageBuffer = null
    if (randomImage && fs.existsSync(randomImage)) {
      try {
        imageBuffer = fs.readFileSync(randomImage)
      } catch {
        imageBuffer = null
      }
    }

    const mentions = [...new Set(
      (responseMessage.match(/@(\d{5,16})/g) || [])
        .map(v => v.replace('@', '') + '@s.whatsapp.net')
    )]

    const start = performance.now()
    if (imageBuffer) {
      await stars.sendMessage(m.chat, {
        image: imageBuffer,
        caption: responseMessage,
        mentions
      }, { quoted: m })
    } else {
      await stars.sendMessage(m.chat, {
        text: responseMessage,
        mentions
      }, { quoted: m })
    }
    const ping = (performance.now() - start).toFixed(2)
    
    if (isOwner) {
      await stars.sendMessage(m.chat, { 
        text: `⚡ *Velocidad de respuesta:* ${ping}ms` 
      }, { quoted: m })
    }

  } catch (e) {
    console.error('❌ Error en plugin bots:', e)
    await stars.sendMessage(m.chat, {
      text: `🛠️ *Comando en mantenimiento*\n\n> El comando *${usedPrefix}bots* no funciona actualmente.\n> Lo estamos actualizando. Disculpa las molestias.`
    }, { quoted: m })
  }
}

handler.command = ['listjadibot', 'bots', 'sockets']
handler.help = ['bots', 'bots full']
handler.tags = ['jadibot']

export default handler