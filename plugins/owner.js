const { cmd } = require('../command');
const config = require('../config');

const quotedContact = {
  key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
  message: {
    contactMessage: {
      displayName: 'VORTEX XMD VERIFIED ✅',
      vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:VORTEX XMD VERIFIED ✅'
    }
  }
};

cmd({
  pattern: 'owner',
  react: '👑',
  desc: 'Get owner contact details',
  category: 'main',
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
    const ownerNumber = config.OWNER_NUMBER;
    const ownerName = config.OWNER_NAME;

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName} 👑\nTEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\nEND:VCARD`;

    await conn.sendMessage(from, {
      contacts: {
        displayName: ownerName,
        contacts: [{ vcard }]
      }
    });

    const caption = `✦━━━━━━━━━━━━━━━━━━━━━━━✦
      👑  O W N E R  I N F O  👑
✦━━━━━━━━━━━━━━━━━━━━━━━✦
◈ Name     ⟫  ${ownerName}
◈ Number   ⟫  ${ownerNumber}
◈ Role     ⟫  Developer & Founder
◈ Bot      ⟫  VORTEX XMD
◈ Version  ⟫  v1.0.0
✦━━━━━━━━━━━━━━━━━━━━━━━✦
⚡ *VORTEX XMD* — Built by HansTz`;

    await conn.sendMessage(from, {
      text: caption,
      contextInfo: {
        mentionedJid: [`${ownerNumber.replace('+', '')}@s.whatsapp.net`],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363421513037430@newsletter',
          newsletterName: 'VORTEX XMD',
          serverMessageId: 143
        }
      }
    }, { quoted: quotedContact });

  } catch (error) {
    console.error(error);
    reply(`❌ Error: ${error.message}`);
  }
});
