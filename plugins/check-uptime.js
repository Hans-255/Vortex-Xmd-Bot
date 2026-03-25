const { cmd } = require('../command');
const { getRandomImage, NEWSLETTER } = require('../lib/media');
const os = require('os');
const process = require('process');

function fancyUptime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d ? d + 'd ' : ''}${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s}s`.trim() || '0s';
}

cmd({
  pattern: 'alive',
  alias: ['av', 'runtime', 'uptime'],
  desc: 'Check bot uptime and system status',
  category: 'main',
  react: '🟢',
  filename: __filename
},
async (conn, mek, m, { from, reply, botNumber, pushname }) => {
  try {
    const nodeVersion = process.version;
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const botName = pushname || 'VORTEX XMD';

    const status = `✦━━━━━━━━━━━━━━━━━━━━━━━✦
   🟢  V O R T E X  X M D  🟢
✦━━━━━━━━━━━━━━━━━━━━━━━✦
◈ Bot Name  ⟫  ${botName}
◈ Bot ID    ⟫  @${botNumber.replace(/@.+/, '')}
◈ Owner     ⟫  HansTz
◈ Uptime    ⟫  ${fancyUptime(process.uptime())}
◈ Node.js   ⟫  ${nodeVersion}
◈ RAM       ⟫  ${usedMem}MB / ${totalMem}MB
◈ Version   ⟫  v1.0.0
✦━━━━━━━━━━━━━━━━━━━━━━━✦
⚡ *VORTEX XMD* — Always Online`;

    await conn.sendMessage(from, {
      image: { url: getRandomImage() },
      caption: status,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER.newsletterJid,
          newsletterName: NEWSLETTER.newsletterName,
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error('Error in alive command:', e);
    reply(`❌ Error: ${e.message}`);
  }
});
