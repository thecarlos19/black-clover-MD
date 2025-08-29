let handler = async (m, { conn }) => {
  let Reglas = `
╭「 *⚠️ REGLAS DEL BOT ⚠️* 」
│
├❗ *NO LLAMAR AL BOT*
├❗ *NO HACER SPAM AL BOT*
├❗ *CONTACTAR AL OWNER SOLO SI ES IMPORTANTE*
├❗ *NO ESCRIBIRLE AL PRIVADO AL BOT*
├❗ *RESPETA LOS TÉRMINOS Y CONDICIONES*
├❗ *USA EL BOT DE MANERA APROPIADA*
├❗ *NO INSULTAR AL BOT*
│
╰─────────────────────

📔 *INFO:* Si se rompen las reglas, puedes ser baneado y bloqueado del bot.

📝 *NOTA:* Este bot oficial es *BlackClover (OFC)*. No nos responsabilizamos por otros bots falsos. Usa *.owner* para verificar el staff oficial.

🌟 Si te gusta el bot, puedes visitar el repositorio y dejar una estrella.
${global.md || 'https://github.com/thecarlos19/Black-Clover-MD'}
`.trim()

  // Si no existe `imagen2`, usamos un enlace predeterminado
  const imagen = typeof imagen2 !== 'undefined'
    ? imagen2
    : 'https://i.imgur.com/U4BTrvK.jpeg'

  await conn.sendMessage(m.chat, {
    image: { url: imagen },
    caption: Reglas
  }, { quoted: m })
}

handler.help = ['reglas']
handler.tags = ['info']
handler.customPrefix = /^(reglas|reglasbot|uso|usobot|uso del bot|botreglas)$/i
handler.command = new RegExp // No necesario si usas customPrefix
handler.register = true
handler.exp = 70

export default handler