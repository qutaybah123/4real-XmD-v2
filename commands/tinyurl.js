const axios = require("axios");
const settings = require("../settings");

async function tinyurlCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const url = args.slice(1).join(" ");

        await sock.sendMessage(chatId, {
            react: { text: '🔗', key: message.key }
        });

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Please provide a URL to shorten.*\n\n*Example:* .tinyurl https://instagram.com/ligang_.4real`
            }, { quoted: message });
        }

        // Basic URL validation
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Invalid URL format.*\n\nPlease include http:// or https:// in your URL."
            }, { quoted: message });
        }

        try {
            const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl, { timeout: 10000 });

            if (response.status === 200 && response.data) {
                const shortUrl = response.data;

                const successMessage = 
`🔗 *URL SHORTENER*

*Original URL:*
${url}

*Shortened URL:*
${shortUrl}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

                await sock.sendMessage(chatId, {
                    text: successMessage
                }, { quoted: message });

            } else {
                await sock.sendMessage(chatId, {
                    text: "❌ *Failed to shorten URL.*\n\nThe service returned an empty response. Please try again."
                }, { quoted: message });
            }

        } catch (error) {
            console.error("TinyURL API Error:", error);
            
            if (error.response) {
                if (error.response.status === 400) {
                    await sock.sendMessage(chatId, {
                        text: "❌ *Invalid URL.*\n\nPlease check the URL and try again."
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `❌ *API Error (${error.response.status})*\n\nUnable to shorten URL at the moment. Please try again later.`
                    }, { quoted: message });
                }
            } else if (error.request) {
                await sock.sendMessage(chatId, {
                    text: "❌ *Network Error*\n\nUnable to connect to the URL shortening service. Please check your connection."
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: "❌ *Unexpected Error*\n\nAn error occurred while shortening the URL. Please try again."
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('TinyURL Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = tinyurlCommand;
