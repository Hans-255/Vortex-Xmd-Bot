'use strict';
const { adams } = require('../Hans/adams');
const { getRandomImage } = require('../Hans/images');
const axios = require('axios');

const NEWSLETTER_JID = '120363421513037430@newsletter';

const makeCtx = () => ({
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_JID,
        newsletterName: 'VORTEX XMD',
        serverMessageId: Math.floor(100000 + Math.random() * 900000)
    },
    externalAdReply: {
        title: 'VORTEX XMD TTS',
        body: 'Text to Speech | HansTz Bot',
        thumbnailUrl: getRandomImage(),
        mediaType: 1,
        sourceUrl: 'https://github.com/Hans-255/Vortex-Xmd-Bot',
        showAdAttribution: true
    }
});

async function getTTS(text, lang) {
    try {
        const res = await axios.get('https://api.maskser.me/api/soundoftext', { params: { text, lang } });
        return (res.data && res.data.result) ? res.data.result : null;
    } catch (e) {
        return null;
    }
}

const ttsCommands = [
    { name: 'dit',  lang: 'fr',    label: 'French' },
    { name: 'itta', lang: 'ja',    label: 'Japanese' },
    { name: 'say',  lang: 'en-US', label: 'English' },
];

ttsCommands.forEach(({ name, lang, label }) => {
    adams({ nomCom: name, categorie: 'TTS', reaction: '🗣️' }, async (dest, zk, opts) => {
        const { ms, arg, repondre } = opts;
        if (!arg || !arg[0]) return repondre(`❌ Usage: .${name} [text]\nExample: .${name} Hello World`);

        const text = arg.join(' ');
        const audioUrl = await getTTS(text, lang);
        if (!audioUrl) return repondre('❌ TTS failed. Please try again later.');

        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: true,
            contextInfo: makeCtx()
        }, { quoted: ms });
    });
});
