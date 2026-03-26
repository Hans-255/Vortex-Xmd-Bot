const { adams, cm } = require('../Hans/adams');
const { getRandomImage } = require('../Hans/images');
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");

const commandTriggers = ["cmds", "cmd", "commands", "help", "list"];

commandTriggers.forEach(trigger => {
    adams({ 
        nomCom: trigger, 
        categorie: "General" 
    }, async (dest, zk, commandeOptions) => {
        const { ms, auteurMessage } = commandeOptions;
        
        const userName = ms?.pushName || "User";
        moment.tz.setDefault(s.TZ || "Africa/Nairobi");
        const time = moment().format("h:mm A");
        const date = moment().format("DD/MM/YYYY");
        
        const categories = {};
        cm.forEach(cmd => {
            if (!categories[cmd.categorie]) categories[cmd.categorie] = [];
            categories[cmd.categorie].push(cmd.nomCom);
        });

        let categorySummary = "";
        let fullCommandList = "";
        let commandCounter = 1;
        for (const [category, commands] of Object.entries(categories)) {
            categorySummary += `▢ ${category.toUpperCase()} (${commands.length})\n`;
            fullCommandList += `\n*【 ${category.toUpperCase()} 】*\n`;
            commands.forEach(cmd => {
                fullCommandList += `${commandCounter++}. ${s.PREFIX || '.'}${cmd}\n`;
            });
        }

        const message = `
┌─❖ 𓆩 ⚡ 𓆪 ❖─┐
       VORTEX XMD  
└─❖ 𓆩 ⚡ 𓆪 ❖─┘  

👤 ᴜsᴇʀ ɴᴀᴍᴇ: ${userName}
📅 ᴅᴀᴛᴇ: ${date}
⏰ ᴛɪᴍᴇ: ${time}

📊 *CATEGORIES (${Object.keys(categories).length})*
${categorySummary}
📜 *FULL COMMAND LIST (${cm.length})*
${fullCommandList}

© *VORTEX XMD* | by HansTz
`.trim();

        const contextInfo = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363421513037430@newsletter',
                newsletterName: "VORTEX XMD",
                serverMessageId: -1 * 900000)
            },
            externalAdReply: {
                title: "VORTEX XMD",
                body: "HansTz Bot | github.com/Hans-255/Vortex-Xmd-Bot",
                thumbnailUrl: getRandomImage(),
                mediaType: 1,
                sourceUrl: 'https://github.com/Hans-255/Vortex-Xmd-Bot',
                showAdAttribution: false
            }
        };

        try {
            const imgUrl = getRandomImage();
            await zk.sendMessage(dest, {
                image: { url: imgUrl },
                caption: message,
                contextInfo: contextInfo
            }, { quoted: ms });
        } catch (err) {
            await zk.sendMessage(dest, {
                text: message,
                contextInfo: contextInfo
            }, { quoted: ms });
        }
    });
});
