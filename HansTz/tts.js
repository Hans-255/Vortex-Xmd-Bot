'use strict';
const { adams } = require('../Hans/adams');
const { getRandomImage } = require('../Hans/images');
const axios = require('axios');

const NEWSLETTER_JID = '120363421513037430@newsletter';

const makeCtx = () => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_JID,
        newsletterName: 'VORTEX XMD',
        serverMessageId: -1
    },
    externalAdReply: {
        showAdAttribution: false,
        renderLargerThumbnail: false,
        title: 'VORTEX XMD TTS',
        body: 'Text to Speech | HansTz Bot',
        thumbnailUrl: getRandomImage(),
        mediaType: 1,
        sourceUrl: 'https://github.com/Hans-255/Vortex-Xmd-Bot'
    }
});

// Google Translate TTS — reliable, no key needed, 200 char limit per call
const GTTS_URL = (text, lang) =>
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=${lang}&client=tw-ob&ttsspeed=1`;

const ttsCommands = [
    { name: 'dit',  lang: 'fr',    label: 'French' },
    { name: 'itta', lang: 'ja',    label: 'Japanese' },
    { name: 'say',  lang: 'en',    label: 'English' },
];

ttsCommands.forEach(({ name, lang }) => {
    adams({ nomCom: name, categorie: 'TTS', reaction: '🗣️' }, async (dest, zk, opts) => {
        const { ms, arg, repondre } = opts;
        if (!arg || !arg[0]) return repondre(`❌ Usage: .${name} [text]\nExample: .${name} Hello World`);

        const text = arg.join(' ');
        const audioUrl = GTTS_URL(text, lang);

        try {
            await zk.sendMessage(dest, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                ptt: true,
                contextInfo: makeCtx()
            }, { quoted: ms });
        } catch (e) {
            repondre('❌ TTS failed: ' + e.message.split('\n')[0]);
        }
    });
});
