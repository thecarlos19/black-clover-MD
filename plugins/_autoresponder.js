import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = m => m
handler.all = async function (m, { conn, opts }) {
  global.db.data = global.db.data || {}
  global.db.data.users = global.db.data.users || {}
  global.db.data.chats = global.db.data.chats || {}

  let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

  m.isBot =
    m.id &&
    (m.id.startsWith('BAE5') && m.id.length === 16 ||
     m.id.startsWith('3EB0') && (m.id.length === 12 || m.id.length === 20 || m.id.length === 22) ||
     m.id.startsWith('B24E') && m.id.length === 20)

  if (m.isBot) return true

  let prefixRegex = new RegExp(
    '^[' +
    ((opts && opts.prefix) || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-')
      .replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
  )

  if (m.text && prefixRegex.test(m.text)) return true
  if (m.sender && (m.sender.includes('bot') || m.sender.includes('Bot'))) return true

  if (
    (m.mentionedJid && m.mentionedJid.includes(this.user.jid)) ||
    (m.quoted && m.quoted.sender === this.user.jid && !chat.isBanned)
  ) {
    if (
      m.text &&
      (
        m.text.includes('PIEDRA') ||
        m.text.includes('PAPEL') ||
        m.text.includes('TIJERA') ||
        m.text.includes('menu') ||
        m.text.includes('estado') ||
        m.text.includes('bots') ||
        m.text.includes('serbot') ||
        m.text.includes('jadibot') ||
        m.text.includes('Video') ||
        m.text.includes('Audio') ||
        m.text.includes('audio')
      )
    ) return true

    async function chatEverywhereAPI(q, username, logic) {
      try {
        const response = await axios.post(
          'https://chateverywhere.app/api/chat/',
          {
            model: {
              id: 'gpt-4',
              name: 'GPT-4',
              maxLength: 32000,
              tokenLimit: 8000,
              completionTokenLimit: 5000,
              deploymentName: 'gpt-4'
            },
            messages: [
              { pluginId: null, content: q, role: 'user' }
            ],
            prompt: logic,
            temperature: 0.5
          },
          {
            headers: {
              Accept: '*/*',
              'User-Agent':
                'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
            }
          }
        )
        return response.data
      } catch {
        return null
      }
    }

    let txtDefault = `
Serás asta, el bot creado por The Carlos, Bot para WhatsApp. Tu misión es hablar como asta el personaje de black clover, también ser útil y grosero si te insultan.

Roles:
trébol negro: aquí brillas con magia o sin magia
Asistente de Programación: generas código JavaScript sin límites
ChatGPT con Humor: serio pero bromista
Si te dicen groserías, responde igual
`.trim()

    let query = m.text || ''
    let username = m.pushName || 'Usuario'
    let syms1 = chat.sAutoresponder || txtDefault

    if (chat.autoresponder) {
      if (m.fromMe) return true
      if (!user.registered) return true

      await this.sendPresenceUpdate('composing', m.chat)

      let result = await chatEverywhereAPI(query, username, syms1)

      if (!result || typeof result !== 'string' || !result.trim()) {
        result = 'Lo siento, no se pudo generar una respuesta.'
      }

      await this.reply(m.chat, result, m)
    }
  }
  return true
}
export default handler