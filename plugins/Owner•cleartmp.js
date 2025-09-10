import { tmpdir } from 'os'
import path, { join } from 'path'
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync
} from 'fs'

let handler = async (m, { conn, __dirname }) => {
  try {
    const tmpDirs = [tmpdir(), join(__dirname, '../tmp')]
    let deletedFiles = []

    for (let dir of tmpDirs) {
      if (!existsSync(dir)) continue

      let files = readdirSync(dir)
      for (let file of files) {
        let filePath = join(dir, file)
        try {
          let stats = statSync(filePath)
          if (stats.isFile()) {
            unlinkSync(filePath)
            deletedFiles.push(filePath)
          }
        } catch (err) {
          console.error(`No se pudo eliminar: ${filePath}`, err)
        }
      }
    }

    await conn.reply(
      m.chat,
      `🚩 Limpieza completada.\nArchivos eliminados: ${deletedFiles.length}`,
      m
    )
  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, '❌ Ocurrió un error al limpiar la carpeta tmp.', m)
  }
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = ['cleartmp', 'borrartmp', 'borrarcarpetatmp', 'vaciartmp']
handler.exp = 500
handler.rowner = true

export default handler