const os = require('os');
const settings = require('../settings.js');

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        
        // First send the "PINGING..." message
        const pingingMsg = await sock.sendMessage(chatId, { 
            text: '📡 PINGING...' 
        }, { quoted: message });

        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        // Simple message with just bot name and ping
        const resultMessage = `🤖 *${settings.botName}* | 🚀 ${ping} ms`;

        // Edit the original "PINGING..." message with the result
        await sock.sendMessage(chatId, { 
            text: resultMessage,
            edit: pingingMsg.key 
        });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' });
    }
}

module.exports = pingCommand;
