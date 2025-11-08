const axios = require("axios");

async function jokeCommand(sock, chatId, message) {
    try {
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🤣', key: message.key }
        });

        try {
            const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
            const joke = response.data;

            if (!joke || !joke.setup || !joke.punchline) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Failed to fetch a joke. Please try again."
                }, { quoted: message });
            }

            const jokeMessage = `🤣 *Here's a random joke for you!* 🤣\n\n*${joke.setup}*\n\n${joke.punchline} 😆`;

            await sock.sendMessage(chatId, {
                text: jokeMessage
            }, { quoted: message });

        } catch (error) {
            console.error("Joke API Error:", error);
            await sock.sendMessage(chatId, {
                text: "⚠️ An error occurred while fetching the joke. Please try again."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Joke Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = jokeCommand;
