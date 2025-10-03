const settings = require("../settings");
const os = require("os");
const { runtime } = require("../lib/functions");

async function aliveCommand(sock, chatId, message) {
    try {
        const status = `
╭───〔 *🤖 STATUS* 〕───◉
│✨ *${settings.botName} is Active & Online!*
│
│👨‍💻 *Owner:* ${settings.botOwner}
│⚡ *Version:* ${settings.version}
│📝 *Mode:* ${settings.commandMode}
│💾 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥️ *Host:* ${os.hostname()}
│⌛ *Uptime:* ${runtime(process.uptime())}
╰────────────────────◉
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

        // Use global.botImageUrl or fallback to text-only
        const imageUrl = global.botImageUrl || null;

        if (imageUrl) {
            await sock.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: status,
                contextInfo: {
                    mentionedJid: [message.sender || message.participant],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: status }, { quoted: message });
        }

    } catch (error) {
        console.error("Error in alive command:", error);
        await sock.sendMessage(chatId, { 
            text: "⚠️ Failed to load full status, but bot is alive and running!" 
        }, { quoted: message });
    }
}

module.exports = aliveCommand;
