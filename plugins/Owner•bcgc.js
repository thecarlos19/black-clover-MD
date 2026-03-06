const handler = async (m, { conn, text }) => {
  const delay = (time) => new Promise(res => setTimeout(res, time))

  const getGroups = await conn.groupFetchAllParticipating()
  const groups = Object.entries(getGroups).map(entry => entry[1])
  const anu = groups.map(v => v.id)

  const pesan = m.quoted?.text ? m.quoted.text : text
  if (!pesan) throw '🚩 *Te faltó el texto.*'

  const nombrePack = global.packname || ''

  for (const id of anu) {
    await delay(1500)

    await conn.relayMessage(id, {
      liveLocationMessage: {
        degreesLatitude: 35.685506276233525,
        degreesLongitude: 139.75270667105852,
        accuracyInMeters: 0,
        degreesClockwiseFromMagneticNorth: 2,
        caption: `⭐️ M E N S A J E ⭐️\n\n${pesan}\n${nombrePack}`,
        sequenceNumber: 2,
        timeOffset: 3
      }
    }, {})
  }

  m.reply(`🍟 *𝖬𝖾𝗇𝗌𝖺𝗃𝖾 𝖤𝗇𝗏𝗂𝖺𝖽𝗈 𝖠:* ${anu.length} *Grupo/S*`)
}

handler.help = ['broadcastgroup', 'bcgc']
handler.tags = ['owner']
handler.command = ['bcgc']
handler.owner = true

export default handler