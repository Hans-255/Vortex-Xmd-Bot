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
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_JID,
        newsletterName: 'VORTEX XMD',
        serverMessageId: Math.floor(100000 + Math.random() * 900000)
    },
    externalAdReply: {
        title: `VORTEX XMD | ${label}`,
        body: 'Audio Effect | HansTz Bot',
        thumbnailUrl: getRandomImage(),
        mediaType: 1,
        sourceUrl: 'https://github.com/Hans-255/Vortex-Xmd-Bot',
        showAdAttribution: true
    }
});

const downloadAudio = async (audioMsg) => {
    const stream = await downloadContentFromMessage(audioMsg, 'audio');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const tmpPath = `${os.tmpdir()}/${Date.now()}_input.audio`;
    fs.writeFileSync(tmpPath, buffer);
    return tmpPath;
};

const applyAndSend = (inputPath, filter, label, zk, dest, ms, repondre) => new Promise(resolve => {
    const outPath = `${os.tmpdir()}/${Date.now()}_output.mp3`;
    const cmd = `"${ffmpegPath}" -y -i "${inputPath}" ${filter} "${outPath}"`;
    exec(cmd, (err) => {
        try { fs.unlinkSync(inputPath); } catch (_) {}
        if (err) {
            repondre('❌ Audio processing failed: ' + err.message.split('\n')[0]);
            return resolve();
        }
        try {
            const buff = fs.readFileSync(outPath);
            zk.sendMessage(dest, {
                audio: buff,
                mimetype: 'audio/mpeg',
                contextInfo: makeCtx(label)
            }, { quoted: ms });
            fs.unlinkSync(outPath);
        } catch (e) { repondre('❌ Could not send audio'); }
        resolve();
    });
});

const checkAudio = (msgRepondu, repondre) => {
    if (!msgRepondu) { repondre('↩️ Please *reply* to an audio message'); return false; }
    if (!msgRepondu.audioMessage) { repondre('🎵 This command only works with *audio messages*'); return false; }
    return true;
};

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
        if (!checkAudio(msgRepondu, repondre)) return;
        try {
            const inp = await downloadAudio(msgRepondu.audioMessage);
            await applyAndSend(inp, filter, label, zk, dest, ms, repondre);
        } catch (e) { repondre('❌ Error: ' + e.message); }
    });
});
