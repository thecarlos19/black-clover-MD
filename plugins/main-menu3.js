let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const owners = global.owner.map(([id]) => id)
  const esReyMago = owners.includes(m.sender)
  const tituloEspecial = esReyMago ? '👑 *REY MAGO SUPREMO* 👑\n' : ''

  const texto = `
╭━━━[ 🧙‍♂️ *MENÚ RPG MÁGICO* ]━━━╮
┃ 🎮 *Comandos de Aventura:*
┃ ⛏️ .minar → Extrae minerales y gana monedas
┃ 🎁 .daily → Reclama tu tesoro diario
┃ ❓ .acertijo → Responde acertijos y gana recompensas
┃ 🗡️ .robar2 @user → Intenta saquear a otro mago
┃ 🛒 .comprar <nombre> → Compra un personaje para tu colección
┃ 📜 .mispersonajes → Revisa tus héroes mágicos
┃ 🔮 .pjs → Lista de personajes disponibles
┃ 💼 .banco → Consulta tus ahorros mágicos
┃ 💸 .enviar @user <cantidad> → Envía monedas a un aliado
┃ ⚔️ .duelo → Desafía a otro jugador en combate
┃ 🩸 .sacrificar → Sacrifica por poder oscuro
┃ 🎲 .cajamisteriosa → Abre una caja con sorpresas
┃ 🏆 .toppersonajes → Ranking de los mejores coleccionistas
┃ 🧟 .invasionzombie → Defiende el reino de los no-muertos
┃ 🏹 .cazar → Caza bestias y gana recompensas
┃ 👑 .reinado → Lucha por el trono mágico
┃ ⚡ .cambiarexp → Intercambia tu exp por monedas
┃ 💰 .mismonedas → Revisa cuántas monedas tienes
┃ 🔨 .trabajar → Trabaja y gana monedas con esfuerzo
┃ 💀 .invocacion → Invoca a un personaje misterioso
┃ 🛡️ .antirobo → Protege tus waifus de los ladrones
┃ ➕ .math <dificultad> → Reta tu mente con matemáticas
┃ 💘 .rw → Compra nuevas waifus
┃ 🎁 .c → Reclama tu waifu gratis
┃ 💖 .miswaifus → Consulta tu colección de waifus
┃ 🔓 .desbloquear → Desbloquea tu base por unos minutos
┃ 🫶 .robarwaifu → Intenta robar waifus de otros
┃ 📖 .listawaifus → Descubre todas las waifus disponibles
┃ 🥇 .topwaifus → Ve quién tiene las waifus más valiosas
╰━━━━━━━━━━━━━━━━━━━━⬯

╭━━━[ 📊 *TU ESTADO* ]━━━╮
┃ 🧪 Nivel de Magia: *${user.level || 0}*
┃ ✨ Experiencia: *${user.exp || 0}*
┃ 💰 Monedas: *${(user.monedas || 0).toLocaleString()} 🪙*
╰━━━━━━━━━━━━━━━━━━━━⬯

${tituloEspecial}
🌟 *Sigue creciendo, aventurero*. ¡El mundo mágico espera tus hazañas!
💡 Usa los comandos sabiamente y alcanza la gloria suprema.
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