const axios = require("axios");

async function bibleCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const reference = args.slice(1).join(" ");

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '📖', key: message.key }
        });

        if (!reference) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please provide a Bible reference.*\n\n📌 *Usage:* .bible <book> <chapter>:<verse>\n*Examples:*\n• .bible John 1:1\n• .bible Psalm 23:1\n• .bible Matthew 5:3-12\n• .bible Romans 8:28"
            }, { quoted: message });
        }

        try {
            const apiUrl = `https://bible-api.com/${encodeURIComponent(reference)}`;
            const response = await axios.get(apiUrl, { timeout: 10000 });

            if (response.status === 200 && response.data.text) {
                const { reference: ref, text, translation_name, verses } = response.data;

                // Format the Bible verse response
                const bibleMessage = 
`╭──「 📖 BIBLE VERSE 」──╮
│
│ *${ref}*
│
│ ${text}
│
│ 📚 *Translation:* ${translation_name}
│ 📝 *Verses:* ${verses?.length || 1}
│
╰──「 ✝️ ʟɪɢᴀɴɢ ᴛᴇᴄʜs 」──╯`;

                await sock.sendMessage(chatId, {
                    text: bibleMessage
                }, { quoted: message });

            } else {
                throw new Error("Verse not found");
            }

        } catch (error) {
            console.error("Bible API Error:", error);
            
            if (error.response?.status === 404) {
                await sock.sendMessage(chatId, {
                    text: `❌ *Bible verse not found:* \"${reference}\"\n\n📖 *Please check the reference format:*\n• Use: Book Chapter:Verse\n• Examples:\n  - .bible John 3:16\n  - .bible Psalm 23\n  - .bible Matthew 5:3-10\n  - .bible Romans 8:28-30`
                }, { quoted: message });
            } else if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: "⏳ *Request timeout.* Please try again."
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error fetching Bible verse:* ${error.message}\n\nTry: .bible John 3:16`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Bible Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = bibleCommand;
