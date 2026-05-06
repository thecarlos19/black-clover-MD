//código creado x The Carlos 
//no olviden dejar créditos 

const IVA = 0.20
const BONUS_PREMIUM = 0.05 // Premium paga menos IVA
const MAX_TRANSFER = 50000000

const owners = [...global.owner.map(([num]) => num + '@s.whatsapp.net')]

const handler = async (m, { conn, text, isPrems }) => {
  try {
    if (typeof m.text !== 'string') m.text = ''

    const senderJid = m.sender

    if (!global.db.data.users[senderJid]) {
      global.db.data.users[senderJid] = {}
    }

    const sender = global.db.data.users[senderJid]

    sender.monedas = sender.monedas || 0
    sender.transferencias = sender.transferencias || 0
    sender.lastTransfer = sender.lastTransfer || 0

    let who = m.mentionedJid?.[0]

    if (!who) {
      throw '🚨 *Debes mencionar a un usuario.*\n📌 Ejemplo: *.enviar @usuario 5000*'
    }

    if (who === senderJid) {
      throw '❌ No puedes enviarte monedas a ti mismo.'
    }

    if (who === conn.user.jid) {
      throw '🤖 No puedes transferir monedas al bot.'
    }

    if (!global.db.data.users[who]) {
      global.db.data.users[who] = {}
    }

    const receiver = global.db.data.users[who]
    receiver.monedas = receiver.monedas || 0

    let cantidadTexto = text
      .replace('@' + who.split('@')[0], '')
      .trim()

    if (!cantidadTexto) {
      throw '💰 Debes indicar una cantidad válida.'
    }

    if (isNaN(cantidadTexto)) {
      throw '❌ Solo puedes ingresar números.'
    }

    const monto = parseInt(cantidadTexto)

    if (monto <= 0) {
      throw '⚠️ La cantidad debe ser mayor a 0.'
    }

    if (monto > MAX_TRANSFER) {
      throw `🚫 El máximo por transferencia es de *${MAX_TRANSFER.toLocaleString()} monedas*.`
    }

    if (receiver.bloqueadoTransferencias) {
      throw '🛡️ Este usuario tiene bloqueadas las transferencias.'
    }

    // IVA reducido para premium
    const ivaAplicado = isPrems
      ? Math.ceil(monto * BONUS_PREMIUM)
      : Math.ceil(monto * IVA)

    const total = monto + ivaAplicado

    if (sender.monedas < total) {
      throw `
😵‍💫 *Fondos insuficientes*

🪙 Dinero actual: *${sender.monedas.toLocaleString()}*
💸 Necesitas: *${total.toLocaleString()}*

📦 Transferencia: *${monto.toLocaleString()}*
🧾 IVA: *${ivaAplicado.toLocaleString()}*
`.trim()
    }

    // Probabilidad de bonus
    let bonus = 0
    let bonusMsg = ''

    if (Math.random() < 0.08) {
      bonus = Math.floor(monto * 0.10)
      receiver.monedas += bonus

      bonusMsg = `\n🎁 *BONUS:* @${who.split('@')[0]} recibió *${bonus.toLocaleString()} monedas extra*`
    }

    // Descontar y transferir
    sender.monedas -= total
    receiver.monedas += monto

    sender.transferencias += 1
    sender.lastTransfer = Date.now()

    // Repartir IVA a owners
    const impuestoPorOwner = Math.floor(ivaAplicado / owners.length)

    for (const ownerJid of owners) {
      if (!global.db.data.users[ownerJid]) {
        global.db.data.users[ownerJid] = {}
      }

      global.db.data.users[ownerJid].monedas =
        (global.db.data.users[ownerJid].monedas || 0) + impuestoPorOwner
    }

    const mensaje = `
╭━━━〔 💸 𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥𝗘𝗡𝗖𝗜𝗔 〕━━━⬣
┃ 👤 Remitente:
┃ @${senderJid.split('@')[0]}
┃
┃ 📥 Destinatario:
┃ @${who.split('@')[0]}
┃
┃ 🪙 Monedas enviadas:
┃ *${monto.toLocaleString()}*
┃
┃ 🧾 IVA aplicado:
┃ *${ivaAplicado.toLocaleString()}*
┃
┃ 💳 Total descontado:
┃ *${total.toLocaleString()}*
┃
┃ 🌟 Premium:
┃ ${isPrems ? '✅ IVA reducido' : '❌ Normal'}
╰━━━━━━━━━━━━━━━━━━⬣
${bonusMsg}

🏦 Saldo restante:
🪙 *${sender.monedas.toLocaleString()} monedas*
`.trim()

    await conn.reply(
      m.chat,
      mensaje,
      m,
      { mentions: [who, senderJid] }
    )

    // Mensaje privado al receptor
    await conn.sendMessage(who, {
      text: `
📥 *¡Has recibido monedas!*

👤 De: @${senderJid.split('@')[0]}
🪙 Cantidad: *${monto.toLocaleString()}*

💰 Nuevo saldo:
*${receiver.monedas.toLocaleString()} monedas*
`.trim(),
      mentions: [senderJid]
    })

    // Reacción
    await conn.sendMessage(m.chat, {
      react: {
        text: '💸',
        key: m.key
      }
    })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, typeof e === 'string' ? e : '❌ Ocurrió un error.', m)
  }
}

handler.help = ['transferir @usuario cantidad']
handler.tags = ['economia', 'rpg']
handler.command = ['transferir', 'enviar', 'dar']
handler.register = true

export default handler