//Codigo creado x The Carlos 👑 
//no editar ya está bien hecho 

import moment from 'moment-timezone'

const limiteComandos = 5
const ventanaTiempo = 10000
const tiempoBloqueo = 60000

async function getLidFromJid(jid, conn) {
  return jid
}

const fake = { key: { remoteJid: 'status@broadcast' }, message: {} }

export async function before(m, { conn }) {
  const senderLid = await getLidFromJid(m.sender, conn)
  const botLid = await getLidFromJid(conn.user.jid, conn)
  const senderJid = m.sender
  const botJid = conn.user.jid

  const groupMetadata = m.isGroup
    ? ((conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(() => null))
    : {}

  const participants = m.isGroup && groupMetadata ? (groupMetadata.participants || []) : []

  const userGroup = participants.find(
    p => (p?.id === senderLid || p?.id === senderJid || p?.jid === senderLid || p?.jid === senderJid)
  ) || {}

  const botGroup = participants.find(
    p => (p?.id === botLid || p?.id === botJid || p?.jid === botLid || p?.jid === botJid)
  ) || {}

  const isRAdmin = (userGroup && userGroup.admin) === 'superadmin'
  const isAdmin = isRAdmin || ((userGroup && userGroup.admin) === 'admin')
  const isBotAdmin = !!(botGroup && botGroup.admin)

  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]
  if (!user.comandos) user.comandos = []
  if (!user.bloqueadoHasta) user.bloqueadoHasta = 0
  if (!user.pc) user.pc = 0

  const ahora = Date.now()
  const nombre = conn.getName(m.sender)
  const fecha = moment.tz('America/Mexico_City').format('DD/MM/YYYY')
  const hora = moment.tz('America/Mexico_City').format('HH:mm:ss')

  if (ahora < user.bloqueadoHasta) {
    const tiempoRestante = ((user.bloqueadoHasta - ahora) / 1000).toFixed(1)
    return conn.reply(m.chat, `🚨 *¡Espera!* Estás en cooldown.\n⏳ Podrás volver a usar comandos en *${tiempoRestante}s*`, m)
  }

  user.comandos.push(ahora)
  user.comandos = user.comandos.filter(ts => ahora - ts < ventanaTiempo)

  if (user.comandos.length > limiteComandos) {
    user.bloqueadoHasta = ahora + tiempoBloqueo
    user.comandos = []

    const mensajeSpam = `🚨 *ALERTA DE SPAM* 🚨
👤 Usuario: ${nombre}
📱 Número: wa.me/${m.sender.split('@')[0]}
🕒 Hora: ${hora}
📅 Fecha: ${fecha}
🔒 Acción: Bloqueo por ${tiempoBloqueo / 1000}s
📍 Chat: ${m.isGroup ? groupMetadata.subject : 'Chat privado'}`

    await conn.reply(m.chat, `⚠️ *Demasiados comandos en poco tiempo*\nHas sido bloqueado por *${tiempoBloqueo / 1000}s* para evitar spam.`, m)
    if (m.isGroup) await conn.sendMessage(m.chat, { text: mensajeSpam })
    return
  }

  if (!m.isGroup && (new Date() - user.pc >= 86400000)) {
    const horaActual = moment.tz('America/Mexico_City').hour()
    const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 18 ? 'Buenas tardes' : 'Buenas noches'

    await conn.reply(m.chat, `👋 Hola ${nombre}!!
*${saludo}*
📅 Fecha: ${fecha}
⏰ Hora: ${hora}
⚠️ *Nota:* No envíe spam a Black-clover-MD
🧃 Escriba *.menu* para mostrar el menú
📝 Apoya el proyecto poniendo una estrellita 🌟 en el repositorio oficial: https://github.com/thecarlos19/black-clover-MD`, m, fake)

    user.pc = new Date() * 1
  }
}