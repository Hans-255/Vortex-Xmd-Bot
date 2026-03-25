const { cmd } = require('../command');

global.groupSettings = global.groupSettings || {};
global.warnCount     = global.warnCount     || {};

const WARN_MESSAGES = [
  '🚫 *Mention Alert!*\n@{user} — mentioning others without permission is *not allowed*.\n⚠️ Warning *{warn}/{max}*.',
  '⚠️ *Caught!*\n@{user}, stop pinging people unnecessarily.\n🔢 Strike *{warn}/{max}*.',
  '❗ *Mention Blocked!*\n@{user} — mentions are reserved for admins.\n⚡ Warning *{warn}/{max}*.',
  '📵 *Mention Deleted!*\n@{user} — strike *{warn}/{max}*.',
  '💢 *No Mentions!*\n@{user} — you are not allowed to mention here.\n🔢 Strike *{warn}/{max}*.',
];
const KICK_MSG = '⛔ @{user} removed for repeatedly violating mention rules.';

// ─── Toggle command ───────────────────────────────────────────────
cmd({
  pattern: 'antimention',
  alias: ['antimentiongc'],
  desc: 'Block non-admins from mentioning others in this group',
  category: 'group',
  use: '.antimention <on delete|warn|kick | off | status>',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');

  if (!global.groupSettings[from]) global.groupSettings[from] = {};

  const action = (args[0] || '').toLowerCase();
  const mode   = (args[1] || '').toLowerCase();

  if (action === 'off') { global.groupSettings[from].antimention = null; return reply('✅ Anti-mention *disabled*.'); }
  if (action === 'on') {
    if (!['delete','warn','kick'].includes(mode))
      return reply('⚠️ Pick a mode:\n◈ `.antimention on delete`\n◈ `.antimention on warn`\n◈ `.antimention on kick`');
    global.groupSettings[from].antimention = mode;
    return reply(`✅ Anti-mention *ON* ⟫ mode: *${mode}*`);
  }

  const cur = global.groupSettings[from]?.antimention;
  return reply(`◈ Anti-mention ⟫ ${cur ? `ON (${cur})` : 'OFF'}`);
});

// ─── Auto enforcement — fires for text/body messages ─────────────
cmd({ on: 'body' }, async (conn, mek, m, { from, sender, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;
    const mode = global.groupSettings[from]?.antimention;
    if (!mode) return;

    // Any @mention in contextInfo
    const mentioned =
      mek.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
      mek.message?.imageMessage?.contextInfo?.mentionedJid || [];

    if (!mentioned || mentioned.length < 1) return;

    await conn.sendMessage(from, { delete: mek.key });

    const tag = sender.split('@')[0];
    const MAX = 5;
    const mention = [sender];

    if (mode === 'delete') {
      return conn.sendMessage(from, { text: `🚫 *Mention deleted!*\n@${tag} — only admins can mention members.`, mentions: mention });
    }
    if (mode === 'kick') {
      await conn.sendMessage(from, { text: `⛔ @${tag} removed for mentioning others.`, mentions: mention });
      return conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
    if (mode === 'warn') {
      const key = from + '_mention';
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
  } catch (e) { console.error('[ANTIMENTION]', e.message); }
});
