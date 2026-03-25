const { cmd } = require('../command');

global.bannedUsers = global.bannedUsers || {};

function isBanned(gid, uid) { return global.bannedUsers[gid]?.has(uid) || false; }
function banUser(gid, uid)  { if (!global.bannedUsers[gid]) global.bannedUsers[gid] = new Set(); global.bannedUsers[gid].add(uid); }
function unbanUser(gid, uid){ global.bannedUsers[gid]?.delete(uid); }

// ─── .ban command ─────────────────────────────────────────────────
cmd({
  pattern: 'ban',
  desc: 'Ban a user — reply to their message',
  category: 'group',
  use: '.ban',
  filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isAdmins, isOwner, isBotAdmins, quoted, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');
  if (!isBotAdmins)          return reply('❌ Make the bot an admin first.');

  const target = quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;
  if (!target) return reply('⚠️ Reply to the target user\'s message, then send `.ban`');

  const targetNum = target.split('@')[0];
  if (isBanned(from, target)) return reply(`⚠️ @${targetNum} is already banned.`);

  banUser(from, target);

  await conn.sendMessage(from, {
    text: `✦━━━━━━━━━━━━━━━━━━━━━━━✦\n    🚫  U S E R  B A N N E D  🚫\n✦━━━━━━━━━━━━━━━━━━━━━━━✦\n◈ User    ⟫  @${targetNum}\n◈ By      ⟫  @${sender.split('@')[0]}\n◈ Action  ⟫  All messages auto-deleted\n✦━━━━━━━━━━━━━━━━━━━━━━━✦\n⚡ *VORTEX XMD* — Group Shield`,
    mentions: [target, sender]
  }, { quoted: mek });
});

// ─── .unban command ───────────────────────────────────────────────
cmd({
  pattern: 'unban',
  desc: 'Unban a previously banned user',
  category: 'group',
  use: '.unban',
  filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isAdmins, isOwner, quoted, reply }) => {
  if (!isGroup)              return reply('❌ Groups only.');
  if (!isAdmins && !isOwner) return reply('❌ Only group admins or bot owner.');

  const target = quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;
  if (!target) return reply('⚠️ Reply to the target user\'s message, then send `.unban`');

  const targetNum = target.split('@')[0];
  if (!isBanned(from, target)) return reply(`⚠️ @${targetNum} is not banned.`);

  unbanUser(from, target);
  await conn.sendMessage(from, {
    text: `✅ @${targetNum} has been *unbanned*.\n◈ They can send messages again.\n\n⚡ *VORTEX XMD*`,
    mentions: [target]
  }, { quoted: mek });
});

// ─── Delete ALL messages (text + media) from banned users ─────────
// on: 'message' fires for every message (added to index.js dispatcher)
cmd({ on: 'message' }, async (conn, mek, m, { from, sender, isGroup, isAdmins }) => {
  try {
    if (!isGroup || isAdmins) return;
    if (!isBanned(from, sender)) return;
    await conn.sendMessage(from, { delete: mek.key });
  } catch (e) { console.error('[BAN]', e.message); }
});

// on: 'body' catches plain text messages from banned users
cmd({ on: 'body' }, async (conn, mek, m, { from, sender, isGroup, isAdmins }) => {
  try {
    if (!isGroup || isAdmins) return;
    if (!isBanned(from, sender)) return;
    await conn.sendMessage(from, { delete: mek.key });
  } catch (e) { console.error('[BAN-TEXT]', e.message); }
});
