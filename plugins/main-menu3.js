let handler = async (m, { conn, usedPrefix }) => {
  const user = global.db.data.users[m.sender] || {}

  const owners = global.owner.map(([id]) => id + '@s.whatsapp.net')
  const esReyMago = owners.includes(m.sender)

  const nivel = user.level || 0
  const exp = (user.exp || 0).toLocaleString()
  const monedas = (user.monedas || 0).toLocaleString()
  const diamantes = (user.diamond || 0).toLocaleString()
  const fragmentos = (user.fragmentos || 0).toLocaleString()
  const personajes = user.personajes?.length || 0
  const salud = user.health || 100

  const tituloEspecial = esReyMago
    ? '\n👑 REY MAGO SUPREMO 👑\n'
    : ''

  const texto = `
   *MENÚ RPG BLACK CLOVER*

> 👤 Usuario: @${m.sender.split('@')[0]}
> 🔝 Nivel: ${nivel}
> ✨ Exp: ${exp}
> 🪙 Monedas: ${monedas}
> 💎 Diamantes: ${diamantes}
> 🔮 Fragmentos: ${fragmentos}
> 🎴 Personajes: ${personajes}
> ❤️ Salud: ${salud}

╰━━━━━━━━━━━━━━━━━⬣

⚔️ AVENTURA Y RPG

> ⛏️ ${usedPrefix}minar
> 🏹 ${usedPrefix}cazar
> 🌌 ${usedPrefix}explorar
> 🧟 ${usedPrefix}invasionzombie
> 🔨 ${usedPrefix}trabajar
> 🎁 ${usedPrefix}daily
> 🎲 ${usedPrefix}cajamisteriosa
> ⚡ ${usedPrefix}cambiarexp
> 🧩 ${usedPrefix}claim
> 🎯 ${usedPrefix}hunt
> 💼 ${usedPrefix}work
> 🧪 ${usedPrefix}adventure
> 🏆 ${usedPrefix}reinado
> ⚔️ ${usedPrefix}duelo
> ❓ ${usedPrefix}acertijo
> ➕ ${usedPrefix}math easy
> ➕ ${usedPrefix}math medium
> ➕ ${usedPrefix}math hard

💰 ECONOMÍA

> 💳 ${usedPrefix}transferir
> 💸 ${usedPrefix}enviar
> 🎁 ${usedPrefix}dar
> 🏦 ${usedPrefix}miestatus
> 🪙 ${usedPrefix}mismonedas
> ✨ ${usedPrefix}miexp
> 🏧 ${usedPrefix}banco
> 💹 ${usedPrefix}depositar
> 💵 ${usedPrefix}retirar
> 📊 ${usedPrefix}balance

🎴 PERSONAJES

> 📜 ${usedPrefix}listarpersonajes
> 🧩 ${usedPrefix}mispersonajes
> 🔮 ${usedPrefix}invocacion
> 💀 ${usedPrefix}sacrificar
> 🏆 ${usedPrefix}toppersonajes
> 🛒 ${usedPrefix}comprar
> 🎟️ ${usedPrefix}inventario
> 🎭 ${usedPrefix}chars
> 👑 ${usedPrefix}topchars

🥷 ROBOS Y PVP

> 🗡️ ${usedPrefix}rob
> 💰 ${usedPrefix}rob2
> 🫶 ${usedPrefix}robarwaifu
> ⚔️ ${usedPrefix}batalla
> ☠️ ${usedPrefix}raid
> 🥷 ${usedPrefix}asaltar

💖 WAIFUS

> 💘 ${usedPrefix}rw
> 🎁 ${usedPrefix}c
> 💖 ${usedPrefix}miswaifus
> 📖 ${usedPrefix}listawaifus
> 🥇 ${usedPrefix}topwaifus
> 💍 ${usedPrefix}casar
> 💔 ${usedPrefix}divorcio

🛡️ PROTECCIÓN

> 🛡️ ${usedPrefix}escudo
> 🔓 ${usedPrefix}desbloquear
> 🚫 ${usedPrefix}antirobo
> 🔒 ${usedPrefix}lock

👑 PREMIUM

> 🌟 ${usedPrefix}listavip
> 💎 ${usedPrefix}premium
> 👑 ${usedPrefix}viplist

🎮 JUEGOS

> 🎰 ${usedPrefix}slot
> 🎲 ${usedPrefix}dado
> 🃏 ${usedPrefix}casino
> 🎯 ${usedPrefix}apostar
> 🧠 ${usedPrefix}ttt
> 🎮 ${usedPrefix}pvp
> 🎳 ${usedPrefix}ruleta

${tituloEspecial}

🌠 Conviértete en el mago más poderoso del reino.
⚡ Usa tus monedas sabiamente y domina el universo RPG.
`.trim()

  const img = 'https://raw.githubusercontent.com/JTxs00/uploads/main/1776310123337.jpeg'

  await conn.sendMessage(
    m.chat,
    {
      image: { url: img },
      caption: texto,
      mentions: [m.sender],
      footer: 'Black Clover RPG',
      buttons: [
        {
          buttonId: `${usedPrefix}menu`,
          buttonText: {
            displayText: '📜 MENU'
          },
          type: 1
        },
        {
          buttonId: `${usedPrefix}owner`,
          buttonText: {
            displayText: '👑 OWNER'
          },
          type: 1
        }
      ],
      headerType: 4,
      contextInfo: {
        mentionedJid: [m.sender]
      }
    },
    { quoted: m }
  )
}

handler.help = ['menurpg', 'rpgmenu', 'menur']
handler.tags = ['rpg']
handler.command = ['menurpg', 'rpgmenu', 'menur', 'rpg']
handler.register = true

export default handler