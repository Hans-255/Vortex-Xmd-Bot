const { cmd } = require('../command');
const config  = require('../config');

// ─── Helper ───────────────────────────────────────────────────────
function makeToggle(key, label) {
  return async (conn, mek, m, { isOwner, args, reply }) => {
    if (!isOwner) return reply('❌ Owner only command.');

    const action = (args[0] || '').toLowerCase();

    if (action === 'on') {
      config[key] = 'true';
      return reply(`✅ *${label}* is now *ON*`);
    }
    if (action === 'off') {
      config[key] = 'false';
      return reply(`❌ *${label}* is now *OFF*`);
    }
    return reply(
      `◈ ${label} ⟫ ${config[key] === 'true' ? 'ON ✅' : 'OFF ❌'}\n\nUsage:\n◈ \`.${key.toLowerCase().replace('_','')} on\`\n◈ \`.${key.toLowerCase().replace('_','')} off\``
    );
  };
}

// ─── Auto Typing ─────────────────────────────────────────────────
cmd({
  pattern: 'autotyping',
  alias: ['typing'],
  desc: 'Toggle auto typing indicator',
  category: 'settings',
  use: '.autotyping <on|off>',
  filename: __filename
}, makeToggle('AUTO_TYPING', 'Auto Typing'));

// ─── Auto Recording ──────────────────────────────────────────────
cmd({
  pattern: 'autorecording',
  alias: ['recording'],
  desc: 'Toggle auto recording indicator',
  category: 'settings',
  use: '.autorecording <on|off>',
  filename: __filename
}, makeToggle('AUTO_RECORDING', 'Auto Recording'));

// ─── Auto Status Seen ────────────────────────────────────────────
cmd({
  pattern: 'autostatusseen',
  alias: ['statusseen'],
  desc: 'Toggle auto status viewing',
  category: 'settings',
  use: '.autostatusseen <on|off>',
  filename: __filename
}, makeToggle('AUTO_STATUS_SEEN', 'Auto Status Seen'));

// ─── Auto Status React ───────────────────────────────────────────
cmd({
  pattern: 'autostatusreact',
  alias: ['statusreact'],
  desc: 'Toggle random emoji reactions on statuses',
  category: 'settings',
  use: '.autostatusreact <on|off>',
  filename: __filename
}, makeToggle('AUTO_STATUS_REACT', 'Auto Status React'));

// ─── Auto Status Reply ───────────────────────────────────────────
cmd({
  pattern: 'autostatusreply',
  alias: ['statusreply'],
  desc: 'Toggle auto reply on status views',
  category: 'settings',
  use: '.autostatusreply <on|off>',
  filename: __filename
}, makeToggle('AUTO_STATUS_REPLY', 'Auto Status Reply'));

// ─── Auto React ──────────────────────────────────────────────────
cmd({
  pattern: 'autoreact',
  alias: ['react'],
  desc: 'Toggle random emoji reaction on all incoming messages',
  category: 'settings',
  use: '.autoreact <on|off>',
  filename: __filename
}, makeToggle('AUTO_REACT', 'Auto React'));

// ─── Read Message ────────────────────────────────────────────────
cmd({
  pattern: 'readmessage',
  alias: ['autoread'],
  desc: 'Toggle auto read messages',
  category: 'settings',
  use: '.readmessage <on|off>',
  filename: __filename
}, makeToggle('READ_MESSAGE', 'Read Message'));

// ─── Always Online ───────────────────────────────────────────────
cmd({
  pattern: 'alwaysonline',
  alias: ['online'],
  desc: 'Toggle always online presence',
  category: 'settings',
  use: '.alwaysonline <on|off>',
  filename: __filename
}, makeToggle('ALWAYS_ONLINE', 'Always Online'));

// ─── Anti Call ───────────────────────────────────────────────────
cmd({
  pattern: 'anticall',
  desc: 'Toggle anti-call (block incoming calls)',
  category: 'settings',
  use: '.anticall <on|off>',
  filename: __filename
}, makeToggle('ANTI_CALL', 'Anti Call'));

// ─── Auto Sticker ────────────────────────────────────────────────
cmd({
  pattern: 'autosticker',
  desc: 'Toggle auto convert images to stickers',
  category: 'settings',
  use: '.autosticker <on|off>',
  filename: __filename
}, makeToggle('AUTO_STICKER', 'Auto Sticker'));

// ─── Auto Reply ──────────────────────────────────────────────────
cmd({
  pattern: 'autoreply',
  desc: 'Toggle auto-reply from autoreply.json',
  category: 'settings',
  use: '.autoreply <on|off>',
  filename: __filename
}, makeToggle('AUTO_REPLY', 'Auto Reply'));

// ─── Anti Delete ─────────────────────────────────────────────────
cmd({
  pattern: 'antidelete',
  alias: ['antidel'],
  desc: 'Toggle anti-delete protection',
  category: 'settings',
  use: '.antidelete <on|off>',
  filename: __filename
}, makeToggle('ANTI_DELETE', 'Anti Delete'));

// ─── Anti Bad Word ───────────────────────────────────────────────
cmd({
  pattern: 'antibad',
  alias: ['antibadword'],
  desc: 'Toggle anti bad word filter in groups',
  category: 'settings',
  use: '.antibad <on|off>',
  filename: __filename
}, makeToggle('ANTI_BAD', 'Anti Bad Word'));

// ─── Settings Status Overview ─────────────────────────────────────
cmd({
  pattern: 'settings',
  alias: ['botsettings', 'config'],
  desc: 'View all bot settings at a glance',
  category: 'settings',
  use: '.settings',
  filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
  if (!isOwner) return reply('❌ Owner only command.');

  const on  = '✅ ON';
  const off = '❌ OFF';
  const s   = (k) => config[k] === 'true' ? on : off;

  const text = `✦━━━━━━━━━━━━━━━━━━━━━━━✦
  ⚙️  B O T  S E T T I N G S  ⚙️
✦━━━━━━━━━━━━━━━━━━━━━━━✦

⬡──【 📡 Auto Features 】──⬡
◈ Auto Typing       ⟫  ${s('AUTO_TYPING')}
◈ Auto Recording    ⟫  ${s('AUTO_RECORDING')}
◈ Always Online     ⟫  ${s('ALWAYS_ONLINE')}
◈ Auto React        ⟫  ${s('AUTO_REACT')}
◈ Auto Reply        ⟫  ${s('AUTO_REPLY')}
◈ Auto Sticker      ⟫  ${s('AUTO_STICKER')}
◈ Read Messages     ⟫  ${s('READ_MESSAGE')}

⬡──【 📺 Status 】──⬡
◈ Status Seen       ⟫  ${s('AUTO_STATUS_SEEN')}
◈ Status React      ⟫  ${s('AUTO_STATUS_REACT')}
◈ Status Reply      ⟫  ${s('AUTO_STATUS_REPLY')}

⬡──【 🛡️ Protection 】──⬡
◈ Anti Call         ⟫  ${s('ANTI_CALL')}
◈ Anti Delete       ⟫  ${s('ANTI_DELETE')}
◈ Anti Bad Word     ⟫  ${s('ANTI_BAD')}
◈ Anti ViewOnce     ⟫  ${s('ANTI_VV')}

⬡──【 ⚡ Bot Info 】──⬡
◈ Mode              ⟫  ${config.MODE}
◈ Prefix            ⟫  ${config.PREFIX}
◈ Bot Name          ⟫  ${config.BOT_NAME}
◈ Owner             ⟫  ${config.OWNER_NAME}

✦━━━━━━━━━━━━━━━━━━━━━━━✦
⚡ Use .commandname on/off to toggle`;

  reply(text);
});
