import { execSync } from 'child_process'
let handler = async (m, { conn, text }) => {

try {
await m.react(rwait)
if (conn.user.jid == conn.user.jid) {
let stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''))
await conn.reply(m.chat, stdout.toString(), m, rcanal)
await m.react(done)}
} catch (e) {
await m.react(error)
await m.reply('🚩 Se han hecho cambios locales qué entran en conflicto con las Actualizaciones del Repositorio, Para actualizar, reinstala el Bot o realiza las actualizaciones manualmente.')
}}

handler.help = ['update', 'actualizar']
handler.tags = ['owner']
handler.command = ['update', 'actualizar']
handler.rowner = true

export default handler