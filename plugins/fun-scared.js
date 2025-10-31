
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    // Verificamos si se menciona a alguien o se cita un mensaje
    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]; // Si hay mención, usamos esa
    } else if (m.quoted) {
        who = m.quoted.sender; // Si se cita un mensaje, usamos el emisor de ese mensaje
    } else {
        who = m.sender; // En caso contrario, usamos el emisor
    }

    let name = conn.getName(who); // Nombre de la persona mencionada o del emisor
    let name2 = conn.getName(m.sender); // Nombre del usuario que envía el comando
    m.react('😨');

    // Construimos el mensaje dependiendo de si hay una mención o no
    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` Está asustad﹫ de \`${name || who}\`.`; // Usamos nombre agendado o número si no está agendado
    } else if (m.quoted) {
        str = `\`${name2}\` Está asustad﹫ de \`${name || who}\`.`; // Mensaje cuando se cita a otro usuario
    } else {
        str = `\`${name2}\` Está asustad﹫.`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://telegra.ph/file/9c1e963fa4d8269fb17a7.mp4'; 
        let pp2 = 'https://telegra.ph/file/0c802b4fa616aaf1da229.mp4'; 
        let pp3 = 'https://telegra.ph/file/d0b166d9a363765e51657.mp4';
        let pp4 = 'https://telegra.ph/file/eae6dd9d45e45fe3a95ab.mp4';
        let pp5 = 'https://telegra.ph/file/1785e535a4463c2a337c5.mp4';
        let pp6 = 'https://telegra.ph/file/c1673b418bc61db1e51a0.mp4';
        let pp7 = 'https://quhttps://telegra.ph/file/9774e1d74c3abf083ae01.mp4.ax/EDZBg.mp4';
        let pp8 = 'https://telegra.ph/file/dcde646a58d8e9bf44867.mp4';
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8];
        const video = videos[Math.floor(Math.random() * videos.length)];
        
        // Enviamos el mensaje con el video y el mensaje correspondiente
        let mentions = [who]; // Mencionamos al usuario que se ha citado o mencionado
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['scared/asustada @tag'];
handler.tags = ['emox'];
handler.command = ['scared', 'asustada'];
handler.group = true;

export default handler;