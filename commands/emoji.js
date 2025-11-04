async function emojiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🙂', key: message.key }
        });

        try {
            if (!text || text.split(' ').length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "Please provide some text to convert into emojis!\n\nUsage: .emoji hello world"
                }, { quoted: message });
            }

            const query = text.split(' ').slice(1).join(' ').trim();
            
            const emojiMapping = {
                "a": "🅰️", "b": "🅱️", "c": "🇨️", "d": "🇩️", "e": "🇪️",
                "f": "🇫️", "g": "🇬️", "h": "🇭️", "i": "🇮️", "j": "🇯️",
                "k": "🇰️", "l": "🇱️", "m": "🇲️", "n": "🇳️", "o": "🅾️",
                "p": "🇵️", "q": "🇶️", "r": "🇷️", "s": "🇸️", "t": "🇹️",
                "u": "🇺️", "v": "🇻️", "w": "🇼️", "x": "🇽️", "y": "🇾️",
                "z": "🇿️", "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣",
                "4": "4️⃣", "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣",
                "9": "9️⃣", " ": "␣"
            };

            let emojiText = query.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

            await sock.sendMessage(chatId, {
                text: emojiText
            }, { quoted: message });

        } catch (error) {
            console.error('Emoji Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to convert text to emojis. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Emoji Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = emojiCommand;
