const { getRandomImage, NEWSLETTER_JID, BOT_NAME } = require('./images');

const createContext = (userJid, options = {}) => {
    // Only include mentionedJid if it's a valid @s.whatsapp.net JID
    const validJid = (typeof userJid === 'string' && userJid.includes('@s.whatsapp.net'))
        ? [userJid] : [];
    return {
        contextInfo: {
            mentionedJid: validJid,
            forwardingScore: 999,
            isForwarded: true,
            businessMessageForwardInfo: { businessOwnerJid: NEWSLETTER_JID },
            forwardedNewsletterMessageInfo: {
                newsletterJid: NEWSLETTER_JID,
                newsletterName: options.newsletterName || BOT_NAME,
                serverMessageId: Math.floor(100000 + Math.random() * 900000)
            },
            externalAdReply: {
                title: options.title || BOT_NAME,
                body: options.body || 'VORTEX XMD | HansTz',
                thumbnailUrl: getRandomImage(),
                mediaType: 1,
                sourceUrl: options.sourceUrl || 'https://github.com/Hans-255/Vortex-Xmd-Bot',
                showAdAttribution: true,
                renderLargerThumbnail: options.large || false
            }
        }
    };
};

module.exports = { createContext };
