// Código creado x The Carlos 👑
// No olvides dejar créditos

import fs from 'fs'
import path from 'path'

export async function before(m, { conn }) {
  if (!m.text) return

  let prefixRegex = global.prefix
  if (!(prefixRegex instanceof RegExp)) {
    prefixRegex = new RegExp(`^(${Array.isArray(prefixRegex) ? prefixRegex.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') : String(prefixRegex).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`)
  }

  const match = m.text.match(prefixRegex)
  if (!match) return

  const usedPrefix = match[0]
  const command = m.text.slice(usedPrefix.length).trim().split(/\s+/)[0]?.toLowerCase()
  if (!command) return

  const isValidCommand = (cmd, plugins) =>
    Object.values(plugins).some(p => {
      if (!p || !p.command) return false
      const cmds = Array.isArray(p.command) ? p.command : [p.command]
      return cmds.includes(cmd)
    })

  if (isValidCommand(command, global.plugins)) {
    const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
    user.commands = (user.commands || 0) + 1
    return
  }

  const comando = usedPrefix + command

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
    `⚠ piche gente Lee el menú pendejo.`,
    `✖ Instrucción no reconocida mierda.`,
    `⚠ ese comando no existe pendejo.`,
    `✖ Comando rechazado basura.`,
    `🚫 No se permite por que no existe pendejo de mierda:`,
    `🔍 No detectado en el sistema y Lee el menú mierda:`,
    `❌ Error no hay ese comando:`
  ]

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

    `📘 *Lee el menú, mierda.*`,
    `📘 *Lee el menú antes de escribir.*`,
    `📘 *Menú primero, cerebro después.*`,
    `📘 *Ahí está el menú, úsalo.*`,
    `📘 *No es tan difícil, lee el menú.*`,
    `📘 *El menú no es decoración.*`,
    `📘 *Aprende a leer, empieza por el menú.*`,
    `📘 *El menú existe por algo, úsalo.*`,
    `📘 *Primero el menú, luego hablas.*`,
    `📘 *Deja de escribir y lee el menú.*`,

    `🛑 *Ese comando no existe, punto.*`,
    `🛑 *No inventes comandos.*`,
    `🛑 *Eso no está en el sistema.*`,
    `🛑 *Comando inválido, intenta otra cosa.*`,
    `🛑 *No, así no funciona.*`,

    `💀 *Ese comando está muerto.*`,
    `💀 *Murió antes de ejecutarse.*`,
    `💀 *Ni siquiera llegó a intento.*`,

    `🧠 *Piensa antes de escribir.*`,
    `🧠 *Usa el cerebro un segundo.*`,
    `🧠 *Un poco de lógica no te haría daño.*`,

    `⚙️ *Comando inútil.*`,
    `⚙️ *Eso no sirve.*`,
    `⚙️ *Intento fallido.*`,

    `👁 *No existe.*`,
    `👁 *Incorrecto.*`,
    `👁 *Rechazado.*`,

    `📘 *Lee el menú, en serio.*`,
    `🛑 *Deja de inventar comandos.*`,
    `💀 *Ese comando está muerto.*`,
    `🧠 *Usa el cerebro tantito.*`,
    `⚙️ *Eso no sirve para nada.*`,
    `😒 *Otra vez mal.*`,
    `🪶 *El Cuervo dice: intenta bien.*`,

    `📘 *Lee el menú y deja de fallar.*`,
    `🛑 *Ya vas varias veces mal.*`,
    `💀 *Sigues fallando igual.*`,
    `🧠 *Ni un intento correcto.*`,
    `⚙️ *Inútil otra vez.*`,
    `😒 *Cansa repetir lo mismo.*`,
    `🪶 *El Cuervo ya se aburrió de ti.*`,

    `😒 *No.*`,
    `😒 *Así no.*`,
    `😒 *Intenta otra vez.*`,

    `🚫 *Error. Fin.*`,
    `🚫 *Denegado.*`,
    `🚫 *Bloqueado.*`
  ]
  

  const esBroma = Math.random() < 0.2
  const respuesta = esBroma
    ? bromas[Math.floor(Math.random() * bromas.length)]
    : `${errores[Math.floor(Math.random() * errores.length)]}\n*${comando}*\n📕 Usa *${usedPrefix}help* para ver el menú.`

  await m.reply(respuesta.trim())
}