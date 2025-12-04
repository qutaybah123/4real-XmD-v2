const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Load settings
const settingsPath = path.join(__dirname, '../settings.js');
let settings = { ownerNumber: '255624314178' };
try {
    settings = require(settingsPath);
} catch (error) {
    console.log('[ANTI-DELETE] Settings not found, using default owner');
}

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
        } else if (message.message?.audioMessage) {
            mediaType = 'audio';
            content = message.message.audioMessage.caption || content;
            mediaBuffer = await bufferizeMedia(message.message.audioMessage, 'audio');
        } else if (message.message?.documentMessage) {
            mediaType = 'document';
            content = message.message.documentMessage.caption || content;
            mediaBuffer = await bufferizeMedia(message.message.documentMessage, 'document');
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
        
        const config = loadAntideleteConfig();
        if (!config.enabled) return;

        const messageId = revocationMessage.message.protocolMessage.key.id;
        const original = messageStore.get(messageId);
        if (!original) return;

        // ✅ Get owner JID from settings
        const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
        
        // ✅ Get who deleted the message
        const deletedBy = revocationMessage.participant 
            || revocationMessage.key?.participant 
            || revocationMessage.key?.remoteJid 
            || 'unknown';
        
        // Clean JIDs for comparison
        const cleanDeletedBy = deletedBy.includes(':') ? deletedBy.split(':')[0] : deletedBy;
        const cleanOwnerJid = ownerJid.replace('@s.whatsapp.net', '');
        const originalSender = original.sender || '';
        const cleanOriginalSender = originalSender.includes(':') ? originalSender.split(':')[0] : originalSender;
        
        // Get bot JID
        const botJid = sock.user.id || '';
        const cleanBotJid = botJid.includes(':') ? botJid.split(':')[0] : botJid;
        
        console.log('[ANTI-DELETE DEBUG]', {
            messageId,
            cleanOriginalSender,
            cleanDeletedBy,
            cleanOwnerJid,
            cleanBotJid,
            isGroup: !!original.group
        });
        
        // ✅ CHECK 1: If owner deleted the message (in any chat)
        if (cleanDeletedBy && cleanDeletedBy.includes(cleanOwnerJid)) {
            console.log('[ANTI-DELETE] Owner deleted a message, ignoring');
            messageStore.delete(messageId);
            return;
        }
        
        // ✅ CHECK 2: If bot deleted its own message
        if (cleanDeletedBy && cleanBotJid && cleanDeletedBy.includes(cleanBotJid)) {
            console.log('[ANTI-DELETE] Bot deleted its own message, ignoring');
            messageStore.delete(messageId);
            return;
        }
        
        // ✅ CHECK 3: If original sender was the bot
        if (cleanOriginalSender && cleanBotJid && cleanOriginalSender.includes(cleanBotJid)) {
            console.log('[ANTI-DELETE] Bot message was deleted, ignoring');
            messageStore.delete(messageId);
            return;
        }
        
        // ✅ CHECK 4: If original sender was the owner
        if (cleanOriginalSender && cleanOriginalSender.includes(cleanOwnerJid)) {
            console.log('[ANTI-DELETE] Owner message was deleted, ignoring');
            messageStore.delete(messageId);
            return;
        }
        
        // ✅ CHECK 5: If user deleted their own message (optional - comment out if you want to capture this)
        if (cleanOriginalSender && cleanDeletedBy && 
            (cleanOriginalSender.includes(cleanDeletedBy) || cleanDeletedBy.includes(cleanOriginalSender))) {
            console.log('[ANTI-DELETE] User deleted their own message, ignoring');
            messageStore.delete(messageId);
            return;
        }

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

        const senderNumber = cleanOriginalSender.split('@')[0] || 'Unknown';
        const deletedByNumber = cleanDeletedBy.split('@')[0] || 'Unknown';
        
        const messageInfo = `🕒 Original Time: ${timeFormatter.format(original.timestamp)}
👤 Sender: @${senderNumber}
🗑️ Deleted By: @${deletedByNumber}`;

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
    const mimeTypes = {
        image: 'image/jpeg',
        video: 'video/mp4',
        sticker: 'image/webp',
        audio: 'audio/mpeg',
        document: 'application/octet-stream'
    };
    return mimeTypes[mediaType] || 'application/octet-stream';
}

// Cleanup old messages periodically (optional)
function cleanupOldMessages() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour
    
    for (const [messageId, message] of messageStore.entries()) {
        if (now - message.timestamp > oneHour) {
            messageStore.delete(messageId);
        }
    }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldMessages, 30 * 60 * 1000);

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};
