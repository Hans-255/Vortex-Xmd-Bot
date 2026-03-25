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
  pattern: "rw",
  alias: ["randomw", "wallpaper"],
  react: "🌌",
  desc: "Download random wallpapers based on keywords.",
  category: "wallpapers",
  use: ".rw <keyword>",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const query = args.join(" ") || "random";
    const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;

    const { data } = await axios.get(apiUrl);

    if (data.status && data.imgUrl) {
      const caption = `┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🌌 *Random Wallpaper: ${query}*
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ > *© Powered by VORTEX XMD*
┗━━━━━━━━━━━━━━━━━━━━━━━`;

      await conn.sendMessage(from, {
        image: { url: data.imgUrl },
        caption,
        ...newsletterContext
      }, { quoted: quotedContact });

    } else {
      reply(`❌ No wallpaper found for *"${query}"*.`);
    }
  } catch (error) {
    console.error("Wallpaper Error:", error);
    reply("❌ An error occurred while fetching the wallpaper. Please try again.");
  }
});
