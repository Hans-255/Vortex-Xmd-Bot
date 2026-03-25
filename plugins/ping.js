const config = require('../config');
const { cmd } = require('../command');

cmd({
  pattern: 'ping',
  alias: ['speed', 'pong'],
  use: '.ping',
  desc: 'Check bot response speed',
  category: 'main',
  react: '⚡',
  filename: __filename,
}, async (conn, mek, msg, { from, sender, reply }) => {
  try {
    const start = Date.now();

    const statuses = ['Excellent ✦', 'Very Fast ✦', 'Fast ✦', 'Good ✦', 'Stable ✦'];
    const randStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const ping = Date.now() - start;
    let quality = '⚡ Fast';
    if (ping > 1000) quality = '🐢 Slow';
    else if (ping > 300) quality = '🟡 Normal';

    let profilePic;
    try {
      profilePic = await conn.profilePictureUrl(sender, 'image');
    } catch {
      profilePic = 'https://i.ibb.co/J23wbKN/default.jpg';
    }

    const botName = config.BOT_NAME || 'VORTEX XMD';

    const caption = `✦━━━━━━━━━━━━━━━━━━━━━━━✦
   ⚡  V O R T E X  X M D  ⚡
✦━━━━━━━━━━━━━━━━━━━━━━━✦
◈ Bot      ⟫  ${botName}
◈ Latency  ⟫  ${ping}ms
◈ Quality  ⟫  ${quality}
◈ Status   ⟫  ${randStatus}
◈ Date     ⟫  ${new Date().toLocaleString()}
✦━━━━━━━━━━━━━━━━━━━━━━━✦
⚡ *VORTEX XMD* — Always Online`;

    await conn.sendMessage(from, {
      image: { url: profilePic },
      caption,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363421513037430@newsletter',
          newsletterName: 'VORTEX XMD',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (err) {
    console.error('Ping error:', err);
    reply('❌ Error: ' + err.message);
  }
});
