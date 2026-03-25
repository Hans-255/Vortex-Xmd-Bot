const { cmd } = require('../command');
const config = require('../config');

// ─── Auto open viewonce — fires for EVERY message ─────────────────
cmd({ on: 'message' }, async (conn, mek, m, { from, sender }) => {
  try {
    if (config.ANTI_VV !== 'true') return;

    // Detect viewonce in all known formats
    const viewOnceMsg =
      mek.message?.viewOnceMessage?.message ||
      mek.message?.viewOnceMessageV2?.message ||
      mek.message?.viewOnceMessageV2Extension?.message;

    if (!viewOnceMsg) return;

    const mediaType = viewOnceMsg.imageMessage
      ? 'imageMessage'
      : viewOnceMsg.videoMessage
      ? 'videoMessage'
      : null;

    if (!mediaType) return;

    // Strip viewonce flag so it can be forwarded
    const stripped = { ...viewOnceMsg };
    if (stripped[mediaType]) stripped[mediaType] = { ...stripped[mediaType], viewOnce: false };

    const ownerJid = `${config.OWNER_NUMBER.replace(/\D/g, '')}@s.whatsapp.net`;
    const caption = `👁️ *ViewOnce Intercepted*\n◈ From  ⟫  @${sender.split('@')[0]}\n◈ Chat  ⟫  ${from.endsWith('@g.us') ? 'Group' : 'Private'}\n\n⚡ *VORTEX XMD* — Anti ViewOnce`;

    const buffer = await conn.downloadMediaMessage({ message: viewOnceMsg, key: mek.key }).catch(() => null);
    if (!buffer) return;

    if (mediaType === 'imageMessage') {
      await conn.sendMessage(ownerJid, { image: buffer, caption, mentions: [sender] });
    } else {
      await conn.sendMessage(ownerJid, { video: buffer, caption, mentions: [sender] });
    }
  } catch (e) {
    console.error('[ANTIVIEWONCE]', e.message);
  }
});

// ─── Toggle command ───────────────────────────────────────────────
cmd({
  pattern: 'antiviewonce',
  alias: ['antivv', 'vvopen'],
  desc: 'Toggle anti-viewonce (auto open view-once messages)',
  category: 'owner',
  use: '.antiviewonce <on|off>',
  filename: __filename
}, async (conn, mek, m, { isOwner, args, reply }) => {
  if (!isOwner) return reply('❌ Owner only.');
  const action = (args[0] || '').toLowerCase();
  if (action === 'on')  { config.ANTI_VV = 'true';  return reply('✅ Anti-ViewOnce *ON* — view-once messages forwarded to you.'); }
  if (action === 'off') { config.ANTI_VV = 'false'; return reply('❌ Anti-ViewOnce *OFF*.'); }
  return reply(`◈ Anti-ViewOnce ⟫ ${config.ANTI_VV === 'true' ? 'ON ✅' : 'OFF ❌'}`);
});
