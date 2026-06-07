import fs from 'fs'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = {}
  }

  const user = global.db.data.users[m.sender]
  user.desahogos = user.desahogos || []
  user.animo = Number(user.animo || 50)
  user.ultimoDesahogo = Number(user.ultimoDesahogo || 0)

  if (command === 'historial') return mostrarHistorial(m, conn, user)
  if (command === 'motivacion') return mostrarMotivacion(m, conn)
  if (command === 'respirar') return ejercicioRespirar(m, conn)
  if (command === 'apoyo') return mostrarApoyo(m, conn, usedPrefix)

  if (!text) {
    let estado = obtenerEstadoAnimo(user.animo)
    let texto = `💙 *ZONA DE DESAHOGO* 💙\n\n`
    texto += `${estado.emoji} *Tu estado actual:* ${estado.texto}\n`
    texto += `📊 *Nivel de ánimo:* ${user.animo}/100\n\n`
    texto += `Cuéntame qué te pasa usando:\n`
    texto += `${usedPrefix}desahogo <tu mensaje>\n\n`
    texto += `*Ejemplos:*\n`
    texto += `➤ ${usedPrefix}desahogo me siento mal hoy\n`
    texto += `➤ ${usedPrefix}desahogo tuve un día horrible\n`
    texto += `➤ ${usedPrefix}desahogo nadie me entiende\n\n`
    texto += `━━━━━━━━━━━━━━━━━━\n`
    texto += `🌟 Estoy aquí para escucharte\n`
    texto += `🤝 No estás solo/a`

    const buttons = [
      { buttonId: `${usedPrefix}historial`, buttonText: { displayText: '📖 Mi historial' }, type: 1 },
      { buttonId: `${usedPrefix}motivacion`, buttonText: { displayText: '✨ Motivación' }, type: 1 },
      { buttonId: `${usedPrefix}respirar`, buttonText: { displayText: '🫁 Respirar' }, type: 1 }
    ]

    return conn.sendMessage(m.chat, {
      text: texto,
      footer: 'Black Clover Support 2026',
      buttons: buttons,
      headerType: 1
    }, { quoted: m })
  }

  if (Date.now() - user.ultimoDesahogo < 10000) {
    return m.reply('⏳ Respira... tómate un momento. Espera 10 segundos antes de escribir otra vez.')
  }

  const problema = text.toLowerCase()
  let respuesta = ''
  let cambioAnimo = 0
  let categoria = 'general'

  if (problema.includes('triste') || problema.includes('llorar') || problema.includes('deprimid')) {
    categoria = 'tristeza'
    cambioAnimo = 15
    respuesta = elegirRespuesta([
      `Te entiendo @${m.sender.split('@')[0]} 💙 Llorar no es debilidad, es liberar lo que duele. Estoy contigo.`,
      `Duele, lo sé. Pero recuerda que después de la tormenta sale el sol ☀️ Tú eres más fuerte de lo que crees.`,
      `No minimices tu dolor. Si estás triste, es válido sentirlo. Aquí estoy para escucharte sin juzgar 🤝`
    ])
  } else if (problema.includes('ansiedad') || problema.includes('nervios') || problema.includes('miedo') || problema.includes('pánico')) {
    categoria = 'ansiedad'
    cambioAnimo = 12
    respuesta = elegirRespuesta([
      `Respira conmigo @${m.sender.split('@')[0]} 🫁 Inhala 4 segundos... mantén 4... exhala 4. La ansiedad miente, tú puedes.`,
      `La ansiedad grita "¿y si...?" pero tú responde "¿y si sale bien?" 🌟 Un paso a la vez, no tienes que resolver todo hoy.`,
      `Siente tus pies en el suelo. Estás aquí, estás a salvo. Esto también pasará 🕊️`
    ])
  } else if (problema.includes('solo') || problema.includes('nadie') || problema.includes('abandon') || problema.includes('invisible')) {
    categoria = 'soledad'
    cambioAnimo = 18
    respuesta = elegirRespuesta([
      `No estás solo @${m.sender.split('@')[0]} 🤗 Yo estoy aquí. Y aunque no lo veas, hay gente que se preocupa por ti.`,
      `La soledad duele, pero no define tu valor. Tú importas. Tu existencia tiene peso en este mundo 🌍`,
      `Aunque sientas que nadie te ve, yo te veo. Eres valioso/a y mereces amor ❤️`
    ])
  } else if (problema.includes('enoja') || problema.includes('rabia') || problema.includes('odio') || problema.includes('furia')) {
    categoria = 'enojo'
    cambioAnimo = 10
    respuesta = elegirRespuesta([
      `Está bien sentir rabia @${m.sender.split('@')[0]} 🔥 Es una emoción válida. Solo no dejes que te consuma. Respira.`,
      `El enojo es una señal de que algo te importa. Canalízalo: escribe, corre, grita en una almohada. No te lo guardes 💪`,
      `Respira. Cuenta hasta 10. Tú controlas tus acciones, no tu enojo. Eres más fuerte que este momento 🛡️`
    ])
  } else if (problema.includes('cansad') || problema.includes('agotad') || problema.includes('quemad') || problema.includes('exhausto')) {
    categoria = 'agotamiento'
    cambioAnimo = 14
    respuesta = elegirRespuesta([
      `Descansa @${m.sender.split('@')[0]} 🌙 No tienes que ser productivo 24/7. Está bien parar. Tu cuerpo te está pidiendo pausa.`,
      `Estar cansado no es fracasar. Es ser humano. Date permiso de no poder con todo hoy ☕`,
      `Has dado mucho. Ahora toca recargar. Duerme, come algo rico, ve tu serie favorita. Te lo mereces 🛏️`
    ])
  } else if (problema.includes('suicid') || problema.includes('morir') || problema.includes('matarme') || problema.includes('acabar')) {
    categoria = 'crisis'
    cambioAnimo = 5
    respuesta = `🚨 @${m.sender.split('@')[0]} me preocupa leerte así. Tu vida vale MUCHO ❤️\n\nNo tienes que pasar esto solo/a. Por favor busca ayuda:\n\n📞 *Línea de la Vida México:* 800 911 2000\n📞 *Emergencias:* 911\n💬 *Habla con alguien de confianza YA*\n\nEres importante. El dolor que sientes ahora no durará para siempre. Quédate 🌟`
  } else {
    categoria = 'general'
    cambioAnimo = 10
    respuesta = elegirRespuesta([
      `Gracias por confiar en mí @${m.sender.split('@')[0]} 💙 Hablarlo ya es un paso valiente. No estás solo/a en esto.`,
      `Te escucho. Todo lo que sientes es válido. A veces solo necesitamos que alguien nos diga: "estoy aquí" 🤝`,
      `Sea lo que sea que estés pasando, va a pasar. Eres resiliente aunque hoy no lo sientas 🌈`
    ])
  }

  user.animo = Math.min(100, user.animo + cambioAnimo)
  user.ultimoDesahogo = Date.now()
  user.desahogos.push({
    fecha: Date.now(),
    texto: text.slice(0, 200),
    categoria: categoria,
    animoAntes: user.animo - cambioAnimo,
    animoDespues: user.animo
  })

  if (user.desahogos.length > 20) user.desahogos.shift()

  let estadoNuevo = obtenerEstadoAnimo(user.animo)
  let textoFinal = `💙 *TE ESCUCHO* 💙\n\n`
  textoFinal += `${respuesta}\n\n`
  textoFinal += `━━━━━━━━━━━━━━━━━━\n\n`
  textoFinal += `${estadoNuevo.emoji} *Ánimo:* ${user.animo - cambioAnimo} → ${user.animo}/100\n`
  textoFinal += `📈 *Mejora:* +${cambioAnimo} puntos\n\n`
  textoFinal += `🌟 *Recuerda:* Pedir ayuda es de valientes\n`
  textoFinal += `💪 *Tú puedes con esto*`

  const buttons = [
    { buttonId: `${usedPrefix}motivacion`, buttonText: { displayText: '✨ Más motivación' }, type: 1 },
    { buttonId: `${usedPrefix}respirar`, buttonText: { displayText: '🫁 Ejercicio' }, type: 1 },
    { buttonId: `${usedPrefix}apoyo`, buttonText: { displayText: '🆘 Ayuda' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: textoFinal,
    footer: 'Black Clover Support 2026',
    buttons: buttons,
    headerType: 1,
    mentions: [m.sender]
  }, { quoted: m })

  if (user.animo < 30 || categoria === 'crisis') {
    await delay(2000)
    let alerta = `🚨 *ALERTA DE ÁNIMO BAJO* 🚨\n\n`
    alerta += `@${m.sender.split('@')[0]} veo que la estás pasando muy mal 😔\n\n`
    alerta += `*Recursos de ayuda inmediata:*\n`
    alerta += `📞 Línea de la Vida MX: 800 911 2000\n`
    alerta += `📞 Línea PAS US: 1-888-628-9454\n`
    alerta += `📞 Chat de Crisis: Text HOME to 741741\n`
    alerta += `🏥 Emergencias: 911\n\n`
    alerta += `💬 Habla con alguien de confianza YA\n`
    alerta += `🏥 Busca ayuda profesional\n\n`
    alerta += `*No estás solo/a. Tu vida vale mucho ❤️*\n`
    alerta += `*Esto que sientes es temporal*`
    await conn.sendMessage(m.chat, { text: alerta, mentions: [m.sender] }, { quoted: m })
  }
}

async function mostrarHistorial(m, conn, user) {
  if (!user?.desahogos?.length) return m.reply('📖 Aún no tienes desahogos registrados.\n\nUsa .desahogo para contarme cómo te sientes')

  let texto = `📖 *TU HISTORIAL DE ÁNIMO* 📖\n\n`
  texto += `${obtenerEstadoAnimo(user.animo).emoji} *Actual:* ${user.animo}/100\n\n`
  texto += `━━━━━━━━━━━━━━━━━━\n\n`

  const ultimos = user.desahogos.slice(-5).reverse()
  ultimos.forEach((d, i) => {
    const fecha = new Date(d.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    texto += `${i + 1}. *${fecha}* - ${d.categoria}\n`
    texto += `   "${d.texto}"\n`
    texto += `   Ánimo: ${d.animoAntes} → ${d.animoDespues}\n\n`
  })

  texto += `━━━━━━━━━━━━━━━━━━\n`
  texto += `💪 Has usado el desahogo ${user.desahogos.length} veces\n`
  texto += `🌟 Seguir hablando ayuda`

  await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

async function mostrarMotivacion(m, conn) {
  const frases = [
    `🌟 "No tienes que ser grande para empezar, pero tienes que empezar para ser grande"`,
    `💪 "Los días malos construyen días mejores. Resiste"`,
    `🌈 "Eres más valiente de lo que crees, más fuerte de lo que pareces"`,
    `🔥 "Caer está permitido. Levantarse es obligatorio"`,
    `☀️ "Hoy puede ser difícil, pero mañana tendrás una nueva oportunidad"`,
    `🦋 "La transformación duele, pero vale la pena. Como la oruga a mariposa"`,
    `⚔️ "No compares tu capítulo 1 con el capítulo 20 de alguien más"`,
    `🌱 "Incluso los árboles más grandes fueron semillas que decidieron no rendirse"`,
    `💎 "La presión convierte el carbón en diamante. Estás en proceso"`,
    `🌊 "No puedes detener las olas, pero puedes aprender a surfear"`
  ]
  await m.reply(elegirRespuesta(frases))
}

async function ejercicioRespirar(m, conn) {
  await m.reply('🫁 *EJERCICIO 4-7-8* 🫁\n\nVamos a respirar juntos...\nPrepárate')
  await delay(2000)
  await m.reply('1️⃣ Inhala por la nariz... 4 segundos\n🫁 ⬆️')
  await delay(4000)
  await m.reply('2️⃣ Mantén el aire... 7 segundos\n⏸️')
  await delay(7000)
  await m.reply('3️⃣ Exhala por la boca... 8 segundos\n🫁 ⬇️')
  await delay(8000)
  await m.reply('✨ *Listo*. Repite 3 veces si lo necesitas.\n\n¿Cómo te sientes ahora? 💙\n\nUsa .desahogo si necesitas hablar')
}

async function mostrarApoyo(m, conn, usedPrefix) {
  let texto = `🆘 *RECURSOS DE APOYO* 🆘\n\n`
  texto += `Si la estás pasando mal, busca ayuda:\n\n`
  texto += `📞 *México:*\n`
  texto += `➤ Línea de la Vida: 800 911 2000\n`
  texto += `➤ SAPTEL: 55 5259 8121\n`
  texto += `➤ Emergencias: 911\n\n`
  texto += `📞 *USA:*\n`
  texto += `➤ Suicide Prevention: 988\n`
  texto += `➤ Línea PAS: 1-888-628-9454\n`
  texto += `➤ Crisis Text: 741741\n\n`
  texto += `📞 *España:*\n`
  texto += `➤ Teléfono de la Esperanza: 717 003 717\n`
  texto += `➤ Emergencias: 112\n\n`
  texto += `━━━━━━━━━━━━━━━━━━\n`
  texto += `💙 *Recuerda:*\n`
  texto += `• Pedir ayuda es de valientes\n`
  texto += `• No estás solo/a\n`
  texto += `• Esto es temporal\n`
  texto += `• Tu vida vale mucho\n\n`
  texto += `Usa ${usedPrefix}desahogo para hablar conmigo`

  await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.help = ['desahogo', 'historial', 'motivacion', 'respirar', 'apoyo']
handler.tags = ['rpg', 'utilidad']
handler.command = ['desahogo', 'historial', 'motivacion', 'respirar', 'apoyo']
handler.register = true

export default handler

function obtenerEstadoAnimo(animo) {
  if (animo >= 80) return { emoji: '😄', texto: 'Excelente' }
  if (animo >= 60) return { emoji: '🙂', texto: 'Bien' }
  if (animo >= 40) return { emoji: '😐', texto: 'Regular' }
  if (animo >= 20) return { emoji: '😔', texto: 'Mal' }
  return { emoji: '😢', texto: 'Muy mal' }
}

function elegirRespuesta(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}