export async function all(m, chatUpdate) {
    if (!m.message || !m.msg || !m.msg.fileSha256) return;

    const fileSha = Buffer.from(m.msg.fileSha256).toString('base64');
    if (!(fileSha in global.db.data.sticker)) return;

    let hash = global.db.data.sticker[fileSha];
    let { text, mentionedJid } = hash;
    let messages = await generateWAMessage(m.chat, {
        text: text,
        mentions: mentionedJid
    }, {
        userJid: this.user.id,
        quoted: m.quoted && m.quoted.fakeObj
    });

    messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.pushName;
    if (m.isGroup) messages.participant = m.sender;

    let msg = {
        ...chatUpdate,
        messages: [proto.WebMessageInfo.fromObject(messages)],
        type: 'append'
    };
    this.ev.emit('messages.upsert', msg);
}