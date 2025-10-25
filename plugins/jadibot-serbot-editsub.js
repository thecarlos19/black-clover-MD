// Código creado x The Carlos 👑
// No olvides dejar créditos
import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'

const menuDir = './media/menu'
if (!fs.existsSync(menuDir)) fs.mkdirSync(menuDir, { recursive: true })

function getMenuMediaFile(botJid) {
  const botId = botJid.replace(/[:@.]/g, '_')
  return path.join(menuDir, `menuMedia_${botId}.json`)
}

function loadMenuMedia(botJid) {
  const file = getMenuMediaFile(botJid)
  if (fs.existsSync(file)) {
    try { return JSON.parse(fs.readFileSync(file)) } catch (e) { 
      console.warn('Error al leer menuMedia JSON:', e)
      return {} 
    }
  }
  return {}
}

function saveMenuMedia(botJid, data) {
  fs.writeFileSync(getMenuMediaFile(botJid), JSON.stringify(data, null, 2))
}

const handler = async (m, { conn, command, usedPrefix, text }) => {
  const isSubBot = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
  if (!isSubBot) return m.reply(`El comando *${command}* solo puede ser ejecutado por un SubBot.`)

  const botJid = conn.user.jid
  let menuMedia = loadMenuMedia(botJid)

  try {
    switch (command) {

      // ===== CAMBIAR IMAGEN O VIDEO DEL MENÚ =====
      case 'setmenuimg': {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''
        if (!/image\/(png|jpe?g)|video\/mp4/.test(mime))
          return m.reply(`Por favor, responde o envía una imagen (jpg/png) o video (mp4) válido.`)

        const media = await q.download()
        if (!media) return m.reply(`No se pudo obtener el archivo.`)

        const ext = mime.includes('video') ? '.mp4' : '.jpg'
        const filePath = path.join(menuDir, `${botJid.replace(/[:@.]/g, '_')}${ext}`)
        fs.writeFileSync(filePath, media)

        if (!menuMedia || typeof menuMedia !== 'object') menuMedia = {}
        if (mime.includes('video')) menuMedia.video = filePath
        else menuMedia.thumbnail = filePath

        saveMenuMedia(botJid, menuMedia)
        m.reply(`✅ Se actualizó correctamente el ${mime.includes('video') ? 'video' : 'thumbnail'} del menú.`)
        break
      }

      // ===== CAMBIAR TÍTULO DEL MENÚ =====
      case 'setmenutitle': {
        if (!text) return m.reply('❎ Ingresa el nuevo título del menú.')
        if (!menuMedia || typeof menuMedia !== 'object') menuMedia = {}
        menuMedia.menuTitle = text
        saveMenuMedia(botJid, menuMedia)
        m.reply(`✅ Título del menú actualizado a:\n${text}`)
        break
      }

      // ===== CAMBIAR FOTO DE PERFIL =====
      case 'subpfp':
      case 'subimagen': {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''
        if (!/image\/(png|jpe?g)/.test(mime)) return m.reply(`Envía una imagen válida.`)

        const media = await q.download()
        const image = await Jimp.read(media)
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)
        await conn.updateProfilePicture(conn.user.id, buffer)
        m.reply(`✅ Foto de perfil del SubBot actualizada.`)
        break
      }

      // ===== CAMBIAR BIOGRAFÍA =====
      case 'substatus':
      case 'subbio':
        if (!text) return m.reply('❎ Ingresa la nueva biografía del SubBot.')
        await conn.updateProfileStatus(text)
        m.reply(`✅ Biografía actualizada:\n${text}`)
        break

      // ===== CAMBIAR NOMBRE =====
      case 'subusername':
      case 'subuser':
        if (!text) return m.reply('❎ Ingresa el nuevo nombre del SubBot.')
        await conn.updateProfileName(text)
        m.reply(`✅ Nombre del SubBot actualizado a:\n${text}`)
        break
    }

  } catch (error) {
    console.error(error)
    m.reply(`⚠︎ Se produjo un error:\n${error.message}`)
  }
}

handler.help = ['setmenuimg','setmenutitle','subpfp','subimagen','substatus','subbio','subusername','subuser']
handler.tags = ['subbot']
handler.command = ['setmenuimg','setmenutitle','subpfp','subimagen','substatus','subbio','subusername','subuser']
export default handler