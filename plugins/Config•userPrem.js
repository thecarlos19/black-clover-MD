const handler = (m) => m;

export async function all(m) {
  try {
    for (const user of Object.values(global.db.data.users)) {
      if (user.premiumTime !== 0 && user.premium) {
        if (new Date() * 1 >= user.premiumTime) {
          user.premiumTime = 0;
          user.premium = false;

          const JID = Object.keys(global.db.data.users).find(
            (key) => global.db.data.users[key] === user
          );

          const fkontak = {
            key: {
              fromMe: false,
              participant: '0@s.whatsapp.net',
              remoteJid: 'status@broadcast'
            },
            message: {
              contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
              }
            }
          };

          const textoo = `「✐」Se agotó tu tiempo como usuario premium`;
          await this.sendMessage(JID, { text: textoo, mentions: [JID] }, { quoted: fkontak });
        }
      }
    }
  } catch (e) {
    console.error('Error al verificar el tiempo premium:', e);
  }
}

export default handler;