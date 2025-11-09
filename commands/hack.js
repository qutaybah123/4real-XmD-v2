const { isSudo } = require('../lib/index');
const settings = require("../settings");

async function hackCommand(sock, chatId, message) {
    try {
        // Check if user is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = message.key.fromMe || senderIsSudo;

        if (!isOwner) {
            return await sock.sendMessage(chatId, {
                text: "🚫 *Owner/Sudo only command!*"
            }, { quoted: message });
        }

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '💻', key: message.key }
        });

        try {
            const steps = [
                '💻 *HACK STARTING...* 💻',
                
                '*Initializing hacking tools...* 🛠️',
                '*Connecting to remote servers...* 🌐',
                
                '```[██████████] 10%``` ⏳',
                '```[███████████████████] 20%``` ⏳',
                '```[███████████████████████] 30%``` ⏳',
                '```[██████████████████████████] 40%``` ⏳',
                '```[███████████████████████████████] 50%``` ⏳',
                '```[█████████████████████████████████████] 60%``` ⏳',
                '```[██████████████████████████████████████████] 70%``` ⏳',
                '```[██████████████████████████████████████████████] 80%``` ⏳',
                '```[██████████████████████████████████████████████████] 90%``` ⏳',
                '```[████████████████████████████████████████████████████] 100%``` ✅',
                
                '🔒 *System Breach: Successful!* 🔓',
                '🚀 *Command Execution: Complete!* 🎯',
                
                '*📡 Transmitting data...* 📤',
                '_🕵️‍♂️ Ensuring stealth..._ 🤫',
                '*🔧 Finalizing operations...* 🏁',
                
                '⚠️ *Note:* All actions are for demonstration purposes only.',
                '⚠️ *Reminder:* Ethical hacking is the only way to ensure security.',
                
                '> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs* ☣'
            ];

            // Send initial message
            await sock.sendMessage(chatId, {
                text: '🚀 *HACKING SIMULATION INITIATED*\n\nStarting hacking sequence...'
            }, { quoted: message });

            // Send each step with delay
            for (const line of steps) {
                await sock.sendMessage(chatId, { text: line });
                await new Promise(resolve => setTimeout(resolve, 800)); // 0.8 second delay
            }

            // Send completion message
            await sock.sendMessage(chatId, {
                text: '✅ *HACKING SIMULATION COMPLETED*\n\nThis was just a fun simulation! 🎮'
            });

        } catch (error) {
            console.error("Hack Command Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ *Hacking simulation failed!* 🔴\n\nSystem security protocols activated. 🛡️"
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Hack Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred during hacking simulation."
        }, { quoted: message });
    }
}

module.exports = hackCommand;
