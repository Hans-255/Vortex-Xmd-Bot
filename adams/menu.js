const { adams } = require('../Hans/adams');
const conf = require('../config');
const moment = require('moment-timezone');

adams({
    nomCom: 'menu',
    aliases: ['help', 'list', 'cmds'],
    categorie: 'General',
    reaction: '📋',
}, async (dest, zk, { ms, repondre, auteurMessage }) => {
    const now = moment().tz('Africa/Dar_es_Salaam');
    const time = now.format('HH:mm:ss');
    const date = now.format('DD/MM/YYYY');

    const menu = `╔═══════════════════╗
║   🌟 *VORTEX XMD* 🌟   ║
╚═══════════════════╝

👤 *User:* @${auteurMessage.split('@')[0]}
⏰ *Time:* ${time}
📅 *Date:* ${date}
🔰 *Prefix:* ${conf.PREFIX}

╔═══ 🛠️ *GENERAL* ═══╗
║ ${conf.PREFIX}ping - Check bot speed
║ ${conf.PREFIX}menu - Show this menu
║ ${conf.PREFIX}owner - Bot owner info
║ ${conf.PREFIX}info - Bot information
╚═══════════════════╝

╔═══ 🎭 *GAMES* ═══╗
║ ${conf.PREFIX}truth - Truth question
║ ${conf.PREFIX}dare - Dare question
║ ${conf.PREFIX}tictactoe - Play TicTacToe
╚═══════════════════╝

╔═══ 👥 *GROUP* ═══╗
║ ${conf.PREFIX}kick - Kick member
║ ${conf.PREFIX}add - Add member
║ ${conf.PREFIX}promote - Promote member
║ ${conf.PREFIX}demote - Demote member
║ ${conf.PREFIX}link - Get group link
║ ${conf.PREFIX}revoke - Reset group link
║ ${conf.PREFIX}hidetag - Tag all members
║ ${conf.PREFIX}kick - Remove member
╚═══════════════════╝

╔═══ 🔒 *OWNER* ═══╗
║ ${conf.PREFIX}restart - Restart bot
║ ${conf.PREFIX}setvar - Set variable
║ ${conf.PREFIX}getvar - Get variable
║ ${conf.PREFIX}status - Bot status
╚═══════════════════╝

> *Powered by VORTEX XMD*`;

    await zk.sendMessage(dest, {
        text: menu,
        mentions: [auteurMessage]
    }, { quoted: ms });
});
