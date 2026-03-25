const axios = require('axios');
const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363421513037430@newsletter',
    newsletterName: 'VORTEX XMD',
    serverMessageId: 143
  }
};

// ─── APK DOWNLOADER ──────────────────────────────────────────────────────────
cmd({
  pattern: 'apk',
  desc: 'Download APK from Aptoide.',
  category: 'download',
  use: '.apk <app name>',
  filename: __filename,
}, async (conn, mek, msg, { from, q, reply }) => {
  try {
    if (!q) return reply('❌ Please provide an app name\nExample: .apk whatsapp');

    await conn.sendMessage(from, { react: { text: '🔎', key: mek.key } });

    const url = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}&apikey=mnp3grlZ/limit=1`;
    const res = await axios.get(url);
    const data = res.data;

    if (!data?.datalist?.list?.[0]) return reply('⚠️ No results found for the given app name.');

    const app = data.datalist.list[0];
    const sizeMb = (app.size / (1024 * 1024)).toFixed(2);
    const downloadUrl = app.file?.path_alt || app.file?.dl_link;

    const caption = `╭───〔 📱 *APK DOWNLOADER* 〕───⬣
┃
┣─ 📛 *Name:* ${app.name}
┣─ 📦 *Package:* ${app.package}
┣─ 👨‍💻 *Developer:* ${app.developer?.name}
┣─ 📏 *Size:* ${sizeMb} MB
┣─ 📅 *Updated:* ${app.updated}
┃
╰──✪ *POWERED BY VORTEX XMD* ✪──`;

    await conn.sendMessage(from, {
      image: { url: app.icon },
      caption,
      contextInfo
    }, { quoted: mek });

    await conn.sendMessage(from, {
      document: { url: downloadUrl },
      fileName: app.name + '.apk',
      mimetype: 'application/vnd.android.package-archive',
      contextInfo
    }, { quoted: mek });

  } catch (err) {
    console.error('APK Error:', err);
    reply('❌ Error: ' + err.message);
  }
});

// ─── MEDIAFIRE DOWNLOADER ─────────────────────────────────────────────────────
cmd({
  pattern: 'mediafire',
  alias: ['mfire'],
  desc: 'To download MediaFire files.',
  category: 'download',
  use: '.mediafire <link>',
  filename: __filename,
}, async (conn, mek, msg, { from, q, reply }) => {
  try {
    if (!q) return reply('❌ Please provide a MediaFire link.');

    await conn.sendMessage(from, { react: { text: '🔎', key: mek.key } });

    const res = await axios.get(`https://www.dark-yasiya-api.site/download/mfire?url=${encodeURIComponent(q)}`);
    const data = res.data?.result;

    if (!data?.mediafire_download) return reply('⚠️ Failed to fetch MediaFire download link. Ensure the link is valid.');

    const caption = `╭───〔 ☁️ *MEDIAFIRE DOWNLOADER* 〕───⬣
┃
┣─ 📛 *File Name:* ${data.fileName || 'Unknown'}
┣─ 📏 *Size:* ${data.size || 'N/A'}
┃
╰──✪ *POWERED BY VORTEX XMD* ✪──`;

    await conn.sendMessage(from, {
      document: { url: data.mediafire_download },
      fileName: data.fileName || 'file',
      mimetype: data.mimetype || 'application/octet-stream',
      caption,
      contextInfo
    }, { quoted: mek });

  } catch (err) {
    console.error('MediaFire Error:', err);
    reply('❌ An error occurred while processing the MediaFire link.');
  }
});

// ─── GOOGLE DRIVE DOWNLOADER ──────────────────────────────────────────────────
cmd({
  pattern: 'gdrive',
  desc: 'Download Google Drive files.',
  category: 'download',
  use: '.gdrive <link>',
  filename: __filename,
}, async (conn, mek, msg, { from, q, reply }) => {
  try {
    if (!q) return reply('❌ Please provide a valid Google Drive link.');

    await conn.sendMessage(from, { react: { text: '🔎', key: mek.key } });

    const res = await axios.get(`https://api.fgmods.xyz/api/downloader/gdrive?url=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data?.download || !data.downloadUrl) return reply('⚠️ Failed to fetch Google Drive download link.');

    await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });
    reply('📥 *Downloading your file...*');

    await conn.sendMessage(from, {
      document: { url: data.downloadUrl },
      fileName: data.fileName || 'gdrive_file',
      mimetype: data.mimetype || 'application/octet-stream',
      contextInfo
    }, { quoted: mek });

  } catch (err) {
    console.error('GDrive Error:', err);
    reply('❌ Error: ' + err.message);
  }
});
