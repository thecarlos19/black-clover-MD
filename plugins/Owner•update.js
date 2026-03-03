import { execSync } from 'child_process'

let handler = async (m, { conn }) => {
  try {
    await m.react('⏳')

    let stdout = execSync('git pull', { encoding: 'utf-8' })

    await conn.reply(
      m.chat,
      `✅ Actualización completada:\n\n${stdout}`,
      m,
      rcanal
    )

    await m.react('✅')

  } catch (e) {
    console.error(e)

    await m.react('❌')
    await conn.reply(
      m.chat,
      '🚩 Se han hecho cambios locales que entran en conflicto con las actualizaciones del repositorio.\n\n Solución:\n• git reset --hard\n• o reinstala el bot',
      m,
      rcanal
    )
  }
}

handler.help = ['update', 'actualizar']
handler.tags = ['owner']
handler.command = ['update', 'actualizar']
handler.rowner = true

export default handler