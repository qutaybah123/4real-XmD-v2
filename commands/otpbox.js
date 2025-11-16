const axios = require("axios");
const { isSudo } = require('../lib/index');
const settings = require('../settings'); // Add this import

async function otpboxCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const phoneNumber = args[1];

        // Check if user is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        
        // Proper owner check - compare with owner number from settings
        const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
        const isOwner = message.key.fromMe || senderId === ownerJid || senderIsSudo;

        if (!isOwner) {
            return await sock.sendMessage(chatId, {
                text: "🚫 *Owner/Sudo Higher Priviledge required!*"
            }, { quoted: message });
        }

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🔑', key: message.key }
        });

        if (!phoneNumber || !phoneNumber.startsWith("+")) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Usage:* .otpbox <full-number>\n*Example:* .otpbox +1234567890"
            }, { quoted: message });
        }

        try {
            const { data } = await axios.get(
                `https://api.vreden.my.id/api/v1/tools/fakenumber/message?number=${encodeURIComponent(phoneNumber)}`,
                { 
                    timeout: 10000,
                    validateStatus: status => status === 200
                }
            );

            if (!data?.result || !Array.isArray(data.result)) {
                return await sock.sendMessage(chatId, {
                    text: "⚠️ No OTP messages found for this number"
                }, { quoted: message });
            }

            // Format OTP messages
            const otpMessages = data.result.map(msg => {
                const otpMatch = msg.content.match(/\b\d{4,8}\b/g);
                const otpCode = otpMatch ? otpMatch[0] : "Not found";
                
                return `┌ *From:* ${msg.from || "Unknown"}
│ *Code:* ${otpCode}
│ *Time:* ${msg.time_wib || msg.timestamp}
└ *Message:* ${msg.content.substring(0, 50)}${msg.content.length > 50 ? "..." : ""}`;
            }).join("\n\n");

            const resultText = 
`╭──「 🔑 OTP MESSAGES 」
│ Number: ${phoneNumber}
│ Messages Found: ${data.result.length}
│
${otpMessages}
╰──「 📌 Use .tempnum to get numbers 」`;

            await sock.sendMessage(chatId, {
                text: resultText
            }, { quoted: message });

        } catch (error) {
            console.error("OTP Check Error:", error);
            
            if (error.code === "ECONNABORTED") {
                await sock.sendMessage(chatId, {
                    text: "⌛ OTP check timed out. Try again later"
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Error: ${error.response?.data?.error || error.message}`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Otpbox Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = otpboxCommand;v
