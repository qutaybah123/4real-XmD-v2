const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fs = require('fs');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

const { tempMailCommand, checkMailCommand } = require("./commands/tempmail");
const aboutCommand = require('./commands/about');
const blockCommand = require('./commands/block'); 
const unblockCommand = require('./commands/unblock');

// Command imports
const { 
  getWrestlingEvents,
  getWWENews,
  getWWESchedule
} = require('./commands/sports');
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const { jokeCommand } = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');

// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A";
global.ytch = "@Ligang Techs";
global.botImageUrl = "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg";
global.OPENGEMINI2_0FLASH_KEY = "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";
global.OPENGEMINI1_5FLASH_KEY = "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";  
global.OPENDEEPSEEKR1_KEY = "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";
global.OPENMISTRAL_KEY = "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";
global.OPENMETA_KEY = "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";
global.OPENANTHROPIC_KEY = "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";
global.OPENNVIDIA_KEY = "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";
global.wwe = 'https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=WWE';
global.OPENAI_API_KEY= "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";
global.wwe1 = 'https://www.thesportsdb.com/api/v1/json/3/searchfilename.php?e=WWE_Events';
global.wwe2 = 'https://www.thesportsdb.com/api/v1/json/3/searchfilename.php?e=WWE';
global.API_FOOTBALL_KEY='032e981a46msh16f8cec081536cbp19841ajsn4cb9928354c6';

// Channel info for forwarding
const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true
    }
};

// Helper functions for consistent error messages
async function sendGroupOnlyError(sock, chatId, message) {
    await sock.sendMessage(chatId, { 
        text: '🚫 This command can only be used in groups.', 
        ...channelInfo 
    }, { quoted: message });
}

async function sendAdminOnlyError(sock, chatId, message) {
    await sock.sendMessage(chatId, { 
        text: '🚫 Only group admins can use this command.', 
        ...channelInfo 
    }, { quoted: message });
}

async function sendOwnerOnlyError(sock, chatId, message) {
    await sock.sendMessage(chatId, { 
        text: '🚫 Only the Owner or sudo can use this command!', 
        ...channelInfo 
    }, { quoted: message });
}

async function sendBotAdminError(sock, chatId, message) {
    await sock.sendMessage(chatId, { 
        text: 'Please make the bot an admin first.', 
        ...channelInfo 
    }, { quoted: message });
}

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(sock, message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const isFromMe = message.key.fromMe;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = isFromMe || senderIsSudo;

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        // Preserve raw message for commands that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // Only log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }

        // Enforce private mode BEFORE any replies (except owner/sudo)
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (!data.isPublic && !isOwner) {
                return; // Silently ignore messages from non-owners when in private mode
            }
        } catch (error) {
            console.error('Error checking access mode:', error);
            // Default to public mode if there's an error reading the file
        }

        // Check if user is banned (skip ban check for unban command)
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            // Only respond occasionally to avoid spam
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '🚫 You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        // First check if it's a game move
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        // Basic message response in private chat (commented out as per original)
        /* if (!isGroup && (userMessage === 'hi' || userMessage === 'hello' || userMessage === 'bot' || userMessage === 'hlo' || userMessage === 'hey' || userMessage === 'bro')) {
            await sock.sendMessage(chatId, {
                text: 'Hi, How can I help you?\nYou can use .menu for more info and commands.',
                ...channelInfo
            });
            return;
        } */

        if (!isFromMe) incrementMessageCount(chatId, senderId);

        // Initialize admin status variables
        let isSenderAdmin = false;
        let isBotAdmin = false;

        // Check admin status for groups
        if (isGroup) {
            const adminStatus = await isAdmin(sock, chatId, senderId, message);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;
        }

        // Check for bad words FIRST, before ANY other processing
        if (isGroup && userMessage) {
            await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            await Antilink(message, sock);
        }

        // PM blocker: block non-owner DMs when enabled (do not ban)
        if (!isGroup && !isFromMe && !isOwner) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    // Inform user, delay, then block without banning globally
                    await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        // Then check for command prefix
        if (!userMessage.startsWith('.')) {
            // Show typing indicator if autotyping is enabled
            await handleAutotypingForMessage(sock, chatId, userMessage);

            if (isGroup) {
                // Process non-command messages first
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
            }
            return;
        }

        // Define command categories
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.setgdesc', '.setgname', '.setgpp', '.welcome', '.goodbye', '.antibadword', '.chatbot', '.clear'];
        const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.clearsession', '.areact', '.autoreact', '.autotyping', '.autoread', '.pmblocker', '.anticall', '.update'];
        const groupOnlyCommands = ['.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.welcome', '.goodbye', '.antibadword', '.chatbot', '.ship', '.groupinfo', '.resetlink', '.staff', '.setgdesc', '.setgname', '.setgpp', '.clear'];

        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));
        const isGroupOnlyCommand = groupOnlyCommands.some(cmd => userMessage.startsWith(cmd));

        // Permission checks
        if (isGroupOnlyCommand && !isGroup) {
            await sendGroupOnlyError(sock, chatId, message);
            return;
        }

        if (isAdminCommand && isGroup) {
            if (!isBotAdmin) {
                await sendBotAdminError(sock, chatId, message);
                return;
            }
            if (!isSenderAdmin && !isOwner) {
                await sendAdminOnlyError(sock, chatId, message);
                return;
            }
        }

        if (isOwnerCommand && !isOwner) {
            await sendOwnerOnlyError(sock, chatId, message);
            return;
        }

        // Command handlers
        let commandExecuted = false;

        switch (true) {
            case userMessage === '.simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the .simage command to convert it.', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.kick'):
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.mute'): {
                const parts = userMessage.trim().split(/\s+/);
                const muteArg = parts[1];
                const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use .mute with no number to mute immediately.', ...channelInfo }, { quoted: message });
                } else {
                    await muteCommand(sock, chatId, senderId, message, muteDuration);
                }
                commandExecuted = true;
                break;
            }

            case userMessage === '.unmute':
                await unmuteCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.ban'):
                await banCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.unban'):
                await unbanCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.help' || userMessage === '.menu' || userMessage === '.bot' || userMessage === '.list':
                await helpCommand(sock, chatId, message, global.ytch);
                commandExecuted = true;
                break;

            case userMessage === '.sticker' || userMessage === '.s':
                await stickerCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.warnings'):
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.warn'):
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.tts'):
                const text = userMessage.slice(4).trim();
                await ttsCommand(sock, chatId, text, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.delete') || userMessage.startsWith('.del'):
                await deleteCommand(sock, chatId, message, senderId);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.attp'):
                await attpCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.settings':
                await settingsCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.mode'): {
                // Read current data first
                let data;
                try {
                    data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
                } catch (error) {
                    console.error('Error reading access mode:', error);
                    await sock.sendMessage(chatId, { text: 'Failed to read bot mode status', ...channelInfo });
                    return;
                }

                const action = userMessage.split(' ')[1]?.toLowerCase();
                // If no argument provided, show current status
                if (!action) {
                    const currentMode = data.isPublic ? 'public' : 'private';
                    await sock.sendMessage(chatId, {
                        text: `Current bot mode: *${currentMode}*\n\nUsage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                if (action !== 'public' && action !== 'private') {
                    await sock.sendMessage(chatId, {
                        text: 'Usage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                try {
                    // Update access mode
                    data.isPublic = action === 'public';
                    // Save updated data
                    fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
                    await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, ...channelInfo });
                } catch (error) {
                    console.error('Error updating access mode:', error);
                    await sock.sendMessage(chatId, { text: 'Failed to update bot access mode', ...channelInfo });
                }
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.anticall'): {
                const args = userMessage.split(' ').slice(1).join(' ');
                await anticallCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.pmblocker'): {
                const args = userMessage.split(' ').slice(1).join(' ');
                await pmblockerCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }

            case userMessage === '.owner':
                await ownerCommand(sock, chatId);
                commandExecuted = true;
                break;

            case userMessage === '.tagall':
                await tagAllCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;

            case userMessage === '.tagnotadmin':
                await tagNotAdminCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.hidetag'): {
                const messageText = rawText.slice(8).trim();
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.tag'): {
                const messageText = rawText.slice(4).trim();
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await tagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.antilink'):
                await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.antitag'):
                await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;

            case userMessage === '.meme':
                await memeCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.joke':
                await jokeCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.quote':
                await quoteCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.fact':
                await factCommand(sock, chatId, message, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.weather'): {
                const city = userMessage.slice(9).trim();
                if (city) {
                    await weatherCommand(sock, chatId, message, city);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please specify a city, e.g., .weather London', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }

            case userMessage === '.news':
                await newsCommand(sock, chatId);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.ttt') || userMessage.startsWith('.tictactoe'): {
                const tttText = userMessage.split(' ').slice(1).join(' ');
                await tictactoeCommand(sock, chatId, senderId, tttText);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.move'): {
                const position = parseInt(userMessage.split(' ')[1]);
                if (isNaN(position)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid position number for Tic-Tac-Toe move.', ...channelInfo }, { quoted: message });
                } else {
                    tictactoeMove(sock, chatId, senderId, position);
                }
                commandExecuted = true;
                break;
            }

            case userMessage === '.topmembers':
                topMembers(sock, chatId, isGroup);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.hangman'):
                startHangman(sock, chatId);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.guess'): {
                const guessedLetter = userMessage.split(' ')[1];
                if (guessedLetter) {
                    guessLetter(sock, chatId, guessedLetter);
                } else {
                    sock.sendMessage(chatId, { text: 'Please guess a letter using .guess <letter>', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.trivia'):
                startTrivia(sock, chatId);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.answer'): {
                const answer = userMessage.split(' ').slice(1).join(' ');
                if (answer) {
                    answerTrivia(sock, chatId, answer);
                } else {
                    sock.sendMessage(chatId, { text: 'Please provide an answer using .answer <answer>', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.compliment'):
                await complimentCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.insult'):
                await insultCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.8ball'): {
                const question = userMessage.split(' ').slice(1).join(' ');
                await eightBallCommand(sock, chatId, question);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.lyrics'): {
                const songTitle = userMessage.split(' ').slice(1).join(' ');
                await lyricsCommand(sock, chatId, songTitle, message);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.simp'): {
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await simpCommand(sock, chatId, quotedMsg, mentionedJid, senderId);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.stupid') || userMessage.startsWith('.itssostupid') || userMessage.startsWith('.iss'): {
                const stupidQuotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const stupidMentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const stupidArgs = userMessage.split(' ').slice(1);
                await stupidCommand(sock, chatId, stupidQuotedMsg, stupidMentionedJid, senderId, stupidArgs);
                commandExecuted = true;
                break;
            }

            case userMessage === '.dare':
                await dareCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.tempmail') || userMessage.startsWith('.genmail'):
                await tempMailCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.about') || userMessage.startsWith('.dev'):
        await aboutCommand(sock, chatId, message);
        break;

            case userMessage.startsWith('.checkmail') || userMessage.startsWith('.inbox') || userMessage.startsWith('.tmail') || userMessage.startsWith('.mailinbox'): {
                const args = userMessage.split(" ").slice(1);
                await checkMailCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }

            // Wrestling Commands
            case userMessage.startsWith('.wrestlingevents') || userMessage.startsWith('.wevents'):
                await getWrestlingEvents(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.wwenews') || userMessage.startsWith('.wwe'):
                await getWWENews(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.wweschedule') || userMessage.startsWith('.wweevents'):
                await getWWESchedule(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.truth':
                await truthCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.clear':
                await clearCommand(sock, chatId);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.promote'): {
                const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.demote'): {
                const mentionedJidListDemote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await demoteCommand(sock, chatId, mentionedJidListDemote, message);
                commandExecuted = true;
                break;
            }

            case userMessage === '.ping':
                await pingCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.alive':
                await aliveCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.mention '): {
                const args = userMessage.split(' ').slice(1).join(' ');
                await mentionToggleCommand(sock, chatId, message, args, isOwner);
                commandExecuted = true;
                break;
            }

            case userMessage === '.setmention':
                await setMentionCommand(sock, chatId, message, isOwner);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.blur'): {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await blurCommand(sock, chatId, message, quotedMessage);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.welcome'):
                await welcomeCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.goodbye'):
                await goodbyeCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.git' || userMessage === '.github' || userMessage === '.sc' || userMessage === '.script' || userMessage === '.repo':
                await githubCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.antibadword'):
                await antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.chatbot'): {
                const match = userMessage.slice(8).trim();
                await handleChatbotCommand(sock, chatId, message, match);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.take'): {
                const takeArgs = rawText.slice(5).trim().split(' ');
                await takeCommand(sock, chatId, message, takeArgs);
                commandExecuted = true;
                break;
            }

            case userMessage === '.flirt':
                await flirtCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.character'):
                await characterCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.waste'):
                await wastedCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.ship':
                await shipCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.groupinfo' || userMessage === '.infogp' || userMessage === '.infogrupo':
                await groupInfoCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.resetlink' || userMessage === '.revoke' || userMessage === '.anularlink':
                await resetlinkCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;

            case userMessage === '.staff' || userMessage === '.admins' || userMessage === '.listadmin':
                await staffCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.tourl') || userMessage.startsWith('.url'):
                await urlCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.emojimix') || userMessage.startsWith('.emix'):
                await emojimixCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.tg') || userMessage.startsWith('.stickertelegram') || userMessage.startsWith('.tgsticker') || userMessage.startsWith('.telesticker'):
                await stickerTelegramCommand(sock, chatId, message);
                commandExecuted = true;
                break;

             case userMessage.startsWith('.block'):
        await blockCommand(sock, chatId, message);
        break;
    
    case userMessage.startsWith('.unblock'):
        await unblockCommand(sock, chatId, message);
        break;

            
            case userMessage === '.vv':
                await viewOnceCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.clearsession' || userMessage === '.clearsesi':
                await clearSessionCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.autostatus'): {
                const autoStatusArgs = userMessage.split(' ').slice(1);
                await autoStatusCommand(sock, chatId, message, autoStatusArgs);
                commandExecuted = true;
                break;
            }

            // Textmaker commands (abbreviated for brevity)
            case userMessage.startsWith('.glow'):
                await textmakerCommand(sock, chatId, message, userMessage, 'glow');
                commandExecuted = true;
                break;

            case userMessage.startsWith('.blackpink'):
                await textmakerCommand(sock, chatId, message, userMessage, 'blackpink');
                commandExecuted = true;
                break;
             
case userMessage.startsWith('.glow'):
    await textmakerCommand(sock, chatId, message, userMessage, 'glow');
    break;
case userMessage.startsWith('.blackpink2'):
    await textmakerCommand(sock, chatId, message, userMessage, 'blackpink2');
    break;
case userMessage.startsWith('.cartoon'):
    await textmakerCommand(sock, chatId, message, userMessage, 'cartoon');
    break;
case userMessage.startsWith('.eraser'):
    await textmakerCommand(sock, chatId, message, userMessage, 'eraser');
    break;
case userMessage.startsWith('.dragonball'):
    await textmakerCommand(sock, chatId, message, userMessage, 'dragonball');
    break;
case userMessage.startsWith('.clouds'):
    await textmakerCommand(sock, chatId, message, userMessage, 'clouds');
    break;
case userMessage.startsWith('.usaflag'):
    await textmakerCommand(sock, chatId, message, userMessage, 'usaflag');
    break;
case userMessage.startsWith('.nigeriaflag'):
    await textmakerCommand(sock, chatId, message, userMessage, 'nigeriaflag');
    break;
case userMessage.startsWith('.hologram'):
    await textmakerCommand(sock, chatId, message, userMessage, 'hologram');
    break;
case userMessage.startsWith('.galaxy'):
    await textmakerCommand(sock, chatId, message, userMessage, 'galaxy');
    break;
case userMessage.startsWith('.galaxywall'):
    await textmakerCommand(sock, chatId, message, userMessage, 'galaxywall');
    break;
case userMessage.startsWith('.glowing'):
    await textmakerCommand(sock, chatId, message, userMessage, 'glowing');
    break;
case userMessage.startsWith('.gradient'):
    await textmakerCommand(sock, chatId, message, userMessage, 'gradient');
    break;
case userMessage.startsWith('.cutegirl'):
    await textmakerCommand(sock, chatId, message, userMessage, 'cutegirl');
    break;
case userMessage.startsWith('.bulbs'):
    await textmakerCommand(sock, chatId, message, userMessage, 'bulbs');
    break;
case userMessage.startsWith('.greenneon'):
    await textmakerCommand(sock, chatId, message, userMessage, 'greenneon');
    break;
case userMessage.startsWith('.bear'):
    await textmakerCommand(sock, chatId, message, userMessage, 'bear');
    break;
case userMessage.startsWith('.galaxyneon'):
    await textmakerCommand(sock, chatId, message, userMessage, 'galaxyneon');
    break;
case userMessage.startsWith('.multicolorneon'):
    await textmakerCommand(sock, chatId, message, userMessage, 'multicolorneon');
    break;
case userMessage.startsWith('.neonglitch'):
    await textmakerCommand(sock, chatId, message, userMessage, 'neonglitch');
    break;
case userMessage.startsWith('.papercut'):
    await textmakerCommand(sock, chatId, message, userMessage, 'papercut');
    break;
case userMessage.startsWith('.pixelglitch'):
    await textmakerCommand(sock, chatId, message, userMessage, 'pixelglitch');
    break;
case userMessage.startsWith('.royal'):
    await textmakerCommand(sock, chatId, message, userMessage, 'royal');
    break;
case userMessage.startsWith('.summersand'):
    await textmakerCommand(sock, chatId, message, userMessage, 'summersand');
    break;
case userMessage.startsWith('.pavement'):
    await textmakerCommand(sock, chatId, message, userMessage, 'pavement');
    break;
case userMessage.startsWith('.watercolor'):
    await textmakerCommand(sock, chatId, message, userMessage, 'watercolor');
    break;
                   case userMessage.startsWith('.wetglass'):
    await textmakerCommand(sock, chatId, message, userMessage, 'wetglass');
    break;
            case userMessage.startsWith('.metallic'):
                await textmakerCommand(sock, chatId, message, userMessage, 'metallic');
                break;
            case userMessage.startsWith('.ice'):
                await textmakerCommand(sock, chatId, message, userMessage, 'ice');
                break;
            case userMessage.startsWith('.snow'):
                await textmakerCommand(sock, chatId, message, userMessage, 'snow');
                break;
            case userMessage.startsWith('.impressive'):
                await textmakerCommand(sock, chatId, message, userMessage, 'impressive');
                break;
            case userMessage.startsWith('.matrix'):
                await textmakerCommand(sock, chatId, message, userMessage, 'matrix');
                break;
            case userMessage.startsWith('.light'):
                await textmakerCommand(sock, chatId, message, userMessage, 'light');
                break;
            case userMessage.startsWith('.neon'):
                await textmakerCommand(sock, chatId, message, userMessage, 'neon');
                break;
            case userMessage.startsWith('.devil'):
                await textmakerCommand(sock, chatId, message, userMessage, 'devil');
                break;
            case userMessage.startsWith('.purple'):
                await textmakerCommand(sock, chatId, message, userMessage, 'purple');
                break;
            case userMessage.startsWith('.thunder'):
                await textmakerCommand(sock, chatId, message, userMessage, 'thunder');
                break;
            case userMessage.startsWith('.leaves'):
                await textmakerCommand(sock, chatId, message, userMessage, 'leaves');
                break;
            case userMessage.startsWith('.1917'):
                await textmakerCommand(sock, chatId, message, userMessage, '1917');
                break;
            case userMessage.startsWith('.arena'):
                await textmakerCommand(sock, chatId, message, userMessage, 'arena');
                break;
            case userMessage.startsWith('.hacker'):
                await textmakerCommand(sock, chatId, message, userMessage, 'hacker');
                break;
            case userMessage.startsWith('.sand'):
                await textmakerCommand(sock, chatId, message, userMessage, 'sand');
                break;
            case userMessage.startsWith('.blackpink'):
                await textmakerCommand(sock, chatId, message, userMessage, 'blackpink');
                break;
            case userMessage.startsWith('.glitch'):
                await textmakerCommand(sock, chatId, message, userMessage, 'glitch');
                break;
            case userMessage.startsWith('.fire'):
                await textmakerCommand(sock, chatId, message, userMessage, 'fire');
                break;

            case userMessage.startsWith('.antidelete'): {
                const antideleteMatch = userMessage.slice(11).trim();
                await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
                commandExecuted = true;
                break;
            }

            case userMessage === '.surrender':
                await handleTicTacToeMove(sock, chatId, senderId, 'surrender');
                commandExecuted = true;
                break;

            case userMessage === '.cleartmp':
                await clearTmpCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.setpp':
                await setProfilePicture(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.setgdesc'): {
                const text = rawText.slice(9).trim();
                await setGroupDescription(sock, chatId, senderId, text, message);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.setgname'): {
                const text = rawText.slice(9).trim();
                await setGroupName(sock, chatId, senderId, text, message);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.setgpp'):
                await setGroupPhoto(sock, chatId, senderId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.instagram') || userMessage.startsWith('.insta') || (userMessage === '.ig' || userMessage.startsWith('.ig ')):
                await instagramCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.igsc'):
                await igsCommand(sock, chatId, message, true);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.igs'):
                await igsCommand(sock, chatId, message, false);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.fb') || userMessage.startsWith('.facebook'):
                await facebookCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.music'):
                await playCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.spotify'):
                await spotifyCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.play') || userMessage.startsWith('.mp3') || userMessage.startsWith('.ytmp3') || userMessage.startsWith('.song'):
                await songCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.video') || userMessage.startsWith('.ytmp4'):
                await videoCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.tiktok') || userMessage.startsWith('.tt'):
                await tiktokCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.gpt') || userMessage.startsWith('.claude') || userMessage.startsWith('.deepseek') || userMessage.startsWith('.mistral') || userMessage.startsWith('.metaai') || userMessage.startsWith('.nemotron') || userMessage.startsWith('.nvidia'):
                await aiCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.translate') || userMessage.startsWith('.trt'): {
                const commandLength = userMessage.startsWith('.translate') ? 10 : 4;
                await handleTranslateCommand(sock, chatId, message, userMessage.slice(commandLength));
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.ss') || userMessage.startsWith('.ssweb') || userMessage.startsWith('.screenshot'): {
                const ssCommandLength = userMessage.startsWith('.screenshot') ? 11 : (userMessage.startsWith('.ssweb') ? 6 : 3);
                await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim());
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.areact') || userMessage.startsWith('.autoreact') || userMessage.startsWith('.autoreaction'):
                await handleAreactCommand(sock, chatId, message, isOwner);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.sudo'):
                await sudoCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.goodnight' || userMessage === '.lovenight' || userMessage === '.gn':
                await goodnightCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.shayari' || userMessage === '.shayri':
                await shayariCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.roseday':
                await rosedayCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.imagine') || userMessage.startsWith('.flux') || userMessage.startsWith('.dalle'):
                await imagineCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage === '.jid':
                await groupJidCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.autotyping'):
                await autotypingCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.autoread'):
                await autoreadCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.heart'):
                await handleHeart(sock, chatId, message);
                commandExecuted = true;
                break;

            // Misc commands with consistent pattern
            case userMessage.startsWith('.horny'): {
                const parts = userMessage.trim().split(/\s+/);
                const args = ['horny', ...parts.slice(1)];
                await miscCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.circle'): {
                const parts = userMessage.trim().split(/\s+/);
                const args = ['circle', ...parts.slice(1)];
                await miscCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }

     case userMessage.startsWith('.lgbt'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['lgbt', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.lolice'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['lolice', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.simpcard'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['simpcard', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.tonikawa'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['tonikawa', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.its-so-stupid'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['its-so-stupid', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.namecard'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['namecard', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;

            case userMessage.startsWith('.oogway2'):
            case userMessage.startsWith('.oogway'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const sub = userMessage.startsWith('.oogway2') ? 'oogway2' : 'oogway';
                    const args = [sub, ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.tweet'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['tweet', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.ytcomment'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['youtube-comment', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.comrade'):
            case userMessage.startsWith('.gay'):
            case userMessage.startsWith('.glass'):
            case userMessage.startsWith('.jail'):
            case userMessage.startsWith('.passed'):
            case userMessage.startsWith('.triggered'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const sub = userMessage.slice(1).split(/\s+/)[0];
                    const args = [sub, ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;

            case userMessage.startsWith('.animu'): {
                const parts = userMessage.trim().split(/\s+/);
                const args = parts.slice(1);
                await animeCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }

            // Anime command aliases
            case userMessage.startsWith('.nom'):
            case userMessage.startsWith('.poke'):
            case userMessage.startsWith('.cry'):
            case userMessage.startsWith('.kiss'):
            case userMessage.startsWith('.pat'):
            case userMessage.startsWith('.hug'):
            case userMessage.startsWith('.wink'):
            case userMessage.startsWith('.facepalm'):
            case userMessage.startsWith('.face-palm'):
            case userMessage.startsWith('.animuquote'):
            case userMessage.startsWith('.quote'):
            case userMessage.startsWith('.loli'): {
                const parts = userMessage.trim().split(/\s+/);
                let sub = parts[0].slice(1);
                if (sub === 'facepalm') sub = 'face-palm';
                if (sub === 'quote' || sub === 'animuquote') sub = 'quote';
                await animeCommand(sock, chatId, message, [sub]);
                commandExecuted = true;
                break;
            }

            case userMessage === '.crop':
                await stickercropCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            case userMessage.startsWith('.pies'): {
                const parts = rawText.trim().split(/\s+/);
                const args = parts.slice(1);
                await piesCommand(sock, chatId, message, args);
                commandExecuted = true;
                break;
            }

            case userMessage === '.china':
                await piesAlias(sock, chatId, message, 'china');
                commandExecuted = true;
                break;

            case userMessage === '.indonesia':
                await piesAlias(sock, chatId, message, 'indonesia');
                commandExecuted = true;
                break;

            case userMessage === '.japan':
                await piesAlias(sock, chatId, message, 'japan');
                commandExecuted = true;
                break;

            case userMessage === '.korea':
                await piesAlias(sock, chatId, message, 'korea');
                commandExecuted = true;
                break;

            case userMessage === '.hijab':
                await piesAlias(sock, chatId, message, 'hijab');
                commandExecuted = true;
                break;

            case userMessage.startsWith('.update'): {
                const parts = rawText.trim().split(/\s+/);
                const zipArg = parts[1] && parts[1].startsWith('http') ? parts[1] : '';
                await updateCommand(sock, chatId, message, senderIsSudo, zipArg);
                commandExecuted = true;
                break;
            }

            case userMessage.startsWith('.removebg') || userMessage.startsWith('.rmbg') || userMessage.startsWith('.nobg'):
                await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1));
                commandExecuted = true;
                break;

            case userMessage.startsWith('.remini') || userMessage.startsWith('.enhance') || userMessage.startsWith('.upscale'):
                await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1));
                commandExecuted = true;
                break;

            case userMessage.startsWith('.sora'):
                await soraCommand(sock, chatId, message);
                commandExecuted = true;
                break;

            default:
                if (isGroup) {
                    // Handle non-command group messages
                    if (userMessage) {
                        await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                    }
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                }
                commandExecuted = false;
                break;
        }

        // If a command was executed, show typing status after command execution
        if (commandExecuted) {
            await showTypingAfterCommand(sock, chatId);
        }

        // Add command reaction for successful commands
        if (userMessage.startsWith('.') && commandExecuted) {
            await addCommandReaction(sock, message);
        }

    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        // Only try to send error message if we have a valid chatId
        if (chatId) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to process command!',
                ...channelInfo
            });
        }
    }
}

// Function to handle .groupjid command
async function groupJidCommand(sock, chatId, message) {
    const groupJid = message.key.remoteJid;

    if (!groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: "🚫 This command can only be used in a group."
        });
    }

    await sock.sendMessage(chatId, {
        text: `✅ Group JID: ${groupJid}`
    }, {
        quoted: message
    });
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;

        // Check if it's a group
        if (!id.endsWith('@g.us')) return;

        // Respect bot mode: only announce promote/demote in public mode
        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {
            // If reading fails, default to public behavior
        }

        // Handle promotion events
        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }

        // Handle demotion events
        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }

        // Handle join events
        if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        }

        // Handle leave events
        if (action === 'remove') {
            await handleLeaveEvent(sock, id, participants);
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

// Export the handlers
module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};
