import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.isGroup ? (m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : false)) : m.chat
    if (!who) throw 'Etiqueta o menciona a alguien'
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)
    await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })
    let str = `${name2} está bailando con ${name} 💃🕺`
    if (m.isGroup){
        let videos = [
            'https://telegra.ph/file/bb4341187c893748f912b.mp4',
            'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4',
            'https://telegra.ph/file/1101c595689f638881327.mp4',
            'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4',
            'https://telegra.ph/file/a2098292896fb05675250.mp4',
            'https://telegra.ph/file/16f43effd7357e82c94d3.mp4',
            'https://telegra.ph/file/55cb31314b168edd732f8.mp4',
            'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4',
            'https://telegra.ph/file/1083c19087f6997ec8095.mp4'
        ]
        let video = videos[Math.floor(Math.random() * videos.length)]
        await conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] }, { quoted: m })
    }
}

let handler2 = async (m, {conn}) => {
    let who = m.isGroup ? (m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : false)) : m.chat
    if (!who) throw `Por favor, menciona el usuario`
    let videos = [
        "https://telegra.ph/file/4d80ab3a945a8446f0b15.mp4",
        "https://telegra.ph/file/ef3a13555dfa425fcf8fd.mp4",
        "https://telegra.ph/file/582e5049e4070dd99a995.mp4",
        "https://telegra.ph/file/ab57cf916c5169f63faee.mp4",
        "https://telegra.ph/file/fce96960010f6d7fc1670.mp4",
        "https://telegra.ph/file/33332f613e1ed024be870.mp4"
    ]
    try {
        const str = `@${m.sender.split('@')[0]} le dio un abrazo a @${who.split('@')[0]} 🫂`
        const video = videos[Math.floor(Math.random() * videos.length)]
        await conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender, who] }, { quoted: m })
    } catch {
        await conn.reply(m.chat, '*¡Ocurrió un error!*', m)
    }
}

let handler3 = async (m, { conn }) => {
    let who = m.isGroup ? (m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : false)) : m.chat
    if (!who) return m.reply('Etiqueta o menciona a alguien')
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)
    await conn.sendMessage(m.chat, { react: { text: '😥', key: m.key } })
    let str = `${name2} está triste por ${name} 😢`
    if (m.isGroup){
        let videos = [
            'https://telegra.ph/file/9c69837650993b40113dc.mp4',
            'https://telegra.ph/file/071f2b8d26bca81578dd0.mp4',
            'https://telegra.ph/file/0af82e78c57f7178a333b.mp4',
            'https://telegra.ph/file/8fb8739072537a63f8aee.mp4',
            'https://telegra.ph/file/4f81cb97f31ce497c3a81.mp4',
            'https://telegra.ph/file/6d626e72747e0c71eb920.mp4',
            'https://telegra.ph/file/8fd1816d52cf402694435.mp4',
            'https://telegra.ph/file/3e940fb5e2b2277dc754b.mp4'
        ]
        let video = videos[Math.floor(Math.random() * videos.length)]
        await conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] }, { quoted: m })
    }
}

let handler4 = async (m, { conn }) => {
    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)
    await conn.sendMessage(m.chat, { react: { text: '💆‍♂️', key: m.key } })
    let str = (who === m.sender) ? `${name2} se acarició a sí mismo 😅` : `${name2} acarició a ${name} 🐾`
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/f75aed769492814d68016.mp4',
            'https://telegra.ph/file/4f24bb58fe580a5e97b0a.mp4',
            'https://telegra.ph/file/30206abdcb7b8a4638510.mp4',
            'https://telegra.ph/file/ecd7aeae5b2242c660d41.mp4'
        ]
        let video = videos[Math.floor(Math.random() * videos.length)]
        await conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [who] }, { quoted: m })
    }
}

let handler5 = async (m, { conn }) => {
    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)
    await conn.sendMessage(m.chat, { react: { text: '🍑', key: m.key } })
    let str = (who === m.sender) ? `${name2} está jugando con el aire 🍑` : `${name2} le dio una palmada amistosa a ${name} 🍑`
    if (m.isGroup) {
        let gifs = [
            'https://files.catbox.moe/yjulgu.mp4',
            'https://files.catbox.moe/erm82k.mp4',
            'https://files.catbox.moe/9m1nkp.mp4',
            'https://files.catbox.moe/rzijb5.mp4'
        ]
        let gif = gifs[Math.floor(Math.random() * gifs.length)]
        await conn.sendMessage(m.chat, { video: { url: gif }, gifPlayback: true, caption: str, mentions: [who] }, { quoted: m })
    }
}

export default {
    help: ['abrazar', 'sad', 'acariciar'],
    tags: ['emox'],
    command: ['abrazar','sad','triste','patt','acariciar'],
    group: true,
    handler(m, data) {
        if (['sixnine','69'].includes(data.command)) return handler(m, data)
        if (['abrazar'].includes(data.command)) return handler2(m, data)
        if (['sad','triste'].includes(data.command)) return handler3(m, data)
        if (['patt','acariciar'].includes(data.command)) return handler4(m, data)
        if (['palmada','broma'].includes(data.command)) return handler5(m, data)
    }
}