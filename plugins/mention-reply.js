const config = require('../config');
const { cmd } = require('../command');
const { sendRandomAudio, NEWSLETTER } = require('../lib/media');

cmd({
  on: 'body'
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;
    const botJid = conn.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
    const isBotMentioned = m.mentionedJid.includes(botJid);
    if (!isBotMentioned) return;
    await sendRandomAudio(conn, m.chat, m);
  } catch (err) {
    console.error('[mention-reply]', err.message);
  }
});
