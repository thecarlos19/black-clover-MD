// código creado x The Carlos 👑
// comando: listar vip 

let handler = async (m, { conn }) => {
  const emoji = '🌟';
  const now = Date.now();

  // Filtrar usuarios con premium activo
  let vipUsers = Object.entries(global.db.data.users)
    .filter(([jid, user]) => user.premium);

  if (!vipUsers.length) {
    return conn.reply(m.chat, '🚩 *No hay usuarios VIP/Premium activos.*', m);
  }

  let message = `${emoji} *LISTA DE USUARIOS VIP / PREMIUM*\n\n`;

  vipUsers.forEach(([jid, user], index) => {
    let tiempoRestante = user.premiumTime === Infinity ? Infinity : Math.max(user.premiumTime - now, 0);
    let status = tiempoRestante > 0 || tiempoRestante === Infinity ? '✅ Activo' : '❌ Expirado';

    let tiempoTexto;
    if (tiempoRestante === Infinity) {
      tiempoTexto = '♾️ Permanente';
    } else if (status === '✅ Activo') {
      let dias = Math.floor(tiempoRestante / 86400000);
      let horas = Math.floor((tiempoRestante % 86400000) / 3600000);
      let minutos = Math.floor((tiempoRestante % 3600000) / 60000);
      tiempoTexto = `${dias}d ${horas}h ${minutos}m`;
    } else {
      tiempoTexto = '0d 0h 0m';
    }

    message += `${index + 1}. @${jid.split('@')[0]}\n   ➤ Estado: *${status}*\n   ➤ Tiempo: *${tiempoTexto}*\n\n`;
  });

  await conn.sendMessage(
    m.chat,
    {
      text: message.trim(),
      mentions: vipUsers.map(([jid]) => jid)
    },
    { quoted: m }
  );
};

handler.help = ['listavip'];
handler.tags = ['premium'];
handler.command = ['listavip', 'viplist', 'usuariosvip'];
handler.register = true;

export default handler;