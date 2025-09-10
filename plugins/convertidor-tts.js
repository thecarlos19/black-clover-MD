import fetch from 'node-fetch';

const voicesList = [
  'Aria', 'Sarah', 'Laura', 'Charlie', 'George', 'Callum', 'River', 'Liam',
  'Charlotte', 'Alice', 'Matilda', 'Will', 'Jessica', 'Eric', 'Chris', 'Brian',
  'Daniel', 'Lily', 'Bill', 'Efrain', 'Azucena Ortega', 'Ayesha - Energetic Hindi Voice'
];

const handler = async (m, { conn, usedPrefix, command, text }) => {
  const voices = await getVoices();
  const match = text.match(/^(\w[\w\s\-]*)\s*\|\s*(.+)/i);

  let voiceName, inputText;

  if (match) {
    voiceName = match[1].trim();
    inputText = match[2].trim();
  } else {
    if (!text.trim()) {
      const voiceNames = voicesList.join('\n◉ ');
      return m.reply(`*[❗] Debes proporcionar un texto para convertir a voz.*\n\n*—◉ Ejemplo:*\n◉ ${usedPrefix + command} nombre_voz | texto\n\n*—◉ Ejemplo sin voz (voz aleatoria):*\n◉ ${usedPrefix + command} Hola, este es un texto de ejemplo.\n\n*—◉ Lista de voces disponibles:*\n◉ ${voiceNames}`);
    }
    voiceName = voicesList[Math.floor(Math.random() * voicesList.length)];
    inputText = text.trim();
  }
  const voice = voices.voices.find(v => v.name.toLowerCase() === voiceName.toLowerCase());

  if (!voice) {
    const voiceNames = voicesList.join('\n◉ ');
    return m.reply(`[❗] No se encontró ninguna voz con el nombre "${voiceName}".\n\n—◉ Lista de voces disponibles:\n◉ ${voiceNames}`);
  }
  const audio = await convertTextToSpeech(inputText, voice.voice_id);
  if (audio) {
    conn.sendMessage(m.chat, { audio: audio.audio, fileName: `tts.mp3`, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
  }
};

handler.help = ['tts'];
handler.tags = ['converter'];
handler.command = ['tts'];

export default handler;

const apiKey = 'a0e2c6022f1aeb28b5020b1dd0faf6ee';
const getVoices = async () => {
  const url = 'https://api.elevenlabs.io/v1/voices';
  const options = { method: 'GET', headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey }};
  try {
    const response = await fetch(url, options);
    const voices = await response.json();
    return voices;
  } catch (error) {
    console.error('Error al obtener las voces:', error);
    return [];
  }
};

const convertTextToSpeech = async (text, voiceId) => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const options = { method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey }, body: JSON.stringify({ text: text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.5 }})};
  try {
    const response = await fetch(url, options);
    const audioBuffer = await response.buffer();
    return { audio: audioBuffer };
  } catch (error) {
    console.error('Error al generar el audio:', error);
    return [];  
  }
};