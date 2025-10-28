const handler = async (m, { conn, args, text, usedPrefix, command }) => {
    let user;
    let db = global.db.data.users;

    if (m.quoted) {
        user = m.quoted.sender;
    } else if (args.length >= 1) {
        user = args[0].replace(/[@\s]/g, '') + '@s.whatsapp.net';
    } else {
        await conn.reply(m.chat, `🚩 Etiqueta o responde al mensaje del usuario que quieras desbanear.\n\n📌 Ejemplo:\n> ${usedPrefix}unbanuser @usuario`, m);
        return;
    }

    if (db[user]) {
        db[user].banned = false;
        db[user].banRazon = '';

        const nametag = await conn.getName(user);
        const nn = await conn.getName(m.sender);

        await conn.reply(m.chat, `✅ El usuario *${nametag}* ha sido desbaneado.`, m, { mentions: [user] });

        await conn.reply(
            '5493876432076@s.whatsapp.net',
            `🚩 El usuario *${nametag}* ha sido desbaneado por *${nn}*`,
            null
        );

    } else {
        await conn.reply(m.chat, `🚩 El usuario no está registrado en la base de datos.`, m);
    }
};

handler.help = ['unbanuser <@tag>'];
handler.tags = ['owner'];
handler.command = ['unbanuser'];
handler.rowner = true;
handler.group = true;

export default handler;