let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/gi

let handler = async (m, { conn, text, isOwner, usedPrefix, command }) => {
  if (!text) return m.reply(`🚩 Ingresa el enlace del grupo.\n\nEjemplo: ${usedPrefix + command} https://chat.whatsapp.com/xxxx`)

  let links = text.match(linkRegex)
  if (!links ||!links.length) return m.reply('🐢 Enlace inválido.')

  let exitos = 0
  let fallidos = 0
  let resultados = []

  for (let link of links) {
    let code = link.split('chat.whatsapp.com/')[1]
    
    try {
      let metadata = await conn.groupGetInviteInfo(code).catch(() => null)
      if (!metadata) {
        resultados.push(`❌ Link inválido o expirado`)
        fallidos++
        continue
      }

      if (metadata.size >= 1023) {
        resultados.push(`❌ ${metadata.subject} - Grupo lleno`)
        fallidos++
        continue
      }

      if (Object.keys(global.db.data.chats).includes(metadata.id)) {
        resultados.push(`⚠️ ${metadata.subject} - Ya estoy ahí`)
        fallidos++
        continue
      }

      let res = await conn.groupAcceptInvite(code)

      await new Promise(r => setTimeout(r, 1500))

      await conn.sendMessage(res, {
        text: `《✧》 *Black Clover* se unió al grupo\n\n👑 Gracias por la invitación\n⚔️ Usa ${usedPrefix}menu para ver comandos`
      }).catch(() => {})

      resultados.push(`✅ ${metadata.subject} - Unido`)
      exitos++

    } catch (e) {
      console.error('Error join:', e)
      if (e.message.includes('not-authorized')) {
        resultados.push(`❌ Link inválido - No autorizado`)
      } else if (e.message.includes('already')) {
        resultados.push(`⚠️ Ya estoy en ese grupo`)
      } else {
        resultados.push(`❌ Error desconocido`)
      }
      fallidos++
    }
  }

  let reporte = `*📊 REPORTE DE UNIÓN*\n\n${resultados.join('\n')}\n\n✅ Exitosos: ${exitos}\n❌ Fallidos: ${fallidos}`
  await m.reply(reporte)
}

handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = ['join', 'entrar']
handler.rowner = true

export default handler