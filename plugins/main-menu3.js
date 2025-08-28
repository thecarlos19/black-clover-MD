let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const owners = global.owner.map(([id]) => id)
  const esReyMago = owners.includes(m.sender)
  const tituloEspecial = esReyMago ? '👑 *REY MAGO SUPREMO* 👑\n' : ''

  const texto = `
╭━━━[ 🧙‍♂️ *MENÚ RPG MÁGICO* ]━━━╮
┃ 🎮 *Comandos del Juego:*
┃ 🪙 .minar → Consigue minerales y monedas
┃ 🎁 .daily → Reclama tu recompensa diaria
┃ ❓ .acertijo → Trivia mágica por monedas
┃ 👊 .robar2 @user → Roba a otro mago
┃ 📦 .comprar <nombre> → Adquiere personajes
┃ 🧾 .mispersonajes → Ver tus adquisiciones
┃ 📜 .pjs → Lista de personajes a la venta
┃ 🧙 .banco → Tu grimorio financiero
┃ 💸 .enviar @user <cantidad> → Transfiere monedas
┃ ⚔️ .duelo → Reta a otro jugador
┃ ☠️ .sacrificar → Sacrifica por poder oscuro
┃ 🤑 .cajamisteriosa → Prueba tu suerte
┃ 👑 .toppersonajes → Ranking de coleccionistas
┃ 🧟‍♂️ .invasionzombie → Defensa mágica
┃ 🏹 .cazar → Caza bestias mágicas
┃ 👑 .reinado → Competencia de poder
┃ ⚡ .cambiarexp →cambias exp por monedas 
┃ 💰 .mismonedas → ver tus monedas 
┃ 🪖 .trabajar →    trabajar como burro 
┃ 💀 .invocacion →invocar un personaje 
┃ 🛡️ .escudo → impide que te roben 
╰━━━━━━━━━━━━━━━━━━━━⬯

╭━━━[ 📈 *TU ESTADO* ]━━━╮
┃ 🧪 Nivel de Magia: *${user.level || 0}*
┃ ✨ Experiencia: *${user.exp || 0}*
┃ 💰 Monedas: *${(user.monedas || 0).toLocaleString()} 🪙*
╰━━━━━━━━━━━━━━━━━━━━⬯

${tituloEspecial}
🌟 Sigue avanzando hasta convertirte en *el Mago Supremo*.
💡 Usa *los comandos* sabiamente... ¡el destino mágico te espera!
`.trim()



  const url = 'https://files.catbox.moe/mfkwj2.jpg'

  await conn.sendMessage(m.chat, {
    image: { url },
    caption: texto
  }, { quoted: m })
}

handler.help = ['menurpg']
handler.tags = ['rpg']
handler.command = ['menurpg', 'rpgmenu', 'menur']
handler.register = true

export default handler