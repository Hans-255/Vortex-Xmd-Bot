'use strict';
const { adams } = require('../Hans/adams');
const { getRandomImage } = require('../Hans/images');

adams(
  { nomCom: 'alive', reaction: '🪄', nomFichier: __filename, categorie: 'General' },
  async (dest, zk, commandeOptions) => {
    const contactName = commandeOptions?.ms?.pushName || 'User';

    const timeZone = 'Africa/Nairobi';
    const localTime = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      hour12: false,
    }).format(new Date());
    const hour = parseInt(localTime, 10);

    let greeting = 'Good Night 🌙';
    if (hour >= 5 && hour < 12) greeting = 'Good Morning 🌅';
    else if (hour >= 12 && hour < 16) greeting = 'Good Afternoon ☀️';
    else if (hour >= 16 && hour < 20) greeting = 'Good Evening 🌠';

    const imageUrl = await getRandomImage();

    const aliveText = `╔══════════════════╗
║  🌟 *VORTEX XMD* 🌟  ║
╚══════════════════╝

*${greeting}, ${contactName}!*

✅ Bot is *ONLINE* and running!
⚡ Status: Active 24/7
🔰 Powered by VORTEX XMD

> Stay connected 🚀`;

    try {
      await zk.sendMessage(dest, {
        image: { url: imageUrl },
        caption: aliveText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363421513037430@newsletter',
            newsletterName: 'VORTEX XMD',
            serverMessageId: -1,
          },
        },
      }, { quoted: commandeOptions?.ms });
    } catch (error) {
      console.error('Alive command error:', error.message);
      await commandeOptions?.repondre(aliveText).catch(() => {});
    }
  }
);
