const fetch = require("node-fetch");

async function dareCommand(sock, chatId, message) {
    try {
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🎯', key: message.key }
        });

        try {
            const shizokeys = 'shizo';
            const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);
            
            if (!res.ok) {
                throw new Error(`API request failed with status ${res.status}`);
            }

            const json = await res.json();

            if (!json.result) {
                throw new Error("Invalid API response: No 'result' field found.");
            }

            const dareText = `🎯 *Dare Challenge:*\n\n${json.result}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

            await sock.sendMessage(chatId, {
                text: dareText
            }, { quoted: message });

        } catch (error) {
            console.error("Dare API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Sorry, something went wrong while fetching the dare. Please try again later."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Dare Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = dareCommand;
