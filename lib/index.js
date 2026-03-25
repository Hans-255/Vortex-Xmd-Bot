const { DeletedText, DeletedMedia, AntiDelete } = require('./antidel');
const { DATABASE } = require('./database');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./functions');
const { sms, downloadMediaMessage } = require('./msg');
const { getRandomImage, getRandomAudio, getAudioMimetype, sendRandomAudio, NEWSLETTER } = require('./media');

module.exports = {
    DeletedText, DeletedMedia, AntiDelete,
    getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson,
    DATABASE, sms, downloadMediaMessage,
    getRandomImage, getRandomAudio, getAudioMimetype, sendRandomAudio, NEWSLETTER
};
