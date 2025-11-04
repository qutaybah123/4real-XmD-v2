const config = require('../config');

async function aboutCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '👑', key: message.key }
        });

        try {
            const about = `> *_ᴛʜᴇ ʙᴇsᴛ ʙᴏᴛ ᴡʜᴀᴛsᴀᴘᴘ_*
╭╼━❍ 𝗕𝗜𝗢𝗚𝗥𝗔𝗣𝗛𝗬 ❍
┃│❍ *ᴄʀᴇᴀᴛᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*
┃│❍ *ʀᴇᴀʟ ɴᴀᴍᴇ➭ qutaybah*
┃│❍ *ɴɪᴄᴋɴᴀᴍᴇ➮ 𝟐𝟒𝐑𝐄𝐀𝐋 𝐗𝐌𝐃*
┃│❍ *ᴀɢᴇ➭ ɴᴏᴛ ᴅᴇғɪɴᴇᴅ*
┃│❍ *ᴄɪᴛʏ➭ ɴᴏᴛ ᴅᴇғɪɴᴇᴅ*
┃│❍ *ᴅᴇᴠɪᴄᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ*
┃╰────────────────
╰╼━━━━━━━━━━━━━━━━╾╯
╭╼━❍ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 ❍
┃│❍➳ *Cyber 4REAL*
┃│❍➳ *ᴏɴʟʏ ᴏɴᴇ ᴅᴇᴠᴇʟᴏᴘᴇʀ*
┃│❍➳ *ʙᴏᴛ➭ 𝟐𝟒𝐑𝐄𝐀𝐋 𝐗𝐌𝐃*
┃╰────────────────
╰╼━━━━━━━━━━━━━━━━╾╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

            await sock.sendMessage(chatId, {
                image: { url: 'https://files.catbox.moe/lhjss2.jpg' },
                caption: about,
                contextInfo: {
                    mentionedJid: [message.key.participant || message.key.remoteJid],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });

        } catch (error) {
            console.error('About Command Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ An error occurred while processing the about command: ${error.message}`,
            }, { quoted: message });
        }
    } catch (error) {
        console.error('About Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = aboutCommand;
