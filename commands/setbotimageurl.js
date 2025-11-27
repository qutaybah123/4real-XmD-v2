const axios = require("axios");
const settings = require("../settings");
const fs = require('fs');
const path = require('path');

async function setbotimageurlCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const imageUrl = args[1];

        await sock.sendMessage(chatId, {
            react: { text: '🖼️', key: message.key }
        });

        // Check if user is owner
        const senderId = message.key.participant || message.key.remoteJid;
        const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
        const isFromMe = message.key.fromMe;
        const { isSudo } = require('../lib/index');
        const senderIsSudo = await isSudo(senderId);
        const isOwner = isFromMe || senderId === ownerJid || senderIsSudo;

        if (!isOwner) {
            return await sock.sendMessage(chatId, {
                text: "❌ Only the bot owner can change the bot image URL."
            }, { quoted: message });
        }

        if (!imageUrl) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Please provide an image URL.*\n\n*Current Bot Image URL:*\n${global.botImageUrl || 'Not set'}\n\n*Usage:* .setimageurl [image-url]\n\n*Example:*\n.setimageurl https://example.com/bot-image.jpg`
            }, { quoted: message });
        }

        // Validate URL format
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Invalid URL Format*\n\nPlease provide a valid HTTP or HTTPS URL."
            }, { quoted: message });
        }

        try {
            // Test if the image URL is accessible
            const response = await axios.head(imageUrl, { timeout: 10000 });
            const contentType = response.headers['content-type'];
            
            if (!contentType || !contentType.startsWith('image/')) {
                return await sock.sendMessage(chatId, {
                    text: "❌ *Invalid Image URL*\n\nThe provided URL does not point to a valid image file."
                }, { quoted: message });
            }

            // Update the global variable
            global.botImageUrl = imageUrl;

            // Save to settings file for persistence
            await saveBotImageUrl(imageUrl);

            const successMessage = 
`🖼️ *BOT IMAGE URL UPDATED*

✅ Successfully updated the bot's image URL!

*New Image URL:*
${imageUrl}`;

            await sock.sendMessage(chatId, {
                text: successMessage
            }, { quoted: message });

            // Optionally send a preview of the new image
            try {
                await sock.sendMessage(chatId, {
                    image: { url: imageUrl },
                    caption: "📸 *Preview of new bot image*"
                });
            } catch (previewError) {
                console.error("Failed to send image preview:", previewError);
                await sock.sendMessage(chatId, {
                    text: "⚠️ *Note:* Could not load image preview. Please verify the URL manually."
                });
            }

        } catch (error) {
            console.error("Image URL validation error:", error);
            
            if (error.response) {
                await sock.sendMessage(chatId, {
                    text: `❌ *URL Access Error (${error.response.status})*\n\nUnable to access the provided image URL. Please check if the URL is correct and publicly accessible.`
                }, { quoted: message });
            } else if (error.request) {
                await sock.sendMessage(chatId, {
                    text: "❌ *Network Error*\n\nUnable to reach the provided URL. Please check your internet connection and try again."
                }, { quoted: message });
            } else if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: "❌ *Timeout Error*\n\nThe image URL took too long to respond. Please try a different image host."
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Validation Error*\n\nFailed to validate the image URL: ${error.message}`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Set Bot Image URL Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: message });
    }
}

// Helper function to save bot image URL to settings file
async function saveBotImageUrl(imageUrl) {
    try {
        const settingsPath = path.join(__dirname, '../settings.js');
        
        // Read current settings
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        // Check if botImageUrl already exists in settings
        if (settingsContent.includes('botImageUrl:')) {
            // Update existing botImageUrl
            settingsContent = settingsContent.replace(
                /botImageUrl:\s*["'][^"']*["']/,
                `botImageUrl: "${imageUrl}"`
            );
        } else {
            // Add botImageUrl to settings (before the closing brace)
            settingsContent = settingsContent.replace(
                /module\.exports\s*=\s*{([^}]+)}/,
                `module.exports = {$1    botImageUrl: "${imageUrl}",\n}`
            );
        }
        
        // Write updated settings back
        fs.writeFileSync(settingsPath, settingsContent, 'utf8');
        
        console.log('Bot image URL saved to settings:', imageUrl);
        return true;
    } catch (error) {
        console.error('Error saving bot image URL to settings:', error);
        return false;
    }
}

// Helper function to get current bot image URL
function getCurrentBotImageUrl() {
    return global.botImageUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbzLpxAyMMFyvSATmkrx_VXMki2k0LyNl7WIDglkASBQ&s=10";
}

module.exports = {
    setbotimageurlCommand,
    getCurrentBotImageUrl
};
