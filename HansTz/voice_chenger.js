'use strict';
const { adams } = require('../Hans/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

// Download audio from replied message to temp file
const downloadAudio = async (audioMsg) => {
    const stream = await downloadContentFromMessage(audioMsg, 'audio');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const tmpPath = `${os.tmpdir()}/${Date.now()}_input.audio`;
    fs.writeFileSync(tmpPath, buffer);
    return tmpPath;
};

// Apply ffmpeg filter and send resulting audio
const applyAndSend = (inputPath, filter, zk, dest, ms, repondre) => new Promise(resolve => {
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
            zk.sendMessage(dest, { audio: buff, mimetype: 'audio/mpeg' }, { quoted: ms });
            fs.unlinkSync(outPath);
        } catch (e) { repondre('❌ Could not send audio'); }
        resolve();
    });
});

const needsAudio = (msgRepondu, repondre) => {
    if (!msgRepondu) { repondre('↩️ Please *reply* to an audio message'); return false; }
    if (!msgRepondu.audioMessage) { repondre('🎵 This command only works with *audio messages*'); return false; }
    return true;
};

const run = (filter) => async (dest, zk, opt) => {
    const { ms, repondre, msgRepondu } = opt;
    if (!needsAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, filter, zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
};

adams({ nomCom: 'deep',      categorie: 'Audio-Edit' }, run('-af atempo=4/4,asetrate=44500*2/3'));
adams({ nomCom: 'bass',      categorie: 'Audio-Edit' }, run('-af equalizer=f=18:width_type=o:width=2:g=14'));
adams({ nomCom: 'reverse',   categorie: 'Audio-Edit' }, run('-filter_complex areverse'));
adams({ nomCom: 'slow',      categorie: 'Audio-Edit' }, run('-af atempo=0.7'));
adams({ nomCom: 'smooth',    categorie: 'Audio-Edit' }, run('-af aecho=0.8:0.88:60:0.4'));
adams({ nomCom: 'tempo',     categorie: 'Audio-Edit' }, run('-af atempo=1.5'));
adams({ nomCom: 'nightcore', categorie: 'Audio-Edit' }, run('-filter:a atempo=1.07,asetrate=44100*1.20'));
