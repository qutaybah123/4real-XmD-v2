const axios = require("axios");
const settings = require("../settings");

async function gdriveCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🌐', key: message.key }
        });

        try {
            if (!text || text.split(' ').length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "❌ Please provide a valid Google Drive link.\n\nExample: .gdrive https://drive.google.com/..."
                }, { quoted: message });
            }

            const url = text.split(' ')[1].trim();
            const apiUrl = `https://api.berryapi.rest/api/gdrive?url=${url}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.success || !data.result || !data.result.download) {
                return await sock.sendMessage(chatId, { 
                    text: "⚠️ No download URL found. Please check the link and try again."
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                react: { text: "⬆️", key: message.key }
            });

            await sock.sendMessage(chatId, {
                document: { url: data.result.download },
                mimetype: data.result.mimetype || "application/octet-stream",
                fileName: data.result.filename || "gdrive_download",
                caption: "> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*"
            }, { quoted: message });

            await sock.sendMessage(chatId, {
                react: { text: "✅", key: message.key }
            });

        } catch (error) {
            console.error('GDrive Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ An error occurred while fetching the Google Drive file. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('GDrive Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = gdriveCommand;
