const { isSudo } = require('../lib/index');

async function msgCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const q = args.slice(1).join(" ");

        // Check if user is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isSudo(senderId);

        if (!isOwner) {
            return await sock.sendMessage(chatId, {
                text: "🚫 *Command Restricted to owner or sudo only!*"
            }, { quoted: message });
        }

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🔁', key: message.key }
        });

        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "*Format:* .msg text,count\n*Example:* .msg Hello,5"
            }, { quoted: message });
        }

        // Check format: .msg text,count
        if (!q.includes(',')) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Format:* .msg text,count\n*Example:* .msg Hello,5"
            }, { quoted: message });
        }

        const [messageText, countStr] = q.split(',');
        const count = parseInt(countStr.trim());

        // Hard limit: 1-100 messages
        if (isNaN(count) || count < 1 || count > 100) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Max 100 messages at once!*"
            }, { quoted: message });
        }

        // Send confirmation
        await sock.sendMessage(chatId, {
            text: `🔁 *Sending ${count} messages...*`
        }, { quoted: message });

        // Send messages
        for (let i = 0; i < count; i++) {
            await sock.sendMessage(chatId, { text: messageText.trim() });
            if (i < count - 1) await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }

    } catch (error) {
        console.error("❌ Msg Command Error:", error);
        await sock.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = msgCommand;
