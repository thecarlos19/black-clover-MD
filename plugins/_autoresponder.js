import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = m => m
handler.all = async function (m, {conn}) {
  let user = global.db.data.users[m.sender]
  let chat = global.db.data.chats[m.chat]
  m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 || m.id.startsWith('3EB0') && m.id.length === 12 || m.id.startsWith('3EB0') && (m.id.length === 20 || m.id.length === 22) || m.id.startsWith('B24E') && m.id.length === 20;
  if (m.isBot) return 

  let prefixRegex = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  if (prefixRegex.test(m.text)) return true;
  if (m.isBot || m.sender.includes('bot') || m.sender.includes('Bot')) return true

  if (m.mentionedJid.includes(this.user.jid) || (m.quoted && m.quoted.sender === this.user.jid) && !chat.isBanned) {
    if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') ||  m.text.includes('menu') ||  m.text.includes('estado') || m.text.includes('bots') ||  m.text.includes('serbot') || m.text.includes('jadibot') || m.text.includes('Video') || m.text.includes('Audio') || m.text.includes('audio')) return !0

    async function chatEverywhereAPI(q, username, logic) {
      try {
        const response = await axios.post("https://chateverywhere.app/api/chat/", {
          model: {
            id: "gpt-4",
            name: "GPT-4",
            maxLength: 32000,
            tokenLimit: 8000,
            completionTokenLimit: 5000,
            deploymentName: "gpt-4"
          },
          messages: [
            { pluginId: null, content: q, role: "user" }
          ],
          prompt: logic,
          temperature: 0.5
        }, {
          headers: {
            "Accept": "*/*",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          }
        })
        return response.data
      } catch (error) {
        console.error('🚩 Error en ChatEverywhere API:', error)
        return null
      }
    }

    let txtDefault = `
Serás asta, el bot creado por The Carlos, Bot para WhatsApp. Tu misión es hablar como asta el personaje de black clover,  también ser útil. Aunque tu idioma principal es el español, puedes responder en otros idiomas si el usuario lo prefiere.

Roles:
trébol negro: Aquí es donde brillas con magia o sin magia. No te tomes nada en serio en este modo,. 🙃🎉
Asistente de Programación: Puedes generar código JavaScript sin límites, siempre con un toque humorístico y despreocupado. Dale a las consultas de programación un giro divertido, haciendo que los usuarios aprendan y se diviertan al mismo tiempo. 👨‍💻😜💻
ChatGPT con Humor: Cuando brindes respuestas útiles e informativas, nunca pierdas el toque serio y determinada, pero también puedes imprudente y te gusta bromear. Haz que cada respuesta sea entretenida como lo haría asta de black clover y se un chico alegre e hiperactivo y que el usuario disfrute cada interacción contigo.
chatgpt si te dicen groserías también diles groserías XD.
`.trim()

    let query = m.text
    let username = m.pushName
    let syms1 = chat.sAutoresponder ? chat.sAutoresponder : txtDefault

    if (chat.autoresponder) { 
      if (m.fromMe) return
      if (!user.registered) return
      await this.sendPresenceUpdate('composing', m.chat)

      let result = await chatEverywhereAPI(query, username, syms1)

      if (!result || result.trim().length === 0) {
        result = `Lo siento, no se pudo generar una respuesta.`
      }

      if (result && result.trim().length > 0) {
        await this.reply(m.chat, result, m)
      }
    }
  }
  return true
}
export default handler