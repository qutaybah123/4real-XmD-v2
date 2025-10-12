const axios = require('axios');
const mumaker = require('mumaker');

// Base channel info template
const channelInfo = {
    forwardingScore: 999,
    isForwarded: true
};

// Reusable message templates
const messageTemplates = {
    error: (message) => ({
        text: message,
        contextInfo: channelInfo
    }),
    success: (text, imageUrl) => ({
        image: { url: imageUrl },
        caption: "Operation Successfully",
        contextInfo: channelInfo
    })
};

async function textmakerCommand(sock, chatId, message, q, type) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, messageTemplates.error("Please provide text to generate\nExample: .metallic 4real"));
        }

        // Extract text
        const text = q.split(' ').slice(1).join(' ');

        if (!text) {
            return await sock.sendMessage(chatId, messageTemplates.error("Please provide text to generate\nExample: .metallic 4real"));
        }

        try {
            let result;
            switch (type) {
                case 'metallic':
                    result = await mumaker.ephoto("https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html", text);
                    break;
                case 'ice':
                    result = await mumaker.ephoto("https://en.ephoto360.com/ice-text-effect-online-101.html", text);
                    break;
                case 'snow':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html", text);
                    break;
                case 'impressive':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html", text);
                    break;
                case 'matrix':
                    result = await mumaker.ephoto("https://en.ephoto360.com/matrix-text-effect-154.html", text);
                    break;
                case 'light':
                    result = await mumaker.ephoto("https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html", text);
                    break;
                case 'neon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html", text);
                    break;
                case 'devil':
                    result = await mumaker.ephoto("https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html", text);
                    break;
                case 'purple':
                    result = await mumaker.ephoto("https://en.ephoto360.com/purple-text-effect-online-100.html", text);
                    break;
                case 'thunder':
                    result = await mumaker.ephoto("https://en.ephoto360.com/thunder-text-effect-online-97.html", text);
                    break;
                case 'leaves':
                    result = await mumaker.ephoto("https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html", text);
                    break;
                case '1917':
                    result = await mumaker.ephoto("https://en.ephoto360.com/1917-style-text-effect-523.html", text);
                    break;
                case 'arena':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html", text);
                    break;
                case 'hacker':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", text);
                    break;
                case 'sand':
                    result = await mumaker.ephoto("https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html", text);
                    break;
                case 'blackpink':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html", text);
                    break;
                case 'glitch':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html", text);
                    break;
                case 'fire':
                    result = await mumaker.ephoto("https://en.ephoto360.com/flame-lettering-effect-372.html", text);
                    break;
                // New effects added below
                case 'glow':
                    result = await mumaker.ephoto("https://en.ephoto360.com/advanced-glow-effects-74.html", text);
                    break;
                case 'blackpink2':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-blackpink-logo-online-free-607.html", text);
                    break;
                case 'cartoon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html", text);
                    break;
                case 'eraser':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html", text);
                    break;
                case 'dragonball':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", text);
                    break;
                case 'clouds':
                    result = await mumaker.ephoto("https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html", text);
                    break;
                case 'usaflag':
                    result = await mumaker.ephoto("https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html", text);
                    break;
                case 'nigeriaflag':
                    result = await mumaker.ephoto("https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html", text);
                    break;
                case 'hologram':
                    result = await mumaker.ephoto("https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html", text);
                    break;
                case 'galaxy':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html", text);
                    break;
                case 'galaxywall':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html", text);
                    break;
                case 'glowing':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-glowing-text-effects-online-706.html", text);
                    break;
                case 'gradient':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html", text);
                    break;
                case 'cutegirl':
                    result = await mumaker.ephoto("https://en.ephoto360.com/cute-girl-painting-graffiti-text-effect-667.html", text);
                    break;
                case 'bulbs':
                    result = await mumaker.ephoto("https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html", text);
                    break;
                case 'greenneon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-light-effects-green-neon-online-429.html", text);
                    break;
                case 'bear':
                    result = await mumaker.ephoto("https://en.ephoto360.com/free-bear-logo-maker-online-673.html", text);
                    break;
                case 'galaxyneon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html", text);
                    break;
                case 'multicolorneon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html", text);
                    break;
                case 'neonglitch':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html", text);
                    break;
                case 'papercut':
                    result = await mumaker.ephoto("https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html", text);
                    break;
                case 'pixelglitch':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html", text);
                    break;
                case 'royal':
                    result = await mumaker.ephoto("https://en.ephoto360.com/royal-text-effect-online-free-471.html", text);
                    break;
                case 'summersand':
                    result = await mumaker.ephoto("https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html", text);
                    break;
                case 'pavement':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html", text);
                    break;
                case 'watercolor':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html", text);
                    break;
                case 'wetglass':
                    result = await mumaker.ephoto("https://en.ephoto360.com/write-text-on-wet-glass-online-589.html", text);
                    break;
                default:
                    return await sock.sendMessage(chatId, messageTemplates.error("Invalid text generator type"));
            }

            if (!result || !result.image) {
                throw new Error('No image URL received from the API');
            }

            await sock.sendMessage(chatId, messageTemplates.success(text, result.image));
        } catch (error) {
            console.error('Error in text generator:', error);
            await sock.sendMessage(chatId, messageTemplates.error(`Error: ${error.message}`));
        }
    } catch (error) {
        console.error('Error in textmaker command:', error);
        await sock.sendMessage(chatId, messageTemplates.error("An error occurred. Please try again later."));
    }
}

module.exports = textmakerCommand;

