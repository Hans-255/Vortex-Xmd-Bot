const { cmd } = require('../command');
const config = require('../config');

// ─── Global State ────────────────────────────────────────────────
global.groupSettings = global.groupSettings || {};
global.warnCount    = global.warnCount    || {};

// ─── Link Detection ──────────────────────────────────────────────
const LINK_RE = /(?:https?:\/\/|www\.)[^\s]+|(?:chat|wa)\.whatsapp\.com\/\S+|wa\.me\/\S+|t(?:elegram)?\.me\/\S+|youtu\.?be(?:\.com)?\/\S+|instagram\.com\/\S+|facebook\.com\/\S+|fb\.me\/\S+|twitter\.com\/\S+|x\.com\/\S+|tiktok\.com\/\S+|discord\.gg\/\S+|discord\.com\/invite\/\S+|snapchat\.com\/\S+|linkedin\.com\/\S+/i;

const WARN_MESSAGES = [
  '🚨 *Link Alert!*\nHey @{user}, links are *not allowed* here!\n⚠️ Warning *{warn}/{max}*.',
  '⚠️ *Caught!*\n@{user} — dropped a link in the wrong place.\n🔢 Strikes: *{warn}/{max}*',
  '❗ *Rule Violation!*\n@{user} — posting links is *prohibited* here.\n⚡ Warning *{warn}/{max}*.',
  '🔔 *Heads Up!*\n@{user}, link sharing is disabled.\n⚠️ Strike *{warn}/{max}*.',
  '🛑 *Warning Issued!*\n@{user} — sharing links here is a mistake.\n📛 *{warn}/{max}* warnings.',
  '🌐 *Link Detected!*\n@{user} — Zero tolerance for links.\n⚠️ Warning *{warn}/{max}*.',
  '💢 *Not Cool!*\n@{user}, you know links are not allowed.\n🔢 Strike *{warn}/{max}*.',
  '📵 *Link Blocked!*\nMessage deleted. @{user} — strike *{warn}/{max}*.',
];
const FINAL_WARN = '🚨 *FINAL WARNING!*\n@{user} — next violation = *removed* from this group!';
const KICK_MSG   = '⛔ @{user} has been *removed* for repeatedly sharing links.';

function addWarn(gid, uid) {
  if (!global.warnCount[gid]) global.warnCount[gid] = {};
  global.warnCount[gid][uid] = (global.warnCount[gid][uid] || 0) + 1;
  return global.warnCount[gid][uid];
}
function resetWarn(gid, uid) { if (global.warnCount[gid]) delete global.warnCount[gid][uid]; }

// ─── Toggle command ───────────────────────────────────────────────
cmd({
  pattern: 'antilink',
  desc: 'Anti-link protection per group',
  category: 'group',
  use: '.antilink <on delete|warn|kick | off | status>',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');

  if (!global.groupSettings[from]) global.groupSettings[from] = {};

  const action = (args[0] || '').toLowerCase();
  const mode   = (args[1] || '').toLowerCase();

  if (action === 'off') { global.groupSettings[from].antilink = null; return reply('✅ Anti-link *disabled*.'); }
  if (action === 'on') {
    if (!['delete','warn','kick'].includes(mode))
      return reply('⚠️ Pick a mode:\n◈ `.antilink on delete` — delete only\n◈ `.antilink on warn` — 5 warnings then kick\n◈ `.antilink on kick` — instant kick');
    global.groupSettings[from].antilink = mode;
    return reply(`✅ Anti-link *ON* ⟫ mode: *${mode}*`);
  }

  const cur = global.groupSettings[from]?.antilink;
  return reply(`◈ Anti-link ⟫ ${cur ? `ON (${cur})` : 'OFF'}\n\n◈ \`.antilink on delete\`\n◈ \`.antilink on warn\`\n◈ \`.antilink on kick\`\n◈ \`.antilink off\``);
});

// ─── Auto enforcement — fires for every text/caption body ─────────
cmd({ on: 'body' }, async (conn, mek, m, { from, body, sender, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;
    const mode = global.groupSettings[from]?.antilink;
    if (!mode) return;
    if (!LINK_RE.test(body)) return;

    await conn.sendMessage(from, { delete: mek.key });

    const tag = sender.split('@')[0];
    const MAX = 5;
    const mention = [sender];

    if (mode === 'delete') {
      return conn.sendMessage(from, { text: `🗑️ *Link deleted!*\n@${tag} — links are not allowed here.`, mentions: mention });
    }
    if (mode === 'kick') {
      await conn.sendMessage(from, { text: `⛔ @${tag} removed for sending a link.`, mentions: mention });
      return conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
    if (mode === 'warn') {
      const warns = addWarn(from, sender);
      if (warns >= MAX) {
        await conn.sendMessage(from, { text: KICK_MSG.replace('{user}', tag), mentions: mention });
        await conn.groupParticipantsUpdate(from, [sender], 'remove');
        resetWarn(from, sender);
        return;
      }
      const isFinal = warns === MAX - 1;
      const msg = isFinal
        ? FINAL_WARN.replace('{user}', tag)
        : WARN_MESSAGES[Math.floor(Math.random() * WARN_MESSAGES.length)]
            .replace('{user}', tag).replace(/\{warn\}/g, warns).replace(/\{max\}/g, MAX);
      conn.sendMessage(from, { text: msg, mentions: mention });
    }
  } catch (e) { console.error('[ANTILINK]', e.message); }
});

setInterval(() => { global.warnCount = {}; }, 24 * 60 * 60 * 1000);
