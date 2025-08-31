//Código creado x The Carlos <👑
import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';
const cooldownFilePath = './src/database/waifu_cooldown.json';
const botOwner = '5217971282613@s.whatsapp.net';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

async function saveCharacters(characters) {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
}

async function loadCooldown() {
    try {
        const data = await fs.readFile(cooldownFilePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveCooldown(cooldowns) {
    await fs.writeFile(cooldownFilePath, JSON.stringify(cooldowns, null, 2), 'utf-8');
}

let handler = async (m, { conn, args }) => {
    try {
        const user = m.sender;
        if (!args[0]) return await conn.reply(m.chat, '✘ Debes proporcionar el ID de la waifu que quieres robar.', m);

        const characters = await loadCharacters();
        const cooldowns = await loadCooldown();

        const waifuId = args[0];
        const waifu = characters.find(c => c.id === waifuId);
        if (!waifu) return await conn.reply(m.chat, `✘ No se encontró ninguna waifu con el ID: *${waifuId}*`, m);

        const oldOwner = waifu.user;

        if (oldOwner === botOwner) {
            return await conn.reply(m.chat, `✘ No puedes robar la waifu de mi owner *${waifu.name}* (ID: ${waifu.id}).`, m);
        }

        if (global.db.data.users[oldOwner]?.antirobo > Date.now()) {
            return await conn.reply(
                m.chat,
                `🛡 La waifu *${waifu.name}* (ID: ${waifu.id}) tiene AntiRobo activo.\n` +
                `No puedes robarla hasta: *${new Date(global.db.data.users[oldOwner].antirobo).toLocaleString()}*`,
                m
            );
        }

        if (user !== botOwner) {
            const now = Date.now();
            const cooldownTime = 10 * 60 * 1000;
            const userCooldown = cooldowns[user] || { count: 0, reset: 0 };

            if (now > userCooldown.reset) {
                userCooldown.count = 0;
                userCooldown.reset = now + cooldownTime;
            }

            if (userCooldown.count >= 2) {
                const tiempoRestante = Math.ceil((userCooldown.reset - now) / 60000);
                return await conn.reply(
                    m.chat,
                    `✘ Ya has robado 2 waifus. Espera *${tiempoRestante} minuto(s)* para volver a robar.`,
                    m
                );
            }

            userCooldown.count++;
            cooldowns[user] = userCooldown;
            await saveCooldown(cooldowns);
        }

        waifu.user = user;
        await saveCharacters(characters);

        await conn.reply(m.chat, `✧ Has robado a *${waifu.name}* (ID: ${waifu.id}) del usuario *${oldOwner?.split('@')[0] || 'Nadie'}* ✧`, m);

        if (oldOwner && oldOwner !== user && oldOwner !== botOwner) {
            await conn.sendMessage(
                oldOwner,
                { text: `✘ El usuario *@${user.split('@')[0]}* ha robado tu waifu *${waifu.name}* (ID: ${waifu.id}).` },
                { quoted: m }
            );
        }
    } catch (error) {
        await conn.reply(m.chat, `✘ Error: ${error.message}`, m);
    }
};

handler.help = ['robarwaifu <id>'];
handler.tags = ['gacha'];
handler.command = ['robarwaifu'];
handler.group = true;

export default handler;