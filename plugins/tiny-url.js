const { cmd } = require("../command");
const axios = require("axios");

// VCard Contact (HansTz VERIFIED ✅)
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

// Newsletter context
const newsletterContext = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363421513037430@newsletter",
      newsletterName: 'VORTEX XMD',
      serverMessageId: 1
    }
  }
};

cmd({
    pattern: "tiny",
    alias: ['short', 'shorturl'],
    react: "🫧",
    desc: "Makes URL tiny.",
    category: "convert",
    use: "<url>",
    filename: __filename,
},
async (conn, mek, m, { from, reply, args }) => {
    if (!args[0]) {
        return reply("*🏷️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ʟɪɴᴋ.*");
    }

    try {
        const link = args[0];
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`);
        const shortenedUrl = response.data;

        // Box style caption
        const caption = `┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🛡️ *URL Shortener*
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ 🔗 Original: ${link}
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ ✂️ Shortened: ${shortenedUrl}
┗━━━━━━━━━━━━━━━━━━━━━━━
🔗 Powered by VORTEX XMD`;

        // Send message with box, newsletter context, and quoted contact
        await conn.sendMessage(from, {
            text: caption,
            ...newsletterContext
        }, { quoted: quotedContact });

    } catch (e) {
        console.error("Error shortening URL:", e);
        reply("❌ An error occurred while shortening the URL. Please try again.");
    }
});
