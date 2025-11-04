async function lovetestCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '❤️', key: message.key }
        });

        try {
            if (mentionedJid.length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "Tag two users!\n\nExample: .lovetest @user1 @user2"
                }, { quoted: message });
            }

            let user1 = mentionedJid[0];
            let user2 = mentionedJid[1];

            let lovePercent = Math.floor(Math.random() * 100) + 1;

            let messages = [
                { range: [90, 100], text: "💖 *A match made in heaven!* True love exists!" },
                { range: [75, 89], text: "😍 *Strong connection!* This love is deep and meaningful." },
                { range: [50, 74], text: "😊 *Good compatibility!* You both can make it work." },
                { range: [30, 49], text: "🤔 *It's complicated!* Needs effort, but possible!" },
                { range: [10, 29], text: "😅 *Not the best match!* Maybe try being just friends?" },
                { range: [1, 9], text: "💔 *Uh-oh!* This love is as real as a Bollywood breakup!" }
            ];

            let loveMessage = messages.find(msg => lovePercent >= msg.range[0] && lovePercent <= msg.range[1]).text;

            let resultMessage = `💘 *Love Compatibility Test* 💘\n\n❤️ *@${user1.split("@")[0]}* + *@${user2.split("@")[0]}* = *${lovePercent}%*\n${loveMessage}`;

            await sock.sendMessage(chatId, {
                text: resultMessage,
                mentions: [user1, user2]
            }, { quoted: message });

        } catch (error) {
            console.error('Lovetest Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to test love compatibility. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Lovetest Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = lovetestCommand;
