import { canLevelUp, xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let img = await (await fetch(`https://telegra.ph/file/b97148e2154508f63d909.jpg`)).buffer()
  let name = conn.getName(m.sender)
  let user = global.db.data.users[m.sender]

  let before = user.level * 1

  // Incrementar nivel mientras se cumpla la condición
  while (canLevelUp(user.level, user.exp, global.multiplier)) {
    user.level++
  }

  // Si no subió de nivel
  if (before === user.level) {
    let { min, xp, max } = xpRange(user.level, global.multiplier)
    let txt = `🍟 *Nombre:* ${name}\n\n`
    txt += `🚩 *Nivel:* ${user.level}\n`
    txt += `🍭 *XP:* ${user.exp - min} / ${xp}\n\n`
    txt += `🐢 No es suficiente XP, te faltan *${max - user.exp}* ✨`

    await conn.sendMessage(m.chat, {
      image: img,
      caption: txt
    }, { quoted: m })

    return
  }

  // Asignar rol si no tiene uno
  if (!user.role) user.role = 'Novato'

  // Mensaje de felicitación
  let txt = `🎊 *F E L I C I T A C I O N E S* 🎊\n\n`
  txt += `*${before}* ➔ *${user.level}* [ ${user.role} ]\n\n`
  txt += `• 🧬 Nivel anterior : ${before}\n`
  txt += `• 🧬 Nuevos niveles : ${user.level}\n`
  txt += `• 📅 Fecha : ${new Date().toLocaleString('id-ID')}\n\n`
  txt += `🚩 *Nota:* _Cuanto más interactúes con *Black Clover*, más rápido subirás de nivel_`

  await conn.sendMessage(m.chat, {
    image: img,
    caption: txt
  }, { quoted: m })
}

handler.help = ['levelup']
handler.tags = ['rpg']
handler.command = ['nivel', 'lvl', 'levelup', 'level']
handler.register = true

export default handler