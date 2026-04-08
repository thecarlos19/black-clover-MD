//código creado x The Carlos 
//no olviden dejar créditos 

const TIEMPO_BLOQUEO_MS = 2 * 24 * 60 * 60 * 1000;

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  try {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.message || typeof m.text !== 'string') return false;

    const text = m.text.toUpperCase();
    const exentos = ['PIEDRA', 'PAPEL', 'TIJERA', 'SERBOT', 'JADIBOT'];
    const comandoPermitidoBloqueado = ['CODE'];

    const bot = global.db.data.settings[conn.user.jid] || {};
    const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});
    const gp1 = global.gp1 || 'https://chat.whatsapp.com/LqidiNoYuDY5aA60c8fuDP?mode=gi_t';

    if (exentos.some(word => text.includes(word)) || comandoPermitidoBloqueado.some(cmd => text.startsWith(cmd))) {
      return true;
    }

    if (user.bloqueado && user.tiempoBloqueo) {
      const ahora = Date.now();
      const tiempoPasado = ahora - user.tiempoBloqueo;

      if (tiempoPasado >= TIEMPO_BLOQUEO_MS) {
        await conn.updateBlockStatus(m.sender, 'unblock').catch(() => {});
        user.bloqueado = false;
        user.tiempoBloqueo = 0;
        user.warnPrivado = 0;

        await conn.sendMessage(m.chat, {
          text: `
╭━〔 🔓 DESBLOQUEO 〕━⬣
┃ 👤 Usuario: @${m.sender.split('@')[0]}
┃ ✨ Estado: Activo nuevamente
┃ 🪄 Acceso restaurado al sistema
╰━━━━━━━━━━━━━━━━⬣`.trim(),
          mentions: [m.sender]
        });

        return true;
      } else {
        return false;
      }
    }

    if (!m.isGroup && bot.antiPrivate && !isOwner && !isROwner) {
      user.warnPrivado = (user.warnPrivado || 0) + 1;

      if (user.warnPrivado >= 3) {
        const msgBloqueo = `
╭━〔 💀 BLOQUEO DEL SISTEMA 〕━⬣
┃ 👤 Usuario: @${m.sender.split('@')[0]}
┃ 🚫 Acceso: Denegado
┃ ⏳ Duración: 2 días
┃ ⚠️ Motivo: Uso indebido en privado
┃
┃ 🌐 Grupo oficial:
┃ ${gp1}
╰━━━━━━━━━━━━━━━━⬣`.trim();

        await conn.sendMessage(m.chat, { text: msgBloqueo, mentions: [m.sender] });
        await conn.updateBlockStatus(m.sender, 'block').catch(() => {});
        user.warnPrivado = 0;
        user.bloqueado = true;
        user.tiempoBloqueo = Date.now();

        return false;
      } else {
        const msgAdvertencia = `
╭━〔 ⚠️ ADVERTENCIA 〕━⬣
┃ 👤 Usuario: @${m.sender.split('@')[0]}
┃ 🚫 No permitido usar el bot en privado
┃ 🔢 Intentos: ${user.warnPrivado}/3
┃
┃ 💡 Usa el bot en el grupo:
┃ ${gp1}
╰━━━━━━━━━━━━━━━━⬣`.trim();

        await conn.sendMessage(m.chat, { text: msgAdvertencia, mentions: [m.sender] });

        return false;
      }
    }

    return true;

  } catch (e) {
    console.error('[❌ ERROR EN ANTI-PRIVADO Y GRUPAL]', e);
    return true;
  }
}