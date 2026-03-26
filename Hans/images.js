const GITHUB_IMAGES_API = 'https://api.github.com/repos/Mrhanstz/HansTz-Sever/contents/Database';
const NEWSLETTER_JID = '120363421513037430@newsletter';
const BOT_NAME = 'VORTEX XMD';
const FALLBACK_IMAGE = 'https://raw.githubusercontent.com/Mrhanstz/HansTz-Sever/main/Database/HansTz.jpg';

let cachedImageUrls = [];
let usedImageIndices = [];

async function fetchGitHubImages() {
    try {
        const response = await fetch(GITHUB_IMAGES_API);
        const files = await response.json();
        if (Array.isArray(files)) {
            cachedImageUrls = files
                .filter(f => f.download_url && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
                .map(f => f.download_url);
            usedImageIndices = [];
            console.log(`Loaded ${cachedImageUrls.length} images from GitHub`);
        }
    } catch (err) { console.error('Failed to fetch GitHub images:', err.message); }
}

function getRandomImage() {
    if (cachedImageUrls.length === 0) return FALLBACK_IMAGE;
    if (usedImageIndices.length >= cachedImageUrls.length) usedImageIndices = [];
    const available = cachedImageUrls.map((_, i) => i).filter(i => !usedImageIndices.includes(i));
    const idx = available[Math.floor(Math.random() * available.length)];
    usedImageIndices.push(idx);
    return cachedImageUrls[idx];
}

fetchGitHubImages();
setInterval(fetchGitHubImages, 30 * 60 * 1000);

module.exports = { getRandomImage, fetchGitHubImages, NEWSLETTER_JID, BOT_NAME, FALLBACK_IMAGE };
