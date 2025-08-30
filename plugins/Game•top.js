import util from 'util'
import path from 'path'

let user = a => '@' + a.split('@')[0]

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
    if (!text) return conn.reply(m.chat, 'Ejemplo de uso: #top *texto*', m)

    const participants = groupMetadata.participants.map(v => v.id)
    const picks = []
    
    for (let i = 0; i < 10; i++) {
        picks.push(participants[Math.floor(Math.random() * participants.length)])
    }

    const k = Math.floor(Math.random() * 70)
    const emojis = ['🤓','😅','😂','😳','😎','🥵','😱','🤑','🙄','💩','🍑','🤨','🥴','🔥','👇🏻','😔','👀','🌚']
    const x = pickRandom(emojis)

    const topMessage = `*${x} Top 10 ${text} ${x}*

*1. ${user(picks[0])}*
*2. ${user(picks[1])}*
*3. ${user(picks[2])}*
*4. ${user(picks[3])}*
*5. ${user(picks[4])}*
*6. ${user(picks[5])}*
*7. ${user(picks[6])}*
*8. ${user(picks[7])}*
*9. ${user(picks[8])}*
*10. ${user(picks[9])}*`

    conn.sendMessage(m.chat, { text: topMessage, mentions: picks })
}

handler.help = ['top *<texto>*']
handler.command = ['top']
handler.tags = ['fun']
handler.group = true

export default handler