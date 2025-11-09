const axios = require("axios");
const { fetchGif, gifToVideo } = require("../lib/fetchGif");
const settings = require('../settings');

// Map of all reaction commands and their API endpoints
const reactionCommands = {
    'cry': { api: 'cry', emoji: '😢' },
    'cuddle': { api: 'cuddle', emoji: '🤗' },
    'bully': { api: 'bully', emoji: '😈' },
    'hug': { api: 'hug', emoji: '🤗' },
    'awoo': { api: 'awoo', emoji: '🐺' },
    'lick': { api: 'lick', emoji: '👅' },
    'pat': { api: 'pat', emoji: '🫂' },
    'smug': { api: 'smug', emoji: '😏' },
    'bonk': { api: 'bonk', emoji: '🔨' },
    'yeet': { api: 'yeet', emoji: '💨' },
    'blush': { api: 'blush', emoji: '😊' },
    'handhold': { api: 'handhold', emoji: '🤝' },
    'highfive': { api: 'highfive', emoji: '✋' },
    'nom': { api: 'nom', emoji: '🍽️' },
    'wave': { api: 'wave', emoji: '👋' },
    'smile': { api: 'smile', emoji: '😁' },
    'wink': { api: 'wink', emoji: '😉' },
    'happy': { api: 'happy', emoji: '😊' },
    'glomp': { api: 'glomp', emoji: '🤗' },
    'bite': { api: 'bite', emoji: '🦷' },
    'poke': { api: 'poke', emoji: '👉' },
    'cringe': { api: 'cringe', emoji: '😬' },
    'dance': { api: 'dance', emoji: '💃' },
    'kill': { api: 'kill', emoji: '🔪' },
    'slap': { api: 'slap', emoji: '✊' },
    'kiss': { api: 'kiss', emoji: '💋' }
};

// Message templates for different reactions
const messageTemplates = {
    'cry': (sender, target) => target ? `${sender} is crying over ${target}` : `${sender} is crying!`,
    'cuddle': (sender, target) => target ? `${sender} cuddled ${target}` : `${sender} is cuddling everyone!`,
    'bully': (sender, target) => target ? `${sender} is bullying ${target}` : `${sender} is bullying everyone!`,
    'hug': (sender, target) => target ? `${sender} hugged ${target}` : `${sender} is hugging everyone!`,
    'awoo': (sender, target) => target ? `${sender} awoos at ${target}` : `${sender} is awooing everyone!`,
    'lick': (sender, target) => target ? `${sender} licked ${target}` : `${sender} licked themselves!`,
    'pat': (sender, target) => target ? `${sender} patted ${target}` : `${sender} is patting everyone!`,
    'smug': (sender, target) => target ? `${sender} is smug at ${target}` : `${sender} is feeling smug!`,
    'bonk': (sender, target) => target ? `${sender} bonked ${target}` : `${sender} is bonking everyone!`,
    'yeet': (sender, target) => target ? `${sender} yeeted ${target}` : `${sender} is yeeting everyone!`,
    'blush': (sender, target) => target ? `${sender} is blushing at ${target}` : `${sender} is blushing!`,
    'handhold': (sender, target) => target ? `${sender} is holding hands with ${target}` : `${sender} wants to hold hands with everyone!`,
    'highfive': (sender, target) => target ? `${sender} gave a high-five to ${target}` : `${sender} is high-fiving everyone!`,
    'nom': (sender, target) => target ? `${sender} is nomming ${target}` : `${sender} is nomming everyone!`,
    'wave': (sender, target) => target ? `${sender} waved at ${target}` : `${sender} is waving at everyone!`,
    'smile': (sender, target) => target ? `${sender} smiled at ${target}` : `${sender} is smiling at everyone!`,
    'wink': (sender, target) => target ? `${sender} winked at ${target}` : `${sender} is winking at everyone!`,
    'happy': (sender, target) => target ? `${sender} is happy with ${target}` : `${sender} is happy with everyone!`,
    'glomp': (sender, target) => target ? `${sender} glomped ${target}` : `${sender} is glomping everyone!`,
    'bite': (sender, target) => target ? `${sender} bit ${target}` : `${sender} is biting everyone!`,
    'poke': (sender, target) => target ? `${sender} poked ${target}` : `${sender} poked everyone`,
    'cringe': (sender, target) => target ? `${sender} thinks ${target} is cringe` : `${sender} finds everyone cringe`,
    'dance': (sender, target) => target ? `${sender} danced with ${target}` : `${sender} is dancing with everyone`,
    'kill': (sender, target) => target ? `${sender} killed ${target}` : `${sender} killed everyone`,
    'slap': (sender, target) => target ? `${sender} slapped ${target}` : `${sender} slapped everyone`,
    'kiss': (sender, target) => target ? `${sender} kissed ${target}` : `${sender} kissed everyone`
};

async function reactionCommand(sock, chatId, message, command) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quotedJid = message.message?.extendedTextMessage?.contextInfo?.participant;
        
        // Get mentioned user or quoted user
        const mentionedUser = mentionedJid[0] || quotedJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const senderName = `@${senderId.split('@')[0]}`;
        const targetName = mentionedUser ? `@${mentionedUser.split('@')[0]}` : null;

        // Show processing indicator with the reaction's emoji
        const reactionEmoji = reactionCommands[command]?.emoji || '🎭';
        await sock.sendMessage(chatId, {
            react: { text: reactionEmoji, key: message.key }
        });

        try {
            const apiUrl = `https://api.waifu.pics/sfw/${reactionCommands[command].api}`;
            const res = await axios.get(apiUrl, { timeout: 15000 });
            
            if (!res.data || !res.data.url) {
                throw new Error("No GIF received from API");
            }

            const gifUrl = res.data.url;
            
            // Get the appropriate message template
            const messageText = messageTemplates[command](senderName, targetName);
            const finalMessage = `${messageText}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

            // Download and convert GIF to video
            let gifBuffer;
            let videoBuffer;
            
            try {
                gifBuffer = await fetchGif(gifUrl);
                videoBuffer = await gifToVideo(gifBuffer);
            } catch (mediaError) {
                console.error(`Media processing error for ${command}:`, mediaError);
                // Fallback to sending as image if video conversion fails
                await sock.sendMessage(chatId, {
                    image: { url: gifUrl },
                    caption: finalMessage,
                    mentions: [senderId, mentionedUser].filter(Boolean)
                }, { quoted: message });
                return;
            }

            // Send the reaction as video
            await sock.sendMessage(chatId, {
                video: videoBuffer,
                caption: finalMessage,
                gifPlayback: true,
                mentions: [senderId, mentionedUser].filter(Boolean)
            }, { quoted: message });

        } catch (error) {
            console.error(`Reaction API Error for ${command}:`, error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: `❌ *Request timeout for ${command}.* Please try again.`
                }, { quoted: message });
            } else if (error.response?.status === 404) {
                await sock.sendMessage(chatId, {
                    text: `❌ *${command} service unavailable.* Try another reaction.`
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error with ${command}:* ${error.message}`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error(`Reaction Command Main Error for ${command}:`, error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

// Individual command functions
const createReactionFunction = (command) => {
    return async (sock, chatId, message) => {
        await reactionCommand(sock, chatId, message, command);
    };
};

// Export all reaction functions
module.exports = {
    reactionCommand,
    cryCommand: createReactionFunction('cry'),
    cuddleCommand: createReactionFunction('cuddle'),
    bullyCommand: createReactionFunction('bully'),
    hugCommand: createReactionFunction('hug'),
    awooCommand: createReactionFunction('awoo'),
    lickCommand: createReactionFunction('lick'),
    patCommand: createReactionFunction('pat'),
    smugCommand: createReactionFunction('smug'),
    bonkCommand: createReactionFunction('bonk'),
    yeetCommand: createReactionFunction('yeet'),
    blushCommand: createReactionFunction('blush'),
    handholdCommand: createReactionFunction('handhold'),
    highfiveCommand: createReactionFunction('highfive'),
    nomCommand: createReactionFunction('nom'),
    waveCommand: createReactionFunction('wave'),
    smileCommand: createReactionFunction('smile'),
    winkCommand: createReactionFunction('wink'),
    happyCommand: createReactionFunction('happy'),
    glompCommand: createReactionFunction('glomp'),
    biteCommand: createReactionFunction('bite'),
    pokeCommand: createReactionFunction('poke'),
    cringeCommand: createReactionFunction('cringe'),
    danceCommand: createReactionFunction('dance'),
    killCommand: createReactionFunction('kill'),
    slapCommand: createReactionFunction('slap'),
    kissCommand: createReactionFunction('kiss')
};
