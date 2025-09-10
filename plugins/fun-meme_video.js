let handler = async (m, { conn, usedPrefix }) => {
    const memes = [
        'https://qu.ax/DksQt.mp4',
        'https://qu.ax/vDgQd.mp4',
        'https://qu.ax/jpiBe.mp4',
        'https://qu.ax/TiecS.mp4',
        'https://qu.ax/LWJCF.mp4',
        'https://qu.ax/euTXj.mp4',
        'https://qu.ax/GoOJh.mp4',
    ];

    const randomMeme = memes[Math.floor(Math.random() * memes.length)];

    const buttons = [
        {
            buttonId: `${usedPrefix}mp4meme`,
            buttonText: { displayText: "🔄 Ver más" },
            type: 1
        }
    ];

    await conn.sendMessage(
        m.chat,
        {
            video: { url: randomMeme },
            caption: "¡Aquí tienes un meme para disfrutar!",
            buttons: buttons,
            viewOnce: true
        },
        { quoted: m }
    );
};

handler.help = ['memev'];
handler.tags = ['fun'];
handler.command = ['memev'];

export default handler;