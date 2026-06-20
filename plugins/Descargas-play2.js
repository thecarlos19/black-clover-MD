import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `❌ Ingresa una canción\n\n*Ejemplo:*\n${usedPrefix + command} Zoé Tú y Yo`

    try {
        await m.react('🔍')
        
        let search = await yts({ query: text, pages: 1 })
        let videos = search.videos?.slice(0, 15) || []

        if (!videos.length) {
            await m.react('❌')
            return m.reply('❌ No encontré canciones con ese nombre')
        }

        videos = videos.filter(v => {
            const seconds = v.seconds || 0
            return seconds > 30 && seconds < 3600 &&!v.url.includes('/shorts/')
        }).slice(0, 10)

        if (!videos.length) {
            await m.react('❌')
            return m.reply('❌ Solo encontré videos muy cortos/largos. Intenta otro nombre')
        }

        let rows = []
        videos.forEach((v, i) => {
            rows.push({
                header: `${i + 1}. ${v.title.slice(0, 30)}`,
                title: `🎵 MP3 - ${v.timestamp}`,
                description: `🎤 ${v.author?.name?.slice(0, 25) || 'Desconocido'} | 👁️ ${v.views?.toLocaleString() || '0'}`,
                id: `${usedPrefix}ytmp3 ${v.url}`
            })
            rows.push({
                header: `${i + 1}. ${v.title.slice(0, 30)}`,
                title: `🎬 MP4 - ${v.timestamp}`,
                description: `📹 Video | 👁️ ${v.views?.toLocaleString() || '0'}`,
                id: `${usedPrefix}ytmp4 ${v.url}`
            })
        })

        const sections = [{
            title: '🎵 Elige formato',
            highlight_label: 'MP3 y MP4',
            rows
        }]

        const msg = {
            image: { url: videos[0].thumbnail },
            caption: `🎧 *Resultados para:* ${text}\n\n📊 *Encontrados:* ${videos.length} canciones\n⚡ *Elige MP3 o MP4*`,
            footer: 'Black Clover ☘️ - Music System 2026',
            buttons: [
                {
                    buttonId: 'dummy',
                    buttonText: { displayText: '📂 VER TODAS' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: '🎶 Descargar',
                            sections
                        })
                    }
                },
                {
                    buttonId: `${usedPrefix}ytmp3 ${videos[0].url}`,
                    buttonText: { displayText: '🎵 MP3 #1' },
                    type: 1
                },
                {
                    buttonId: `${usedPrefix}ytmp4 ${videos[0].url}`,
                    buttonText: { displayText: '🎬 MP4 #1' },
                    type: 1
                }
            ],
            headerType: 4,
            viewOnce: true
        }

        await conn.sendMessage(m.chat, msg, { quoted: m })
        await m.react('🎵')

    } catch (e) {
        console.error('ERROR YTSEARCH:', e)
        await m.react('❌')
        m.reply(`❌ Error al buscar\n\n*Razón:* ${e.message || 'YouTube bloqueó la búsqueda'}`)
    }
}

handler.help = ['ytsearch <canción>']
handler.tags = ['music']
handler.command = ['ytsearch', 'yts', 'buscar']
export default handler