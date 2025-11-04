const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
┌─⊷ *${settings.botName || '4Real-XMD'}*
▢ Version: ${settings.version}
▢ Owner: ${settings.botOwner || 'qut@ybah'}
▢ YT : ${global.ytch || '@ligang Techs'}
└───────────

┌─⊷ *GENERAL*
▢ .help or .menu
▢ .ping
▢ .about
▢ .alive
▢ .tts <text>
▢ .owner
▢ .joke
▢ .quote
▢ .fact
▢ .weather <city>
▢ .news
▢ .attp <text>
▢ .lyrics <song_title>
▢ .8ball <question>
▢ .groupinfo
▢ .staff or .admins 
▢ .vv
▢ .trt <text> <lang>
▢ .ss <link>
▢ .jid
▢ .url
▢ .tempmail
▢ .checkmail <session_id>
▢ .fancy
└───────────

┌─⊷ *ADMIN*
▢ .ban @user
▢ .promote @user
▢ .demote @user
▢ .mute <minutes>
▢ .unmute
▢ .delete or .del
▢ .kick @user
▢ .warnings @user
▢ .warn @user
▢ .antilink
▢ .antibadword
▢ .clear
▢ .tag <message>
▢ .tagall
▢ .tagnotadmin
▢ .hidetag <message>
▢ .chatbot
▢ .resetlink
▢ .antitag <on/off>
▢ .welcome <on/off>
▢ .goodbye <on/off>
▢ .setgdesc <description>
▢ .setgname <new name>
▢ .setgpp (reply to image)
└───────────

┌─⊷ *OWNER*
▢ .mode <public/private>
▢ .clearsession
▢ .antidelete
▢ .cleartmp
▢ .update
▢ .settings
▢ .setpp <reply to image>
▢ .autoreact <on/off>
▢ .autostatus <on/off>
▢ .autostatus react <on/off>
▢ .autotyping <on/off>
▢ .autoread <on/off>
▢ .anticall <on/off>
▢ .pmblocker <on/off/status>
▢ .pmblocker setmsg <text>
▢ .setmention <reply to msg/media>
▢ .mention <on/off>
▢ .block
▢ .unblock
└───────────

┌─⊷ *STICKERS / IMAGES*
▢ .blur <image>
▢ .simage <reply to sticker>
▢ .sticker <reply to image>
▢ .removebg
▢ .remini
▢ .crop <reply to image>
▢ .tgsticker <Link>
▢ .meme
▢ .take <packname> 
▢ .emojimix <emj1>+<emj2>
▢ .igs <insta link>
▢ .igsc <insta link>
└───────────

┌─⊷ *WRESTLING*
▢ .wevents
▢ .wwenews 
▢ .wweevents
└───────────

┌─⊷ *PIES*
▢ .pies <country>
▢ .china 
▢ .indonesia 
▢ .japan 
▢ .korea 
▢ .hijab
└───────────

┌─⊷ *GAMES*
▢ .tictactoe @user
▢ .hangman
▢ .guess <letter>
▢ .trivia
▢ .answer <answer>
▢ .truth
▢ .dare
└───────────

┌─⊷ *AI*
▢ .gpt <question>
▢ .claude <question>
▢ .mistral <question>
▢ .metaai <question>
▢ .nemotron <question>
▢ .nvidia <question>
▢ .imagine <prompt>
▢ .flux <prompt>
▢ .sora <prompt>
└───────────

┌─⊷ *FUN*
▢ .compliment @user
▢ .insult @user
▢ .flirt 
▢ .shayari
▢ .goodnight
▢ .roseday
▢ .character @user
▢ .wasted @user
▢ .ship @user
▢ .simp @user
▢ .stupid @user [text]
└───────────

┌─⊷ *TEXTMAKER*
▢ .metallic <text>
▢ .ice <text>
▢ .snow <text>
▢ .impressive <text>
▢ .matrix <text>
▢ .light <text>
▢ .neon <text>
▢ .devil <text>
▢ .purple <text>
▢ .thunder <text>
▢ .leaves <text>
▢ .1917 <text>
▢ .arena <text>
▢ .hacker <text>
▢ .sand <text>
▢ .blackpink <text>
▢ .glitch <text>
▢ .fire <text>
▢ .glow <text>
▢ .blackpink2 <text>
▢ .cartoon <text>
▢ .eraser <text>
▢ .dragonball <text>
▢ .clouds <text>
▢ .usaflag <text>
▢ .nigeriaflag <text>
▢ .hologram <text>
▢ .galaxy <text>
▢ .galaxywall <text>
▢ .glowing <text>
▢ .gradient <text>
▢ .cutegirl <text>
▢ .bulbs <text>
▢ .greenneon <text>
▢ .bear <text>
▢ .galaxyneon <text>
▢ .multicolorneon <text>
▢ .neonglitch <text>
▢ .papercut <text>
▢ .pixelglitch <text>
▢ .royal <text>
▢ .summersand <text>
▢ .pavement <text>
▢ .watercolor <text>
▢ .wetglass <text>
└───────────

┌─⊷ *DOWNLOADER*
▢ .play <song_name>
▢ .song <song_name>
▢ .spotify <query>
▢ .instagram <link>
▢ .facebook <link>
▢ .tiktok <link>
▢ .video <song name>
▢ .ytmp4 <Link>
└───────────

┌─⊷ *MISC*
▢ .heart
▢ .horny
▢ .circle
▢ .lgbt
▢ .lolice
▢ .its-so-stupid
▢ .namecard 
▢ .oogway
▢ .tweet
▢ .ytcomment 
▢ .comrade 
▢ .gay 
▢ .glass 
▢ .jail 
▢ .passed 
▢ .triggered
└───────────

┌─⊷ *ANIME*
▢ .neko
▢ .waifu
▢ .loli
▢ .nom 
▢ .poke 
▢ .cry 
▢ .kiss 
▢ .pat 
▢ .hug 
▢ .wink 
▢ .facepalm 
└───────────

┌─⊷ *GITHUB*
▢ .git
▢ .github
▢ .repo
└───────────

Join our channel for updates:`;

    try {
        // Use global image URL variable (fallback to local image if not set)
        if (global.botImageUrl) {
            // Send message with image URL
            await sock.sendMessage(chatId, {
                image: { url: global.botImageUrl },
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                }
            }, { quoted: message });
        } else {
            // Fallback to local image file
            const imagePath = path.join(__dirname, '../assets/bot_image.jpeg');
            
            if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: helpMessage,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                    }
                }, { quoted: message });
            } else {
                console.error('Bot image not found at:', imagePath);
                await sock.sendMessage(chatId, { 
                    text: helpMessage,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
