const axios = require("axios");

/**
 * Generate a new temporary email address
 */
async function tempMailCommand(sock, chatId, message) {
    try {
        const response = await axios.get("https://apis.davidcyriltech.my.id/temp-mail");
        const { email, session_id, expires_at } = response.data;

        const expiresDate = new Date(expires_at);
        const timeString = expiresDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
        const dateString = expiresDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        const textMsg = `
╭───〔 📧 *TEMPORARY EMAIL GENERATED* 〕
│✉️ *Email:* ${email}
│⏳ *Expires:* ${timeString} • ${dateString}
│🔑 *Session ID:* \`\`\`${session_id}\`\`\`
│
│📥 *Check Inbox:* .checkmail ${session_id}
│
│🕒 _Email will expire after 24 hours_
╰───────────────────────◉`;

        await sock.sendMessage(chatId, {
            text: textMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: "📧", key: message.key } });

    } catch (error) {
        console.error("TempMail Error:", error);
        await sock.sendMessage(chatId, {
            text: `❌ Error generating temporary mail: ${error.message}`
        }, { quoted: message });
    }
}

/**
 * Check inbox of a temporary email
 */
async function checkMailCommand(sock, chatId, message, args) {
    try {
        const sessionId = args[0];
        if (!sessionId) {
            return await sock.sendMessage(chatId, {
                text: "🔑 Please provide your session ID\nExample: `.checkmail YOUR_SESSION_ID`"
            }, { quoted: message });
        }

        const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
        const response = await axios.get(inboxUrl);

        if (!response.data.success) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid session ID or expired email."
            }, { quoted: message });
        }

        const { inbox_count, messages } = response.data;
        if (inbox_count === 0) {
            await sock.sendMessage(chatId, { react: { text: "📭", key: message.key } });
            return await sock.sendMessage(chatId, {
                text: "📭 Your inbox is empty."
            }, { quoted: message });
        }

        let messageList = `📬 *You have ${inbox_count} message(s)*\n\n`;
        messages.forEach((msg, index) => {
            messageList += `━━━━━━━━━━━━━━━━━━\n` +
                `📌 *Message ${index + 1}*\n` +
                `👤 *From:* ${msg.from}\n` +
                `📝 *Subject:* ${msg.subject}\n` +
                `⏰ *Date:* ${new Date(msg.date).toLocaleString()}\n\n` +
                `📄 *Content:*\n${msg.body}\n\n`;
        });

        await sock.sendMessage(chatId, {
            text: messageList
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: "📬", key: message.key } });

    } catch (error) {
        console.error("CheckMail Error:", error);
        await sock.sendMessage(chatId, {
            text: `❌ Error checking inbox: ${error.response?.data?.message || error.message}`
        }, { quoted: message });
    }
}

module.exports = {
    tempMailCommand,
    checkMailCommand
};
