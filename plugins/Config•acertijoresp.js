import similarity from 'similarity';
const threshold = 0.72;
const RIDDLE_PREFIX = 'ⷮ';

const handler = (m) => m;

handler.before = async function(m) {
  const id = m.chat;
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !new RegExp(`^${RIDDLE_PREFIX}`, 'i').test(m.quoted.text)) return !0;

  this.tekateki = this.tekateki || {};
  if (!(id in this.tekateki)) return m.reply('⚠️ *Sistema:* El acertijo ya ha expirado o fue resuelto.');

  if (m.quoted.id == this.tekateki[id][0].id) {
    const json = JSON.parse(JSON.stringify(this.tekateki[id][1]));

    // Asegura que el usuario existe en la DB
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || { monedas: 0 };

    if (m.text.toLowerCase() == json.response.toLowerCase().trim()) {
      global.db.data.users[m.sender].monedas += this.tekateki[id][2];
      m.reply(`🧠✅ *¡Respuesta correcta, ejecutor!* +${this.tekateki[id][2]} 🪙 *Monedas del Sistema*`);
      clearTimeout(this.tekateki[id][3]);
      delete this.tekateki[id];
    } else if (similarity(m.text.toLowerCase(), json.response.toLowerCase().trim()) >= threshold) {
      m.reply(`🤏 *Casi lo logras, hacker... estás cerca del núcleo!*`);
    } else {
      m.reply('❌ *Respuesta incorrecta. Intenta de nuevo, no te rindas.*');
    }
  }

  return !0;
};

handler.exp = 0;
export default handler;