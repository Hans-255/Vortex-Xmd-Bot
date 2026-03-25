const config = require('../config');
const { cmd } = require('../command');
const { getRandomImage, NEWSLETTER } = require('../lib/media');

const quotedContact = {
  key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
  message: {
    contactMessage: {
      displayName: 'VORTEX XMD VERIFIED ✅',
      vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:VORTEX XMD VERIFIED ✅\nORG:VORTEX XMD;\nTEL;type=CELL;type=VOICE;waid=255753668403:+255753668403\nEND:VCARD'
    }
  }
};

cmd({
  pattern: 'menu',
  alias: ['allmenu', 'command'],
  use: '.menu',
  desc: 'Display all bot commands',
  category: 'menu',
  react: '⚡',
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const imageUrl = getRandomImage();

    const dec = `✦━━━━━━━━━━━━━━━━━━━━━━━✦
    ⚡  V O R T E X  X M D  ⚡
✦━━━━━━━━━━━━━━━━━━━━━━━✦
◈ Owner    ⟫  ${config.OWNER_NAME}
◈ Runtime  ⟫  Node.js
◈ Library  ⟫  Baileys MD
◈ Mode     ⟫  ${config.MODE}
◈ Prefix   ⟫  [ ${config.PREFIX} ]
◈ Build    ⟫  v1.0.0
✦━━━━━━━━━━━━━━━━━━━━━━━✦

⬡──【 🛠️ TOOL LIST 】──⬡
⌦ gpt        ⌦ vv         ⌦ vv2
⌦ bible      ⌦ channel    ⌦ unblock
⌦ block      ⌦ gitclone   ⌦ check
⌦ ping       ⌦ pair       ⌦ owner
⌦ getpp      ⌦ github     ⌦ listonline
⌦ alive      ⌦ menu       ⌦ repo
⌦ attp       ⌦ post       ⌦ restart
⌦ send       ⌦ save       ⌦ sticker
⌦ take       ⌦ jid        ⌦ uptime
⬡━━━━━━━━━━━━━━━━━━━━━━━━━⬡

⬡──【 📥 TOOL DOWNLOAD 】──⬡
⌦ fb         ⌦ play       ⌦ apk
⌦ video      ⌦ img        ⌦ tiktok
⌦ fancy      ⌦ imgscan    ⌦ stabilityai
⌦ fluxai     ⌦ iyrics     ⌦ movie
⌦ screenshot ⌦ rw         ⌦ toppt
⌦ tomp3      ⌦ short      ⌦ convert
⌦ trt        ⌦ yts        ⌦ url
⬡━━━━━━━━━━━━━━━━━━━━━━━━━━━⬡

⬡──【 👥 TOOL GROUP 】──⬡
⌦ gdesc      ⌦ add        ⌦ kick
⌦ hidetag    ⌦ tagall     ⌦ antilink
⌦ welcome    ⌦ gname      ⌦ ginfo
⌦ join       ⌦ link       ⌦ vcf
⌦ left       ⌦ mute       ⌦ out
⌦ unmute     ⌦ newgc      ⌦ deletelink
⬡━━━━━━━━━━━━━━━━━━━━━━━━━⬡

⬡──【 ⚙️ TOOL SETTINGS 】──⬡
⌦ antidelete    ⌦ anticall
⌦ autotyping    ⌦ autorecording
⌦ mode          ⌦ statusreact
⌦ readmessage   ⌦ statusreply
⌦ autoreact     ⌦ autoreply
⬡━━━━━━━━━━━━━━━━━━━━━━━━━━━⬡
⚡ *VORTEX XMD* — Next Level Bot`;

    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: dec,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER.newsletterJid,
          newsletterName: NEWSLETTER.newsletterName
        }
      }
    }, { quoted: quotedContact });

  } catch (e) {
    reply('Error: ' + e.message);
  }
});
