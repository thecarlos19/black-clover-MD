import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

async function saveCharacters(characters) {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
}

let handler = async (m, { conn, args, isOwner }) => {
    try {
        if (!isOwner) return await conn.reply(m.chat, '✘ Solo el *owner* puede robar waifus.', m);
        if (!args[0]) return await conn.reply(m.chat, '✘ Debes proporcionar el ID de la waifu que quieres robar.', m);

        const characters = await loadCharacters();
        const waifuId = args[0];
        const waifu = characters.find(c => c.id === waifuId);

        if (!waifu) return await conn.reply(m.chat, `✘ No se encontró ninguna waifu con el ID: *${waifuId}*`, m);

        const oldOwner = waifu.user;
        waifu.user = m.sender;
        await saveCharacters(characters);

        await conn.reply(m.chat, `✧ Has robado a *${waifu.name}* (ID: ${waifu.id}) del usuario *${oldOwner.split('@')[0]}* ✧`, m);

        if (oldOwner !== m.sender) {
            await conn.sendMessage(oldOwner, { text: `✘ El owner ha robado a tu waifu *${waifu.name}* (ID: ${waifu.id}).` });
        }
    } catch (error) {
        await conn.reply(m.chat, `✘ Error: ${error.message}`, m);
    }
};

handler.help = ['robawaifu <id>'];
handler.tags = ['gacha'];
handler.command = ['robawaifu'];
handler.group = true;

export default handler;