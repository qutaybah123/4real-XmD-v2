async function roastCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🔥', key: message.key }
        });

        try {
            const roasts = [
                "Bro, your IQ is lower than a Wi-Fi signal!",
                "Your thinking is like a WhatsApp status—disappears in 24 hours!",
                "You think too much, what are you? A NASA scientist?",
                "Who even are you? Even Google can't find your name!",
                "Is your brain running on 2G or what?",
                "Don't overthink, bro—your battery will drain faster!",
                "Your thoughts are like a cricket match—stop when it rains!",
                "You're VIP — Very Idiotic Person!",
                "Bro, your IQ is worse than a dropped Wi-Fi connection!",
                "Your mindset disappears faster than a WhatsApp status!",
                "Which planet are you from? This world isn't for aliens like you!",
                "There's so much to search in your brain, yet nothing turns up!",
                "Your life is like a WhatsApp status—can be deleted anytime!",
                "Your style is like a Wi-Fi password—no one really knows it!",
                "You're the guy who Googles his own life plot twists!",
                "Even a software update wouldn't fix you—you're permanently stuck!",
                "It takes more effort to understand you than Googling anything!",
                "I have no shortage of words, just not in the mood to roast you... yet!",
                "Your personality is like a dead battery—needs charging ASAP!",
                "Your thinking deserves its own dedicated server!"
            ];

            let mentionedUser = mentionedJid[0] || (quoted && quoted.participant);
            
            if (!mentionedUser) {
                return await sock.sendMessage(chatId, { 
                    text: "Usage: .roast @user (Tag someone to roast them!)"
                }, { quoted: message });
            }

            let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
            let sender = message.key.participant || message.key.remoteJid;
            let target = mentionedUser;

            let roastMessage = `@${target.split("@")[0]} :\n *${randomRoast}*\n> This is all for fun, don't take it seriously!`;

            await sock.sendMessage(chatId, {
                text: roastMessage,
                mentions: [sender, target]
            }, { quoted: message });

        } catch (error) {
            console.error('Roast Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to roast. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Roast Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = roastCommand;
