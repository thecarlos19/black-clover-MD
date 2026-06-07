//código creado x The Carlos 👑
//no olvides dejar créditos 

import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import { performance } from 'perf_hooks'

const imagen1 = 'https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg'

var handler = async (m, { conn, usedPrefix, participants }) => {
  let who = m.mentionedJid && m.mentionedJid[0]
 ? m.mentionedJid[0]
    : m.fromMe
 ? conn.user.jid
    : m.sender

  let pp
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {
    pp = imagen1
  }

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {}
  }

  const user = global.db.data.users[who]

  user.premium = Boolean(user.premium)
  user.level = Number(user.level || 0)
  user.cookies = Number(user.cookies || 0)
  user.exp = Number(user.exp || 0)
  user.lastclaim = Number(user.lastclaim || 0)
  user.registered = Boolean(user.registered)
  user.regTime = Number(user.regTime || -1)
  user.age = Number(user.age || 0)
  user.role = user.role || '⭑ Novato ⭑'
  user.monedas = Number(user.monedas || 0)
  user.diamond = Number(user.diamond || 0)
  user.health = Number(user.health || 100)
  user.mp = Number(user.mp || 100)
  user.atq = Number(user.atq || 50)
  user.def = Number(user.def || 50)
  user.personajes = user.personajes || []
  user.chat = Number(user.chat || 0)
  user.joincount = Number(user.joincount || 0)

  let { premium, level, exp, registered, role, monedas, diamond, health, mp, atq, def, personajes, chat, joincount } = user
  let username = await conn.getName(who)
  let number = PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')

  let xpParaSiguiente = 1000 + (level * 100)
  let porcentaje = ((exp / xpParaSiguiente) * 100).toFixed(1)
  let barraXp = barra(exp, xpParaSiguiente, 10)

  let rangoAuto = obtenerRango(level)
  if (rangoAuto!== role &&!premium) user.role = rangoAuto

  const rank = Object.entries(global.db.data.users)
.sort((a, b) => b[1].level - a[1].level)
.findIndex(([id]) => id === who) + 1

  const totalRiqueza = monedas + (diamond * 100)
  const poderTotal = Math.floor((atq + def + level) * (health / 100))

  let animacion = `〘 *Sistema Mágico * 〙📖\n\n`
  animacion += `🔒 Detectando energía mágica...\n`
  animacion += `⏳ Analizando grimorio del portador...\n`
  animacion += `💠 Sincronizando con el maná...\n\n`
  animacion += `✨✨✨ 𝙰𝙲𝚃𝙸𝚅𝙰𝙲𝙸𝙾́𝙽 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰 ✨✨✨\n\n`
  animacion += `*El grimorio se ha abierto...*`

  await conn.sendMessage(m.chat, { text: animacion }, { quoted: m })
  await delay(1000)

  let noprem = `『 ＧＲＩＭＯＲＩＯ ＢＡＳＥ 』📕\n\n`
  noprem += `⚔️ *Portador:* ${username}\n`
  noprem += `🆔 *Número:* ${number}\n`
  noprem += `📜 *Registrado:* ${registered? '✅ Activado' : '❌ No'}\n`
  noprem += `🏆 *Ranking:* #${rank}\n\n`
  noprem += `🧪 *Estado Mágico:*\n`
  noprem += `⚡ *Nivel:* ${level}\n`
  noprem += `✨ *Exp:* ${exp.toLocaleString()}/${xpParaSiguiente.toLocaleString()} (${porcentaje}%)\n`
  noprem += `${barraXp}\n`
  noprem += `📈 *Rango:* ${role}\n`
  noprem += `🔮 *Premium:* ❌ No activo\n\n`
  noprem += `💰 *Economía:*\n`
  noprem += `➤ Monedas: ${monedas.toLocaleString()}\n`
  noprem += `➤ Diamantes: ${diamond.toLocaleString()}\n`
  noprem += `➤ Riqueza: ${totalRiqueza.toLocaleString()}\n\n`
  noprem += `⚔️ *Combate:*\n`
  noprem += `➤ Vida: ${health}/100\n`
  noprem += `➤ Mana: ${mp}/100\n`
  noprem += `➤ Ataque: ${atq} | Defensa: ${def}\n`
  noprem += `➤ Poder: ${poderTotal.toLocaleString()}\n\n`
  noprem += `📊 *Stats:*\n`
  noprem += `➤ Mensajes: ${chat.toLocaleString()}\n`
  noprem += `➤ Personajes: ${personajes.length}\n`
  noprem += `➤ Tokens: ${joincount.toLocaleString()}\n\n`
  noprem += `📔 *Grimorio:* Básico de 1 hoja 📘\n`
  noprem += `🔒 *Elemento:* Desconocido\n\n`
  noprem += `📌 Mejora tu grimorio para desbloquear más magia...\n`
  noprem += `━━━━━━━━━━━━━━━━━━`

  let prem = `👹〘 𝐌𝐎𝐃𝐎 𝐃𝐄𝐌𝐎𝐍𝐈𝐎: *𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎* 〙👹\n\n`
  prem += `🌌 ＧＲＩＭＯＲＩＯ ５ＬＴ（Ａ』\n\n`
  prem += `🧛 *Portador Élite:* ${username}\n`
  prem += `🧿 *Número:* ${number}\n`
  prem += `✅ *Registrado:* ${registered? 'Sí' : 'No'}\n`
  prem += `👑 *Rango:* 🟣 *Supremo Demoníaco*\n`
  prem += `🏆 *Ranking Global:* #${rank}\n\n`
  prem += `🔮 *Energía Oscura:*\n`
  prem += `⚡ *Nivel:* ${level}\n`
  prem += `🌟 *Exp:* ${exp.toLocaleString()}/${xpParaSiguiente.toLocaleString()} (${porcentaje}%)\n`
  prem += `${barraXp}\n`
  prem += `🪄 *Rango Mágico:* ${role}\n`
  prem += `💠 *Estado Premium:* ✅ ACTIVADO\n\n`
  prem += `💎 *Economía Élite:*\n`
  prem += `➤ Monedas: ${monedas.toLocaleString()}\n`
  prem += `➤ Diamantes: ${diamond.toLocaleString()}\n`
  prem += `➤ Riqueza Total: ${totalRiqueza.toLocaleString()}\n\n`
  prem += `⚔️ *Stats Demoníacas:*\n`
  prem += `➤ Vida: ${health}/100\n`
  prem += `➤ Mana: ${mp}/100\n`
  prem += `➤ Ataque: ${atq} | Defensa: ${def}\n`
  prem += `➤ Poder Total: ${poderTotal.toLocaleString()}\n\n`
  prem += `📊 *Estadísticas:*\n`
  prem += `➤ Mensajes: ${chat.toLocaleString()}\n`
  prem += `➤ Personajes: ${personajes.length}\n`
  prem += `➤ Tokens: ${joincount.toLocaleString()}\n\n`
  prem += `📕 *Grimorio:* ☯️ Anti-Magia de 5 hojas\n`
  prem += `🔥 *Modo Especial:* ✦ *Despertar Oscuro de Asta*\n`
  prem += `🧩 *Elemento:* Anti-Magia & Espada Demoníaca\n\n`
  prem += `📜 *Hechizo Desbloqueado:*\n`
  prem += `❖ 「𝙱𝚕𝚊𝚌𝚔 the Legends ⚡」\n`
  prem += ` ↳ Daño masivo a bots enemigos.\n\n`
  prem += `📔 *Nota:* Este usuario ha superado sus límites... ☄️\n`
  prem += `🌌⟣══════════════⟢🌌`

  const buttons = [
    { buttonId: `${usedPrefix}inventario`, buttonText: { displayText: '🎒 Inventario' }, type: 1 },
    { buttonId: `${usedPrefix}top`, buttonText: { displayText: '🏆 Ranking' }, type: 1 },
    { buttonId: `${usedPrefix}premium`, buttonText: { displayText: '💎 Premium' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: premium? prem : noprem,
    footer: 'Black Clover RPG 2026',
    buttons: buttons,
    headerType: 4,
    mentions:
  }, { quoted: m })
}

handler.help = ['profile', 'perfil', 'me']
handler.register = true
handler.group = true
handler.tags = ['rg', 'rpg']
handler.command = ['profile', 'perfil', 'me']
export default handler

function obtenerRango(level) {
  if (level >= 200) return '🔱 Dios Arcano'
  if (level >= 150) return '👑 Rey Mago'
  if (level >= 100) return '⚜️ Emperador Arcano'
  if (level >= 80) return '🛡️ Capitán Supremo'
  if (level >= 60) return '🔮 Gran Hechicero'
  if (level >= 40) return '⚔️ Caballero Mágico'
  if (level >= 25) return '✨ Mago Avanzado'
  if (level >= 10) return '📘 Aprendiz'
  return '⭑ Novato ⭑'
}

function barra(valor, max, tamaño = 10) {
  const progreso = Math.min(valor / max, 1)
  const llenos = Math.round(progreso * tamaño)
  const vacios = tamaño - llenos
  return '█'.repeat(llenos) + '░'.repeat(vacios)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}