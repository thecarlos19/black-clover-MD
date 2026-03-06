import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec).bind(cp)

const handler = async (m, { conn, text, isROwner }) => {
  if (!isROwner) return
  if (global.conn.user.jid !== conn.user.jid) return
  if (!text) return m.reply('❗ Escribe un comando para ejecutar.')

  m.reply('💥 *Ejecutando orden.*')

  let o
  try {
    o = await exec(text.trim())
  } catch (e) {
    o = e
  } finally {
    const stdout = o?.stdout || ''
    const stderr = o?.stderr || ''

    if (stdout.trim()) await m.reply(stdout)
    if (stderr.trim()) await m.reply(stderr)
  }
}

handler.help = ['$ <comando>']
handler.tags = ['owner']
handler.customPrefix = /^\$/
handler.command = /(?:)/i
handler.rowner = true

export default handler