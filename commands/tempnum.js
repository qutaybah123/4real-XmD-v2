const axios = require("axios");
const { isSudo } = require('../lib/index');

async function tempnumCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const countryCode = args[1];

        // Check if user is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = message.key.fromMe || senderIsSudo;

        if (!isOwner) {
            return await sock.sendMessage(chatId, {
                text: "🚫 *Owner/Sudo only Can only access the Command!*"
            }, { quoted: message });
        }

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '📱', key: message.key }
        });

        if (!countryCode) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Usage:* .tempnum <country-code>\n*Example:* .tempnum us\n\n📦 Use .otpbox <number> to check OTPs"
            }, { quoted: message });
        }

        try {
            const { data } = await axios.get(
                `https://api.vreden.my.id/api/v1/tools/fakenumber/number?id=${countryCode.toLowerCase()}`,
                { 
                    timeout: 10000,
                    validateStatus: status => status === 200
                }
            );

            if (!data?.result || !Array.isArray(data.result)) {
                return await sock.sendMessage(chatId, {
                    text: "⚠️ *Invalid API response format*\nTry: .tempnum us"
                }, { quoted: message });
            }

            if (data.result.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `📭 *No numbers available for ${countryCode.toUpperCase()}*\nTry another country code!\n\nUse .otpbox <number> after selection`
                }, { quoted: message });
            }

            // Process numbers
            const numbers = data.result.slice(0, 25);
            const numberList = numbers.map((num, i) => 
                `${String(i+1).padStart(2, ' ')}. ${num.number}`
            ).join("\n");

            const resultText = 
`╭──「 📱 TEMPORARY NUMBERS 」
│
│ Country: ${countryCode.toUpperCase()}
│ Numbers Found: ${numbers.length}
│
${numberList}

╰──「 📦 USE: .otpbox <number> 」
_Example: .otpbox +1234567890_`;

            await sock.sendMessage(chatId, {
                text: resultText
            }, { quoted: message });

        } catch (error) {
            console.error("Tempnum API Error:", error);
            
            if (error.code === "ECONNABORTED") {
                await sock.sendMessage(chatId, {
                    text: "⏳ *Timeout:* API took too long\nTry smaller country codes like 'us', 'gb'"
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *Error:* ${error.message}\nUse format: .tempnum <country-code>`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Tempnum Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = tempnumCommand;
