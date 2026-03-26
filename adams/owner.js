const { adams } = require('../Hans/adams');
const conf = require('../config');

adams({
    nomCom: 'owner',
    aliases: ['creator', 'dev'],
    categorie: 'General',
    reaction: '👑',
}, async (dest, zk, { ms, repondre }) => {
    const ownerNumber = conf.OWNER_NUMBER || '255753668403';
    const ownerName = conf.OWNER_NAME || 'HansTz';
    const botName = conf.BOT_NAME || 'VORTEX XMD';

    await zk.sendMessage(dest, {
        text: `👑 *${botName} Owner Info* 👑\n\n` +
              `👤 *Name:* ${ownerName}\n` +
              `📞 *Number:* wa.me/${ownerNumber}\n` +
              `🤖 *Bot:* ${botName}\n\n` +
              `> *Contact owner for support!*`
    }, { quoted: ms });
});
