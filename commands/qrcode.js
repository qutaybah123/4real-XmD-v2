const axios = require("axios");
const settings = require("../settings");

async function qrcodeCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const qrText = args.slice(1).join(" ");

        await sock.sendMessage(chatId, {
            react: { text: '📱', key: message.key }
        });

        if (!qrText) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please enter text or URL to generate QR code.*\n\n*Example:* .qrcode https://example.com"
            }, { quoted: message });
        }

        try {
            const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrText)}&size=200x200&format=png`;
            
            const qrMessage = 
`📱 *QR CODE GENERATED*

*Content:* ${qrText}

*Size:* 200x200 pixels

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

            // Send the message first
            await sock.sendMessage(chatId, {
                text: qrMessage
            }, { quoted: message });

            // Then send the QR code image
            await sock.sendMessage(chatId, {
                image: { url: apiUrl },
                caption: `🔍 Scan this QR Code\n\nContent: ${qrText}`
            });

        } catch (error) {
            console.error("QR Code API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Error generating QR code. Please try again."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('QR Code Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = qrcodeCommand;
