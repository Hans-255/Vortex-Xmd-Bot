const { getRandomImage, NEWSLETTER_JID, BOT_NAME } = require('./images');

const createContext = (userJid, options = {}) => ({
    contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        businessMessageForwardInfo: {
            businessOwnerJid: NEWSLETTER_JID,
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWSLETTER_JID,
            newsletterName: options.newsletterName || BOT_NAME,
            serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
            title: options.title || BOT_NAME,
            body: options.body || 'Premium WhatsApp Bot Solution',
            thumbnailUrl: options.thumbnail || getRandomImage(),
            mediaType: 1,
            mediaUrl: options.mediaUrl || undefined,
            sourceUrl: options.sourceUrl || 'https://wa.me/255753668403',
            showAdAttribution: true,
            renderLargerThumbnail: options.large || false
        }
    }
});

module.exports = { createContext };
