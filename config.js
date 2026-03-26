'use strict';

// Simple in-memory settings store populated from process.env at startup.
// No Heroku API, no hybridConfig, no restarts on changes. config.env is the source of truth.
const _s = {
    // Identity
    BOT_NAME:            process.env.BOT_NAME            || 'VORTEX XMD',
    PREFIX:              process.env.PREFIX               || '.',
    OWNER:               process.env.OWNER               || process.env.OWNER_NUMBER || '',
    OWNER_NUMBER:        process.env.OWNER_NUMBER         || process.env.OWNER        || '',
    OWNER_NAME:          process.env.OWNER_NAME           || 'HansTz',
    SESSION_ID:          process.env.SESSION_ID           || '',
    session:             process.env.SESSION_ID           || '',  // alias used by index.js
    HEROKU_APP_NAME:     process.env.HEROKU_APP_NAME      || 'vortex',
    HEROKU_API_KEY:      process.env.HEROKU_API_KEY       || '',
    TZ:                  process.env.TZ                   || 'Africa/Nairobi',
    GURL:                process.env.GURL                 || 'https://whatsapp.com/channel/0029VaAjYcNEFeOcSU2L2E0b',
    WEB:                 process.env.WEB                  || 'https://github.com/Hans-255/Vortex-Xmd-Bot',

    // Feature flags (friendly names)
    MODE:                process.env.PUBLIC_MODE          || 'yes',
    ANTICALL:            process.env.AUTO_REJECT_CALL     || 'no',
    ANTICALL_BLOCK:      process.env.ANTICALL_BLOCK       || 'no',
    ANTIDELETE1:         process.env.ANTIDELETE_RECOVER_CONVENTION || 'no',
    ANTIDELETE2:         process.env.ANTIDELETE_SENT_INBOX || 'yes',
    ETAT:                process.env.PRESENCE             || '0',
    PRESENCE:            process.env.PRESENCE             || '0',
    DP:                  process.env.STARTING_BOT_MESSAGE || 'yes',
    GROUP_ANTILINK:      process.env.GROUPANTILINK_REMOVE || process.env.GROUPANTILINK || 'no',
    GROUP_ANTILINK2:     process.env.GROUPANTILINK_DELETE_ONLY || 'yes',

    // Auto features (raw env var names for compatibility)
    AUTO_REACT_STATUS:   process.env.AUTO_REACT_STATUS    || 'yes',
    AUTO_READ_STATUS:    process.env.AUTO_READ_STATUS      || 'yes',
    AUTO_REACT:          process.env.AUTO_REACT            || 'no',
    AUTO_READ:           process.env.AUTO_READ             || 'yes',
    AUTO_REPLY:          process.env.AUTO_REPLY            || 'yes',
    AUTO_REPLY_STATUS:   process.env.AUTO_REPLY_STATUS     || 'no',
    AUTO_SAVE_CONTACTS:  process.env.AUTO_SAVE_CONTACTS    || 'yes',
    AUTO_BIO:            process.env.AUTO_BIO              || 'no',
    AUTO_DOWNLOAD_STATUS:process.env.AUTO_DOWNLOAD_STATUS  || 'no',
    AUTO_REJECT_CALL:    process.env.AUTO_REJECT_CALL      || 'no',
    CHATBOT:             process.env.CHATBOT               || 'no',
    AUDIO_CHATBOT:       process.env.AUDIO_CHATBOT         || 'no',
    WELCOME_MESSAGE:     process.env.WELCOME_MESSAGE       || 'no',
    GOODBYE_MESSAGE:     process.env.GOODBYE_MESSAGE       || 'no',
    STARTING_BOT_MESSAGE:process.env.STARTING_BOT_MESSAGE  || 'yes',
    PUBLIC_MODE:         process.env.PUBLIC_MODE           || 'yes',
    GROUPANTILINK:       process.env.GROUPANTILINK_REMOVE  || process.env.GROUPANTILINK || 'no',
    GROUPANTILINK_REMOVE:process.env.GROUPANTILINK_REMOVE  || 'no',
    ANTIDELETE_RECOVER_CONVENTION: process.env.ANTIDELETE_RECOVER_CONVENTION || 'no',
    ANTIDELETE_SENT_INBOX: process.env.ANTIDELETE_SENT_INBOX || 'yes',
    STATUS_REACT_EMOJIS: process.env.STATUS_REACT_EMOJIS || '🔥,⚡,🌎,🚀,💯,🏆,✨,🌟,🎯,🎉,💖,🙏,👑,🌈,💪',
    REPLY_STATUS_TEXT:   process.env.REPLY_STATUS_TEXT    || '',
    AUDIO_REPLY:         process.env.AUDIO_REPLY          || 'yes',
};

// Export as Proxy so conf.X reads always reflect current in-memory value
const conf = new Proxy(_s, {
    get(t, k) { return t[k]; },
    set(t, k, v) { t[k] = v; return true; }
});

// Backward-compatibility shim for herokuvars.js that used hybridConfig
// setSetting now just updates the in-memory store (no Heroku API, no restart)
const hybridConfig = {
    getSetting: (key, defaultVal) => _s[key] !== undefined ? _s[key] : defaultVal,
    setSetting: async (key, value) => {
        _s[key] = value;
        // Sync friendly name aliases
        if (key === 'AUTO_REJECT_CALL') _s.ANTICALL = value;
        if (key === 'ANTICALL_BLOCK')   _s.ANTICALL_BLOCK = value;
        if (key === 'PUBLIC_MODE')       _s.MODE = value;
        if (key === 'ANTIDELETE_RECOVER_CONVENTION') _s.ANTIDELETE1 = value;
        if (key === 'ANTIDELETE_SENT_INBOX')         _s.ANTIDELETE2 = value;
        if (key === 'PRESENCE')          { _s.ETAT = value; _s.PRESENCE = value; }
        if (key === 'STARTING_BOT_MESSAGE') _s.DP = value;
        if (key === 'GROUPANTILINK_REMOVE' || key === 'GROUPANTILINK')
            { _s.GROUP_ANTILINK = value; _s.GROUPANTILINK = value; }
        return true;
    }
};

module.exports = conf;
module.exports.hybridConfig = hybridConfig;
