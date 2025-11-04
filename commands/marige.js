const axios = require("axios");
const { fetchGif, gifToVideo } = require("../lib/fetchGif");

async function marigeCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '💍', key: message.key }
        });

        try {
            // Check if it's a group
            const isGroup = chatId.endsWith('@g.us');
            if (!isGroup) {
                return await sock.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups!"
                }, { quoted: message });
            }

            // Get group metadata
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(user => user.id);
            const sender = message.key.participant || message.key.remoteJid;
            
            // Filter out the sender and bot number
            const eligibleParticipants = participants.filter(id => 
                id !== sender && !id.includes(sock.user.id.split('@')[0])
            );
            
            if (eligibleParticipants.length < 1) {
                return await sock.sendMessage(chatId, { 
                    text: "❌ Not enough participants to perform a marriage!"
                }, { quoted: message });
            }

            // Select random pair
            const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const randomPair = eligibleParticipants[randomIndex];

            // Fetch wedding GIF
            const apiUrl = "https://api.waifu.pics/sfw/hug";
            let res = await axios.get(apiUrl);
            let gifUrl = res.data.url;

            let gifBuffer = await fetchGif(gifUrl);
            let videoBuffer = await gifToVideo(gifBuffer);

            const messageText = `💍 *Shadi Mubarak!* 💒\n\n👰 @${sender.split("@")[0]} + 🤵 @${randomPair.split("@")[0]}\n\nMay you both live happily ever after! 💖`;

            await sock.sendMessage(
                chatId,
                { 
                    video: videoBuffer, 
                    caption: messageText, 
                    gifPlayback: true, 
                    mentions: [sender, randomPair] 
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Marige Command Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to perform marriage ceremony: ${error.message}`,
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Marige Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = marigeCommand;
