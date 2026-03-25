const { cmd } = require('../command');

global.groupSettings = global.groupSettings || {};
global.warnCount     = global.warnCount     || {};

const WARN_MESSAGES = [
  '🚫 *Sticker Alert!*\nHey @{user} — stickers are *not allowed* here!\n⚠️ Warning *{warn}/{max}*.',
  '⚠️ *Caught!*\n@{user} — sticker sharing is *disabled*.\n🔢 Strikes: *{warn}/{max}*',
  '❗ *Rule Break!*\n@{user}, no stickers allowed.\n⚡ Warning *{warn}/{max}*.',
  '📵 *Sticker Blocked!*\n@{user} — strike *{warn}/{max}*.',
  '💢 *No Stickers!*\n@{user} — violating group rules.\n🔢 Strike *{warn}/{max}*.',
];
const KICK_MSG = '⛔ @{user} removed for repeatedly sending stickers.';

// ─── Toggle command ───────────────────────────────────────────────
cmd({
  pattern: 'antisticker',
  desc: 'Control sticker sending in this group',
  category: 'group',
  use: '.antisticker <on delete|warn|kick | off | status>',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');

  if (!global.groupSettings[from]) global.groupSettings[from] = {};

  const action = (args[0] || '').toLowerCase();
  const mode   = (args[1] || '').toLowerCase();

  if (action === 'off') { global.groupSettings[from].antisticker = null; return reply('✅ Anti-sticker *disabled*.'); }
  if (action === 'on') {
    if (!['delete','warn','kick'].includes(mode))
      return reply('⚠️ Pick a mode:\n◈ `.antisticker on delete`\n◈ `.antisticker on warn`\n◈ `.antisticker on kick`');
    global.groupSettings[from].antisticker = mode;
    return reply(`✅ Anti-sticker *ON* ⟫ mode: *${mode}*`);
  }

  const cur = global.groupSettings[from]?.antisticker;
  return reply(`◈ Anti-sticker ⟫ ${cur ? `ON (${cur})` : 'OFF'}`);
});

// ─── Auto enforcement — fires ONLY for sticker messages ───────────
cmd({ on: 'sticker' }, async (conn, mek, m, { from, sender, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;
    const mode = global.groupSettings[from]?.antisticker;
    if (!mode) return;

    await conn.sendMessage(from, { delete: mek.key });

    const tag = sender.split('@')[0];
    const MAX = 5;
    const mention = [sender];

    if (mode === 'delete') {
      return conn.sendMessage(from, { text: `🚫 *Sticker deleted!*\n@${tag} — no stickers here.`, mentions: mention });
    }
    if (mode === 'kick') {
      await conn.sendMessage(from, { text: `⛔ @${tag} removed for sending a sticker.`, mentions: mention });
      return conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
    if (mode === 'warn') {
      const key = from + '_sticker';
      if (!global.warnCount[key]) global.warnCount[key] = {};
      global.warnCount[key][sender] = (global.warnCount[key][sender] || 0) + 1;
      const warns = global.warnCount[key][sender];
      if (warns >= MAX) {
        await conn.sendMessage(from, { text: KICK_MSG.replace('{user}', tag), mentions: mention });
        await conn.groupParticipantsUpdate(from, [sender], 'remove');
        delete global.warnCount[key][sender];
        return;
      }
      const msg = WARN_MESSAGES[Math.floor(Math.random() * WARN_MESSAGES.length)]
        .replace('{user}', tag).replace(/\{warn\}/g, warns).replace(/\{max\}/g, MAX);
      conn.sendMessage(from, { text: msg, mentions: mention });
    }
  } catch (e) { console.error('[ANTISTICKER]', e.message); }
});
