const axios = require("axios");
const settings = require("../settings");

async function phoneCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const subcommand = args[1]?.toLowerCase();

        await sock.sendMessage(chatId, {
            react: { text: '📱', key: message.key }
        });

        try {
            const apiUrl = `https://script.google.com/macros/s/AKfycbxNu27V2Y2LuKUIQMK8lX1y0joB6YmG6hUwB1fNeVbgzEh22TcDGrOak03Fk3uBHmz-/exec?route=recommended`;
            const response = await axios.get(apiUrl, { timeout: 15000 });

            if (response.status === 200 && response.data.status === 200 && response.data.data) {
                const data = response.data.data;

                let phoneMessage = '';
                
                // Handle different subcommands
                switch(subcommand) {
                    case 'latest':
                    case 'new':
                        phoneMessage = formatLatestPhones(data.recommended_1);
                        break;
                    case 'instock':
                    case 'available':
                        phoneMessage = formatInStockPhones(data.recommended_2);
                        break;
                    case 'popular':
                    case 'trending':
                        phoneMessage = formatPopularPhones(data.recommended_3);
                        break;
                    case 'fans':
                    case 'favorites':
                        phoneMessage = formatFanFavorites(data.recommended_4);
                        break;
                    case 'compare':
                    case 'comparisons':
                        phoneMessage = formatComparisons(data.recommended_5);
                        break;
                    case 'all':
                    default:
                        phoneMessage = formatAllRecommendations(data);
                        break;
                }

                await sock.sendMessage(chatId, {
                    text: phoneMessage
                }, { quoted: message });

            } else {
                await sock.sendMessage(chatId, {
                    text: "❌ *Failed to fetch phone data.*\n\nPlease try again later."
                }, { quoted: message });
            }

        } catch (error) {
            console.error("Phone API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ *Service Error*\n\nUnable to fetch phone recommendations at the moment."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Phone Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: message });
    }
}

// Format latest phones
function formatLatestPhones(data) {
    let message = `📱 *LATEST PHONES* - ${data.title}\n\n`;
    
    data.data.forEach((phone, index) => {
        message += `${index + 1}. *${phone.device_name}*\n`;
        message += `   🔗 Key: ${phone.key}\n`;
        if (index < data.data.length - 1) message += '\n';
    });
    
    message += `\n> Use *.phone compare* for comparisons`;
    return message;
}

// Format in-stock phones
function formatInStockPhones(data) {
    let message = `🛒 *IN STOCK NOW* - ${data.title}\n\n`;
    
    data.data.forEach((phone, index) => {
        message += `${index + 1}. *${phone.device_name}*\n`;
        message += `   🔗 ${phone.key}\n`;
        if (index < data.data.length - 1) message += '\n';
    });
    
    return message;
}

// Format popular phones
function formatPopularPhones(data) {
    let message = `🔥 *TOP 10 POPULAR PHONES* - ${data.title}\n\n`;
    
    data.data.forEach((phone) => {
        message += `${phone.no}. *${phone.device_name}*\n`;
        message += `   👀 ${phone.daily_hits} daily views\n`;
        message += `   🔗 ${phone.key}\n\n`;
    });
    
    return message;
}

// Format fan favorites
function formatFanFavorites(data) {
    let message = `⭐ *TOP 10 FAN FAVORITES* - ${data.title}\n\n`;
    
    data.data.forEach((phone) => {
        message += `${phone.no}. *${phone.device_name}*\n`;
        message += `   ❤️ ${phone.daily_hits} fan hits\n`;
        message += `   🔗 ${phone.key}\n\n`;
    });
    
    return message;
}

// Format comparisons
function formatComparisons(data) {
    let message = `📊 *POPULAR COMPARISONS* - ${data.title}\n\n`;
    
    data.data.forEach((comparison, index) => {
        message += `${index + 1}. *${comparison.device_name}*\n`;
        message += `   📱 IDs: ${comparison.device_one_id} vs ${comparison.device_two_id}\n`;
        if (index < data.data.length - 1) message += '\n';
    });
    
    return message;
}

// Format all recommendations
function formatAllRecommendations(data) {
    let message = `📱 *PHONE RECOMMENDATIONS*\n\n`;
    
    // Latest devices
    message += `📅 *${data.recommended_1.title}:*\n`;
    data.recommended_1.data.slice(0, 3).forEach((phone, index) => {
        message += `${index + 1}. ${phone.device_name}\n`;
    });
    message += `... and ${data.recommended_1.data.length - 3} more\n\n`;
    
    // Popular devices
    message += `🔥 *${data.recommended_3.title}:*\n`;
    data.recommended_3.data.slice(0, 3).forEach((phone) => {
        message += `${phone.no}. ${phone.device_name} (${phone.daily_hits})\n`;
    });
    message += `... and ${data.recommended_3.data.length - 3} more\n\n`;
    
    message += `💡 *Usage:* 
.phone latest - Latest devices
.phone popular - Trending phones  
.phone fans - Fan favorites
.phone instock - Available phones
.phone compare - Popular comparisons
.phone all - All categories`;
    
    return message;
}

module.exports = phoneCommand;
