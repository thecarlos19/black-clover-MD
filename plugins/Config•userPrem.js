const handler = m => m

export async function all() {
  try {
    const users = global.db.data.users || {}
    const now = Date.now()

    for (const [jid, user] of Object.entries(users)) {
      if (!user?.premium ||!user?.premiumTime) continue
      if (user.premiumTime === 0) continue

      const timeLeft = user.premiumTime - now

      if (timeLeft <= 0) {
        user.premiumTime = 0
        user.premium = false
        user.premiumExpireNotified = false

        const fkontak = {
          key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
          },
          message: {
            contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${jid.split('@')[0]}:${jid.split('@')[0]}\nEND:VCARD`
            }
          }
        }

        const textoo = `「✐」Tu tiempo premium ha expirado\n\n*Renueva con:*.premium`

        await this.sendMessage(
          jid,
          { text: textoo, mentions: [jid] },
          { quoted: fkontak }
        ).catch(() => {})

      } else if (timeLeft <= 86400000 &&!user.premiumExpireNotified) {
        user.premiumExpireNotified = true

        const hours = Math.floor(timeLeft / 3600000)
        const text = `「⚠️」*Aviso Premium*\n\nTu suscripción expira en *${hours} hora${hours!== 1? 's' : ''}*\n\nRenueva con: *.premium*`

        await this.sendMessage(jid, { text }, { quoted: null }).catch(() => {})
      }
    }

  } catch (e) {
    console.error('error premium system:', e)
  }
}

handler.checkPremium = async function(jid) {
  const user = global.db.data.users[jid]
  if (!user?.premium ||!user?.premiumTime) return { active: false, timeLeft: 0 }

  const timeLeft = user.premiumTime - Date.now()
  if (timeLeft <= 0) {
    user.premium = false
    user.premiumTime = 0
    return { active: false, timeLeft: 0 }
  }

  return {
    active: true,
    timeLeft,
    days: Math.floor(timeLeft / 86400000),
    hours: Math.floor((timeLeft % 86400000) / 3600000)
  }
}

handler.addPremium = async function(jid, days = 30) {
  const user = global.db.data.users[jid]
  if (!user) return false

  const now = Date.now()
  const addTime = days * 86400000

  user.premium = true
  user.premiumTime = user.premiumTime > now? user.premiumTime + addTime : now + addTime
  user.premiumExpireNotified = false

  return true
}

export default handler