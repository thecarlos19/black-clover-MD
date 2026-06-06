let handler = async (m, { conn }) => {
  let plugins = Object.values(global.plugins).filter(v => v.help && v.tags)

  let totalf = plugins.length
  let totalCmds = plugins.reduce((acc, v) => acc + (Array.isArray(v.help)? v.help.length : 1), 0)

  let tags = {}
  for (let plugin of plugins) {
    if (!plugin.tags) continue
    for (let tag of plugin.tags) {
      if (!tags[tag]) tags[tag] = 0
      tags[tag]++
    }
  }

  let list = Object.entries(tags)
   .sort((a, b) => b[1] - a[1])
   .map(([tag, count]) => `> ⤿ ${tag}: *${count}*`).join('\n')

  let text = `${emoji} *Total de Funciones*

✦ Plugins: *${totalf}*
✦ Comandos: *${totalCmds}*

✦ *Por Categoría:*
${list}`

  conn.reply(m.chat, text, m)
}

handler.help = ['totalfunciones']
handler.tags = ['main']
handler.command = ['totalfunciones', 'comandos', 'funciones']
handler.register = true

export default handler