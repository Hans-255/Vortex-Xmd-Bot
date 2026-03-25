const { cmd } = require('../command');

global.groupSettings = global.groupSettings || {};

// ─── Toggle command ───────────────────────────────────────────────
cmd({
  pattern: 'antiphoto',
  desc: 'Delete photos sent by non-admins in this group',
  category: 'group',
  use: '.antiphoto <on|off|status>',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');

  if (!global.groupSettings[from]) global.groupSettings[from] = {};

  const action = (args[0] || '').toLowerCase();
  if (action === 'on')  { global.groupSettings[from].antiphoto = true;  return reply('✅ Anti-photo *ON* — photos from non-admins deleted.'); }
  if (action === 'off') { global.groupSettings[from].antiphoto = false; return reply('❌ Anti-photo *OFF*.'); }

  const cur = global.groupSettings[from]?.antiphoto;
  return reply(`◈ Anti-photo ⟫ ${cur ? 'ON ✅' : 'OFF ❌'}\n\n◈ \`.antiphoto on\`\n◈ \`.antiphoto off\``);
});

// ─── Auto enforcement — fires ONLY for image messages ─────────────
cmd({ on: 'image' }, async (conn, mek, m, { from, sender, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;
    if (!global.groupSettings[from]?.antiphoto) return;

    await conn.sendMessage(from, { delete: mek.key });
    await conn.sendMessage(from, {
      text: `🚫 *Photo deleted!*\n@${sender.split('@')[0]} — image sharing is *restricted* in this group.`,
      mentions: [sender]
    });
  } catch (e) { console.error('[ANTIPHOTO]', e.message); }
});
