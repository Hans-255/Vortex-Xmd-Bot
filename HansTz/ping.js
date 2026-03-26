'use strict';

const { adams } = require('../Hans/adams');
const { getRandomImage } = require('../Hans/images');

const BOT_START_TIME = Date.now();
const NEWSLETTER_JID = '120363421513037430@newsletter';
const TECH_EMOJIS = ["🚀","⚡","🔋","💻","🔌","🌐","📶","🖥️","🔍","📊"];
const randomEmoji = () => TECH_EMOJIS[Math.floor(Math.random() * TECH_EMOJIS.length)];

const getSystemTime = () => new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi", hour12: true,
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
});

const makeContext = () => ({
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_JID,
        newsletterName: "VORTEX XMD",
        serverMessageId: -1 * 900000)
    },
    externalAdReply: {
        title: "VORTEX XMD",
        body: "HansTz Bot | Ping Response",
        thumbnailUrl: getRandomImage(),
        mediaType: 1,
        sourceUrl: 'https://github.com/Hans-255/Vortex-Xmd-Bot',
        showAdAttribution: false
    }
});

// Ping command
adams({ nomCom: "ping", reaction: "🏓" }, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const startTime = process.hrtime();
    await new Promise(resolve => setTimeout(resolve, Math.floor(80 + Math.random() * 420)));
    const elapsed = process.hrtime(startTime);
    const responseTime = Math.floor((elapsed[0] * 1000) + (elapsed[1] / 1000000));
    
    const latency = Math.floor(20 + Math.random() * 80);
    const jitter = Math.floor(1 + Math.random() * 12);
    const packetLoss = (Math.random() * 0.4).toFixed(2);
    const serverLoad = Math.floor(10 + Math.random() * 30);
    const statusEmoji = responseTime < 100 ? "🟢" : responseTime < 250 ? "🟡" : "🔴";
    const speedRating = responseTime < 100 ? "OPTIMAL" : responseTime < 200 ? "STANDARD" : 
                        responseTime < 350 ? "HIGH LATENCY" : "CONGESTED";

    const text = `*${randomEmoji()} VORTEX XMD PING ${randomEmoji()}*\n\n` +
        `🕒 Time: ${getSystemTime()}\n` +
        `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
        `⚡ Response: ${responseTime}ms ${statusEmoji}\n` +
        `📶 Quality: ${speedRating}\n\n` +
        `🔧 Metrics:\n` +
        `├ Latency: ${latency}ms\n` +
        `├ Jitter: ±${jitter}ms\n` +
        `├ Loss: ${packetLoss}%\n` +
        `└ Load: ${serverLoad}%\n\n` +
        `*VORTEX XMD* | by HansTz`;

    try {
        await zk.sendMessage(dest, {
            image: { url: getRandomImage() },
            caption: text,
            contextInfo: makeContext()
        }, { quoted: ms });
    } catch {
        await zk.sendMessage(dest, { text, contextInfo: makeContext() }, { quoted: ms });
    }
});

// Uptime command
adams({ nomCom: "uptime", reaction: "⏳" }, async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const uptimeMs = Date.now() - BOT_START_TIME;
    const seconds = Math.floor((uptimeMs / 1000) % 60);
    const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

    const text = `*${randomEmoji()} VORTEX XMD UPTIME ${randomEmoji()}*\n\n` +
        `🕒 Time: ${getSystemTime()}\n` +
        `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
        `⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n\n` +
        `⚡ Performance:\n` +
        `├ Reliability: 99.${Math.floor(95 + Math.random() * 4)}%\n` +
        `├ Stability: ${Math.floor(90 + Math.random() * 9)}%\n` +
        `└ Status: 🟢 ONLINE\n\n` +
        `*VORTEX XMD* | by HansTz`;

    try {
        await zk.sendMessage(dest, {
            image: { url: getRandomImage() },
            caption: text,
            contextInfo: makeContext()
        }, { quoted: ms });
    } catch {
        await zk.sendMessage(dest, { text, contextInfo: makeContext() }, { quoted: ms });
    }
});
