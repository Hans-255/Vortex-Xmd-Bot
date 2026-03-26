'use strict';
const { adams } = require('../Hans/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

// Helper: download audio from quoted message to a temp file
const downloadAudio = async (audioMsg) => {
    const stream = await downloadContentFromMessage(audioMsg, 'audio');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const tmpPath = `${os.tmpdir()}/${Date.now()}_input.audio`;
    fs.writeFileSync(tmpPath, buffer);
    return tmpPath;
};

// Helper: apply ffmpeg filter and send result
const applyAndSend = async (inputPath, filter, zk, dest, ms, repondre) => {
    const outPath = `${os.tmpdir()}/${Date.now()}_output.mp3`;
    return new Promise((resolve) => {
        exec(`ffmpeg -y -i "${inputPath}" ${filter} "${outPath}"`, (err) => {
            try { fs.unlinkSync(inputPath); } catch (_) {}
            if (err) { repondre('❌ Error processing audio: ' + err.message); return resolve(); }
            try {
                const buff = fs.readFileSync(outPath);
                zk.sendMessage(dest, { audio: buff, mimetype: 'audio/mpeg' }, { quoted: ms });
                fs.unlinkSync(outPath);
            } catch (e) { repondre('❌ Error sending audio'); }
            resolve();
        });
    });
};

const checkAudio = (msgRepondu, repondre) => {
    if (!msgRepondu) { repondre('Please reply to an audio message'); return false; }
    if (!msgRepondu.audioMessage) { repondre('The command only works with audio messages'); return false; }
    return true;
};

adams({ nomCom: 'deep', categorie: 'Audio-Edit' }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    if (!checkAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, '-af atempo=4/4,asetrate=44500*2/3', zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
});

adams({ nomCom: 'bass', categorie: 'Audio-Edit' }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    if (!checkAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, '-af equalizer=f=18:width_type=o:width=2:g=14', zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
});

adams({ nomCom: 'reverse', categorie: 'Audio-Edit' }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    if (!checkAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, '-filter_complex areverse', zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
});

adams({ nomCom: 'slow', categorie: 'Audio-Edit' }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    if (!checkAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, '-af atempo=0.7', zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
});

adams({ nomCom: 'smooth', categorie: 'Audio-Edit' }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    if (!checkAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, '-af aecho=0.8:0.88:60:0.4', zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
});

adams({ nomCom: 'tempo', categorie: 'Audio-Edit' }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    if (!checkAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, '-af atempo=1.5', zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
});

adams({ nomCom: 'nightcore', categorie: 'Audio-Edit' }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;
    if (!checkAudio(msgRepondu, repondre)) return;
    try {
        const inp = await downloadAudio(msgRepondu.audioMessage);
        await applyAndSend(inp, '-filter:a "atempo=1.07,asetrate=44100*1.20"', zk, dest, ms, repondre);
    } catch (e) { repondre('❌ Error: ' + e.message); }
});
