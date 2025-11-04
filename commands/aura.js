async function auraCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '💀', key: message.key }
        });

        try {
            if (mentionedJid.length < 1) {
                return await sock.sendMessage(chatId, { 
                    text: "Please mention a user to calculate their aura.\n\nUsage: `.aura @user`"
                }, { quoted: message });
            }

            let user = mentionedJid[0];
            
            // Calculate a random aura score (between 1 to 1000)
            let auraScore = Math.floor(Math.random() * 1000) + 1;

            // Check for special DEV number
            const config = require('../config');
            const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

            if (user === specialNumber) {
                auraScore = 999999;
                return await sock.sendMessage(chatId, {
                    text: `💀 Aura of @${user.split('@')[0]}: ${auraScore}+ 🗿`,
                    mentions: [user]
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                text: `💀 Aura of @${user.split('@')[0]}: ${auraScore}/1000 🗿`,
                mentions: [user]
            }, { quoted: message });

        } catch (error) {
            console.error('Aura Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to calculate aura. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Aura Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = auraCommand;
