const axios = require("axios");

async function fancyCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const command = args.shift()?.toLowerCase();
        const q = args.join(" ");

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '✍️', key: message.key }
        });

        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "❎ Please provide text to convert.\n\n*Example:* .fancy Hello",
            }, { quoted: message });
        }

        try {
            const apiUrl = `https://billowing-waterfall-dbab.bot1newnew.workers.dev/?word=${encodeURIComponent(q)}`;
            const res = await axios.get(apiUrl);

            if (!res.data.status || !Array.isArray(res.data.result)) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Error fetching fonts. Try again later.",
                }, { quoted: message });
            }

            const fonts = res.data.result;
            const maxDisplay = 44;
            const displayList = fonts.slice(0, maxDisplay);

            let menuText = "╭──⪨ *FANCY STYLES* ⪩──⬣\n";
            displayList.forEach((f, i) => {
                menuText += `┃ ${i + 1}. ${f.result}\n`;
            });
            menuText += "╰──────────────⬣\n\n📌 *Reply with the number to select a font style for:*\n❝ " + q + " ❞";

            const sentMsg = await sock.sendMessage(chatId, {
                text: menuText
            }, { quoted: message });

            const messageID = sentMsg.key.id;

            const messageHandler = async (msgData) => {
                const receivedMsg = msgData.messages?.[0];
                if (!receivedMsg || !receivedMsg.message) return;

                const receivedText = receivedMsg.message.conversation ||
                    receivedMsg.message.extendedTextMessage?.text;

                const senderID = receivedMsg.key.remoteJid;
                const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (isReplyToBot && senderID === chatId) {
                    const selectedNumber = parseInt(receivedText.trim());
                    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > displayList.length) {
                        return sock.sendMessage(chatId, {
                            text: `❎ Invalid selection. Please reply with a number from 1 to ${displayList.length}.`,
                        }, { quoted: receivedMsg });
                    }

                    const chosen = displayList[selectedNumber - 1];
                    const finalText = `✨ *Your Text in ${chosen.name || 'Selected Style'}:*\n\n${chosen.result}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

                    await sock.sendMessage(chatId, {
                        text: finalText
                    }, { quoted: receivedMsg });
                }
            };

            sock.ev.on("messages.upsert", messageHandler);

        } catch (error) {
            console.error("Fancy Command Error:", error);
            await sock.sendMessage(chatId, {
                text: `❌ An error occurred while processing the fancy command: ${error.message}`,
            }, { quoted: message });
        }

    } catch (error) {
        console.error("Fancy Command Main Error:", error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = fancyCommand;
