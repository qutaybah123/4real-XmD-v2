async function eightBallCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🎱', key: message.key }
        });

        try {
            if (!text || text.split(' ').length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "Ask a yes/no question!\n\nExample: .8ball Will I be rich?"
                }, { quoted: message });
            }

            const responses = [
                "Yes!", "No.", "Maybe...", "Definitely!", "Not sure.", 
                "Ask again later.", "I don't think so.", "Absolutely!", 
                "No way!", "Looks promising!"
            ];
            
            let answer = responses[Math.floor(Math.random() * responses.length)];
            
            await sock.sendMessage(chatId, {
                text: `🎱 *Magic 8-Ball says:* ${answer}`
            }, { quoted: message });

        } catch (error) {
            console.error('8Ball Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to consult the magic ball. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('8Ball Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = eightBallCommand;
