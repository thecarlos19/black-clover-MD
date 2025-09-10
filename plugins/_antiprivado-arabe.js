const codigosArabes = ['+212', '+971', '+20', '+966', '+964', '+963', '+973', '+968', '+974'];
const regexArabe = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const regexComando = /^[\/!#.]/;

// Objeto global para advertencias
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
🟥 ⛔ *[BLOQUEO ACTIVADO]* ⛔ 🟥
══════════════════════
🛡️ *Seguridad CyberCore™ activada*
📛 Usuario: ${numero}
💬 Motivo: Texto no permitido (3/3)

🧨 Ejecución del protocolo [AUTOBLOCK-ΣX3]...
🔒 Estado: *USUARIO BLOQUEADO*

🔗 Acceso finalizado.
══════════════════════`);
        await conn.updateBlockStatus(m.chat, 'block');
        console.log(`[⛔ BLOQUEADO PERMANENTE] ${numero}`);
        delete global.advertenciasArabes[numero];
      } else {
        await m.reply(`
⚠️ ⚠️ *[ADVERTENCIA ${advertencias}/3]* ⚠️ ⚠️
══════════════════════
🚫 Sistema de defensa activado.
💬 Has enviado texto no permitido.

📎 Solo comandos aceptados:
Ej: */menu*, */help*, */code* !info

🧬 Siguiente violación resultará en *bloqueo automático*.
══════════════════════`);
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