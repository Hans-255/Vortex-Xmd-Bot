'use strict';
const { adams } = require('../Hans/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getRandomImage } = require('../Hans/images');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

const NEWSLETTER_JID = '120363421513037430@newsletter';

const makeCtx = (label) => ({
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
        title: `VORTEX XMD | ${label}`,
        body: 'Audio Effect | HansTz Bot',
        thumbnailUrl: getRandomImage(),
        mediaType: 1,
        sourceUrl: 'https://github.com/Hans-255/Vortex-Xmd-Bot'
    }
});

const downloadAudio = async (audioMsg) => {
    const stream = await downloadContentFromMessage(audioMsg, 'audio');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    const p = `${os.tmpdir()}/${Date.now()}_in.audio`;
    fs.writeFileSync(p, buf);
    return p;
};

const applyAndSend = (inp, filter, label, zk, dest, ms, repondre) => new Promise(resolve => {
    const out = `${os.tmpdir()}/${Date.now()}_out.mp3`;
    exec(`"${ffmpegPath}" -y -i "${inp}" ${filter} "${out}"`, (err) => {
        try { fs.unlinkSync(inp); } catch (_) {}
        if (err) {
            repondre('❌ Audio processing failed: ' + err.message.split('\n')[0]);
            return resolve();
        }
        try {
            const buf = fs.readFileSync(out);
            zk.sendMessage(dest, {
                audio: buf,
                mimetype: 'audio/mpeg',
                contextInfo: makeCtx(label)
            }, { quoted: ms });
            fs.unlinkSync(out);
        } catch (e) { repondre('❌ Could not send audio: ' + e.message); }
        resolve();
    });
});

const effects = [
    { cmd: 'deep',      label: 'Deep Voice',    filter: '-af atempo=4/4,asetrate=44500*2/3' },
    { cmd: 'bass',      label: 'Bass Boost',    filter: '-af equalizer=f=18:width_type=o:width=2:g=14' },
    { cmd: 'reverse',   label: 'Reverse Audio', filter: '-filter_complex areverse' },
    { cmd: 'slow',      label: 'Slow Down',     filter: '-af atempo=0.7' },
    { cmd: 'smooth',    label: 'Smooth Echo',   filter: '-af aecho=0.8:0.88:60:0.4' },
    { cmd: 'tempo',     label: 'Fast Tempo',    filter: '-af atempo=1.5' },
    { cmd: 'nightcore', label: 'Nightcore',     filter: '-filter:a atempo=1.07,asetrate=44100*1.20' },
];

effects.forEach(({ cmd, label, filter }) => {
    adams({ nomCom: cmd, categorie: 'Audio-Edit', reaction: '🎵' }, async (dest, zk, opts) => {
        const { ms, repondre, msgRepondu } = opts;
        if (!msgRepondu) return repondre('↩️ Please *reply* to an audio message');
        if (!msgRepondu.audioMessage) return repondre('🎵 Only works with *audio messages*');
        try {
            const inp = await downloadAudio(msgRepondu.audioMessage);
            await applyAndSend(inp, filter, label, zk, dest, ms, repondre);
        } catch (e) { repondre('❌ Error: ' + e.message); }
    });
});
