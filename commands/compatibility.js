async function compatibilityCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '💖', key: message.key }
        });

        try {
            if (mentionedJid.length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "Please mention two users to calculate compatibility.\n\nUsage: `.compatibility @user1 @user2`"
                }, { quoted: message });
            }

            let user1 = mentionedJid[0]; 
            let user2 = mentionedJid[1];

            // Calculate a random compatibility score (between 1 to 1000)
            let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

            // Check for special DEV number
            const config = require('../config');
            const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

            if (user1 === specialNumber || user2 === specialNumber) {
                compatibilityScore = 1000;
                return await sock.sendMessage(chatId, {
                    text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}+/1000 💖`,
                    mentions: [user1, user2]
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}/1000 💖`,
                mentions: [user1, user2]
            }, { quoted: message });

        } catch (error) {
            console.error('Compatibility Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to calculate compatibility. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Compatibility Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = compatibilityCommand;
