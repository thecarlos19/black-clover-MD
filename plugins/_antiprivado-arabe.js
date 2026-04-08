const codigosArabes = ['+212', '+971', '+20', '+966', '+964', '+963', '+973', '+968', '+974'];
const regexArabe = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const regexComando = /^[\/!#.]/;

global.advertenciasArabes = global.advertenciasArabes || {};

export async function before(m, { conn, isOwner, isROwner }) {
  try {
    if (
      m.isBaileys ||
      m.isGroup ||
      !m.message ||
      !m.sender ||
      typeof m.text !== 'string' ||
      isOwner ||
      isROwner
    ) return false;

    const numero = m.sender;
    const texto = m.text;
    const numeroLimpio = numero.replace(/[^0-9]/g, '');

    const esArabe = regexArabe.test(texto) || codigosArabes.some(pref => numeroLimpio.startsWith(pref.replace('+', '')));
    const esComando = regexComando.test(texto);

    if (esArabe && !esComando) {
      global.advertenciasArabes[numero] = (global.advertenciasArabes[numero] || 0) + 1;

      const advertencias = global.advertenciasArabes[numero];

      if (advertencias >= 3) {
        await m.reply(`
╭━〔 ⛔ BLOQUEO ACTIVADO 〕━⬣
┃ 👤 Usuario: ${numero}
┃ 🚫 Acceso: Denegado
┃ ⚠️ Motivo: Texto no permitido
┃ 🔢 Intentos: 3/3
┃
┃ 🔒 Estado: Usuario bloqueado
┃ 🛡️ Sistema de protección activo
╰━━━━━━━━━━━━━━━━⬣`.trim());

        await conn.updateBlockStatus(m.chat, 'block');
        console.log(`[⛔ BLOQUEADO PERMANENTE] ${numero}`);
        delete global.advertenciasArabes[numero];

      } else {
        await m.reply(`
╭━〔 ⚠️ ADVERTENCIA 〕━⬣
┃ 👤 Usuario: ${numero}
┃ 🚫 Texto no permitido detectado
┃ 🔢 Intentos: ${advertencias}/3
┃
┃ 💡 Solo comandos permitidos:
┃ /menu  /help  /code  !info
┃
┃ ⚠️ Al llegar a 3 serás bloqueado
╰━━━━━━━━━━━━━━━━⬣`.trim());

        console.log(`[⚠️ ADVERTENCIA ${advertencias}/3] ${numero}`);
      }

      return false;
    }

    return true;

  } catch (e) {
    console.error('[❌ ERROR EN SISTEMA CYBERPUNK DE ADVERTENCIAS]', e);
    return true;
  }
}