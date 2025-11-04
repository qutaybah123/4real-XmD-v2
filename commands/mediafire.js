const axios = require("axios");

async function mediafireCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🎥', key: message.key }
        });

        try {
            if (!text || text.split(' ').length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "❌ Please provide a valid MediaFire link.\n\nExample: .mediafire https://www.mediafire.com/..."
                }, { quoted: message });
            }

            const url = text.split(' ')[1].trim();
            const response = await axios.get(`https://api.berryapi.rest/api/mediafire?url=${url}`);
            const data = response.data;

            if (!data || !data.success || !data.result || !data.result.download) {
                return await sock.sendMessage(chatId, { 
                    text: "⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public."
                }, { quoted: message });
            }

            const { download, filename, size } = data.result;

            await sock.sendMessage(chatId, {
                react: { text: "⬆️", key: message.key }
            });

            const caption = `╭━━⪨ *MEDIAFIRE DOWNLOADER* ⪩━━⊷
┃▸ *FILE NAME:* ${filename}
┃▸ *FILE SIZE:* ${size}
┃╰━━━━━━━━━━━━━━━━━━━━━
📥 *Downloading your file...*`;

            await sock.sendMessage(chatId, {
                document: { url: download },
                mimetype: "application/octet-stream",
                fileName: filename,
                caption: caption
            }, { quoted: message });

        } catch (error) {
            console.error('MediaFire Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ An error occurred while processing your request. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('MediaFire Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = mediafireCommand;
