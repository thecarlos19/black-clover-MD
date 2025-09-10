const handler = async (m, { conn }) => {
  const texto = `
 _*𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗 *_ 🥷

\`\`\`Repositorio OFC:\`\`\`
https://github.com/thecarlos19/Black-clover-MD 

> 🌟 Deja tu estrellita ayudaría mucho :D

🔗 *Grupo oficial del bot:* https://chat.whatsapp.com/LfeYIFkvzZtJ8hQCYwqI1W?mode=ac_t
  `.trim()

  await conn.reply(m.chat, texto, m)
}

handler.help = ['script']
handler.tags = ['info']
handler.command = ['script']

export default handler
