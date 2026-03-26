'use strict';
const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

// ─────────────────────────────────────────────────────────────────────────────
//  VORTEX XMD  —  Configuration
//  Reads from Heroku config vars (process.env) or config.env for local dev.
//  Do NOT hardcode secrets here — set them as Heroku config vars.
// ─────────────────────────────────────────────────────────────────────────────

const conf = {

    // ══════════════════════════════════════════════════
    //                      SESSION
    // ══════════════════════════════════════════════════
    SESSION_ID:           process.env.SESSION_ID           || '',
    session:              process.env.SESSION_ID           || '', // alias used by index.js

    // ══════════════════════════════════════════════════
    //                       OWNER
    // ══════════════════════════════════════════════════
    OWNER_NUMBER:         process.env.OWNER_NUMBER         || '',
    OWNER:                process.env.OWNER_NUMBER         || '', // alias
    OWNER_NAME:           process.env.OWNER_NAME           || 'HansTz',
    DEV:                  process.env.DEV                  || process.env.OWNER_NUMBER || '',

    // ══════════════════════════════════════════════════
    //                    ANTI CALL
    // ══════════════════════════════════════════════════
    ANTI_CALL:            process.env.ANTI_CALL            || process.env.AUTO_REJECT_CALL || 'false',
    ANTI_CALL_BLOCK:      process.env.ANTI_CALL_BLOCK      || process.env.ANTICALL_BLOCK   || 'false',
    // Legacy aliases used by index.js and herokuvars.js
    ANTICALL:             process.env.ANTI_CALL            || process.env.AUTO_REJECT_CALL || 'false',
    ANTICALL_BLOCK:       process.env.ANTI_CALL_BLOCK      || process.env.ANTICALL_BLOCK   || 'false',
    AUTO_REJECT_CALL:     process.env.ANTI_CALL            || process.env.AUTO_REJECT_CALL || 'false',

    // ══════════════════════════════════════════════════
    //                       MODE
    // ══════════════════════════════════════════════════
    MODE:                 process.env.MODE                 || 'public',
    PUBLIC_MODE:          process.env.PUBLIC_MODE          || 'yes',
    ALWAYS_ONLINE:        process.env.ALWAYS_ONLINE        || 'false',
    ETAT:                 process.env.PRESENCE             || '0',
    PRESENCE:             process.env.PRESENCE             || '0',

    // ══════════════════════════════════════════════════
    //                     CHATBOT
    // ══════════════════════════════════════════════════
    CHAT_BOT:             process.env.CHAT_BOT             || process.env.CHATBOT || 'false',
    CHATBOT:              process.env.CHAT_BOT             || process.env.CHATBOT || 'false', // alias
    AUDIO_CHATBOT:        process.env.AUDIO_CHATBOT        || 'false',

    // ══════════════════════════════════════════════════
    //                    MESSAGES
    // ══════════════════════════════════════════════════
    ANTI_DELETE:          process.env.ANTI_DELETE          || 'true',
    ANTIDELETE1:          process.env.ANTIDELETE_RECOVER_CONVENTION || process.env.ANTI_DELETE || 'no',
    ANTIDELETE2:          process.env.ANTIDELETE_SENT_INBOX || 'yes',
    ANTIDELETE_RECOVER_CONVENTION: process.env.ANTIDELETE_RECOVER_CONVENTION || 'no',
    ANTIDELETE_SENT_INBOX: process.env.ANTIDELETE_SENT_INBOX || 'yes',
    READ_MESSAGE:         process.env.READ_MESSAGE         || process.env.AUTO_READ || 'false',
    AUTO_READ:            process.env.AUTO_READ            || process.env.READ_MESSAGE || 'yes',
    AUTO_REACT:           process.env.AUTO_REACT           || 'false',
    AUTO_REPLY:           process.env.AUTO_REPLY           || 'false',
    AUTO_REPLY_STATUS:    process.env.AUTO_REPLY_STATUS    || 'no',
    AUTO_TYPING:          process.env.AUTO_TYPING          || 'false',
    AUTO_RECORDING:       process.env.AUTO_RECORDING       || 'false',
    AUTO_BIO:             process.env.AUTO_BIO             || 'no',
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
    AUTO_SAVE_CONTACTS:   process.env.AUTO_SAVE_CONTACTS   || 'yes',
    READ_CMD:             process.env.READ_CMD             || 'false',

    // ══════════════════════════════════════════════════
    //                      GROUP
    // ══════════════════════════════════════════════════
    WELCOME:              process.env.WELCOME              || 'false',
    WELCOME_MESSAGE:      process.env.WELCOME_MESSAGE      || process.env.WELCOME || 'no',
    GOODBYE_MESSAGE:      process.env.GOODBYE_MESSAGE      || 'no',
    ADMIN_EVENTS:         process.env.ADMIN_EVENTS         || 'false',
    ANTI_LINK:            process.env.ANTI_LINK            || process.env.GROUPANTILINK || 'false',
    ANTI_LINK_KICK:       process.env.ANTI_LINK_KICK       || process.env.GROUPANTILINK_REMOVE || 'false',
    GROUP_ANTILINK:       process.env.GROUPANTILINK_REMOVE || process.env.GROUPANTILINK || 'no',
    GROUPANTILINK:        process.env.GROUPANTILINK_REMOVE || process.env.GROUPANTILINK || 'no',
    GROUPANTILINK_REMOVE: process.env.GROUPANTILINK_REMOVE || 'no',
    ANTI_BAD:             process.env.ANTI_BAD             || 'false',
    DELETE_LINKS:         process.env.DELETE_LINKS         || 'false',
    MENTION_REPLY:        process.env.MENTION_REPLY        || 'false',

    // ══════════════════════════════════════════════════
    //                      STATUS
    // ══════════════════════════════════════════════════
    AUTO_STATUS_SEEN:     process.env.AUTO_STATUS_SEEN     || process.env.AUTO_READ_STATUS || 'true',
    AUTO_STATUS_REPLY:    process.env.AUTO_STATUS_REPLY    || process.env.AUTO_REPLY_STATUS || 'false',
    AUTO_STATUS_REACT:    process.env.AUTO_STATUS_REACT    || process.env.AUTO_REACT_STATUS || 'true',
    AUTO_STATUS_MSG:      process.env.AUTO_STATUS_MSG      || process.env.REPLY_STATUS_TEXT || '',
    // Legacy aliases
    AUTO_READ_STATUS:     process.env.AUTO_READ_STATUS     || process.env.AUTO_STATUS_SEEN || 'yes',
    AUTO_REACT_STATUS:    process.env.AUTO_REACT_STATUS    || process.env.AUTO_STATUS_REACT || 'yes',
    REPLY_STATUS_TEXT:    process.env.REPLY_STATUS_TEXT    || process.env.AUTO_STATUS_MSG || '',

    // ══════════════════════════════════════════════════
    //                   BOT APPEARANCE
    // ══════════════════════════════════════════════════
    PREFIX:               process.env.PREFIX               || '.',
    BOT_NAME:             process.env.BOT_NAME             || '𝐕𝐎𝐑𝐓𝐄𝐗-𝐗𝐌𝐃',
    STICKER_NAME:         process.env.STICKER_NAME         || '𝐕𝐎𝐑𝐓𝐄𝐗-𝐗𝐌𝐃',
    ALIVE_IMG:            process.env.ALIVE_IMG            || process.env.MENU_IMAGE_URL || 'https://files.catbox.moe/di5kdx.jpg',
    MENU_IMAGE_URL:       process.env.MENU_IMAGE_URL       || 'https://files.catbox.moe/di5kdx.jpg',
    LIVE_MSG:             process.env.LIVE_MSG             || '> 𝐕𝐎𝐑𝐓𝐄𝐗-𝐗𝐌𝐃⚡ IS ALIVE',
    DESCRIPTION:          process.env.DESCRIPTION          || '*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ HansTz*',
    STARTING_BOT_MESSAGE: process.env.STARTING_BOT_MESSAGE || 'yes',
    DP:                   process.env.STARTING_BOT_MESSAGE || 'yes',
    HEROKU_APP_NAME:      process.env.HEROKU_APP_NAME      || 'vortex',
    HEROKU_API_KEY:       process.env.HEROKU_API_KEY       || '',
    TZ:                   process.env.TZ                   || 'Africa/Nairobi',
    WEB:                  process.env.WEB                  || 'https://github.com/Hans-255/Vortex-Xmd-Bot',
    GURL:                 process.env.GURL                 || 'https://whatsapp.com/channel/0029VaAjYcNEFeOcSU2L2E0b',

    // ══════════════════════════════════════════════════
    //                    REACTIONS
    // ══════════════════════════════════════════════════
    CUSTOM_REACT:         process.env.CUSTOM_REACT         || 'false',
    CUSTOM_REACT_EMOJIS:  process.env.CUSTOM_REACT_EMOJIS  || process.env.STATUS_REACT_EMOJIS || '🔥,⚡,🌎,🚀,💯,🏆,✨,🌟,🎯,🎉,💖,🙏,👑,🌈,💪',
    STATUS_REACT_EMOJIS:  process.env.STATUS_REACT_EMOJIS  || process.env.CUSTOM_REACT_EMOJIS || '🔥,⚡,🌎,🚀,💯,🏆,✨,🌟,🎯,🎉,💖,🙏,👑,🌈,💪',

    // ══════════════════════════════════════════════════
    //                     PRIVACY
    // ══════════════════════════════════════════════════
    ANTI_VV:              process.env.ANTI_VV              || 'true',

    // ══════════════════════════════════════════════════
    //                    STICKER
    // ══════════════════════════════════════════════════
    AUTO_STICKER:         process.env.AUTO_STICKER         || 'false',
    AUDIO_REPLY:          process.env.AUDIO_REPLY          || 'yes',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Backward-compatibility shim — used by herokuvars.js command handlers.
//  setSetting updates the in-memory object for the current session.
//  To make changes permanent, update Heroku config vars in the dashboard.
// ─────────────────────────────────────────────────────────────────────────────
const hybridConfig = {
    getSetting: (key, defaultVal) => conf[key] !== undefined ? conf[key] : defaultVal,
    setSetting: async (key, value) => {
        conf[key] = value;
        // Keep friendly aliases in sync
        if (key === 'ANTI_CALL'  || key === 'AUTO_REJECT_CALL') {
            conf.ANTICALL = value; conf.AUTO_REJECT_CALL = value; conf.ANTI_CALL = value;
        }
        if (key === 'ANTI_CALL_BLOCK' || key === 'ANTICALL_BLOCK') {
            conf.ANTICALL_BLOCK = value; conf.ANTI_CALL_BLOCK = value;
        }
        if (key === 'PUBLIC_MODE')       conf.MODE = value;
        if (key === 'PRESENCE')          { conf.ETAT = value; conf.PRESENCE = value; }
        if (key === 'STARTING_BOT_MESSAGE') conf.DP = value;
        if (key === 'GROUPANTILINK_REMOVE' || key === 'GROUPANTILINK') {
            conf.GROUP_ANTILINK = value; conf.GROUPANTILINK = value;
        }
        if (key === 'ANTIDELETE_RECOVER_CONVENTION') conf.ANTIDELETE1 = value;
        if (key === 'ANTIDELETE_SENT_INBOX')         conf.ANTIDELETE2 = value;
        if (key === 'AUTO_READ_STATUS' || key === 'AUTO_STATUS_SEEN') {
            conf.AUTO_READ_STATUS = value; conf.AUTO_STATUS_SEEN = value;
        }
        if (key === 'AUTO_REACT_STATUS' || key === 'AUTO_STATUS_REACT') {
            conf.AUTO_REACT_STATUS = value; conf.AUTO_STATUS_REACT = value;
        }
        if (key === 'CHAT_BOT' || key === 'CHATBOT') {
            conf.CHATBOT = value; conf.CHAT_BOT = value;
        }
        return true;
    }
};

module.exports = conf;
module.exports.hybridConfig = hybridConfig;
