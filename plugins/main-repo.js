const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

// Verified contact
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
  pattern: "repo",
  alias: ["sc", "script", "info"],
  desc: "Fetch GitHub repository information",
  react: "🎗️",
  category: "info",
  filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
  const githubRepoURL = 'https://github.com/Hans-255/Vortex-Xmd';

  try {
    const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const repoData = await response.json();

    // 5 styles bila `description`
    const style1 = `
╭━━━「 ${config.BOT_NAME} REPO 」━━━➤
│ 📦 Name: ${repoData.name}
│ 👤 Owner: ${repoData.owner.login}
│ ⭐ Stars: ${repoData.stargazers_count}
│ 🍴 Forks: ${repoData.forks_count}
│ 🌐 URL: ${repoData.html_url}
╰━━━━━━━━━━━━━━━━━━━━━━━➤
🔗 ${config.DESCRIPTION}`;

    const style2 = `
┏━━━━━ ⍟ ${config.BOT_NAME} GitHub Repo ⍟ ━━━━━┓
┃ 🔖 Name : ${repoData.name}
┃ 👑 Owner : ${repoData.owner.login}
┃ 🌟 Stars : ${repoData.stargazers_count}
┃ 🍽️ Forks : ${repoData.forks_count}
┃ 🔗 Link : ${repoData.html_url}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
✨ ${config.DESCRIPTION}`;

    const style3 = `
━━━━━━━━━━━━━━━━━━━━
🔰 *${config.BOT_NAME} GitHub Info*
━━━━━━━━━━━━━━━━━━━━
🔹 *Name:* ${repoData.name}
🔹 *Owner:* ${repoData.owner.login}
🔹 *Stars:* ${repoData.stargazers_count}
🔹 *Forks:* ${repoData.forks_count}
🔹 *Link:* ${repoData.html_url}
━━━━━━━━━━━━━━━━━━━━
🔸 ${config.DESCRIPTION}`;

    const style4 = `
> ${config.BOT_NAME} :: Repository Info
----------------------------------------
[ Name  ] => ${repoData.name}
[ Owner ] => ${repoData.owner.login}
[ Stars ] => ${repoData.stargazers_count}
[ Forks ] => ${repoData.forks_count}
[ Link  ] => ${repoData.html_url}
----------------------------------------
${config.DESCRIPTION}`;

    const style5 = `
📦 *${config.BOT_NAME} REPO DETAILS* 📦
━━━━━━━━━━━━━━━━━━━━
🔰 *NAME:* ${repoData.name}
👤 *OWNER:* ${repoData.owner.login}
⭐ *STARS:* ${repoData.stargazers_count}
🍴 *FORKS:* ${repoData.forks_count}
🌐 *URL:* ${repoData.html_url}
━━━━━━━━━━━━━━━━━━━━
📌 ${config.DESCRIPTION}`;

    const styles = [style1, style2, style3, style4, style5];
    const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

    const scsFolder = path.join(__dirname, "../plugins");
    const images = fs.readdirSync(scsFolder).filter(f => /^menu\d+\.jpg$/i.test(f));
    const randomImage = images.length > 0
      ? fs.readFileSync(path.join(scsFolder, images[Math.floor(Math.random() * images.length)]))
      : null;

    const messageOptions = {
      image: randomImage || { url: "https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png" },
      caption: selectedStyle.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363421513037430@newsletter',
          newsletterName: config.OWNER_NAME || 'VORTEX XMD',
          serverMessageId: 143
        }
      }
    };

    await conn.sendMessage(from, messageOptions, { quoted: quotedContact });

  } catch (error) {
    console.error("Repo command error:", error);
    reply(`❌ Error: ${error.message}`);
  }
});
  
