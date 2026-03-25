const config = require('../config');
const { cmd } = require('../command');
const { getGroupAdmins } = require('../lib/functions');

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
  pattern: 'ginfo',
  react: '📊',
  alias: ['groupinfo'],
  desc: 'Get group information',
  category: 'group',
  use: '.ginfo',
  filename: __filename
},
async (conn, mek, m, { from, isGroup, participants, reply }) => {
  try {
    if (!isGroup) return reply('❌ This command works in groups only.');

    let ppUrl = await conn.profilePictureUrl(from, 'image').catch(() => null);
    if (!ppUrl) ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';

    const metadata = await conn.groupMetadata(from);
    const groupAdmins = participants.filter(p => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `  ◈ ${i + 1}. @${v.id.split('@')[0]}`).join('\n');
    const owner = metadata.owner || metadata.participants.find(p => p.admin === 'superadmin')?.id;

    const gdata = `✦━━━━━━━━━━━━━━━━━━━━━━━✦
   📊  G R O U P  I N F O  📊
✦━━━━━━━━━━━━━━━━━━━━━━━✦
◈ Name     ⟫  ${metadata.subject}
◈ Group ID ⟫  ${metadata.id}
◈ Members  ⟫  ${metadata.size}
◈ Creator  ⟫  @${owner?.split('@')[0] || 'Unknown'}
✦━━━━━━━━━━━━━━━━━━━━━━━✦
◈ Description:
  ${metadata.desc?.toString() || 'No description set.'}
✦━━━━━━━━━━━━━━━━━━━━━━━✦
◈ Admins (${groupAdmins.length}):
${listAdmin}
✦━━━━━━━━━━━━━━━━━━━━━━━✦
⚡ *VORTEX XMD*`;

    await conn.sendMessage(from, {
      image: { url: ppUrl },
      caption: gdata,
      contextInfo: {
        mentionedJid: groupAdmins.map(v => v.id).concat(owner).filter(Boolean),
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363421513037430@newsletter',
          newsletterName: 'VORTEX XMD',
          serverMessageId: 143
        }
      }
    }, { quoted: quotedContact });

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
