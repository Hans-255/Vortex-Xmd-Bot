const { cmd } = require("../command");

// Contact for verified quoting
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "VORTEX XMD VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:VORTEX XMD VERIFIED ✅"
    }
  }
};

cmd({
  pattern: "vv",
  alias: ["viewonce", "retrive"],
  react: '☢️',
  desc: "Owner Only - retrieve quoted view once message",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { from, isCreator }) => {
  try {
    if (!isCreator) {
      return await conn.sendMessage(from, {
        text: "*📛 This is an owner-only command.*",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363421513037430@newsletter",
            newsletterName: 'VORTEX XMD',
            serverMessageId: 13
          }
        }
      }, { quoted: quotedContact });
    }

    if (!m.quoted) {
      return await conn.sendMessage(from, {
        text: "*🍁 Please reply to a view once message.*",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363421513037430@newsletter",
            newsletterName: 'VORTEX XMD',
            serverMessageId: 13
          }
        }
      }, { quoted: quotedContact });
    }

    const buffer = await m.quoted.download?.();
    const mtype = m.quoted.mtype;

    if (!buffer || !mtype) {
      return await conn.sendMessage(from, {
        text: "❌ Unable to download the message or unsupported type.",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363421513037430@newsletter",
            newsletterName: 'VORTEX XMD',
            serverMessageId: 13
          }
        }
      }, { quoted: quotedContact });
    }

    let content = {};

    switch (mtype) {
      case "imageMessage":
        content = {
          image: buffer,
          caption: m.quoted.text || "📷 Image restored"
        };
        break;
      case "videoMessage":
        content = {
          video: buffer,
          caption: m.quoted.text || "🎥 Video restored"
        };
        break;
      case "audioMessage":
        content = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: m.quoted.ptt || false
        };
        break;
      default:
        return await conn.sendMessage(from, {
          text: "❌ Only image, video, and audio view once messages are supported.",
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363421513037430@newsletter",
              newsletterName: 'VORTEX XMD',
              serverMessageId: 13
            }
          }
        }, { quoted: quotedContact });
    }

    // Send restored content with newsletter context
    await conn.sendMessage(from, {
      ...content,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363421513037430@newsletter",
          newsletterName: 'VORTEX XMD',
          serverMessageId: 13
        }
      }
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("vv Error:", error);
    await conn.sendMessage(from, {
      text: `❌ Error occurred while retrieving view once:\n\n${error.message || error}`
    }, { quoted: quotedContact });
  }
});
