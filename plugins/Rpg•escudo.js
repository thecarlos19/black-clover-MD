const COSTO_POR_HORA = 10000;

const handler = async (m, { conn, args, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];
  const now = Date.now();

  if (!user) {
    global.db.data.users[m.sender] = { cookies: 0, shieldUntil: 0 };
    user = global.db.data.users[m.sender];
  }

  if (user.shieldUntil > now) {
    const tiempoRestante = msToTime(user.shieldUntil - now);
    return conn.reply(
      m.chat,
      `🛡️ Tu escudo ya está activo. Tiempo restante: *${tiempoRestante}*.\nMientras tengas el escudo, tus monedas no pueden ser reducidas.`,
      m
    );
  }

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `🛡️ *Comprar Escudo*\n\nUsa:\n*${usedPrefix + command} <horas>*\n\nCada hora cuesta *10,000 monedas*.\nEjemplo:\n- *${usedPrefix + command} 1* → 1 hora\n- *${usedPrefix + command} 24* → 1 día`,
      m
    );
  }

  const horas = parseInt(args[0]);
  if (isNaN(horas) || horas <= 0) {
    return conn.reply(m.chat, `❌ Ingresa una cantidad válida de horas.`, m);
  }

  const costo = horas * COSTO_POR_HORA;
  if (user.cookies < costo) {
    return conn.reply(
      m.chat,
      `❌ No tienes suficientes monedas 🪙. Necesitas *${costo.toLocaleString()}* para comprar ${horas} hora(s) de escudo.`,
      m
    );
  }

  user.cookies -= costo;
  user.shieldUntil = now + horas * 60 * 60 * 1000;

  const tiempoTotal = msToTime(user.shieldUntil - now);
  return conn.reply(
    m.chat,
    `✅ Has comprado un escudo por *${horas}* hora(s).\nAhora estás protegido durante: *${tiempoTotal}*. 🛡️`,
    m
  );
};

handler.help = ['escudo <horas>'];
handler.tags = ['rpg'];
handler.command = ['escudo', 'comprar-escudo'];
export default handler;

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} Día(s) ${hours} Hora(s)`;
  if (hours > 0) return `${hours} Hora(s) ${minutes} Minuto(s)`;
  return `${minutes} Minuto(s) ${seconds} Segundo(s)`;
}