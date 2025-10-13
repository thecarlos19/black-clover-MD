import path from 'path'
import { toAudio } from './converter.js'
import chalk from 'chalk' 
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import util from 'util'
import { fileTypeFromBuffer } from 'file-type'
import { format } from 'util'
import { fileURLToPath } from 'url'
import store from './store.js'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** 
 * @type {import('@adiwajshing/baileys')}
 */
const {
    default: _makeWaSocket,
    makeWALegacySocket,
    proto,
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
    generateWAMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    extractMessageContent,
    makeInMemoryStore,
    getAggregateVotesInPollMessage, 
    prepareWAMessageMedia,
    WA_DEFAULT_EPHEMERAL
} = (await import('@whiskeysockets/baileys')).default

export function makeWASocket(connectionOptions, options = {}) {
    /**
     * @type {import('@adiwajshing/baileys').WASocket | import('@adiwajshing/baileys').WALegacySocket}
     */
    let conn = (global.opts['legacy'] ? makeWALegacySocket : _makeWaSocket)(connectionOptions)

    let sock = Object.defineProperties(conn, {
        chats: {
            value: { ...(options.chats || {}) },
            writable: true
        },
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null
                return jid.decodeJid()
            }
        },
        logger: {
            get() {
                return {
                    info(...args) {
                        console.log(
                            chalk.bold.bgRgb(51, 204, 51)('INFO '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.cyan(format(...args))
                        )
                    },
                    error(...args) {
                        console.log(
                            chalk.bold.bgRgb(247, 38, 33)('ERROR '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.rgb(255, 38, 0)(format(...args))
                        )
                    },
                    warn(...args) {
                        console.log(
                            chalk.bold.bgRgb(255, 153, 0)('WARNING '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.redBright(format(...args))
                        )
                    },
                    trace(...args) {
                        console.log(
                            chalk.grey('TRACE '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        )
                    },
                    debug(...args) {
                        console.log(
                            chalk.bold.bgRgb(66, 167, 245)('DEBUG '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        )
                    }
                }
            },
            enumerable: true
        },
        sendSylph: {
    async value(jid, text = '', buffer, title, body, url, quoted, options) {
    if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
	let prep = generateWAMessageFromContent(jid, { extendedTextMessage: { text: text, contextInfo: { externalAdReply: { title: title, body: body, thumbnail: buffer, sourceUrl: url }, mentionedJid: await conn.parseMention(text) }}}, { quoted: quoted })
    return conn.relayMessage(jid, prep.message, { messageId: prep.key.id })
}},
        sendSylphy: {
async value(jid, medias, options = {}) {
  if (typeof jid !== "string") {
    throw new TypeError(`jid must be string, received: ${jid} (${jid?.constructor?.name})`);
  }
  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) {
      throw new TypeError(`media.type must be "image" or "video", received: ${media.type} (${media.type?.constructor?.name})`);
    }
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
      throw new TypeError(`media.data must be object with url or buffer, received: ${media.data} (${media.data?.constructor?.name})`);
    }
  }
  if (medias.length < 2) {
    throw new RangeError("Minimum 2 media");
  }
  const delay = !isNaN(options.delay) ? options.delay : 500;
  delete options.delay;
  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(media => media.type === "image").length,
        expectedVideoCount: medias.filter(media => media.type === "video").length,
        ...(options.quoted
          ? {
              contextInfo: {
                remoteJid: options.quoted.key.remoteJid,
                fromMe: options.quoted.key.fromMe,
                stanzaId: options.quoted.key.id,
                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                quotedMessage: options.quoted.message,
              },
            }
          : {}),
      },
    },
    {}
  );
  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });
  for (let i = 0; i < medias.length; i++) {
    const { type, data, caption } = medias[i];
    const message = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, caption: caption || "" },
      { upload: conn.waUploadToServer }
    );
    message.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    };
    await conn.relayMessage(message.key.remoteJid, message.message, { messageId: message.key.id });
    await baileys.delay(delay);
  }
  return album;
}},
sendListB: {
    async value(jid, title, text, buttonText, buffer, listSections, quoted, options = {}) {
      let img, video

        if (/^https?:\/\//i.test(buffer)) {
            try {
                // Obtener el tipo MIME de la URL
                const response = await fetch(buffer)
                const contentType = response.headers.get('content-type')
                if (/^image\//i.test(contentType)) {
                    img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                } else if (/^video\//i.test(contentType)) {
                    video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                } else {
                    console.error("Tipo MIME no compatible:", contentType)
                }
            } catch (error) {
                console.error("Error al obtener el tipo MIME:", error)
            }
        } else {

            try {
                const type = await conn.getFile(buffer)
               if (/^image\//i.test(type.mime)) {
                    img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                } else if (/^video\//i.test(type.mime)) {
                    video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                }
            } catch (error) {
                console.error("Error al obtener el tipo de archivo:", error);
            }
        }

  const sections = [...listSections]

        const message = {
            interactiveMessage: {
                header: {title: title, 
                hasMediaAttachment: false,
                imageMessage: img ? img.imageMessage : null,
                videoMessage: video ? video.videoMessage : null 
                   } ,
                body: {text: text}, 
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: buttonText,
                                sections
                            })
                        }
                    ],
                    messageParamsJson: ''
                }
            }
        };

        let msgL = generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message} }, { userJid: conn.user.jid, quoted })

        //await conn.relayMessage(jid, { viewOnceMessage: { message } }, {});
        conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options })

    }
},
       //sendBot
        sendBot: {
    async value(jid, text = '', buffer, title, body, url, quoted, options) {
    if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
        let prep = generateWAMessageFromContent(jid, { extendedTextMessage: { text: text, contextInfo: { externalAdReply: { title: title, body: body, thumbnail: buffer, sourceUrl: url }, mentionedJid: await conn.parseMention(text) }}}, { quoted: quoted })
    return conn.relayMessage(jid, prep.message, { messageId: prep.key.id })
}
},
        sendPayment: {
           async value(jid, amount, text, quoted, options) {
               conn.relayMessage(jid,  {
             requestPaymentMessage: {
             currencyCodeIso4217: 'PEN',
             amount1000: amount,
             requestFrom: null,
             noteMessage: {
           extendedTextMessage: {
             text: text,
           contextInfo: {
           externalAdReply: {
             showAdAttribution: true
           }, mentionedJid: conn.parseMention(text) }}}}}, {})}
      },        
        getFile: {
            /**
             * getBuffer hehe
             * @param {fs.PathLike} PATH 
             * @param {Boolean} saveToFile
             */
            async value(PATH, saveToFile = false) {
                let res, filename
                const data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? PATH.toBuffer() : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
                if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
                const type = await fileTypeFromBuffer(data) || {
                    mime: 'application/octet-stream',
                    ext: '.bin'
                }
                if (data && saveToFile && !filename) (filename = path.join(__dirname, '../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
                return {
                    res,
                    filename,
                    ...type,
                    data,
                    deleteFile() {
                        return filename && fs.promises.unlink(filename)
                    }
                }
            },
            enumerable: true
        },
        waitEvent: {
            /**
             * waitEvent
             * @param {String} eventName 
             * @param {Boolean} is 
             * @param {Number} maxTries 
             */
            value(eventName, is = () => true, maxTries = 25) { //Idk why this exist?
                return new Promise((resolve, reject) => {
                    let tries = 0
                    let on = (...args) => {
                        if (++tries > maxTries) reject('Max tries reached')
                        else if (is()) {
                            conn.ev.off(eventName, on)
                            resolve(...args)
                        }
                    }
                    conn.ev.on(eventName, on)
                })
            }
        },   
        sendContact: {        
            /**
             * Send Contact
             * @param {String} jid 
             * @param {String[][]|String[]} data
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted 
             * @param {Object} options 
             */
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                let contacts = []
                for (let [number, name] of data) {
                    number = number.replace(/[^0-9]/g, '')
                    let njid = number + '@s.whatsapp.net'
                    let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${biz.description ? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim() : ''}
END:VCARD
        `.trim()
                    contacts.push({ vcard, displayName: name })

                }
                return await conn.sendMessage(jid, {
                    ...options,
                    contacts: {
                        ...options,
                        displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
                        contacts,
                    }
                }, { quoted, ...options })
            },
            enumerable: true
        },

reply: {
async value(jid, text = '', quoted, options) {
if (Buffer.isBuffer(text)) {
return conn.sendFile(jid, text, 'file', '', quoted, false, options)
} else {
let canalId = ["120363419782804545@newsletter", "120363419782804545@newsletter", "120363419782804545@newsletter", "120363419782804545@newsletter"]
let canalNombre = ["⏤͟͞㋡ 𝐓𝐇𝐄 𝐋𝐄𝐆𝐄𝐍𝐃𝐒", "⏤͟͞㋡ 𝐓𝐇𝐄 𝐋𝐄𝐆𝐄𝐍𝐃𝐒", "—͟͟͞͞𖣘𝐓𝐡𝐞 𝐂𝐚𝐫𝐥𝐨𝐬 ㊗ ", "𝕭𝖑𝖆𝖈𝖐 𝕮𝖑𝖔𝖛𝖊𝖗  | 𝕳𝖆𝖐 v777 🥷🏻"]

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalId.length)
let id = canalId[randomIndex]
let nombre = canalNombre[randomIndex]
return { id, nombre }
} 
	
let randomChannel = await getRandomChannel()
const contextInfo = {
mentionedJid: await conn.parseMention(text),
isForwarded: true,
forwardingScore: 1, 
forwardedNewsletterMessageInfo: {
newsletterJid: randomChannel.id, 
newsletterName: randomChannel.nombre, 
serverMessageId: 100
}}
        
const messageOptions = { ...options, text, contextInfo }
return conn.sendMessage(jid, messageOptions, { quoted, ...options })
}}},
				       
	sendContactArray: {
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                let contacts = []
                for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) {
                    number = number.replace(/[^0-9]/g, '')
                    let njid = number + '@s.whatsapp.net'
                    let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
                    // N:;${name.replace(/\n/g, '\\n').split(' ').reverse().join(';')};;;
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:${name.replace(/\n/g, '\\n')}
item.ORG:${isi}
item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:${isi1}
item2.EMAIL;type=INTERNET:${isi2}
item2.X-ABLabel:📧 Email
item3.ADR:;;${isi3};;;;
item3.X-ABADR:ac
item3.X-ABLabel:📍 Region
item4.URL:${isi4}
item4.X-ABLabel:Website
item5.X-ABLabel:${isi5}
END:VCARD`.trim()
                    contacts.push({ vcard, displayName: name })
                }
                return await conn.sendMessage(jid, {
                    contacts: {
                        displayName: (contacts.length > 1 ? `2013 kontak` : contacts[0].displayName) || null,
                        contacts,
                    }
                },
                    {
                        quoted,
                        ...options
                    })
            }
        },
    // sendButton: {
    /**
     * send Button
     * @param {String} jid
     * @param {String} text
     * @param {String} footer
     * @param {Buffer} buffer
     * @param {String[] | String[][]} buttons
     * @param {import("baileys").proto.WebMessageInfo} quoted
     * @param {Object} options
     */
    /*   async value(jid, text = '', footer = '', buffer, buttons, quoted, options) {
        let type;
        if (Array.isArray(buffer)) (options = quoted, quoted = buttons, buttons = buffer, buffer = null);
        else if (buffer) {
          try {
            (type = await conn.getFile(buffer), buffer = type.data);
          } catch {
            buffer = null;
          }
        }
        if (!Array.isArray(buttons[0]) && typeof buttons[0] === 'string') buttons = [buttons];
        if (!options) options = {};
        const message = {
          ...options,
          [buffer ? 'caption' : 'text']: text || '',
          footer,
          buttons: buttons.map((btn) => ({
            buttonId: !nullish(btn[1]) && btn[1] || !nullish(btn[0]) && btn[0] || '',
            buttonText: {
              displayText: !nullish(btn[0]) && btn[0] || !nullish(btn[1]) && btn[1] || '',
            },
          })),
          ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                          location: {
                            ...options,
                            jpegThumbnail: buffer,
                          },
                        } : {
                          [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer,
                        } : {}),
        };

        return await conn.sendMessage(jid, message, {
          quoted,
          upload: conn.waUploadToServer,
          ...options,
        });
      },
      enumerable: true,
    },*/
    //-- new
    sendButton: {
      async value(
        jid,
        text = "",
        footer = "",
        buffer,
        buttons,
        copy,
        urls,
        quoted,
        options,
      ) {
        let img, video;

        if (/^https?:\/\//i.test(buffer)) {
          try {
            // Obtener el tipo MIME de la URL
            const response = await fetch(buffer);
            const contentType = response.headers.get("content-type");
            if (/^image\//i.test(contentType)) {
              img = await prepareWAMessageMedia(
                { image: { url: buffer } },
                { upload: conn.waUploadToServer },
              );
            } else if (/^video\//i.test(contentType)) {
              video = await prepareWAMessageMedia(
                { video: { url: buffer } },
                { upload: conn.waUploadToServer },
              );
            } else {
              console.error("Tipo MIME no compatible:", contentType);
            }
          } catch (error) {
            console.error("Error al obtener el tipo MIME:", error);
          }
        } else {
          try {
            const type = await conn.getFile(buffer);
            if (/^image\//i.test(type.mime)) {
              img = await prepareWAMessageMedia(
                { image: { url: buffer } },
                { upload: conn.waUploadToServer },
              );
            } else if (/^video\//i.test(type.mime)) {
              video = await prepareWAMessageMedia(
                { video: { url: buffer } },
                { upload: conn.waUploadToServer },
              );
            }
          } catch (error) {
            console.error("Error al obtener el tipo de archivo:", error);
          }
        }

        const dynamicButtons = buttons.map((btn) => ({
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: btn[0],
            id: btn[1],
          }),
        }));

        if (copy && (typeof copy === "string" || typeof copy === "number")) {
          // Añadir botón de copiar
          dynamicButtons.push({
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "Copy",
              copy_code: copy,
            }),
          });
        }

        // Añadir botones de URL
        if (urls && Array.isArray(urls)) {
          urls.forEach((url) => {
            dynamicButtons.push({
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: url[0],
                url: url[1],
                merchant_url: url[1],
              }),
            });
          });
        }

        const interactiveMessage = {
          body: { text: text },
          footer: { text: footer },
          header: {
            hasMediaAttachment: false,
            imageMessage: img ? img.imageMessage : null,
            videoMessage: video ? video.videoMessage : null,
          },
          nativeFlowMessage: {
            buttons: dynamicButtons,
            messageParamsJson: "",
          },
        };

        let msgL = generateWAMessageFromContent(
          jid,
          {
            viewOnceMessage: {
              message: {
                interactiveMessage,
              },
            },
          },
          { userJid: conn.user.jid, quoted },
        );

        conn.relayMessage(jid, msgL.message, {
          messageId: msgL.key.id,
          ...options,
        });
      },
    },

    sendList: {
      async value(
        jid,
        title,
        text,
        buttonText,
        listSections,
        quoted,
        options = {},
      ) {
        const sections = [...listSections];

        const message = {
          interactiveMessage: {
            header: { title: title },
            body: { text: text },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    title: buttonText,
                    sections,
                  }),
                },
              ],
              messageParamsJson: "",
            },
          },
        };
        await conn.relayMessage(jid, { viewOnceMessage: { message } }, {});
      },
    },

    sendEvent: {
      async value(jid, text, des, loc, link) {
        let msg = generateWAMessageFromContent(
          jid,
          {
            messageContextInfo: {
              messageSecret: randomBytes(32),
            },
            eventMessage: {
              isCanceled: false,
              name: text,
              description: des,
              location: {
                degreesLatitude: 0,
                degreesLongitude: 0,
                name: loc,
              },
              joinLink: link,
              startTime: "m.messageTimestamp",
            },
          },
          {},
        );

        conn.relayMessage(jid, msg.message, {
          messageId: msg.key.id,
        });
      },
      enumerable: true,
    },

    sendPoll: {
      async value(jid, name = "", optiPoll, options) {
        if (!Array.isArray(optiPoll[0]) && typeof optiPoll[0] === "string")
          optiPoll = [optiPoll];
        if (!options) options = {};
        const pollMessage = {
          name: name,
          options: optiPoll.map((btn) => ({
            optionName: (!nullish(btn[0]) && btn[0]) || "",
          })),
          selectableOptionsCount: 1,
        };
        return conn.relayMessage(
          jid,
          { pollCreationMessage: pollMessage },
          { ...options },
        );
      },
    },
    sendHydrated: {
      /**
       *
       * @param {String} jid
       * @param {String} text
       * @param {String} footer
       * @param {fs.PathLike} buffer
       * @param {String|string[]} url
       * @param {String|string[]} urlText
       * @param {String|string[]} call
       * @param {String|string[]} callText
       * @param {String[][]} buttons
       * @param {import("baileys").proto.WebMessageInfo} quoted
       * @param {Object} options
       */
      async value(
        jid,
        text = "",
        footer = "",
        buffer,
        url,
        urlText,
        call,
        callText,
        buttons,
        quoted,
        options,
      ) {
        let type;
        if (buffer) {
          try {
            ((type = await conn.getFile(buffer)), (buffer = type.data));
          } catch {
            buffer = buffer;
          }
        }
        if (
          buffer &&
          !Buffer.isBuffer(buffer) &&
          (typeof buffer === "string" || Array.isArray(buffer))
        )
          ((options = quoted),
            (quoted = buttons),
            (buttons = callText),
            (callText = call),
            (call = urlText),
            (urlText = url),
            (url = buffer),
            (buffer = null));
        if (!options) options = {};
        const templateButtons = [];
        if (url || urlText) {
          if (!Array.isArray(url)) url = [url];
          if (!Array.isArray(urlText)) urlText = [urlText];
          templateButtons.push(
            ...(url
              .map((v, i) => [v, urlText[i]])
              .map(([url, urlText], i) => ({
                index: templateButtons.length + i + 1,
                urlButton: {
                  displayText:
                    (!nullish(urlText) && urlText) ||
                    (!nullish(url) && url) ||
                    "",
                  url:
                    (!nullish(url) && url) ||
                    (!nullish(urlText) && urlText) ||
                    "",
                },
              })) || []),
          );
        }
        if (call || callText) {
          if (!Array.isArray(call)) call = [call];
          if (!Array.isArray(callText)) callText = [callText];
          templateButtons.push(
            ...(call
              .map((v, i) => [v, callText[i]])
              .map(([call, callText], i) => ({
                index: templateButtons.length + i + 1,
                callButton: {
                  displayText:
                    (!nullish(callText) && callText) ||
                    (!nullish(call) && call) ||
                    "",
                  phoneNumber:
                    (!nullish(call) && call) ||
                    (!nullish(callText) && callText) ||
                    "",
                },
              })) || []),
          );
        }
        if (buttons.length) {
          if (!Array.isArray(buttons[0])) buttons = [buttons];
          templateButtons.push(
            ...(buttons.map(([text, id], index) => ({
              index: templateButtons.length + index + 1,
              quickReplyButton: {
                displayText:
                  (!nullish(text) && text) || (!nullish(id) && id) || "",
                id: (!nullish(id) && id) || (!nullish(text) && text) || "",
              },
            })) || []),
          );
        }
        const message = {
          ...options,
          [buffer ? "caption" : "text"]: text || "",
          footer,
          templateButtons,
          ...(buffer
            ? options.asLocation && /image/.test(type.mime)
              ? {
                  location: {
                    ...options,
                    jpegThumbnail: buffer,
                  },
                }
              : {
                  [/video/.test(type.mime)
                    ? "video"
                    : /image/.test(type.mime)
                      ? "image"
                      : "document"]: buffer,
                }
            : {}),
        };
        return await conn.sendMessage(jid, message, {
          quoted,
          upload: conn.waUploadToServer,
          ...options,
        });
      },
      enumerable: true,
    },
    sendHydrated2: {
      /**
       *
       * @param {String} jid
       * @param {String} text
       * @param {String} footer
       * @param {fs.PathLike} buffer
       * @param {String|string[]} url
       * @param {String|string[]} urlText
       * @param {String|string[]} call
       * @param {String|string[]} callText
       * @param {String[][]} buttons
       * @param {import("baileys").proto.WebMessageInfo} quoted
       * @param {Object} options
       */
      async value(
        jid,
        text = "",
        footer = "",
        buffer,
        url,
        urlText,
        url2,
        urlText2,
        buttons,
        quoted,
        options,
      ) {
        let type;
        if (buffer) {
          try {
            ((type = await conn.getFile(buffer)), (buffer = type.data));
          } catch {
            buffer = buffer;
          }
        }
        if (
          buffer &&
          !Buffer.isBuffer(buffer) &&
          (typeof buffer === "string" || Array.isArray(buffer))
        )
          ((options = quoted),
            (quoted = buttons),
            (buttons = callText),
            (callText = call),
            (call = urlText),
            (urlText = url),
            (url = buffer),
            (buffer = null));
        if (!options) options = {};
        const templateButtons = [];
        if (url || urlText) {
          if (!Array.isArray(url)) url = [url];
          if (!Array.isArray(urlText)) urlText = [urlText];
          templateButtons.push(
            ...(url
              .map((v, i) => [v, urlText[i]])
              .map(([url, urlText], i) => ({
                index: templateButtons.length + i + 1,
                urlButton: {
                  displayText:
                    (!nullish(urlText) && urlText) ||
                    (!nullish(url) && url) ||
                    "",
                  url:
                    (!nullish(url) && url) ||
                    (!nullish(urlText) && urlText) ||
                    "",
                },
              })) || []),
          );
        }
        if (url2 || urlText2) {
          if (!Array.isArray(url2)) url2 = [url2];
          if (!Array.isArray(urlText2)) urlText2 = [urlText2];
          templateButtons.push(
            ...(url2
              .map((v, i) => [v, urlText2[i]])
              .map(([url2, urlText2], i) => ({
                index: templateButtons.length + i + 1,
                urlButton: {
                  displayText:
                    (!nullish(urlText2) && urlText2) ||
                    (!nullish(url2) && url2) ||
                    "",
                  url:
                    (!nullish(url2) && url2) ||
                    (!nullish(urlText2) && urlText2) ||
                    "",
                },
              })) || []),
          );
        }
        if (buttons.length) {
          if (!Array.isArray(buttons[0])) buttons = [buttons];
          templateButtons.push(
            ...(buttons.map(([text, id], index) => ({
              index: templateButtons.length + index + 1,
              quickReplyButton: {
                displayText:
                  (!nullish(text) && text) || (!nullish(id) && id) || "",
                id: (!nullish(id) && id) || (!nullish(text) && text) || "",
              },
            })) || []),
          );
        }
        const message = {
          ...options,
          [buffer ? "caption" : "text"]: text || "",
          footer,
          templateButtons,
          ...(buffer
            ? options.asLocation && /image/.test(type.mime)
              ? {
                  location: {
                    ...options,
                    jpegThumbnail: buffer,
                  },
                }
              : {
                  [/video/.test(type.mime)
                    ? "video"
                    : /image/.test(type.mime)
                      ? "image"
                      : "document"]: buffer,
                }
            : {}),
        };
        return await conn.sendMessage(jid, message, {
          quoted,
          upload: conn.waUploadToServer,
          ...options,
        });
      },
      enumerable: true,
    },
    cMod: {
      /**
       * cMod
       * @param {String} jid
       * @param {import("baileys").proto.WebMessageInfo} message
       * @param {String} text
       * @param {String} sender
       * @param {*} options
       * @returns
       */
      value(jid, message, text = "", sender = conn.user.jid, options = {}) {
        if (options.mentions && !Array.isArray(options.mentions))
          options.mentions = [options.mentions];
        const copy = message.toJSON();
        delete copy.message.messageContextInfo;
        delete copy.message.senderKeyDistributionMessage;
        const mtype = Object.keys(copy.message)[0];
        const msg = copy.message;
        const content = msg[mtype];
        if (typeof content === "string") msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text;
        if (typeof content !== "string") {
          msg[mtype] = { ...content, ...options };
          msg[mtype].contextInfo = {
            ...(content.contextInfo || {}),
            mentionedJid:
              options.mentions || content.contextInfo?.mentionedJid || [],
          };
        }
        if (copy.participant)
          sender = copy.participant = sender || copy.participant;
        else if (copy.key.participant)
          sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes("@s.whatsapp.net"))
          sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes("@broadcast"))
          sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false;
        return proto.WebMessageInfo.fromObject(copy);
      },
      enumerable: true,
    },
    copyNForward: {
      /**
       * Exact Copy Forward
       * @param {String} jid
       * @param {import("baileys").proto.WebMessageInfo} message
       * @param {Boolean|Number} forwardingScore
       * @param {Object} options
       */
      async value(jid, message, forwardingScore = true, options = {}) {
        let vtype;
        if (options.readViewOnce && message.message.viewOnceMessage?.message) {
          vtype = Object.keys(message.message.viewOnceMessage.message)[0];
          delete message.message.viewOnceMessage.message[vtype].viewOnce;
          message.message = proto.Message.fromObject(
            JSON.parse(JSON.stringify(message.message.viewOnceMessage.message)),
          );
          message.message[vtype].contextInfo =
            message.message.viewOnceMessage.contextInfo;
        }
        const mtype = Object.keys(message.message)[0];
        let m = generateForwardMessageContent(message, !!forwardingScore);
        const ctype = Object.keys(m)[0];
        if (
          forwardingScore &&
          typeof forwardingScore === "number" &&
          forwardingScore > 1
        )
          m[ctype].contextInfo.forwardingScore += forwardingScore;
        m[ctype].contextInfo = {
          ...(message.message[mtype].contextInfo || {}),
          ...(m[ctype].contextInfo || {}),
        };
        m = generateWAMessageFromContent(jid, m, {
          ...options,
          userJid: conn.user.jid,
        });
        await conn.relayMessage(jid, m.message, {
          messageId: m.key.id,
          additionalAttributes: { ...options },
        });
        return m;
      },
      enumerable: true,
    },
    fakeReply: {
      /**
       * Fake Replies
       * @param {String} jid
       * @param {String|Object} text
       * @param {String} fakeJid
       * @param {String} fakeText
       * @param {String} fakeGroupJid
       * @param {String} options
       */
      value(
        jid,
        text = "",
        fakeJid = this.user.jid,
        fakeText = "",
        fakeGroupJid,
        options,
      ) {
        return conn.reply(jid, text, {
          key: {
            fromMe: areJidsSameUser(fakeJid, conn.user.id),
            participant: fakeJid,
            ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}),
          },
          message: { conversation: fakeText },
          ...options,
        });
      },
    },
    downloadM: {
      /**
       * Download media message
       * @param {Object} m
       * @param {String} type
       * @param {fs.PathLike | fs.promises.FileHandle} saveToFile
       * @return {Promise<fs.PathLike | fs.promises.FileHandle | Buffer>}
       */
      async value(m, type, saveToFile) {
        let filename;
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
        const stream = await downloadContentFromMessage(m, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        if (saveToFile) ({ filename } = await conn.getFile(buffer, true));
        return saveToFile && fs.existsSync(filename) ? filename : buffer;
      },
      enumerable: true,
    },
    parseMention: {
      value(text = "") {
        try {
          const esNumeroValido = (numero) => {
            const len = numero.length;
            if (len < 8 || len > 13) return false; 
            if (len > 10 && numero.startsWith("9")) return false;
            const codigosValidos = ["1","7","20","27","30","31","32","33","34","36","39","40","41","43","44","45","46","47","48","49","51","52","53","54","55","56","57","58","60","61","62","63","64","65","66","81","82","84","86","90","91","92","93","94","95","98","211","212","213","216","218","220","221","222","223","224","225","226","227","228","229","230","231","232","233","234","235","236","237","238","239","240","241","242","243","244","245","246","248","249","250","251","252","253","254","255","256","257","258","260","261","262","263","264","265","266","267","268","269","290","291","297","298","299","350","351","352","353","354","355","356","357","358","359","370","371","372","373","374","375","376","377","378","379","380","381","382","383","385","386","387","389","420","421","423","500","501","502","503","504","505","506","507","508","509","590","591","592","593","594","595","596","597","598","599","670","672","673","674","675","676","677","678","679","680","681","682","683","685","686","687","688","689","690","691","692","850","852","853","855","856","880","886","960","961","962","963","964","965","966","967","968","970","971","972","973","974","975","976","977","978","979","992","993","994","995","996","998"]; 
            return codigosValidos.some((codigo) => numero.startsWith(codigo));
          };
          return (text.match(/@(\d{5,20})/g) || []).map((m) => m.substring(1)).map((numero) => esNumeroValido(numero) ? `${numero}@s.whatsapp.net` : `${numero}@lid`, );
        } catch (error) {
          console.error("Error:", error);
          return [];
        }
      },
      enumerable: true,
    },
    getName: {
      /**
       * Get name from jid
       * @param {String} jid
       * @param {Boolean} withoutContact
       */
      value(jid = "", withoutContact = false) {
        try {
          if (
            !jid ||
            typeof jid !== "string" ||
            jid.includes("No SenderKeyRecord")
          )
            return "";
          jid = conn.decodeJid(jid);
          withoutContact = conn.withoutContact || withoutContact;
          let v;
          if (jid.endsWith("@g.us")) {
            return new Promise(async (resolve) => {
              try {
                v = conn.chats[jid] || {};
                if (!(v.name || v.subject))
                  v = await conn?.groupMetadata(jid).catch(() => ({}));
                resolve(
                  v.name ||
                    v.subject ||
                    PhoneNumber(
                      "+" + jid.replace("@s.whatsapp.net", ""),
                    ).getNumber("international"),
                );
              } catch (e) {
                resolve("");
              }
            });
          } else {
            v =
              jid === "0@s.whatsapp.net"
                ? { jid, vname: "WhatsApp" }
                : areJidsSameUser(jid, conn.user.id)
                  ? conn.user
                  : conn.chats[jid] || {};
            return (
              (withoutContact ? "" : v.name) ||
              v.subject ||
              v.vname ||
              v.notify ||
              v.verifiedName ||
              PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
                "international",
              )
            );
          }
        } catch (error) {
          return "";
        }
      },
    },
    loadMessage: {
      /**
       *
       * @param {String} messageID
       * @returns {import("baileys").proto.WebMessageInfo}
       */
      value(messageID) {
        return Object.entries(conn.chats)
          .filter(([_, { messages }]) => typeof messages === "object")
          .find(([_, { messages }]) =>
            Object.entries(messages).find(
              ([k, v]) => k === messageID || v.key?.id === messageID,
            ),
          )?.[1].messages?.[messageID];
      },
      enumerable: true,
    },
    sendGroupV4Invite: {
      /**
       * sendGroupV4Invite
       * @param {String} jid
       * @param {*} participant
       * @param {String} inviteCode
       * @param {Number} inviteExpiration
       * @param {String} groupName
       * @param {String} caption
       * @param {Buffer} jpegThumbnail
       * @param {*} options
       */
      async value(
        jid,
        participant,
        inviteCode,
        inviteExpiration,
        groupName = "unknown subject",
        caption = "Invitation to join my WhatsApp group",
        jpegThumbnail,
        options = {},
      ) {
        const msg = proto.Message.fromObject({
          groupInviteMessage: proto.GroupInviteMessage.fromObject({
            inviteCode,
            inviteExpiration:
              parseInt(inviteExpiration) ||
              +new Date(new Date() + 3 * 86400000),
            groupJid: jid,
            groupName:
              (groupName ? groupName : await conn.getName(jid)) || null,
            jpegThumbnail: Buffer.isBuffer(jpegThumbnail)
              ? jpegThumbnail
              : null,
            caption,
          }),
        });
        const message = generateWAMessageFromContent(participant, msg, options);
        await conn.relayMessage(participant, message.message, {
          messageId: message.key.id,
          additionalAttributes: { ...options },
        });
        return message;
      },
      enumerable: true,
    },
    processMessageStubType: {
      /**
       * to process MessageStubType
       * @param {import("baileys").proto.WebMessageInfo} m
       */
      async value(m) {
        if (!m.messageStubType) return;
        const chat = conn.decodeJid(
          m.key.remoteJid ||
            m.message?.senderKeyDistributionMessage?.groupId ||
            "",
        );
        if (!chat || chat === "status@broadcast") return;
        const emitGroupUpdate = (update) => {
          conn.ev.emit("groups.update", [{ id: chat, ...update }]);
        };
        switch (m.messageStubType) {
          case WAMessageStubType.REVOKE:
          case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
            emitGroupUpdate({ revoke: m.messageStubParameters[0] });
            break;
          case WAMessageStubType.GROUP_CHANGE_ICON:
            emitGroupUpdate({ icon: m.messageStubParameters[0] });
            break;
          default: {
            console.log({
              messageStubType: m.messageStubType,
              messageStubParameters: m.messageStubParameters,
              type: WAMessageStubType[m.messageStubType],
            });
            break;
          }
        }
        const isGroup = chat.endsWith("@g.us");
        if (!isGroup) return;
        let chats = conn.chats[chat];
        if (!chats) chats = conn.chats[chat] = { id: chat };
        chats.isChats = true;
        const metadata = await conn.groupMetadata(chat).catch((_) => null);
        if (!metadata) return;
        chats.subject = metadata.subject;
        chats.metadata = metadata;
      },
    },
    insertAllGroup: {
      async value() {
        const groups =
          (await conn.groupFetchAllParticipating().catch((_) => null)) || {};
        for (const group in groups)
          conn.chats[group] = {
            ...(conn.chats[group] || {}),
            id: group,
            subject: groups[group].subject,
            isChats: true,
            metadata: groups[group],
          };
        return conn.chats;
      },
    },
    pushMessage: {
      /**
       * pushMessage
       * @param {import("baileys").proto.WebMessageInfo[]} m
       */
      async value(m) {
        if (!m) return;
        if (!Array.isArray(m)) m = [m];
        for (const message of m) {
          try {
            // if (!(message instanceof proto.WebMessageInfo)) continue // https://github.com/adiwajshing/Baileys/pull/696/commits/6a2cb5a4139d8eb0a75c4c4ea7ed52adc0aec20f
            if (!message) continue;
            if (
              message.messageStubType &&
              message.messageStubType != WAMessageStubType.CIPHERTEXT
            )
              conn.processMessageStubType(message).catch(console.error);
            const _mtype = Object.keys(message.message || {});
            const mtype =
              (!["senderKeyDistributionMessage", "messageContextInfo"].includes(
                _mtype[0],
              ) &&
                _mtype[0]) ||
              (_mtype.length >= 3 &&
                _mtype[1] !== "messageContextInfo" &&
                _mtype[1]) ||
              _mtype[_mtype.length - 1];
            const chat = conn.decodeJid(
              message.key.remoteJid ||
                message.message?.senderKeyDistributionMessage?.groupId ||
                "",
            );
            if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
              /**
               * @type {import("baileys").proto.IContextInfo}
               */
              const context = message.message[mtype].contextInfo;
              let participant = conn.decodeJid(context.participant);
              const remoteJid = conn.decodeJid(
                context.remoteJid || participant,
              );
              /**
               * @type {import("baileys").proto.IMessage}
               *
               */
              const quoted = message.message[mtype].contextInfo.quotedMessage;
              if (remoteJid && remoteJid !== "status@broadcast" && quoted) {
                let qMtype = Object.keys(quoted)[0];
                if (qMtype == "conversation") {
                  quoted.extendedTextMessage = { text: quoted[qMtype] };
                  delete quoted.conversation;
                  qMtype = "extendedTextMessage";
                }
                if (!quoted[qMtype].contextInfo)
                  quoted[qMtype].contextInfo = {};
                quoted[qMtype].contextInfo.mentionedJid =
                  context.mentionedJid ||
                  quoted[qMtype].contextInfo.mentionedJid ||
                  [];
                const isGroup = remoteJid.endsWith("g.us");
                if (isGroup && !participant) participant = remoteJid;
                const qM = {
                  key: {
                    remoteJid,
                    fromMe: areJidsSameUser(conn.user.jid, remoteJid),
                    id: context.stanzaId,
                    participant,
                  },
                  message: JSON.parse(JSON.stringify(quoted)),
                  ...(isGroup ? { participant } : {}),
                };
                let qChats = conn.chats[participant];
                if (!qChats)
                  qChats = conn.chats[participant] = {
                    id: participant,
                    isChats: !isGroup,
                  };
                if (!qChats.messages) qChats.messages = {};
                if (!qChats.messages[context.stanzaId] && !qM.key.fromMe)
                  qChats.messages[context.stanzaId] = qM;
                let qChatsMessages;
                if (
                  (qChatsMessages = Object.entries(qChats.messages)).length > 40
                )
                  qChats.messages = Object.fromEntries(
                    qChatsMessages.slice(30, qChatsMessages.length),
                  ); // maybe avoid memory leak
              }
            }
            if (!chat || chat === "status@broadcast") continue;
            const isGroup = chat.endsWith("@g.us");
            let chats = conn.chats[chat];
            if (!chats) {
              if (isGroup) await conn.insertAllGroup().catch(console.error);
              chats = conn.chats[chat] = {
                id: chat,
                isChats: true,
                ...(conn.chats[chat] || {}),
              };
            }
            let metadata;
            let sender;
            if (isGroup) {
              if (!chats.subject || !chats.metadata) {
                metadata =
                  (await conn.groupMetadata(chat).catch((_) => ({}))) || {};
                if (!chats.subject) chats.subject = metadata.subject || "";
                if (!chats.metadata) chats.metadata = metadata;
              }
              sender = conn.decodeJid(
                (message.key?.fromMe && conn.user.id) ||
                  message.participant ||
                  message.key?.participant ||
                  chat ||
                  "",
              );
              if (sender !== chat) {
                let chats = conn.chats[sender];
                if (!chats) chats = conn.chats[sender] = { id: sender };
                if (!chats.name)
                  chats.name = message.pushName || chats.name || "";
              }
            } else if (!chats.name)
              chats.name = message.pushName || chats.name || "";
            if (
              ["senderKeyDistributionMessage", "messageContextInfo"].includes(
                mtype,
              )
            )
              continue;
            chats.isChats = true;
            if (!chats.messages) chats.messages = {};
            const fromMe =
              message.key.fromMe ||
              areJidsSameUser(sender || chat, conn.user.id);
            if (
              !["protocolMessage"].includes(mtype) &&
              !fromMe &&
              message.messageStubType != WAMessageStubType.CIPHERTEXT &&
              message.message
            ) {
              delete message.message.messageContextInfo;
              delete message.message.senderKeyDistributionMessage;
              chats.messages[message.key.id] = JSON.parse(
                JSON.stringify(message, null, 2),
              );
              let chatsMessages;
              if ((chatsMessages = Object.entries(chats.messages)).length > 40)
                chats.messages = Object.fromEntries(
                  chatsMessages.slice(30, chatsMessages.length),
                );
            }
          } catch (e) {
            console.error(e);
          }
        }
      },
    },
    serializeM: {
      /**
       * Serialize Message, so it easier to manipulate
       * @param {import("baileys").proto.WebMessageInfo} m
       */
      value(m) {
        return smsg(conn, m);
      },
    },
    ...(typeof conn.chatRead !== "function"
      ? {
          chatRead: {
            /**
             * Read message
             * @param {String} jid
             * @param {String|undefined|null} participant
             * @param {String} messageID
             */
            value(jid, participant = conn.user.jid, messageID) {
              return conn.sendReadReceipt(jid, participant, [messageID]);
            },
            enumerable: true,
          },
        }
      : {}),
    ...(typeof conn.setStatus !== "function"
      ? {
          setStatus: {
            /**
             * setStatus bot
             * @param {String} status
             */
            value(status) {
              return conn.query({
                tag: "iq",
                attrs: {
                  to: S_WHATSAPP_NET,
                  type: "set",
                  xmlns: "status",
                },
                content: [
                  {
                    tag: "status",
                    attrs: {},
                    content: Buffer.from(status, "utf-8"),
                  },
                ],
              });
            },
            enumerable: true,
          },
        }
      : {}),
  });
  if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id);
  store.bind(sock);
  return sock;
}
/**
 * Serialize Message
 * @param {ReturnType<typeof makeWASocket>} conn
 * @param {import("baileys").proto.WebMessageInfo} m
 * @param {Boolean} hasParent
 */
export function smsg(conn, m, hasParent) {
  if (!m) return m;
  const M = proto.WebMessageInfo;
  try {
    m = M.fromObject(m);
    m.conn = conn;
    let protocolMessageKey;
    if (m.message) {
      if (m.mtype == "protocolMessage" && m.msg?.key) {
        protocolMessageKey = m.msg.key;
        if (protocolMessageKey.remoteJid === "status@broadcast") {
          protocolMessageKey.remoteJid = m.chat || "";
        }
        if (
          !protocolMessageKey.participant ||
          protocolMessageKey.participant === "status_me"
        ) {
          protocolMessageKey.participant =
            typeof m.sender === "string" ? m.sender : "";
        }
        const decodedParticipant =
          conn?.decodeJid?.(protocolMessageKey.participant) || "";
        protocolMessageKey.fromMe =
          decodedParticipant === (conn?.user?.id || "");
        if (
          !protocolMessageKey.fromMe &&
          protocolMessageKey.remoteJid === (conn?.user?.id || "")
        ) {
          protocolMessageKey.remoteJid =
            typeof m.sender === "string" ? m.sender : "";
        }
      }
      if (m.quoted && !m.quoted.mediaMessage) {
        delete m.quoted.download;
      }
    }
    if (!m.mediaMessage) {
      delete m.download;
    }
    if (protocolMessageKey && m.mtype == "protocolMessage") {
      try {
        conn.ev.emit("message.delete", protocolMessageKey);
      } catch (e) {
        console.error("Error al emitir message.delete:", e);
      }
    }
    return m;
  } catch (e) {
    console.error("Error en smsg:", e);
    return m;
  }
}

// https://github.com/Nurutomo/wabot-aq/issues/490
// Fix 2025 - @BrunoSobrino - LID Resolved

export function serialize() {
    const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']
    return Object.defineProperties(proto.WebMessageInfo.prototype, {
        conn: {
            value: undefined,
            enumerable: false,
            writable: true
        },
        id: {
            get() {
                return this.key?.id
            }
        },
    isBaileys: {
    get() {
    return (this?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender)) && this.id.startsWith('3EB0') && (this.id.length === 20 || this.id.length === 22 || this.id.length === 12) || false
        },
    },
        chat: {
            get() {
                const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId
                return (
                    this.key?.remoteJid ||
                    (senderKeyDistributionMessage &&
                        senderKeyDistributionMessage !== 'status@broadcast'
                    ) || ''
                ).decodeJid()
            }
        },
        isGroup: {
            get() {
                return this.chat.endsWith('@g.us')
            },
            enumerable: true
        },
        sender: {
            get() {
                return this.conn?.decodeJid(this.key?.fromMe && this.conn?.user.id || this.participant || this.key.participant || this.chat || '')
            },
            enumerable: true
        },
        fromMe: {
            get() {
                return this.key?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender) || false
            }
        },
        mtype: {
            get() {
                if (!this.message) return ''
                const type = Object.keys(this.message)
                return (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || // Sometimes message in the front
                    (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || // Sometimes message in midle if mtype length is greater than or equal to 3
                    type[type.length - 1] // common case
            },
            enumerable: true
        },
        msg: {
            get() {
                if (!this.message) return null
                return this.message[this.mtype]
            }
        },
        mediaMessage: {
            get() {
                if (!this.message) return null
                const Message = ((this.msg?.url || this.msg?.directPath) ? { ...this.message } : extractMessageContent(this.message)) || null
                if (!Message) return null
                const mtype = Object.keys(Message)[0]
                return MediaType.includes(mtype) ? Message : null
            },
            enumerable: true
        },
        mediaType: {
            get() {
                let message
                if (!(message = this.mediaMessage)) return null
                return Object.keys(message)[0]
            },
            enumerable: true,
        },
        quoted: {
            get() {
                /**
                 * @type {ReturnType<typeof makeWASocket>}
                 */
                const self = this
                const msg = self.msg
                const contextInfo = msg?.contextInfo
                const quoted = contextInfo?.quotedMessage
                if (!msg || !contextInfo || !quoted) return null
                const type = Object.keys(quoted)[0]
                let q = quoted[type]
                const text = typeof q === 'string' ? q : q.text
                return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? { text: q } : q)), {
                    mtype: {
                        get() {
                            return type
                        },
                        enumerable: true
                    },
                    mediaMessage: {
                        get() {
                            const Message = ((q.url || q.directPath) ? { ...quoted } : extractMessageContent(quoted)) || null
                            if (!Message) return null
                            const mtype = Object.keys(Message)[0]
                            return MediaType.includes(mtype) ? Message : null
                        },
                        enumerable: true
                    },
                    mediaType: {
                        get() {
                            let message
                            if (!(message = this.mediaMessage)) return null
                            return Object.keys(message)[0]
                        },
                        enumerable: true,
                    },
                    id: {
                        get() {
                            return contextInfo.stanzaId
                        },
                        enumerable: true
                    },
                    chat: {
                        get() {
                            return contextInfo.remoteJid || self.chat
                        },
                        enumerable: true
                    },
                    isBaileys: {
                    get() {
                    return (this?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender)) && this.id.startsWith('3EB0') && (this.id.length === 20 || this.id.length === 22 || this.id.length === 12) || false
                       },
                        enumerable: true
                    },
                    sender: {
                        get() {
                            return (contextInfo.participant || this.chat || '').decodeJid()
                        },
                        enumerable: true
                    },
                    fromMe: {
                        get() {
                            return areJidsSameUser(this.sender, self.conn?.user.jid)
                        },
                        enumerable: true,
                    },
                    text: {
                        get() {
                            return text || this.caption || this.contentText || this.selectedDisplayText || ''
                        },
                        enumerable: true
                    },
                    mentionedJid: {
                        get() {
                            return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || []
                        },
                        enumerable: true
                    },
                    name: {
                        get() {
                            const sender = this.sender
                            return sender ? self.conn?.getName(sender) : null
                        },
                        enumerable: true

                    },
                    vM: {
                        get() {
                            return proto.WebMessageInfo.fromObject({
                                key: {
                                    fromMe: this.fromMe,
                                    remoteJid: this.chat,
                                    id: this.id
                                },
                                message: quoted,
                                ...(self.isGroup ? { participant: this.sender } : {})
                            })
                        }
                    },
                    fakeObj: {
                        get() {
                            return this.vM
                        }
                    },
                    download: {
                        value(saveToFile = false) {
                            const mtype = this.mediaType
                            return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
                        },
                        enumerable: true,
                        configurable: true,
                    },
                    reply: {
                        /**
                         * Reply to quoted message
                         * @param {String|Object} text
                         * @param {String|false} chatId
                         * @param {Object} options
                         */
                        value(text, chatId, options) {
                            return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options)
                        },
                        enumerable: true,
                    },
                    copy: {
                        /**
                         * Copy quoted message
                         */
                        value() {
                            const M = proto.WebMessageInfo
                            return smsg(conn, M.fromObject(M.toObject(this.vM)))
                        },
                        enumerable: true,
                    },
                    forward: {
                        /**
                         * Forward quoted message
                         * @param {String} jid
                         *  @param {Boolean} forceForward
                         */
                        value(jid, force = false, options) {
                            return self.conn?.sendMessage(jid, {
                                forward: this.vM, force, ...options
                            }, { ...options })
                        },
                        enumerable: true,
                    },
                    copyNForward: {
                        /**
                         * Exact Forward quoted message
                         * @param {String} jid
                         * @param {Boolean|Number} forceForward
                         * @param {Object} options
                         */
                        value(jid, forceForward = false, options) {
                            return self.conn?.copyNForward(jid, this.vM, forceForward, options)
                        },
                        enumerable: true,

                    },
                    cMod: {
                        /**
                         * Modify quoted Message
                         * @param {String} jid
                         * @param {String} text
                         * @param {String} sender
                         * @param {Object} options
                         */
                        value(jid, text = '', sender = this.sender, options = {}) {
                            return self.conn?.cMod(jid, this.vM, text, sender, options)
                        },
                        enumerable: true,

                    },
                    delete: {
                        /**
                         * Delete quoted message
                         */
                        value() {
                            return self.conn?.sendMessage(this.chat, { delete: this.vM.key })
                        },
                        enumerable: true,

                    },
                react: {
                                                value(text) {
                                                        return self.conn?.sendMessage(this.chat, {
                                                                react: {
                                                                        text,
                                                                        key: this.vM.key
                                                                }
                                                        })
                                                },
                                                enumerable: true,
                                        }
                                })
                        },
                        enumerable: true
                },
                _text: {
                        value: null,
                        writable: true,
                },
                text: {
                        get() {
                const msg = this.msg
                const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || ''
                return typeof this._text === 'string' ? this._text : '' || (typeof text === 'string' ? text : (
                    text?.selectedDisplayText ||
                    text?.hydratedTemplate?.hydratedContentText ||
                    text
                )) || ''
            },
            set(str) {
                return this._text = str
            },
            enumerable: true
        },
        mentionedJid: {
            get() {
                return this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid || []
            },
            enumerable: true
        },
        name: {
            get() {
                return !nullish(this.pushName) && this.pushName || this.conn?.getName(this.sender)
            },
            enumerable: true
        },
        download: {
            value(saveToFile = false) {
                const mtype = this.mediaType
                return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile)
            },
            enumerable: true,
            configurable: true
        },
        reply: {
            value(text, chatId, options) {
                return this.conn?.reply(chatId ? chatId : this.chat, text, this, options)
            }
        },
        copy: {
            value() {
                const M = proto.WebMessageInfo
                return smsg(this.conn, M.fromObject(M.toObject(this)))
            },
            enumerable: true
        },
        forward: {
            value(jid, force = false, options = {}) {
                return this.conn?.sendMessage(jid, {
                    forward: this, force, ...options
                }, { ...options })
            },
            enumerable: true
        },
        copyNForward: {
            value(jid, forceForward = false, options = {}) {
                return this.conn?.copyNForward(jid, this, forceForward, options)
            },
            enumerable: true
        },
        cMod: {
            value(jid, text = '', sender = this.sender, options = {}) {
                return this.conn?.cMod(jid, this, text, sender, options)
            },
            enumerable: true
        },
        getQuotedObj: {
            value() {
                if (!this.quoted.id) return null
                const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM)
                return smsg(this.conn, q)
            },
            enumerable: true
        },
        getQuotedMessage: {
            get() {
                return this.getQuotedObj
            }
        },
        delete: {
            value() {
                return this.conn?.sendMessage(this.chat, { delete: this.key })
            },
            enumerable: true
},
                react: {
                        value(text) {
                                return this.conn?.sendMessage(this.chat, {
                                        react: {
                                                text,
                                                key: this.key
                                        }
                                })
                        },
                        enumerable: true
                }
        })
}

export function logic(check, inp, out) {
  if (inp.length !== out.length)
    throw new Error("Input and Output must have same length");
  for (const i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
  return null;
}

export function protoType() {
  Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
    const ab = new ArrayBuffer(this.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < this.length; ++i) {
      view[i] = this[i];
    }
    return ab;
  };
  /**
   * @return {ArrayBuffer}
   */
  Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
    return this.buffer.slice(
      this.byteOffset,
      this.byteOffset + this.byteLength,
    );
  };
  /**
   * @return {Buffer}
   */
  ArrayBuffer.prototype.toBuffer = function toBuffer() {
    return Buffer.from(new Uint8Array(this));
  };
  // /**
  //  * @returns {String}
  //  */
  // Buffer.prototype.toUtilFormat = ArrayBuffer.prototype.toUtilFormat = Object.prototype.toUtilFormat = Array.prototype.toUtilFormat = function toUtilFormat() {
  //     return util.format(this)
  // }
  Uint8Array.prototype.getFileType =
    ArrayBuffer.prototype.getFileType =
    Buffer.prototype.getFileType =
      async function getFileType() {
        return await fileTypeFromBuffer(this);
      };
  /**
   * @returns {Boolean}
   */
  String.prototype.isNumber = Number.prototype.isNumber = isNumber;
  /**
   *
   * @return {String}
   */
  String.prototype.capitalize = function capitalize() {
    return this.charAt(0).toUpperCase() + this.slice(1, this.length);
  };
  /**
   * @return {String}
   */
  String.prototype.capitalizeV2 = function capitalizeV2() {
    const str = this.split(" ");
    return str.map((v) => v.capitalize()).join(" ");
  };

  // Resolver problema LIDs, Fu*k You Meta - Resolve id@lid
  String.prototype.resolveLidToRealJid = (function () {
    const lidCache = new Map();
    return async function (
      groupChatId,
      conn,
      maxRetries = 3,
      retryDelay = 60000,
    ) {
      const inputJid = this.toString();
      if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) {
        return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`;
      }
      if (lidCache.has(inputJid)) {
        return lidCache.get(inputJid);
      }
      const lidToFind = inputJid.split("@")[0];
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const metadata = await conn?.groupMetadata(groupChatId);
          if (!metadata?.participants)
            throw new Error("No se obtuvieron participantes");
          for (const participant of metadata.participants) {
            try {
              if (!participant?.jid) continue;
              const contactDetails = await conn?.onWhatsApp(participant.jid);
              if (!contactDetails?.[0]?.lid) continue;
              const possibleLid = contactDetails[0].lid.split("@")[0];
              if (possibleLid === lidToFind) {
                lidCache.set(inputJid, participant.jid);
                return participant.jid;
              }
            } catch (e) {
              continue;
            }
          }
          lidCache.set(inputJid, inputJid);
          return inputJid;
        } catch (e) {
          if (++attempts >= maxRetries) {
            lidCache.set(inputJid, inputJid);
            return inputJid;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
      return inputJid;
    };
  })();

  String.prototype.decodeJid = function decodeJid() {
    if (/:\d+@/gi.test(this)) {
      const decode = jidDecode(this) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        this
      ).trim();
    } else return this.trim();
  };
  /**
   * number must be milliseconds
   * @return {string}
   */
  Number.prototype.toTimeString = function toTimeString() {
    // const milliseconds = this % 1000
    const seconds = Math.floor((this / 1000) % 60);
    const minutes = Math.floor((this / (60 * 1000)) % 60);
    const hours = Math.floor((this / (60 * 60 * 1000)) % 24);
    const days = Math.floor(this / (24 * 60 * 60 * 1000));
    return (
      (days ? `${days} day(s) ` : "") +
      (hours ? `${hours} hour(s) ` : "") +
      (minutes ? `${minutes} minute(s) ` : "") +
      (seconds ? `${seconds} second(s)` : "")
    ).trim();
  };
  Number.prototype.getRandom =
    String.prototype.getRandom =
    Array.prototype.getRandom =
      getRandom;
}

function isNumber() {
  const int = parseInt(this);
  return typeof int === "number" && !isNaN(int);
}

function getRandom() {
  if (Array.isArray(this) || this instanceof String)
    return this[Math.floor(Math.random() * this.length)];
  return Math.floor(Math.random() * this);
}

/**
 * @deprecated use the operator ?? instead
 * - (null || undefined) ?? 'idk'
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
 */
function nullish(args) {
  return !(args !== null && args !== undefined);
}
