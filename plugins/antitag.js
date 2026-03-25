const { cmd } = require('../command');

global.groupSettings = global.groupSettings || {};
global.warnCount     = global.warnCount     || {};

const WARN_MESSAGES = [
  '🚫 *Tag Spam!*\n@{user} — mass tagging is *not allowed* here!\n⚠️ Warning *{warn}/{max}*.',
  '⚠️ *Caught!*\n@{user} — tagging multiple people without permission.\n🔢 Strike *{warn}/{max}*.',
  '❗ *No Spam Tags!*\n@{user} — tag responsibly.\n⚡ Warning *{warn}/{max}*.',
  '📵 *Tag Spam Blocked!*\n@{user} — strike *{warn}/{max}*.',
  '💢 *Rule Violated!*\n@{user}, stop tagging everyone.\n🔢 Strike *{warn}/{max}*.',
];
const KICK_MSG = '⛔ @{user} removed for repeatedly spamming tags.';

// ─── Toggle command ───────────────────────────────────────────────
cmd({
  pattern: 'antitag',
  desc: 'Block non-admins from mass tagging in this group',
  category: 'group',
  use: '.antitag <on delete|warn|kick | off | status>',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');

  if (!global.groupSettings[from]) global.groupSettings[from] = {};

  const action = (args[0] || '').toLowerCase();
  const mode   = (args[1] || '').toLowerCase();

  if (action === 'off') { global.groupSettings[from].antitag = null; return reply('✅ Anti-tag *disabled*.'); }
  if (action === 'on') {
    if (!['delete','warn','kick'].includes(mode))
      return reply('⚠️ Pick a mode:\n◈ `.antitag on delete`\n◈ `.antitag on warn`\n◈ `.antitag on kick`');
    global.groupSettings[from].antitag = mode;
    return reply(`✅ Anti-tag *ON* ⟫ mode: *${mode}*`);
  }

  const cur = global.groupSettings[from]?.antitag;
  return reply(`◈ Anti-tag ⟫ ${cur ? `ON (${cur})` : 'OFF'}`);
});

// ─── Auto enforcement — fires for text/body messages ─────────────
// Mentions (tags) always come in extendedTextMessage contextInfo
cmd({ on: 'body' }, async (conn, mek, m, { from, sender, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;
    const mode = global.groupSettings[from]?.antitag;
    if (!mode) return;

    // Get tagged users from contextInfo
    const mentioned =
      mek.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
      mek.message?.imageMessage?.contextInfo?.mentionedJid ||
      mek.message?.videoMessage?.contextInfo?.mentionedJid || [];

    // Trigger on 3+ tags (mass tagging)
    if (!mentioned || mentioned.length < 3) return;

    await conn.sendMessage(from, { delete: mek.key });

    const tag = sender.split('@')[0];
    const MAX = 5;
    const mention = [sender];

    if (mode === 'delete') {
      return conn.sendMessage(from, { text: `🚫 *Tag spam deleted!*\n@${tag} — no mass tagging here.`, mentions: mention });
    }
    if (mode === 'kick') {
      await conn.sendMessage(from, { text: `⛔ @${tag} removed for mass tagging.`, mentions: mention });
      return conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
    if (mode === 'warn') {
      const key = from + '_tag';
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
  } catch (e) { console.error('[ANTITAG]', e.message); }
});
