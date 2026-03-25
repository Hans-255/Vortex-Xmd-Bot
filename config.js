const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {

// ─── SESSION ──────────────────────────────────────────────────────
SESSION_ID: process.env.SESSION_ID || "qTBlhL4S#wlyeEBUFqLuE9Y-2TqpOfq-QfJNpZrJ7YE4umGGtXZ4",
// Add your Session ID

// ─── BOT IDENTITY ─────────────────────────────────────────────────
BOT_NAME: process.env.BOT_NAME || "VORTEX-XMD",
// Bot display name

OWNER_NAME: process.env.OWNER_NAME || "HansTz",
// Bot owner name

OWNER_NUMBER: process.env.OWNER_NUMBER || "255753668403",
// Owner WhatsApp number (international format, no +)

DEV: process.env.DEV || "255753668403",
// Developer number (same as owner by default)

// ─── BOT MODE ─────────────────────────────────────────────────────
MODE: process.env.MODE || "public",
// public / private / inbox / group

PREFIX: process.env.PREFIX || ".",
// Command prefix

// ─── STATUS SETTINGS ──────────────────────────────────────────────
AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
// Automatically view statuses

AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
// Auto reply when viewing a status

AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
// Auto react to statuses with random emojis

AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN BY VORTEX XMD ⚡*",
// Message sent when auto-replying to statuses

// ─── AUTO FEATURES ────────────────────────────────────────────────
AUTO_TYPING: process.env.AUTO_TYPING || "true",
// Show typing indicator automatically

AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
// Show recording (audio) indicator automatically

AUTO_REACT: process.env.AUTO_REACT || "false",
// React with random emojis on every incoming message

AUTO_REPLY: process.env.AUTO_REPLY || "false",
// Auto-reply using data/autoreply.json

AUTO_STICKER: process.env.AUTO_STICKER || "false",
// Convert every image to sticker automatically

READ_MESSAGE: process.env.READ_MESSAGE || "false",
// Auto mark messages as read

READ_CMD: process.env.READ_CMD || "false",
// Mark commands as read

ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
// Keep bot presence as always online

AUTO_BIO: process.env.AUTO_BIO || "false",
// Auto-update bot bio/status message

CHAT_BOT: process.env.CHAT_BOT || "false",
// Enable AI chatbot mode

// ─── REACT EMOJIS ─────────────────────────────────────────────────
CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
// Use custom emoji list for reactions

CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍,⚡,🔥,🌟,✨,💫,🎯,🚀",
// Comma-separated list of emojis for random reactions

// ─── GROUP PROTECTION ─────────────────────────────────────────────
ANTI_LINK: process.env.ANTI_LINK || "true",
// Enable anti-link (use .antilink command to set mode per group)

ANTI_BAD: process.env.ANTI_BAD || "false",
// Block bad words in groups

ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",
// Notify on admin promote/demote events

WELCOME: process.env.WELCOME || "true",
// Welcome and goodbye messages in groups

// ─── ANTI FEATURES (Per-group via commands) ────────────────────────
// antilink: use .antilink on delete|warn|kick / .antilink off
// antibot:  use .antibot on / .antibot off
// antisticker: use .antisticker on delete|warn|kick / .antisticker off
// antitag: use .antitag on delete|warn|kick / .antitag off
// antimention: use .antimention on delete|warn|kick / .antimention off
// antiphoto: use .antiphoto on / .antiphoto off
// ban: reply to a message + .ban / .unban

// ─── ANTI VIEWONCE ────────────────────────────────────────────────
ANTI_VV: process.env.ANTI_VV || "true",
// Open view-once messages and send to owner

// ─── ANTI DELETE ──────────────────────────────────────────────────
ANTI_DELETE: process.env.ANTI_DELETE || "true",
// Resend deleted messages

ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log",
// 'log' = send to owner inbox | 'same' = resend in same chat

// ─── ANTI CALL ────────────────────────────────────────────────────
ANTI_CALL: process.env.ANTI_CALL || "true",
// Block incoming calls

// ─── MENTION & MEDIA ──────────────────────────────────────────────
MENTION_REPLY: process.env.MENTION_REPLY || "false",
// Auto reply when mentioned

MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://raw.githubusercontent.com/Hans-255/Vortex-Xmd/main/assets/vortex.jpg",
// Menu and mention reply image

ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Hans-255/Vortex-Xmd/main/assets/vortex.jpg",
// Image for alive command

STICKER_NAME: process.env.STICKER_NAME || "VORTEX-XMD",
// Sticker pack name

DESCRIPTION: process.env.DESCRIPTION || "*© POWERED BY VORTEX-XMD | HansTz*",
// Bot description text

LIVE_MSG: process.env.LIVE_MSG || "> Powered by *VORTEX-XMD | HansTz* ⚡",
// Alive message footer

PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
// Allow public usage

GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || "DsoPcRpOcCg73qya4cFeD3",
// WhatsApp group invite link code

CHANNEL_LINK: process.env.CHANNEL_LINK || "https://whatsapp.com/channel/0029Vb7JRfvCRs1gTmsCB812",
// WhatsApp channel link

};
