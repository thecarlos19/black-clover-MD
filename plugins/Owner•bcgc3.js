import { randomBytes } from 'crypto';

// Variable global para almacenar qué sub bot ya está enviando el broadcast
global.broadcastingBot = global.broadcastingBot || null;

const handler = async (m, { conn, command, participants, text }) => {
  if (!text) return conn.reply(m.chat, '🚩 Te faltó el texto que quieres transmitir a todos los chats.', m);

  // Si aún no hay un bot enviando, asigna este como el único
  if (!global.broadcastingBot) {
    global.broadcastingBot = conn.user.jid;
    await conn.reply(m.chat, '✅ Este sub bot se ha asignado para enviar el mensaje a todos los chats.', m);
  }

  // Si otro bot intenta enviar mientras uno ya está activo, bloquearlo
  if (global.broadcastingBot !== conn.user.jid) {
    return conn.reply(m.chat, '⚠️ Otro sub bot ya está enviando el mensaje, espera a que termine.', m);
  }

  const teks4 = text;
  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${conn.user.jid.split('@')[0]}:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  };

  const groups2 = Object.keys(await conn.groupFetchAllParticipating());
  const chats2 = Object.keys(global.db.data.users).filter(user => user.endsWith('@s.whatsapp.net'));

  await conn.reply(m.chat, '🧋✨ *El texto se está enviando a todos los chats...*', m);

  const start2 = new Date().getTime();
  const usersTag2 = participants.map(u => conn.decodeJid(u.id));
  let totalPri2 = 0;

  // Enviar a grupos con delay
  for (let i = 0; i < groups2.length; i++) {
    const group = groups2[i];
    const delay = i * 4000; // 4 seg
    setTimeout(async () => {
      await conn.reply(group, teks4, { mentions: usersTag2 }, { quoted: null });
    }, delay);
  }

  // Enviar a chats privados con delay
  for (const user of chats2) {
    await delayMs(2000); // 2 seg
    await conn.reply(user, teks4, null, null);
    totalPri2++;
    if (totalPri2 >= 500000) break;
  }

  const end2 = new Date().getTime();
  const totalPrivate2 = chats2.length;
  const totalGroups2 = groups2.length;
  const total2 = totalPrivate2 + totalGroups2;

  let time2 = Math.floor((end2 - start2) / 1000);
  time2 = time2 >= 60
    ? `${Math.floor(time2 / 60)} minutos y ${time2 % 60} segundos`
    : `${time2} segundos`;

  await m.reply(`⭐️ Mensaje enviado a:\n🍟 Chats Privados: ${totalPrivate2}\n⚜️ Grupos: ${totalGroups2}\n🚩 Total: ${total2}\n\n⏱️ *Tiempo total:* ${time2}`);

  // Liberar el bloqueo al terminar
  global.broadcastingBot = null;
};

handler.help = ['broadcast', 'bc3'];
handler.tags = ['owner'];
handler.command = ['bc3', 'comunicado'];
handler.owner = true;

export default handler;

const delayMs = ms => new Promise(resolve => setTimeout(resolve, ms));
const randomID = length => randomBytes(Math.ceil(length * 0.5)).toString('hex').slice(0, length);