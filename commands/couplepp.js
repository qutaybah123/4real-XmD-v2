const axios = require('axios');

async function coupleppCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '💑', key: message.key }
        });

        try {
            await sock.sendMessage(chatId, {
                text: "*💑 Fetching couple profile pictures...*"
            }, { quoted: message });

            const response = await axios.get("https://apis.davidcyriltech.my.id/couplepp");

            if (!response.data || !response.data.success) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Failed to fetch couple profile pictures. Please try again later.",
                }, { quoted: message });
            }

            const malePp = response.data.male;
            const femalePp = response.data.female;

            if (malePp) {
                await sock.sendMessage(chatId, {
                    image: { url: malePp },
                    caption: "👨 Male Couple Profile Picture"
                }, { quoted: message });
            }

            if (femalePp) {
                await sock.sendMessage(chatId, {
                    image: { url: femalePp },
                    caption: "👩 Female Couple Profile Picture"
                }, { quoted: message });
            }

        } catch (error) {
            console.error("CouplePP Command Error:", error);
            await sock.sendMessage(chatId, {
                text: `❌ An error occurred while fetching couple profile pictures: ${error.message}`,
            }, { quoted: message });
        }

    } catch (error) {
        console.error("CouplePP Command Main Error:", error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = coupleppCommand;
