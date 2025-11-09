const axios = require('axios');

async function countryinfoCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const countryName = args.slice(1).join(" ");

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🌍', key: message.key }
        });

        if (!countryName) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please provide a country name.*\n\n📌 *Usage:* .countryinfo <country>\n*Example:* .countryinfo Tanzania\n*Example:* .countryinfo United States"
            }, { quoted: message });
        }

        try {
            const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(countryName)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });

            if (!data.status || !data.data) {
                return await sock.sendMessage(chatId, {
                    text: `❌ *No information found for* \"${countryName}\"\n\nPlease check the country name and try again.`
                }, { quoted: message });
            }

            const info = data.data;
            
            // Format neighbors text
            let neighborsText = info.neighbors && info.neighbors.length > 0
                ? info.neighbors.map(n => `🌍 ${n.name}`).join(", ")
                : "No neighboring countries found.";

            // Format languages text
            let languagesText = info.languages && info.languages.native
                ? info.languages.native.join(", ")
                : "Information not available";

            const captionText = 
`🌍 *COUNTRY INFORMATION: ${info.name.toUpperCase()}* 🌍

🏛 *Capital:* ${info.capital || 'N/A'}
📍 *Continent:* ${info.continent?.name || 'N/A'} ${info.continent?.emoji || ''}
📞 *Phone Code:* +${info.phoneCode || 'N/A'}
📏 *Area:* ${info.area?.squareKilometers || 'N/A'} km²
🚗 *Driving Side:* ${info.drivingSide || 'N/A'}
💱 *Currency:* ${info.currency || 'N/A'}
🔤 *Languages:* ${languagesText}
🌟 *Famous For:* ${info.famousFor || 'N/A'}
🌍 *ISO Code:* ${info.isoCode?.alpha2?.toUpperCase() || 'N/A'}, ${info.isoCode?.alpha3?.toUpperCase() || 'N/A'}
🌎 *Internet TLD:* ${info.internetTLD || 'N/A'}

🔗 *Neighboring Countries:*
${neighborsText}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

            // Send message with country flag image
            await sock.sendMessage(chatId, {
                image: { url: info.flag },
                caption: captionText
            }, { quoted: message });

        } catch (error) {
            console.error("Country Info API Error:", error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: "⏳ *Request timeout.* Please try again with a different country name."
                }, { quoted: message });
            } else if (error.response?.status === 404) {
                await sock.sendMessage(chatId, {
                    text: `❌ *Country not found:* \"${countryName}\"\n\nPlease check the spelling and try again.`
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error fetching country information:* ${error.message}`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Countryinfo Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = countryinfoCommand;
