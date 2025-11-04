const axios = require("axios");

async function ringtoneCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🎵', key: message.key }
        });

        try {
            if (!text || text.split(' ').length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "Please provide a search query!\n\nExample: .ringtone Suna"
                }, { quoted: message });
            }

            const query = text.split(' ').slice(1).join(' ').trim();
            const apiUrl = `https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`;

            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result || data.result.length === 0) {
                return await sock.sendMessage(chatId, { 
                    text: "No ringtones found for your query. Please try a different keyword."
                }, { quoted: message });
            }

            const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];

            await sock.sendMessage(
                chatId,
                {
                    audio: { url: randomRingtone.dl_link },
                    mimetype: "audio/mpeg",
                    fileName: `${randomRingtone.title}.mp3`,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Ringtone Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Sorry, something went wrong while fetching the ringtone. Please try again later.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Ringtone Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = ringtoneCommand;
