const config = require('../config')
const { cmd } = require('../command')

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
    pattern: "groupname",
    alias: ["upgname", "gname"],
    react: "📝",
    desc: "Change the group name.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {
    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363421513037430@newsletter",
            newsletterName: 'VORTEX XMD',
            serverMessageId: 1
        }
    };

    if (!isGroup) return reply(`
╭───「 *ERROR* 」───╮
│ ❌ This command can only be used in groups.
╰──────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    if (!isAdmins) return reply(`
╭───「 *ACCESS DENIED* 」───╮
│ 🚫 Only group admins can use this command.
╰──────────────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    if (!isBotAdmins) return reply(`
╭───「 *BOT ERROR* 」───╮
│ ⚠️ I need to be an admin to update the group name.
╰──────────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    if (!q) return reply(`
╭───「 *USAGE* 」───╮
│ ❌ Please provide a new group name.
╰──────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    try {
        await conn.groupUpdateSubject(from, q);
        return reply(`
╭───「 *SUCCESS* 」───╮
│ ✅ Group name has been updated to: *${q}*
╰───────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    } catch (e) {
        console.error("Error updating group name:", e);
        return reply(`
╭───「 *ERROR* 」───╮
│ ❌ Failed to update the group name. Please try again.
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    }
});
