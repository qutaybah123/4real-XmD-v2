const { isSudo } = require('../lib/index');

async function reportCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const reportText = args.slice(1).join(" ");

        // Check if user is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = message.key.fromMe || senderIsSudo;

        if (!isOwner) {
            return await sock.sendMessage(chatId, {
                text: "🚫 *Access Denied U need 2 be the Sudo or Owner Only!*"
            }, { quoted: message });
        }

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '📋', key: message.key }
        });

        if (!reportText) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Usage:* .report <message>\n*Example:* .report Play command is not working\n*Example:* .report Please add new feature"
            }, { quoted: message });
        }

        try {
            // Replace with your actual developer number
            const devNumber = "255624314178@s.whatsapp.net"; // Your number
            
            const reportMessage = 
`*📋 | REQUEST/BUG REPORT |*

👤 *User:* ${message.pushName || 'Unknown'}
📞 *Number:* ${senderId.split('@')[0]}
📝 *Message:* ${reportText}

⏰ *Time:* ${new Date().toLocaleString()}`;

            // Send report to developer
            await sock.sendMessage(devNumber, {
                text: reportMessage
            });

            // Send confirmation to user
            const confirmationText = 
`✅ *Report Sent Successfully!*

Your report has been forwarded to the developer.

📝 *Your Message:* ${reportText}

We'll review it and get back to you soon.

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

            await sock.sendMessage(chatId, {
                text: confirmationText
            }, { quoted: message });

        } catch (error) {
            console.error("Report Send Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to send report. Please try again later."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Report Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = reportCommand;
