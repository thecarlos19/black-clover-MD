import fs from 'fs';

const handler = (m) => m;

handler.all = async function(m) {

    const chat = global.db.data.chats[m.chat];
    if (chat.isBaneed) return;

    const text = m.text.toLowerCase(); // simplifica las comparaciones

    // Mapeo de palabras clave y respuestas
    const respuestas = {
        "bot": `🚩 ¡Hola! Soy asta, en que puedo ayudarte hoy?\n\n✰ Usa *!menu* para ver mis comandos.`,
        //"corin": `🚀 CorinPlus Hosting ¡El plus que necesitas!\n🚩 *Dash:* https://dash.corinplus.com\n🌱 *Panel:* https://ctrl.corinplus.com`, // comentado como en tu código
        "sexo": "*pervertido* 🫣",
        "teta": "*que caliente eres* 🥵",
        "tetas": "*que caliente eres* 🥵",
        "bug": "*tu mamá we* 😹",
        "pene": "*comes* 😹",
        "hola": "¡Hola! 😎",
        "adios": "Hasta luego 👋",
        "amor": "¡Qué romántico! ❤️",
        "odio": "Tranquilo, respira 😅",
        "jaja": "😂 me alegra que te rías",
        "xd": "😆",
        "gato": "¡Amo los gatos! 🐱",
        "perro": "¡Los perros son geniales! 🐶",
        "pizza": "¡Pizza time! 🍕",
        "hamburguesa": "🍔 deliciosa",
        "café": "☕ ya me dieron ganas",
        "té": "🍵 saludable",
        "dinero": "💸 todos lo queremos",
        "trabajo": "😓 ánimo, tú puedes",
        "fiesta": "🎉 vamos a celebrar",
        "música": "🎵 ¿qué escuchas?",
        "amor platónico": "💌 interesante...",
        "amor verdadero": "💖 suerte en eso",
        "broma": "😂 me encanta reír",
        "chiste": "😆 cuéntame otro",
        "frío": "🥶 abrígate",
        "calor": "🥵 toma agua",
        "lluvia": "🌧 me gusta la lluvia",
        "sol": "☀️ perfecto para salir",
        "noche": "🌙 que descanses",
        "día": "🌞 buen día",
        "comida": "🍽 delicioso",
        "videojuego": "🎮 a jugar!",
        "película": "🍿 vamos al cine",
        "serie": "📺 binge time!",
        "libro": "📚 buena lectura",
        "viaje": "✈️ a dónde vamos?",
        "playa": "🏖 me encanta",
        "montaña": "⛰ aventura total",
        "deporte": "⚽ vamos a movernos",
        "fútbol": "⚽ gol!",
        "basquet": "🏀 encesto!",
        "amor secreto": "🤫 shh...",
        "amigo": "🤝 ¡saludos!",
        "enemigo": "😬 cuidado...",
        "familia": "👨‍👩‍👧‍👦 muy importante",
        "fiesta loca": "🥳 cuidado!",
        "dinámico": "⚡ qué energía",
        "relajado": "😌 así está bien",
        "trabajador": "💪 sigue así",
        "perezoso": "😴 jaja"
    };

    // Buscar coincidencias
    for (let key in respuestas) {
        const regex = new RegExp(`^${key}$`, "i");
        if (regex.test(m.text)) {
            conn.reply(m.chat, respuestas[key], m, rcanal);
            return !0;
        }
    }

    return !0;
};

export default handler;