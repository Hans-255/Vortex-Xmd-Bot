const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');

const BOT_REPO = 'Hans-255/Vortex-Xmd-Bot';
const REPO_API = `https://api.github.com/repos/${BOT_REPO}`;

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: '🆕',
    desc: "Update the bot to the latest version.",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("This command is only for the bot owner.");

    try {
        await reply("🔍 Checking for VORTEX XMD updates...");

        const { data: commitData } = await axios.get(`${REPO_API}/commits/main`, {
            headers: { 'User-Agent': 'VORTEX-XMD-Bot' }
        });
        const latestCommitHash = commitData.sha;
        const currentHash = await getCommitHash();

        if (latestCommitHash === currentHash) {
            return reply("✅ Your VORTEX XMD bot is already up-to-date!");
        }

        await reply("🚀 Downloading latest VORTEX XMD update...");

        const zipPath = path.join(__dirname, "latest.zip");
        const { data: zipData } = await axios.get(
            `https://github.com/${BOT_REPO}/archive/refs/heads/main.zip`,
            { responseType: "arraybuffer", headers: { 'User-Agent': 'VORTEX-XMD-Bot' } }
        );
        fs.writeFileSync(zipPath, zipData);

        await reply("📦 Extracting the latest code...");
        const extractPath = path.join(__dirname, 'latest');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        await reply("🔄 Replacing files...");
        const repoFolderName = BOT_REPO.split('/')[1] + '-main';
        const sourcePath = path.join(extractPath, repoFolderName);
        const destinationPath = path.join(__dirname, '..');
        copyFolderSync(sourcePath, destinationPath);

        await setCommitHash(latestCommitHash);

        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        await reply("✅ Update complete! Restarting VORTEX XMD...");
        process.exit(0);
    } catch (error) {
        console.error("Update error:", error);
        return reply(`❌ Update failed: ${error.message}`);
    }
});

function copyFolderSync(source, target) {
    if (!fs.existsSync(source)) return;
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        if (item === "config.js" || item === "app.json" || item === "config.env") {
            console.log(`Skipping ${item} to preserve custom settings.`);
            continue;
        }

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
