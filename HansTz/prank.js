const { adams } = require('../Hans/adams');

adams({ nomCom: "hack", categorie: "Fun", reaction: "💀" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, prefixe } = commandeOptions;

    try {
        // Loading animation sequence
        const loadingSequence = [
            "⚡ _Connecting to encrypted servers..._ ⚡",
            "🔐 _Bypassing multi-layer firewalls..._ 🔐",
            "⚙️ _Injecting malicious payload..._ ⚙️",
            "🛑 _Exploiting kernel vulnerabilities..._ 🛑",
            "💣 _Uploading spyware to remote host..._ 💣"
        ];

        // Respond with loading animations
        for (const message of loadingSequence) {
            try {
                await repondre(message);
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
            } catch (animationError) {
                console.error("Error sending loading message:", animationError);
                // Continue to the next message to avoid stopping the prank
            }
        }

        // Main prank message
        const hackedMessage = `*💀🔓 SYSTEM BREACHED 🔓💀*
        
        ⚠️ _Critical security breach detected!_ ⚠️
        
        ▄█▓▒░ *SYSTEM LOG* ░▒▓█▄
        ${"█".repeat(30)}
        🔴 *WhatsApp Chats* _exported to shadow network!_
        🔴 *Contacts Synced to Deep Web Servers!*
        🔴 _Injecting trojan into system: \`/root/sys32/critical.js\`_
        🔴 Device IMEI: *${Math.floor(100000000000000 + Math.random() * 900000000000000)}*
        🔴 _Live Camera Stream Activated..._
        ${"█".repeat(30)}
        
        *⚠️ WARNING ⚠️*  
        _Your device is under remote surveillance. Do NOT attempt to reboot._

        _💀 Script Executed by: VORTEX md 💀_`;

        // Send the prank message
        try {
            await repondre(hackedMessage);
        } catch (mainMessageError) {
            console.error("Error sending prank message:", mainMessageError);
            return await repondre("_❌ An error occurred while sending the main prank message 😅_");
        }

        // Final warning with fake countdown
        const countdown = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
        for (const seconds of countdown) {
            try {
                await repondre(`💣 _System Destruction in: ${seconds} seconds..._ 💣`);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
            } catch (countdownError) {
                console.error("Error during countdown:", countdownError);
                // Allow the countdown to continue even if one message fails
            }
        }

        // Fake ending message
        try {
            await repondre("💥💀 *VICTIM SYSTEM DEMOLISHED!* 💀💥");
        } catch (finalMessageError) {
            console.error("Error sending final message:", finalMessageError);
        }
    } catch (globalError) {
        console.error("Critical error in prank script:", globalError);
        return await repondre("_❌ A critical error occurred during the prank 😅_");
    }
});
