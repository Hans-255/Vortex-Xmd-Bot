'use strict';
const { getRandomImage, NEWSLETTER_JID, BOT_NAME } = require('./images');

// Safe contextInfo for ALL messages — tested pattern that avoids silent drops
const createContext = (userJid, options = {}) => {
    // NEVER include undefined/lid JIDs — they break protobuf encoding silently
    const validJid = (typeof userJid === 'string' && userJid.includes('@s.whatsapp.net'))
        ? [userJid] : [];

    return {
        contextInfo: {
            mentionedJid: validJid,
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: NEWSLETTER_JID,
                newsletterName: options.newsletterName || BOT_NAME,
                serverMessageId: -1          // -1 = always valid; random IDs get dropped
            },
            externalAdReply: {
                showAdAttribution: false,    // true = WhatsApp treats as ad, silently drops
                renderLargerThumbnail: false,
                title: options.title || BOT_NAME,
                body:  options.body  || 'VORTEX XMD | HansTz',
                thumbnailUrl: getRandomImage(),
                mediaType: 1,
                sourceUrl: options.sourceUrl || 'https://github.com/Hans-255/Vortex-Xmd-Bot'
            }
        }
    };
};

module.exports = { createContext };
