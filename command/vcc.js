const axios = require("axios");
const settings = require("../settings");

async function vccCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            react: { text: '💳', key: message.key }
        });

        try {
            const apiUrl = `https://api.apiverve.com/v1/cardgenerator?brand=visa&count=5`;
            const response = await axios.get(apiUrl, { 
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'caadf82a-3b4f-441a-af04-fbe886e62b70'
                }
            });

            // Check if response is successful and has data
            if (response.status === 200 && response.data && response.data.status === "ok" && response.data.data && response.data.data.cards) {
                const cards = response.data.data.cards;
                const brand = response.data.data.brand.toUpperCase();
                const owner = response.data.data.owner;

                let vccMessage = `🎴 *GENERATED VCCS*\n*Type:* ${brand} | *Count:* ${cards.length}\n\n`;

                cards.forEach((card, index) => {
                    vccMessage += 
`#️⃣ *Card ${index + 1}:*
🔢 *Number:* ${card.number_alt?.unmasked || card.number}
📅 *Expiry:* ${card.expiration}
🧾 *Holder:* ${owner.name}
🔒 *CVV:* ${card.cvv}
🏦 *Issuer:* ${card.issuer}
🆔 *Last 4:* ${card.number_alt?.last4 || card.number.slice(-4)}\n\n`;
                });

                // Add owner information
                vccMessage += `👤 *Cardholder Information:*
🧾 *Name:* ${owner.name}
🏠 *Address:* ${owner.address.street}, ${owner.address.city}, ${owner.address.state} ${owner.address.zipCode}\n\n`;

                vccMessage += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

                await sock.sendMessage(chatId, {
                    text: vccMessage
                }, { quoted: message });

            } else {
                await sock.sendMessage(chatId, {
                    text: "❌ *Invalid Response*\n\nThe API returned an unexpected response format. Please try again later."
                }, { quoted: message });
            }

        } catch (error) {
            console.error("VCC API Error:", error.message);
            
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 401) {
                    await sock.sendMessage(chatId, {
                        text: "❌ *API Key Error*\n\nThe VCC service is currently unavailable due to authentication issues."
                    }, { quoted: message });
                } else if (error.response.status === 429) {
                    await sock.sendMessage(chatId, {
                        text: "❌ *Rate Limit Exceeded*\n\nToo many requests. Please try again in a few minutes."
                    }, { quoted: message });
                } else if (error.response.status >= 500) {
                    await sock.sendMessage(chatId, {
                        text: `❌ *Service Temporarily Unavailable*\n\nThe VCC service is currently experiencing issues. Please try again later.\n\n*Error:* ${error.response.status}`
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `❌ *API Error:* ${error.response.status}\n\nPlease try again later.`
                    }, { quoted: message });
                }
            } else if (error.request) {
                // Request was made but no response received
                await sock.sendMessage(chatId, {
                    text: "❌ *Network Error*\n\nUnable to connect to the VCC service. Please check your connection and try again."
                }, { quoted: message });
            } else {
                // Something else happened
                await sock.sendMessage(chatId, {
                    text: "❌ *Unexpected Error*\n\nAn error occurred while generating VCCs. Please try again."
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('VCC Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = vccCommand;
