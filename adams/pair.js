const { adams } = require('../Ibrahim/adams');
const { default: axios } = require('axios');
const pkg = require('@whiskeysockets/baileys');
const { generateWAMessageFromContent, prepareWAMessageMedia } = pkg;

// Available API endpoints
const apiEndpoints = [
    "https://ultra-scanner.onrender.com"
    //"https://bwm-xmd-scanner-2.onrender.com",
   // "https://bwm-xmd-scanner-vv1.onrender.com",
   // "https://bwm-xmd-scanner-vv2.onrender.com"
   // "https://bwm-xmd-scanner-vvv1.onrender.com",
  //  "https://bwm-xmd-scanner-vvv2.onrender.com"
];

// Unified Rent/Code Command
const nomComList = ["rent", "code", "pair", "link"];

nomComList.forEach((nomCom) => {
    adams({ nomCom, reaction: "🚘", categorie: "User" }, async (dest, zk, commandeOptions) => {
        const randomEndpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
        await handleCodeRequest(dest, zk, commandeOptions, randomEndpoint);
    });
});

async function handleCodeRequest(dest, zk, commandeOptions, apiUrl) {
    const { repondre, arg, ms } = commandeOptions;

    try {
        if (!arg || arg.length === 0) {
            return repondre(`Example Usage: .${commandeOptions.nomCom} 254xxxxxxxx`);
        }

        await repondre('ɢᴇɴᴇʀᴀᴛɪɴɢ ʏᴏᴜʀ ᴄᴏᴅᴇ.........');
        const text = encodeURIComponent(arg.join(' '));
        const fullApiUrl = `${apiUrl}/code?number=${text}`;

        const response = await axios.get(fullApiUrl);
        const result = response.data;

        if (result && result.code) {
            const getsess = result.code;

            // FIRST MESSAGE: Just the code in clean format
            await zk.sendMessage(dest, {
                text: `  ${getsess} `,
                footer: "Copy this code for verification",
                contextInfo: {
                    mentionedJid: [ms.key.participant || ms.key.remoteJid]
                }
            }, { quoted: ms });

            // SECOND MESSAGE: Interactive buttons
            const buttonMessage = {
                text: '*Link your code now?*',
                footer: "Ultraxas md Code Generator",
                buttons: [
                    {
                        buttonId: 'resend_code',
                        buttonText: { displayText: '🔄 Resend Code' },
                        type: 1
                    },
                    {
                        buttonId: 'visit_website',
                        buttonText: { displayText: '🌐 Visit Website' },
                        type: 1
                    },
                    {
                        buttonId: 'get_help',
                        buttonText: { displayText: '❓ Help' },
                        type: 1
                    }
                ],
                headerType: 1
            };

            const sentMsg = await zk.sendMessage(dest, buttonMessage, { quoted: ms });

            // Button handler
            const buttonHandler = async (update) => {
                const message = update.messages[0];
                if (!message.message?.buttonsResponseMessage || 
                    message.message.buttonsResponseMessage.contextInfo?.stanzaId !== sentMsg.key.id) return;

                const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
                const userJid = message.key.participant || message.key.remoteJid;

                if (buttonId === 'resend_code') {
                    await repondre('Resending your code...');
                    await handleCodeRequest(dest, zk, commandeOptions, apiUrl);
                } 
                else if (buttonId === 'visit_website') {
                    await zk.sendMessage(dest, {
                        text: "🌐 *BWM XMD Website*\nbusiness.bwmxmd.online"
                    }, { quoted: message });
                }
                else if (buttonId === 'get_help') {
                    await zk.sendMessage(dest, {
                        text: "🆘 *Need help?*\nContact support:\nbwm-xmd-messenger.up.railway.app"
                    }, { quoted: message });
                }
            };

            zk.ev.on('messages.upsert', buttonHandler);
            setTimeout(() => zk.ev.off('messages.upsert', buttonHandler), 300000);

        } else {
            throw new Error('Invalid response from API.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        repondre('⚠️ Error generating code. Please try again later.');
    }
}

// Scan Command (unchanged as requested)
adams({ nomCom: "scan", reaction: "🔍", categorie: "pair" }, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;

    try {
        const instructions = `
*📖 HOW TO GET ULTRAXAS XMD SESSION:*

1️⃣ **Open the link below**

> https://ultra-scanner.onrender.com

2️⃣ **Enter Your WhatsApp Number**  

   👉 Type your WhatsApp number with your country code without (+) (e.g., 254xxxxxxxx) and tap **Submit**.  

3️⃣ **Receive a Code**  

   👉 Ibrahim Tech will send a short code, Copy it to your keyboard.  

4️⃣ **Check WhatsApp Notification**  

   👉 WhatsApp will notify you. Tap on the notification and enter the code sent by Ibrahim Tech.  

5️⃣ **Wait for the Session**  

   👉 After loading, it will link then Ibrahim Tech will send a session to your WhatsApp number.  

6️⃣ **Copy and Share the Session**  

   👉 Copy the long session and send it to me.  

> Ultraxas md
        `;

        await zk.sendMessage(dest, { 
            text: instructions 
        }, { quoted: ms });

    } catch (error) {
        console.error('Error:', error.message);
        repondre('⚠️ Error sending instructions. Please try again.');
    }
});
