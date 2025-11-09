const axios = require("axios");

async function rwCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const query = args.slice(1).join(" ") || "random";

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🌌', key: message.key }
        });

        try {
            const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;
            const { data } = await axios.get(apiUrl, { timeout: 15000 });

            if (data.status && data.imgUrl) {
                const caption = `🌌 *RANDOM WALLPAPER*`;

                await sock.sendMessage(chatId, {
                    image: { url: data.imgUrl },
                    caption: caption
                }, { quoted: message });

            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *No wallpaper found for* \"${query}\"\n\nTry different keywords like:\n• nature\n• anime\n• cars\n• abstract\n• minimal`
                }, { quoted: message });
            }

        } catch (error) {
            console.error("Wallpaper API Error:", error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: "⏳ *Request timeout.* Please try again with a different keyword."
                }, { quoted: message });
            } else if (error.response?.status === 404) {
                await sock.sendMessage(chatId, {
                    text: `❌ *Wallpaper service unavailable.*\nTry again later.`
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error fetching wallpaper:* ${error.message}`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('RW Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = rwCommand;
