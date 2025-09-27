let handler = async (m, { conn, text }) => {
  let who;
  if (m.isGroup) {
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0];
    } else if (m.quoted) {
      who = m.quoted.sender;
    } else {
      return m.reply('❗ *Menciona a un usuario o responde a su mensaje.*');
    }
  } else {
    who = m.chat;
  }

  if (!text) {
    return m.reply(`📥 *Ingresa la cantidad de monedas 🪙 a añadir.*\n\nEjemplo:\n*.añadirmonedas @user 50000*\n*.añadirmonedas @user infinito*`);
  }

  let args = text.trim().split(/\s+/);
  let cantidadTexto = args[args.length - 1].toLowerCase();

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {
      exp: 0,
      monedas: 0,
      joincount: 1,
      diamond: 0,
      level: 0,
      bank: 0,
      premium: false,
      premiumTime: 0,
      banned: false
    };
  }

  if (cantidadTexto === 'infinito' || cantidadTexto === '∞') {
    global.db.data.users[who].monedas = 999_999_999;
    return await conn.reply(m.chat, `
╭━━〔 *💸 TESORO ILIMITADO* 〕━━⬣  
┃🎖️ Usuario: @${who.split('@')[0]}
┃💰 Monedas asignadas: *999,999,999 🪙*
┃🛡️ Modo: *Infinito Activado*
╰━━━━━━━━━━━━━━━━━━━━⬣`, m, { mentions: [who] });
  }

  let cantidad = parseInt(cantidadTexto.replace(/\D/g, ''));
  if (isNaN(cantidad)) return m.reply('⚠️ *Solo se permiten números o la palabra "infinito".*');
  if (cantidad < 1) return m.reply('❌ *La cantidad mínima es 1.*');
  if (cantidad > 1_000_000_000) return m.reply('🚨 *Cantidad demasiado alta. Máximo permitido: 1,000,000,000 🪙*');

  global.db.data.users[who].monedas += cantidad;

  await conn.reply(m.chat, `
╭━━〔 *🪙 MONEDAS ENTREGADAS* 〕━━⬣  
┃👤 Usuario: @${who.split('@')[0]}
┃💰 Monedas añadidas: *${cantidad.toLocaleString()} 🪙*
┃💼 Total actual: *${global.db.data.users[who].monedas.toLocaleString()} 🪙*
╰━━━━━━━━━━━━━━━━━━━━⬣`, m, { mentions: [who] });
};

handler.help = ['añadirmonedas @usuario cantidad'];
handler.tags = ['owner'];
handler.command = ['añadirmonedas', 'addmonedas', 'addmoney'];
handler.rowner = true;

export default handler;