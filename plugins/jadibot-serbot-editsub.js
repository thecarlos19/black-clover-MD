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
  if (!fs.existsSync(file)) return {}

  try {
    return JSON.parse(fs.readFileSync(file))
  } catch (e) {
    console.warn('Error leyendo menuMedia:', e)
    return {}
  }
}

function saveMenuMedia(botJid, data) {
  fs.writeFileSync(getMenuMediaFile(botJid), JSON.stringify(data, null, 2))
}

const handler = async (m, { conn, command, usedPrefix, text }) => {
  const isSubBot =
    [conn.user.jid, ...global.owner.map(([n]) => `${n}@s.whatsapp.net`)]
      .includes(m.sender)

  if (!isSubBot) {
    return m.reply(`El comando *${command}* solo puede ser usado por el SubBot.`)
  }

  const botJid = conn.user.jid
  let menuMedia = loadMenuMedia(botJid)

  try {

    switch (command) {

      case 'setmenuimg': {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''

        if (!/image\/(png|jpe?g)|video\/mp4/.test(mime)) {
          return m.reply('Responde a una imagen (jpg/png) o video (mp4) válido.')
        }

        const media = await q.download()
        if (!media) return m.reply('No se pudo descargar el archivo.')

        const ext = mime.includes('video') ? '.mp4' : '.jpg'
        const filePath = path.join(menuDir, `${botJid.replace(/[:@.]/g, '_')}${ext}`)

        fs.writeFileSync(filePath, media)

        menuMedia = typeof menuMedia === 'object' ? menuMedia : {}

        if (mime.includes('video')) {
          menuMedia.video = filePath
          menuMedia.thumbnail = filePath
        } else {
          menuMedia.thumbnail = filePath
        }

        saveMenuMedia(botJid, menuMedia)

        return m.reply(`✅ ${mime.includes('video') ? 'Video' : 'Imagen'} del menú actualizado.`)
      }

      case 'setmenutitle': {
        if (!text) return m.reply('❎ Ingresa el nuevo título del menú.')

        menuMedia = menuMedia || {}
        menuMedia.menuTitle = text

        saveMenuMedia(botJid, menuMedia)

        return m.reply(`✅ Título actualizado:\n${text}`)
      }

      case 'setmenufont': {
        if (!text) return m.reply('❎ Ingresa el nombre de la fuente: cyber, gothic, minimal')

        const fonts = ['cyber', 'gothic', 'minimal', 'default']
        if (!fonts.includes(text.toLowerCase())) return m.reply(`❎ Fuentes válidas: ${fonts.join(', ')}`)

        menuMedia = menuMedia || {}
        menuMedia.fontStyle = text.toLowerCase()

        saveMenuMedia(botJid, menuMedia)

        return m.reply(`✅ Fuente del menú actualizada: ${text}`)
      }

      case 'setmenucolor': {
        if (!text) return m.reply('❎ Ingresa el color hex: #FF0000')

        if (!/^#[0-9A-F]{6}$/i.test(text)) return m.reply('❎ Color hex inválido. Ejemplo: #FF0000')

        menuMedia = menuMedia || {}
        menuMedia.accentColor = text

        saveMenuMedia(botJid, menuMedia)

        return m.reply(`✅ Color actualizado: ${text}`)
      }

      case 'subpfp':
      case 'subimagen': {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''

        if (!/image\/(png|jpe?g)/.test(mime)) {
          return m.reply('Envía una imagen válida.')
        }

        const media = await q.download()
        if (!media) return m.reply('No se pudo descargar la imagen.')

        const image = await Jimp.read(media)
        await image.cover(640, 640)
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)

        await conn.updateProfilePicture(conn.user.jid, buffer)

        return m.reply('✅ Foto de perfil actualizada.')
      }

      case 'substatus':
      case 'subbio': {
        if (!text) return m.reply('❎ Ingresa la nueva biografía.')

        if (text.length > 139) return m.reply('❎ Máximo 139 caracteres.')

        await conn.updateProfileStatus(text)

        return m.reply(`✅ Biografía actualizada:\n${text}`)
      }

      case 'subusername':
      case 'subuser': {
        if (!text) return m.reply('❎ Ingresa el nuevo nombre.')

        if (text.length > 25) return m.reply('❎ Máximo 25 caracteres.')

        await conn.updateProfileName(text)

        return m.reply(`✅ Nombre actualizado:\n${text}`)
      }

      case 'backupconfig': {
        const configFile = getMenuMediaFile(botJid)
        if (!fs.existsSync(configFile)) return m.reply('❎ No hay configuración para respaldar.')

        const backupPath = path.join(menuDir, `backup_${botJid.replace(/[:@.]/g, '_')}_${Date.now()}.json`)
        fs.copyFileSync(configFile, backupPath)

        return m.reply(`✅ Backup creado: ${path.basename(backupPath)}`)
      }

      case 'resetmenu': {
        const configFile = getMenuMediaFile(botJid)
        if (fs.existsSync(configFile)) fs.unlinkSync(configFile)

        const mediaFile = path.join(menuDir, `${botJid.replace(/[:@.]/g, '_')}.jpg`)
        if (fs.existsSync(mediaFile)) fs.unlinkSync(mediaFile)

        const videoFile = path.join(menuDir, `${botJid.replace(/[:@.]/g, '_')}.mp4`)
        if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile)

        return m.reply('✅ Configuración del menú reseteada a valores por defecto.')
      }

      case 'personalizar': {
        return m.reply(`
✙ *Opciones de Personalización*

▢ ${usedPrefix}setmenuimg
↳ Cambia imagen/video del menú

▢ ${usedPrefix}setmenutitle <texto>
↳ Cambia título del menú

▢ ${usedPrefix}setmenufont <fuente>
↳ Cambia fuente: cyber, gothic, minimal

▢ ${usedPrefix}setmenucolor <#hex>
↳ Cambia color de acento

▢ ${usedPrefix}subpfp
↳ Cambia foto de perfil del SubBot

▢ ${usedPrefix}substatus <texto>
↳ Cambia biografía

▢ ${usedPrefix}subusername <texto>
↳ Cambia nombre del SubBot

▢ ${usedPrefix}backupconfig
↳ Respalda configuración actual

▢ ${usedPrefix}resetmenu
↳ Resetea todo a default

📢 Canal:
https://whatsapp.com/channel/0029VbB36XC8aKvQevh8Bp04
`.trim())
      }

    }

  } catch (e) {
    console.error(e)
    m.reply(`⚠︎ Error:\n${e.message}`)
  }
}

handler.help = [
  'personalizar','setmenuimg','setmenutitle','setmenufont','setmenucolor',
  'subpfp','subimagen','substatus','subbio',
  'subusername','subuser','backupconfig','resetmenu'
]

handler.tags = ['subbot']
handler.command = [
  'personalizar','setmenuimg','setmenutitle','setmenufont','setmenucolor',
  'subpfp','subimagen','substatus','subbio',
  'subusername','subuser','backupconfig','resetmenu'
]

export default handler