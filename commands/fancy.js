
const axios = require("axios");
const settings = require("../settings");
async function fancyCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text.split(' ');
        const q = args.slice(1).join(' ');

        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "❎ Please provide text to convert.\n\n*Example:* .fancy Hello"
            }, { quoted: message });
        }

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '✍️', key: message.key }
        });

        console.log('🔄 Fetching fancy text for:', q);

        const apiUrl = `https://billowing-waterfall-dbab.bot1newnew.workers.dev/?word=${encodeURIComponent(q)}`;
        console.log('🌐 API URL:', apiUrl);

        const response = await axios.get(apiUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log('✅ API Response status:', response.status);
        console.log('✅ API Data type:', typeof response.data);
        console.log('✅ Is array?:', Array.isArray(response.data));

        if (!Array.isArray(response.data)) {
            console.log('❌ API did not return array. Actual response:', typeof response.data, response.data);
            return await sock.sendMessage(chatId, {
                text: "❌ Error: API returned invalid format"
            }, { quoted: message });
        }

        const fonts = response.data;
        console.log('🎨 Number of fonts received:', fonts.length);

        if (fonts.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ No font styles found for your text."
            }, { quoted: message });
        }

        // Build the response message
        let resultText = `✨ *FANCY TEXT STYLES FOR:* "${q}"\n\n`;
        
        // Show first 20 styles to avoid message being too long
        const displayFonts = fonts.slice(0, 20);
        
        displayFonts.forEach((font, index) => {
            resultText += `*${index + 1}.* ${font}\n`;
        });

        if (fonts.length > 20) {
            resultText += `\n... and ${fonts.length - 20} more styles`;
        }

        resultText += `\n\n📝 *Total ${fonts.length} styles generated*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;
        console.log('📤 Sending response to user...');
        
        await sock.sendMessage(chatId, {
            text: resultText
        }, { quoted: message });

        console.log('✅ Response sent successfully!');

    } catch (error) {
        console.error('❌ Fancy command error:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            await sock.sendMessage(chatId, {
                text: "❌ Request timeout. Please try again."
            }, { quoted: message });
        } else if (error.response) {
            await sock.sendMessage(chatId, {
                text: `❌ API Error: ${error.response.status} - ${error.response.statusText}`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            }, { quoted: message });
        }
    }
}

module.exports = fancyCommand;
