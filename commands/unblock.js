async function unblockCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🔓', key: message.key }
        });

        try {
            // Get the bot owner's number dynamically
            const botOwner = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            const sender = message.key.participant || message.key.remoteJid;
            
            if (sender !== botOwner) {
                await sock.sendMessage(chatId, {
                    react: { text: '❌', key: message.key }
                });
                return await sock.sendMessage(chatId, { 
                    text: "Only the bot owner can use this command."
                }, { quoted: message });
            }

            let jid;
            if (quoted) {
                jid = quoted.participant; // If replying to a message, get sender JID
            } else if (mentionedJid.length > 0) {
                jid = mentionedJid[0]; // If mentioning a user, get their JID
            } else if (text) {
                const query = text.split(' ').slice(1).join(' ').trim();
                if (query && query.includes("@")) {
                    jid = query.replace(/[@\s]/g, '') + "@s.whatsapp.net"; // If manually typing a JID
                }
            }

            if (!jid) {
                await sock.sendMessage(chatId, {
                    react: { text: '❌', key: message.key }
                });
                return await sock.sendMessage(chatId, { 
                    text: "Please mention a user or reply to their message.\n\nExample:\n• Reply to user's message with .unblock\n• Or type: .unblock @user"
                }, { quoted: message });
            }

            await sock.updateBlockStatus(jid, "unblock");
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });
            await sock.sendMessage(chatId, {
                text: `Successfully unblocked @${jid.split("@")[0]}`,
                mentions: [jid]
            }, { quoted: message });

        } catch (error) {
            console.error('Unblock Command Error:', error);
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });
            await sock.sendMessage(chatId, {
                text: "Failed to unblock the user. Please check if the JID is valid.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Unblock Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = unblockCommand;
