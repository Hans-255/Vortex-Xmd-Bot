const { adams } = require('../Hans/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { createContext } = require('../Hans/helper');

// botJid is computed lazily inside each handler since vortex may not be ready at load time
const getBotJid = () => `${global.vortex?.user?.id?.split(':')[0]}@s.whatsapp.net`;

const mediaRecoveryCommands = ['vv', 'sent'];
const dmMediaCommands = ['vv2', 'save'];

async function downloadMedia(mediaMessage, mediaType) {
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    return await streamToBuffer(stream);
}

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// vv / sent: forward deleted/private media back to chat
mediaRecoveryCommands.forEach(cmdName => {
    adams({ nomCom: cmdName, categorie: 'Media', reaction: '👁️' }, async (dest, zk, commandeOptions) => {
        const { ms, msgRepondu, auteurMsgRepondu } = commandeOptions;
        const botJid = getBotJid();
        if (!msgRepondu) {
            return await zk.sendMessage(dest, { text: '❌ Reply to a media message to use this command.' });
        }
        try {
            const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];
            let mediaType = null;
            let mediaMsg = null;
            for (const t of mediaTypes) {
                if (msgRepondu[`${t}Message`]) { mediaType = t; mediaMsg = msgRepondu[`${t}Message`]; break; }
            }
            if (!mediaType) return await zk.sendMessage(dest, { text: '❌ No media found in the replied message.' });
            const buffer = await downloadMedia(mediaMsg, mediaType);
            await zk.sendMessage(dest, {
                [mediaType]: buffer,
                mimetype: mediaMsg.mimetype,
                caption: mediaMsg.caption || '',
                ...createContext(dest, { title: 'VORTEX XMD', body: 'Media Recovery' })
            });
        } catch (err) {
            await zk.sendMessage(dest, { text: `❌ Error: ${err.message}` });
        }
    });
});

// vv2 / save: send media to bot DM
dmMediaCommands.forEach(cmdName => {
    adams({ nomCom: cmdName, categorie: 'Media', reaction: '💾' }, async (dest, zk, commandeOptions) => {
        const { ms, msgRepondu } = commandeOptions;
        const botJid = getBotJid();
        if (!msgRepondu) {
            return await zk.sendMessage(dest, { text: '❌ Reply to a media message to use this command.' });
        }
        try {
            const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];
            let mediaType = null;
            let mediaMsg = null;
            for (const t of mediaTypes) {
                if (msgRepondu[`${t}Message`]) { mediaType = t; mediaMsg = msgRepondu[`${t}Message`]; break; }
            }
            if (!mediaType) return await zk.sendMessage(dest, { text: '❌ No media found in the replied message.' });
            const buffer = await downloadMedia(mediaMsg, mediaType);
            if (botJid) {
                await zk.sendMessage(botJid, {
                    [mediaType]: buffer,
                    mimetype: mediaMsg.mimetype,
                    caption: mediaMsg.caption || '📥 Saved by VORTEX XMD',
                    ...createContext(botJid, { title: 'VORTEX XMD', body: 'Media Saved' })
                });
                await zk.sendMessage(dest, { text: '✅ Media saved to bot DM!' });
            }
        } catch (err) {
            await zk.sendMessage(dest, { text: `❌ Error: ${err.message}` });
        }
    });
});
