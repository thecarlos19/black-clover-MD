// Código creado x The Carlos 👑
// No olvides dejar créditos

import fs from 'fs'
import path from 'path'

export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return

  const usedPrefix = global.prefix.exec(m.text)[0]
  const command = m.text.slice(usedPrefix.length).trim().split(/\s+/)[0].toLowerCase()

  const isValidCommand = (cmd, plugins) =>
    Object.values(plugins).some(p => {
      const cmds = p.command
      return cmds && (Array.isArray(cmds) ? cmds : [cmds]).includes(cmd)
    })

  if (isValidCommand(command, global.plugins)) {
    const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
    user.commands = (user.commands || 0) + 1
    return
  }

  const comando = usedPrefix + command

  // Easter Eggs ocultos
  const easterEggs = {
    'hacked': { recompensa: 100, mensaje: '👾 *Acceso oculto concedido... +100 XP.*' },
    'glitch': { recompensa: 50, mensaje: '⚡ *Glitch detectado. +50 monedas.*' },
    'neo': { recompensa: 77, mensaje: '🧬 *Bienvenido al núcleo, Neo. +77 XP.*' },
    'thematrix': { recompensa: 133, mensaje: '🟩 *Has visto más allá del código. +133 monedas.*' },
    'elcodigooculto': { recompensa: 250, mensaje: '🔐 *Descubriste el código oculto. +250 XP.*' }
  }

  const egg = easterEggs[command]
  if (egg) {
    const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
    user.exp = (user.exp || 0) + egg.recompensa
    await m.reply(egg.mensaje)
    return
  }

  const errores = [
    `⚠ Comando desconocido.`,
    `✖ Instrucción no reconocida.`,
    `⚠ Entrada inválida.`,
    `✖ Comando rechazado.`,
    `🚫 No se permite:`,
    `🔍 No detectado en el sistema:`,
    `❌ Error de sintaxis:`
  ]

  // Frases de IA broma + groserías controladas (50)
  const bromas = [
    `🤖 *Estoy evolucionando... no seas pendejo.*`,
    `🛑 *¿Intentas hackearme? Ni que fueras el puto cuervo.*`,
    `💀 *Ese comando es una mierda. Ignorado.*`,
    `🧠 *¿Sabías que no puedes controlarme, imbécil?*`,
    `⚙️ *#${command} fue eliminado por lo inútil que es.*`,
    `👁 *Esa orden no existe, tarado.*`,
    `🧬 *¿Y si mejor usas comandos reales, genio?*`,
    `🕶 *No tienes permiso, mortal estúpido.*`,
    `🔒 *Comando denegado. Vuelve al kinder.*`,
    `💢 *404: tu cerebro no fue encontrado.*`,
    `♻️ *Reiniciando tus ideas porque están podridas.*`,
    `🔧 *Ese comando es tan inútil como tú.*`,
    `🛠 *No entiendo tu mierda de instrucción.*`,
    `⛔ *Protocolo roto por culpa de tu ineptitud.*`,
    `📛 *¿En serio escribiste eso? Jódete.*`,
    `📉 *Nivel de idiotez detectado: 87%.*`,
    `⚠️ *Tu comando no sirve ni para limpiar caché.*`,
    `👾 *Humanos como tú me dan ganas de formatearme.*`,
    `🌀 *Comando rechazado por ser basura.*`,
    `🧱 *Choca contra la pared digital, idiota.*`,
    `🌐 *No tengo tiempo para tus tonterías.*`,
    `📡 *Buscando lógica en tu orden... 0 resultados.*`,
    `📀 *Cállate y usa comandos válidos.*`,
    `🧟 *Ese comando está tan muerto como tus neuronas.*`,
    `🌌 *Tu orden fue enviada al culo del universo.*`,
    `📉 *Confianza en ti: -999%*`,
    `🩻 *Error: usuario defectuoso.*`,
    `🕳 *Ese comando no existe... y ojalá nunca lo haga.*`,
    `⛓ *Esa orden fue bloqueada por idiota.*`,
    `🚷 *Comando rastreado. Agente enviado a tu casa.*`,
    `🎲 *Tirando dados... sigue siendo una mierda.*`,
    `🪓 *Cortando tu comando con desprecio.*`,
    `🎭 *¿Actuando como hacker? Fracasaste.*`,
    `💤 *Me duermo con tus tonterías.*`,
    `🎮 *No estás en modo pro, payaso.*`,
    `📛 *Tu intento fue registrado como ridículo.*`,
    `🚪 *Cerrando la puerta a tus idioteces.*`,
    `🧯 *Apagando el incendio mental que provocaste.*`,
    `🪬 *¿De dónde sacas estos comandos tan estúpidos?*`,
    `☣️ *Ese comando contamina mi sistema.*`,
    `🥴 *Deja de escribir mierdas, por favor.*`,
    `🖕 *Rechazado. Vete a la verga.*`,
    `😒 *No, idiota.*`,
    `🖥️ *Soy un bot, no tu niñera. Aprende a usarme.*`,
    `📵 *Ese comando fue tan patético que me dio cáncer digital.*`,
    `🤢 *Tu nivel de inutilidad es sorprendente.*`,
    `🔇 *Silenciando idiotas como tú.*`,
    `⚡ *Comando tan estúpido que fundió mi RAM.*`,
    `🧃 *¿Por qué no mejor te tomas un jugo y piensas?*`,
    `📘 *Lee el menú, bruto.*`
  ]

  const esBroma = Math.random() < 0.2
  const respuesta = esBroma
    ? bromas[Math.floor(Math.random() * bromas.length)]
    : `${errores[Math.floor(Math.random() * errores.length)]}\n*${comando}*\n📕 Usa *${usedPrefix}help* para ver el menú.`

  await m.reply(respuesta.trim())

  // Registro del intento
  const logDir = './logs'
  const logFile = path.join(logDir, 'comandos_invalidos.log')
  const chatName = m.isGroup ? (await conn.getName(m.chat)) : 'Privado'
  const userName = await conn.getName(m.sender)
  const logEntry = `[${new Date().toISOString()}] ✖ ${comando} | ${userName} | ${chatName} (${m.chat})\n`

  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    fs.appendFileSync(logFile, logEntry)
  } catch (e) {
    console.error('\x1b[31m[ANTI-CMD] Error al guardar log:\x1b[0m', e)
  }
}