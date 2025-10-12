const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

const messageStore = new Map();
const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');

// Configuration handling
function loadAntideleteConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
        return JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch (error) {
        console.error('Config load error:', error);
        return { enabled: false };
    }
}

function saveAntideleteConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Config save error:', error);
    }
}

// Command handler
async function handleAntideleteCommand(sock, chatId, message, match) {
    try {
        if (!message.key.fromMe) {
            return sock.sendMessage(chatId, { 
                text: '*🚫 Only bot owner can configure anti-delete*' ,
         contextInfo: { isForwarded: true }         
            });
        }

        const config = loadAntideleteConfig();
        
        if (!match) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            return sock.sendMessage(chatId, {
                text: `*Anti-Delete System*\n\nStatus: ${status}\n\nUse:\n.antidelete on - Enable\n.antidelete off - Disable`,
             contextInfo: { isForwarded: true }     
            });
        }

        if (match === 'on') {
            config.enabled = true;
            saveAntideleteConfig(config);
            return sock.sendMessage(chatId, { text: '*🛡️ Anti-delete protection activated*',
        contextInfo: { isForwarded: true }                                       });
        }

        if (match === 'off') {
            config.enabled = false;
            saveAntideleteConfig(config);
            return sock.sendMessage(chatId, { text: '*⚠️ Anti-delete protection disabled*',
       contextInfo: { isForwarded: true }                                       });
        }

        return sock.sendMessage(chatId, { text: '*❌ Invalid command. Use .antidelete for help*',
      contextInfo: { isForwarded: true }                                     });

    } catch (error) {
        console.error('Antidelete command error:', error);
        sock.sendMessage(chatId, { text: '*⚠️ Failed to process command*',
  contextInfo: { isForwarded: true }                                  });
    }
}

// Message storage
async function storeMessage(message) {
    try {
        const config = loadAntideleteConfig();
        if (!config.enabled || !message?.key?.id) return;

        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;
        let content = '';
        let mediaType = '';
        let mediaBuffer = null;

        if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        }

        if (message.message?.imageMessage) {
            mediaType = 'image';
            content = message.message.imageMessage.caption || content;
            mediaBuffer = await bufferizeMedia(message.message.imageMessage, 'image');
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
            mediaBuffer = await bufferizeMedia(message.message.stickerMessage, 'sticker');
        } else if (message.message?.videoMessage) {
            mediaType = 'video';
            content = message.message.videoMessage.caption || content;
            mediaBuffer = await bufferizeMedia(message.message.videoMessage, 'video');
        }

        messageStore.set(messageId, {
            content,
            mediaType,
            mediaBuffer,
            sender,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Message storage error:', error);
    }
}

// Media buffer converter
async function bufferizeMedia(mediaMessage, type) {
    try {
        const stream = await downloadContentFromMessage(mediaMessage, type);
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('Media buffering failed:', error);
        return null;
    }
}

// Message revocation handler
async function handleMessageRevocation(sock, revocationMessage) {
    let targetChat;
    
    try {
        if (!revocationMessage?.message?.protocolMessage?.key?.id) return;
        
        // Critical owner check - ignore owner deletions
        if (revocationMessage.key.fromMe) return;

        const config = loadAntideleteConfig();
        if (!config.enabled) return;

        const messageId = revocationMessage.message.protocolMessage.key.id;
        const original = messageStore.get(messageId);
        if (!original) return;

        const deletedBy = revocationMessage.participant 
            || revocationMessage.key?.participant 
            || revocationMessage.key?.remoteJid 
            || 'unknown';

        targetChat = original.group || original.sender;
        if (!targetChat) return;

        const timeFormatter = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'Africa/Dar_es_Salaam'
        });

        const messageInfo = `🕒 Original Time: ${timeFormatter.format(original.timestamp)}
👤 Sender: @${original.sender.split('@')[0]}
🗑️ Deleted By: @${deletedBy.split('@')[0]}`;

        if (original.mediaBuffer && original.mediaType) {
            await sock.sendMessage(targetChat, {
                [original.mediaType]: original.mediaBuffer,
                mimetype: getMimeType(original.mediaType),
                caption: `${messageInfo}\n💬 Caption: ${original.content || 'None'}`,
                mentions: [original.sender, deletedBy],
                contextInfo: { isForwarded: true }
            });
        } else if (original.content) {
            await sock.sendMessage(targetChat, {
                text: `${messageInfo}\n📝 Content:\n${original.content}`,
                mentions: [original.sender, deletedBy],
                contextInfo: { isForwarded: true }
            });
        }

        messageStore.delete(messageId);

    } catch (error) {
        console.error('[ANTI-DELETE] Error:', error);
        try {
            if (targetChat) {
                await sock.sendMessage(targetChat, {
                    text: '⚠️ Failed to recover deleted message'
                });
            }
        } catch (fallbackError) {
            console.error('[ANTI-DELETE] Error reporting failed:', fallbackError);
        }
    }
}

// MIME type helper
function getMimeType(mediaType) {
    return {
        image: 'image/jpeg',
        video: 'video/mp4',
        sticker: 'image/webp'
    }[mediaType] || 'application/octet-stream';
}

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};
