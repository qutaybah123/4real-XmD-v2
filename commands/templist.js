const axios = require("axios");
const { isSudo } = require('../lib/index');
const settings = require('../settings'); // Add this import

async function templistCommand(sock, chatId, message) {
    try {
        // Check if user is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        
        // Proper owner check - compare with owner number from settings
        const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
        const isOwner = message.key.fromMe || senderId === ownerJid || senderIsSudo;

        if (!isOwner) {
            return await sock.sendMessage(chatId, {
                text: "🚫 *Command Require Roots Priviledge Access Denied!*"
            }, { quoted: message });
        }

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🌍', key: message.key }
        });

        try {
            const { data } = await axios.get(
                "https://api.vreden.my.id/api/v1/tools/fakenumber/country",
                { timeout: 10000 }
            );

            if (!data || !data.result) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Couldn't fetch country list."
                }, { quoted: message });
            }

            const countries = data.result.map((c, i) => 
                `*${i + 1}.* ${c.title} (${c.id})`
            ).join("\n");

            const resultText = 
`🌍 *Total Available Countries:* ${data.result.length}

${countries}

📌 *Usage:* .tempnum <country-code>
*Example:* .tempnum us`;

            await sock.sendMessage(chatId, {
                text: resultText
            }, { quoted: message });

        } catch (error) {
            console.error("Templist API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch temporary number country list."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Templist Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = templistCommand;
