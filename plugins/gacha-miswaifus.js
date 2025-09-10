import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('❀ No se pudo cargar el archivo characters.json.');
    }
}

let handler = async (m, { conn }) => {
    try {
        const userId = m.sender;
        const characters = await loadCharacters();

        const myWaifus = characters.filter(c => c.user === userId);

        if (myWaifus.length === 0) {
            return await conn.reply(m.chat, '《✧》No tienes ninguna waifu reclamada.', m);
        }

        let message = `❀ *Tus waifus (${myWaifus.length}):*\n`;
        myWaifus.forEach((waifu, index) => {
            message += `✰ ${index + 1} » *${waifu.name}* (ID: ${waifu.id})\n`;
        });

        await conn.reply(m.chat, message, m);
    } catch (error) {
        await conn.reply(m.chat, `✘ Error al obtener tus waifus: ${error.message}`, m);
    }
};

handler.help = ['miswaifus'];
handler.tags = ['gacha'];
handler.command = ['miswaifus', 'mywaifus'];
handler.group = true;

export default handler;