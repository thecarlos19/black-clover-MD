import fetch from 'node-fetch';
import cheerio from 'cheerio';

/**
 * Extrae el ID de un video de YouTube a partir de la URL
 * @param {string} url 
 * @returns {string|null}
 */
const extractYTId = (url) => {
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
    const match = ytIdRegex.exec(url);
    return match ? match[1] : null;
};

/**
 * Función auxiliar para enviar POST a y2mate
 * @param {string} url 
 * @param {object} formdata 
 * @returns {Promise<Response>}
 */
const post = (url, formdata) =>
    fetch(url, {
        method: 'POST',
        headers: {
            accept: "*/*",
            'accept-language': "en-US,en;q=0.9",
            'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: new URLSearchParams(Object.entries(formdata))
    });

/**
 * Función genérica para descargar desde y2mate
 * @param {string} yutub
 * @param {'mp3'|'mp4'} format
 * @returns {Promise<object>}
 */
const y2mate = async (yutub, format = 'mp4') => {
    const ytId = extractYTId(yutub);
    if (!ytId) throw new Error('Invalid YouTube URL');

    const url = 'https://youtu.be/' + ytId;

    const res = await post('https://www.y2mate.com/mates/en68/analyze/ajax', {
        url,
        q_auto: 0,
        ajax: 1
    });

    const { result } = await res.json();
    const $ = cheerio.load(result);

    const thumb = $('.thumbnail.cover > a > img').attr('src');
    const title = $('.thumbnail.cover > div > b').text().trim();
    const id = /var k__id = "(.*?)"/.exec(result)?.[1];
    if (!id) throw new Error('Could not extract k__id');

    const rowSelector = format === 'mp4' ? '#mp4 > table > tbody > tr' : '#mp3 > table > tbody > tr';
    const row = $(rowSelector);

    const size = row.find('td:nth-child(2)').first().text().trim();
    const tipe = row.find('td:nth-child(3) > a').attr('data-ftype');
    const quality = row.find('td:nth-child(3) > a').attr('data-fquality');
    const output = `${title}.${tipe}`;

    const res2 = await post('https://www.y2mate.com/mates/en68/convert', {
        type: 'youtube',
        _id: id,
        v_id: ytId,
        ajax: 1,
        token: '',
        ftype: tipe,
        fquality: quality
    });

    const meme = await res2.json();
    const supp = cheerio.load(meme.result);
    const link = supp('a').attr('href');

    return { thumb, title, quality, tipe, size, output, link };
};

// Descarga de video
const ytv = async (url) => y2mate(url, 'mp4');
// Descarga de audio
const yta = async (url) => y2mate(url, 'mp3');

export { ytv, yta };