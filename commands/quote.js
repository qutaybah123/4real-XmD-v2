const axios = require("axios");

async function quoteCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            react: { text: '💬', key: message.key }
        });

        try {
            const response = await axios.get("https://api.quotable.io/random", { timeout: 10000 });
            const { content, author } = response.data;

            const quoteMessage = `💬 *"${content}"*\n- ${author}`;

            await sock.sendMessage(chatId, {
                text: quoteMessage
            }, { quoted: message });

        } catch (error) {
            console.error("Quote API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch quote. Please try again later."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Quote Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = quoteCommand;
