//Código creado x The Carlos 👑 
import { promises as fs } from 'fs';
const charactersFilePath = './src/database/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

async function saveCharacters(characters) {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
}

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) {
        return await conn.reply(m.chat, '✘ Solo el owner puede usar este comando.', m);
    }

    try {
        const characters = await loadCharacters();
        if (characters.length === 0) {
            return await conn.reply(m.chat, '✘ No hay waifus registradas.', m);
        }

        characters.forEach(c => {
            c.user = null;
        });

        await saveCharacters(characters);
        await conn.reply(m.chat, '✅ Todas las waifus han sido reiniciadas. Ahora nadie las posee.', m);
    } catch (error) {
        await conn.reply(m.chat, `✘ Error: ${error.message}`, m);
    }
};

handler.help = ['resetwaifus'];
handler.tags = ['gacha'];
handler.command = ['resetwaifus'];
handler.group = true;
handler.owner = true;

export default handler;