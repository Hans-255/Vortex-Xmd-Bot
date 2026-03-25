const { cmd } = require('../command');

global.groupSettings = global.groupSettings || {};

// ─── Toggle command ───────────────────────────────────────────────
cmd({
  pattern: 'antibot',
  desc: 'Prevent other bots from operating in this group',
  category: 'group',
  use: '.antibot <on|off|status>',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');

  if (!global.groupSettings[from]) global.groupSettings[from] = {};

  const action = (args[0] || '').toLowerCase();
  if (action === 'on')  { global.groupSettings[from].antibot = true;  return reply('✅ Anti-bot *ON* — bot commands will be deleted.'); }
  if (action === 'off') { global.groupSettings[from].antibot = false; return reply('❌ Anti-bot *OFF*.'); }

  const cur = global.groupSettings[from]?.antibot;
  return reply(`◈ Anti-bot ⟫ ${cur ? 'ON ✅' : 'OFF ❌'}\n\n◈ \`.antibot on\`\n◈ \`.antibot off\``);
});

// ─── Auto enforcement — fires for body messages ───────────────────
// Detect messages that start with common bot command prefixes
cmd({ on: 'body' }, async (conn, mek, m, { from, body, sender, isGroup, isAdmins, isBotAdmins, isMe }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins || isMe) return;
    if (!global.groupSettings[from]?.antibot) return;

    // Detect bot-like command pattern: starts with ., !, /, #, $, ?, *
    if (!/^[.!/#$?*]\w+/.test((body || '').trim())) return;

    await conn.sendMessage(from, { delete: mek.key });
    await conn.sendMessage(from, {
      text: `🤖 *Bot command detected & deleted!*\n@${sender.split('@')[0]} — only VORTEX XMD is allowed here.`,
      mentions: [sender]
    });
  } catch (e) { console.error('[ANTIBOT]', e.message); }
});
