import { DOMImplementation, XMLSerializer } from 'xmldom';
import JsBarcode from 'jsbarcode';
import { JSDOM } from 'jsdom';  
import { readFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const src = join(__dirname, '..', 'src');
const _svg = readFileSync(join(src, 'welcome.svg'), 'utf-8');

const domImpl = new DOMImplementation();
const xmlSerializer = new XMLSerializer();

const barcode = (data) => {
    const document = domImpl.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, data, { xmlDocument: document });

    return xmlSerializer.serializeToString(svgNode);
};

const imageSetter = (img, value) => img?.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', value);
const textSetter = (el, value) => el && (el.textContent = value);

let { document: svg } = new JSDOM(_svg).window;

const genSVG = async ({
    wid = '',
    pp = join(src, 'avatar_contact.png'),
    title = '',
    name = '',
    text = '',
    background = ''
} = {}) => {

    const el = {
        code: ['#_1661899539392 > g:nth-child(6) > image', imageSetter, toBase64(await toImg(barcode(wid.replace(/[^0-9]/g, '')), 'png'), 'image/png')],
        pp: ['#_1661899539392 > g:nth-child(3) > image', imageSetter, pp],
        text: ['#_1661899539392 > text.fil1.fnt0', textSetter, text],
        title: ['#_1661899539392 > text.fil2.fnt1', textSetter, title],
        name: ['#_1661899539392 > text.fil2.fnt2', textSetter, name],
        bg: ['#_1661899539392 > g:nth-child(2) > image', imageSetter, background],
    };

    for (let [selector, setter, value] of Object.values(el)) {
        const element = svg.querySelector(selector);
        setter(element, value);
    }

    return svg.body.innerHTML;
};

const toImg = (svgContent, format = 'png') => new Promise((resolve, reject) => {
    if (!svgContent) return resolve(Buffer.alloc(0));

    const bufs = [];
    const im = spawn('magick', ['convert', 'svg:-', `${format}:-`]);

    im.on('error', reject);
    im.stdout.on('data', chunk => bufs.push(chunk));
    im.stdin.write(Buffer.from(svgContent));
    im.stdin.end();

    im.on('close', code => code === 0 ? resolve(Buffer.concat(bufs)) : reject(new Error(`ImageMagick exited with code ${code}`)));
});

const toBase64 = (buffer, mime) => `data:${mime};base64,${buffer.toString('base64')}`;

const render = async ({
    wid = '',
    pp = toBase64(readFileSync(join(src, 'avatar_contact.png')), 'image/png'),
    name = '',
    title = '',
    text = '',
    background = toBase64(readFileSync(join(src, 'Aesthetic', 'Aesthetic_000.jpeg')), 'image/jpeg'),
} = {}, format = 'png') => {
    const svgContent = await genSVG({ wid, pp, name, text, background, title });
    return await toImg(svgContent, format);
};

if (require.main === module) {
    render({
        wid: '1234567890',
        name: 'John Doe',
        text: 'Lorem ipsum\ndot sit color',
        title: 'Group Testing'
    }, 'jpg').then(result => process.stdout.write(result));
} else {
    module.exports = render;
}