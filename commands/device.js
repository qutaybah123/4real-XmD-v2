const { getDevice } = require('@whiskeysockets/baileys');
const settings = require("../settings");

async function deviceCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, {
            react: { text: '📱', key: message.key }
        });

        // Check if message is quoted
        if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please quote a message to use this command!*\n\n*Usage:* Reply to any message with `.device` to detect the device type."
            }, { quoted: message });
        }

        try {
            const quotedMsg = message.message.extendedTextMessage.contextInfo;
            const messageId = quotedMsg.stanzaId;

            console.log('Quoted Message ID:', messageId);
            console.log('Quoted Key:', quotedMsg);

            if (!messageId) {
                return await sock.sendMessage(chatId, {
                    text: "❌ *Could not detect message details.*\n\nPlease try with a newly sent message."
                }, { quoted: message });
            }

            const device = getDevice(messageId) || 'Unknown';

            const deviceMessage = 
`📱 *DEVICE DETECTION*

*Message ID:* ${messageId}
*Device Type:* ${device}

${getDeviceEmoji(device)} *${formatDeviceName(device)}*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

            await sock.sendMessage(chatId, {
                text: deviceMessage
            }, { quoted: message });

        } catch (error) {
            console.error("Device Detection Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ *Error analyzing message.*\n\nCould not determine device information. Please try with a different message."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Device Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: message });
    }
}

// Helper function to get appropriate emoji for device type
function getDeviceEmoji(device) {
    const deviceEmojis = {
        'android': '🤖',
        'ios': '📱',
        'web': '🌐',
        'desktop': '💻',
        'unknown': '❓'
    };
    
    const deviceLower = device.toLowerCase();
    for (const [key, emoji] of Object.entries(deviceEmojis)) {
        if (deviceLower.includes(key)) {
            return emoji;
        }
    }
    return '📱';
}

// Helper function to format device name
function formatDeviceName(device) {
    const deviceMap = {
        'android': 'Android Device',
        'ios': 'iPhone/iOS Device',
        'web': 'Web Browser',
        'desktop': 'Desktop App',
        'unknown': 'Unknown Device'
    };
    
    const deviceLower = device.toLowerCase();
    for (const [key, name] of Object.entries(deviceMap)) {
        if (deviceLower.includes(key)) {
            return name;
        }
    }
    return device.charAt(0).toUpperCase() + device.slice(1);
}

module.exports = deviceCommand;
