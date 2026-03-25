// ── VORTEX-XMD | Random Images & Audios from GitHub ────────────────────────
const NEWSLETTER = {
  newsletterJid: '120363421513037430@newsletter',
  newsletterName: 'VORTEX XMD'
};

const GITHUB_IMAGES_API = 'https://api.github.com/repos/Mrhanstz/HansTz-Sever/contents/Database';
const GITHUB_AUDIOS_API = 'https://api.github.com/repos/Mrhanstz/HansTz-Sever/contents/databaseaudios';
const FALLBACK_IMAGE = 'https://raw.githubusercontent.com/Mrhanstz/HansTz-Sever/main/Database/HansTz.jpg';

let cachedImageUrls = [];
let usedImageIndices = [];
let audioFiles = [];
let usedAudioIndices = [];

async function fetchGitHubImages() {
    try {
        const res = await fetch(GITHUB_IMAGES_API);
        const files = await res.json();
        if (Array.isArray(files)) {
            const urls = files
                .filter(f => f.download_url && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
                .map(f => f.download_url);
            if (urls.length > 0) {
                cachedImageUrls = urls;
                usedImageIndices = [];
                console.log('[media] Loaded ' + cachedImageUrls.length + ' images from GitHub');
            }
        }
    } catch (err) {
        console.error('[media] Failed to fetch images:', err.message);
    }
}

async function fetchAudioFiles() {
    try {
        const res = await fetch(GITHUB_AUDIOS_API);
        const files = await res.json();
        if (Array.isArray(files)) {
            const valid = files
                .filter(f => f.download_url && f.size > 100 && /\.(mp3|mp4|m4a|ogg|wav|aac|m4r)$/i.test(f.name))
                .map(f => f.download_url);
            if (valid.length > 0) {
                audioFiles = valid;
                usedAudioIndices = [];
                console.log('[media] Loaded ' + audioFiles.length + ' audio files from GitHub');
            }
        }
    } catch (err) {
        console.error('[media] Failed to fetch audios:', err.message);
    }
}

// Boot load + refresh every 30 min
fetchGitHubImages();
fetchAudioFiles();
setInterval(fetchGitHubImages, 30 * 60 * 1000);
setInterval(fetchAudioFiles, 30 * 60 * 1000);

function getRandomImage() {
    if (cachedImageUrls.length === 0) return FALLBACK_IMAGE;
    if (usedImageIndices.length >= cachedImageUrls.length) usedImageIndices = [];
    const available = cachedImageUrls.map((_, i) => i).filter(i => !usedImageIndices.includes(i));
    const idx = available[Math.floor(Math.random() * available.length)];
    usedImageIndices.push(idx);
    return cachedImageUrls[idx];
}

function getRandomAudio() {
    if (audioFiles.length === 0) return null;
    if (usedAudioIndices.length >= audioFiles.length) usedAudioIndices = [];
    const available = audioFiles.map((_, i) => i).filter(i => !usedAudioIndices.includes(i));
    const idx = available[Math.floor(Math.random() * available.length)];
    usedAudioIndices.push(idx);
    return audioFiles[idx];
}

function getAudioMimetype(url) {
    if (!url) return 'audio/mpeg';
    const lower = url.toLowerCase();
    if (lower.endsWith('.mp3')) return 'audio/mpeg';
    if (lower.endsWith('.mp4') || lower.endsWith('.m4a') || lower.endsWith('.m4r')) return 'audio/mp4';
    if (lower.endsWith('.ogg')) return 'audio/ogg';
    if (lower.endsWith('.wav')) return 'audio/wav';
    if (lower.endsWith('.aac')) return 'audio/aac';
    return 'audio/mpeg';
}

async function sendRandomAudio(socket, chatId, quoted) {
    const audioUrl = getRandomAudio();
    if (!audioUrl) return;
    try {
        await socket.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: getAudioMimetype(audioUrl),
            ptt: false,
            contextInfo: {
                forwardingScore: 5,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: NEWSLETTER.newsletterJid,
                    newsletterName: NEWSLETTER.newsletterName
                }
            }
        }, quoted ? { quoted } : undefined);
    } catch (err) {
        console.error('[media] Failed to send audio:', err.message);
    }
}

module.exports = { getRandomImage, getRandomAudio, getAudioMimetype, sendRandomAudio, NEWSLETTER };
