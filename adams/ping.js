const { adams } = require('../Hans/adams');

adams({
    nomCom: 'ping',
    aliases: ['speed', 'pong'],
    categorie: 'General',
    reaction: '🏓',
}, async (dest, zk, { ms, repondre }) => {
    const start = Date.now();
    await repondre('🏓 *Pong!*');
    const end = Date.now();
    await zk.sendMessage(dest, {
        text: `⚡ *Speed:* ${end - start}ms\n🤖 *VORTEX XMD* is running perfectly!`
    }, { quoted: ms });
});
