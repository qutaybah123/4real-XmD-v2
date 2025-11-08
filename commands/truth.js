const fetch = require("node-fetch");

async function truthCommand(sock, chatId, message) {
    try {
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '❓', key: message.key }
        });

        try {
            const shizokeys = 'shizo';
            const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
            
            if (!res.ok) {
                throw new Error(`API request failed with status ${res.status}`);
            }

            const json = await res.json();

            if (!json.result) {
                throw new Error("Invalid API response: No 'result' field found.");
            }

            const truthText = `❓ *Truth Question:*\n\n${json.result}`;

            await sock.sendMessage(chatId, {
                text: truthText
            }, { quoted: message });

        } catch (error) {
            console.error("Truth API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Sorry, something went wrong while fetching the truth question. Please try again later."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Truth Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = truthCommand;
