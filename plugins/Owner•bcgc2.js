//código hecho x The Carlos ofc 

const handler = async (m, { conn, text }) => {
  // 🔐 Solo para el creador y owners definidos
  const isCreator = global.owner.find(([num]) => m.sender.includes(num));
  if (!isCreator) {
    return m.reply(`🚫 *Acceso denegado:*\nEste comando solo está permitido para el *creador del bot* o *usuarios autorizados*.`);
  }

  if (!text) {
    return m.reply('⚠️ *Debes escribir el mensaje que quieres enviar a todos los grupos.*');
  }

  const fakeContact = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      id: 'broadcast'
    },
    message: {
      contactMessage: {
        displayName: '📡 Sistema Central',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Black Clover IA\nTEL;type=CELL:${conn.user.jid.split('@')[0]}\nEND:VCARD`
      }
    }
  };

  // 🎨 Mensaje Cyberpunk
  const message = `
┏━━━《👾 𝘚𝘠𝘚𝘛𝘌𝘔 𝘉𝘙𝘖𝘈𝘋𝘊𝘈𝘚𝘛 👾》━━━┓
┃ ⚙️ *Módulo IA Activado...*
┃
┃ 🔮 *MENSAJE DEL SISTEMA:*
┃ ➥ ${text}
┃
┃ 🛰️ Transmitiendo en redes paralelas...
┗━━━━━━━━━━━━━━━━━━━━━━┛`.trim();

  const conns = [conn, ...(global.conns || [])];
  let totalGrupos = 0;

  for (const bot of conns) {
    try {
      const grupos = await bot.groupFetchAllParticipating();
      const ids = Object.keys(grupos);

      for (const gid of ids) {
        if (grupos[gid].announce) continue;
        await bot.sendMessage(gid, { text: message }, { quoted: fakeContact });
        totalGrupos++;
      }
    } catch (err) {
      console.error('❗ Error en difusión:', err);
    }
  }

  return m.reply(`✅ *Difusión completada:*\n📡 *Grupos alcanzados:* ${totalGrupos}\n🧠 *Sistema:* Black Clover IA`);
};

handler.help = ['bcgc2', 'bcg'];
handler.tags = ['owner'];
handler.command = ['bcgc2', 'bcg'];
handler.owner = true; // Requiere que esté en global.owner

export default handler;