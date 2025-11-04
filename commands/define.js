const axios = require('axios');

async function defineCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🔍', key: message.key }
        });

        try {
            if (!text || text.split(' ').length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "Please provide a word to define.\n\n📌 *Usage:* .define [word]"
                }, { quoted: message });
            }

            const word = text.split(' ').slice(1).join(' ').trim();
            const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

            const response = await axios.get(url);
            const definitionData = response.data[0];

            const definition = definitionData.meanings[0].definitions[0].definition;
            const example = definitionData.meanings[0].definitions[0].example || '❌ No example available';
            const synonyms = definitionData.meanings[0].definitions[0].synonyms?.join(', ') || '❌ No synonyms available';
            const phonetics = definitionData.phonetics[0]?.text || '🔇 No phonetics available';
            const audio = definitionData.phonetics[0]?.audio || null;

            const wordInfo = `
📖 *Word*: *${definitionData.word}*  
🗣️ *Pronunciation*: _${phonetics}_  
📚 *Definition*: ${definition}  
✍️ *Example*: ${example}  
📝 *Synonyms*: ${synonyms}  

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

            // Send audio pronunciation if available
            if (audio) {
                await sock.sendMessage(chatId, { 
                    audio: { url: audio }, 
                    mimetype: 'audio/mpeg' 
                }, { quoted: message });
            }

            // Send the definition
            await sock.sendMessage(chatId, {
                text: wordInfo
            }, { quoted: message });

        } catch (error) {
            console.error('Define Command Error:', error);
            
            if (error.response && error.response.status === 404) {
                await sock.sendMessage(chatId, {
                    text: "🚫 *Word not found.* Please check the spelling and try again."
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: "⚠️ An error occurred while fetching the definition. Please try again later."
                }, { quoted: message });
            }
        }
    } catch (error) {
        console.error('Define Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = defineCommand;
