const axios = require('axios');
const fetch = require('node-fetch');

async function praytimeCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const city = args.slice(1).join(" ") || "bhakkar"; // Default to Bhakkar if no city provided

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🕌', key: message.key }
        });

        try {
            const apiUrl = `https://api.nexoracle.com/islamic/prayer-times?city=${encodeURIComponent(city)}`;
            const response = await fetch(apiUrl, { timeout: 15000 });

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== 200 || !data.result) {
                throw new Error("Failed to get prayer times data");
            }

            const prayerTimes = data.result.items?.[0];
            const weather = data.result.today_weather;
            const location = data.result.city;

            if (!prayerTimes) {
                throw new Error("No prayer times data available");
            }

            // Build the message content
            let prayerMessage = `🕌 *PRAYER TIMES FOR ${location.toUpperCase()}*\n\n`;
            prayerMessage += `📍 *Location:* ${location}, ${data.result.state || 'N/A'}, ${data.result.country || 'N/A'}\n`;
            prayerMessage += `📅 *Date:* ${new Date().toLocaleDateString()}\n`;
            prayerMessage += `🕌 *Method:* ${data.result.prayer_method_name || 'Standard'}\n\n`;

            prayerMessage += `🌅 *Fajr:* ${prayerTimes.fajr || 'N/A'}\n`;
            prayerMessage += `🌄 *Shurooq:* ${prayerTimes.shurooq || 'N/A'}\n`;
            prayerMessage += `☀️ *Dhuhr:* ${prayerTimes.dhuhr || 'N/A'}\n`;
            prayerMessage += `🌇 *Asr:* ${prayerTimes.asr || 'N/A'}\n`;
            prayerMessage += `🌆 *Maghrib:* ${prayerTimes.maghrib || 'N/A'}\n`;
            prayerMessage += `🌃 *Isha:* ${prayerTimes.isha || 'N/A'}\n\n`;

            prayerMessage += `🧭 *Qibla Direction:* ${data.result.qibla_direction || 'N/A'}°\n`;

            const temperature = weather?.temperature !== null && weather?.temperature !== undefined 
                ? `${weather.temperature}°C` 
                : 'Data not available';
            prayerMessage += `🌡️ *Temperature:* ${temperature}\n\n`;

            prayerMessage += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

            // Send image with prayer times
            await sock.sendMessage(chatId, {
                image: { url: `https://files.catbox.moe/swpr8s.jpg` },
                caption: prayerMessage
            }, { quoted: message });

            // Send Islamic audio
            try {
                await sock.sendMessage(chatId, {
                    audio: { url: 'https://github.com/JawadYT36/KHAN-DATA/raw/refs/heads/main/autovoice/Islamic.m4a' },
                    mimetype: 'audio/mp4',
                    fileName: 'islamic_reminder.m4a'
                });
            } catch (audioError) {
                console.log('Audio sending failed, continuing without audio');
            }

        } catch (error) {
            console.error("Praytime API Error:", error);
            
            if (error.message.includes('fetch failed') || error.code === 'ENOTFOUND') {
                await sock.sendMessage(chatId, {
                    text: `❌ *Network error.* Cannot connect to prayer times service.\n\nTry again later or use: .praytime [city-name]`
                }, { quoted: message });
            } else if (error.message.includes('status')) {
                await sock.sendMessage(chatId, {
                    text: `❌ *Service unavailable.* Prayer times service is currently down.\n\nTry: .praytime mecca`
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error fetching prayer times for* \"${city}\"\n\nPlease check the city name and try again.\n*Example:* .praytime mecca`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Praytime Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = praytimeCommand;
