const axios = require("axios");

async function factCommand(sock, chatId, message) {
    try {
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🧠', key: message.key }
        });

        try {
            const response = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
            const fact = response.data.text;

            if (!fact) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Failed to fetch a fun fact. Please try again."
                }, { quoted: message });
            }

            const factMessage = `🧠 *Random Fun Fact* 🧠\n\n${fact}`;

            await sock.sendMessage(chatId, {
                text: factMessage
            }, { quoted: message });

        } catch (error) {
            console.error("Fact API Error:", error);
            await sock.sendMessage(chatId, {
                text: "⚠️ An error occurred while fetching a fun fact. Please try again later."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Fact Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = factCommand;
