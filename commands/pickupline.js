const fetch = require("node-fetch");

async function pickuplineCommand(sock, chatId, message) {
    try {
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '💬', key: message.key }
        });

        try {
            const res = await fetch('https://api.popcat.xyz/pickuplines');
            
            if (!res.ok) {
                throw new Error(`API request failed with status ${res.status}`);
            }

            const json = await res.json();

            const pickupLine = `💬 *Pickup Line:*\n\n"${json.pickupline}"`;

            await sock.sendMessage(chatId, {
                text: pickupLine
            }, { quoted: message });

        } catch (error) {
            console.error("Pickupline API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Sorry, something went wrong while fetching the pickup line. Please try again later."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Pickupline Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = pickuplineCommand;
