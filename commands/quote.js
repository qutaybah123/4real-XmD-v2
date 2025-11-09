const axios = require("axios");

async function quoteCommand(sock, chatId, message) {
    try {
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '💬', key: message.key }
        });

        try {
            // Try multiple quote APIs in sequence
            let quoteData = await tryMultipleQuoteAPIs();
            
            if (!quoteData) {
                throw new Error("All quote APIs failed");
            }

            const quoteMessage = 
`╭──「 💬 RANDOM QUOTE 」──╮
│
│ *${quoteData.content}*
│
│ ─ *${quoteData.author}*
│
╰──「 ✨ ʟɪɢᴀɴɢ ᴛᴇᴄʜs 」──╯`;

            await sock.sendMessage(chatId, {
                text: quoteMessage
            }, { quoted: message });

        } catch (error) {
            console.error("All Quote APIs Failed:", error);
            
            // Use local fallback quotes
            await sendFallbackQuote(sock, chatId, message);
        }

    } catch (error) {
        console.error('Quote Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

// Try multiple quote APIs
async function tryMultipleQuoteAPIs() {
    const apis = [
        {
            name: 'ZenQuotes',
            url: 'https://zenquotes.io/api/random',
            parser: (data) => ({ content: data[0].q, author: data[0].a })
        },
        {
            name: 'Quotable Backup',
            url: 'https://quotable-api.vercel.app/random',
            parser: (data) => ({ content: data.content, author: data.author })
        },
        {
            name: 'Programming Quotes',
            url: 'https://programming-quotes-api.herokuapp.com/quotes/random',
            parser: (data) => ({ content: data.en, author: data.author })
        }
    ];

    for (const api of apis) {
        try {
            console.log(`Trying ${api.name} API...`);
            const response = await axios.get(api.url, { 
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.data) {
                console.log(`✅ Success with ${api.name}`);
                return api.parser(response.data);
            }
        } catch (apiError) {
            console.log(`❌ ${api.name} failed:`, apiError.message);
            continue; // Try next API
        }
    }
    
    return null; // All APIs failed
}

// Fallback local quotes
async function sendFallbackQuote(sock, chatId, message) {
    const fallbackQuotes = [
        {
            content: "The only way to do great work is to love what you do.",
            author: "Steve Jobs"
        },
        {
            content: "Innovation distinguishes between a leader and a follower.",
            author: "Steve Jobs"
        },
        {
            content: "Your time is limited, so don't waste it living someone else's life.",
            author: "Steve Jobs"
        },
        {
            content: "Stay hungry, stay foolish.",
            author: "Steve Jobs"
        },
        {
            content: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt"
        },
        {
            content: "It does not matter how slowly you go as long as you do not stop.",
            author: "Confucius"
        },
        {
            content: "Everything you've ever wanted is on the other side of fear.",
            author: "George Addair"
        },
        {
            content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            author: "Winston Churchill"
        },
        {
            content: "The only impossible journey is the one you never begin.",
            author: "Tony Robbins"
        },
        {
            content: "Believe you can and you're halfway there.",
            author: "Theodore Roosevelt"
        }
    ];
    
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    const fallbackMessage = 
`╭──「 💬 RANDOM QUOTE 」──╮
│
│ *${randomQuote.content}*
│
│ ─ *${randomQuote.author}*
│
│ 📝 *Note:* Using local quotes (API unavailable)
│
╰──「 ✨ ʟɪɢᴀɴɢ ᴛᴇᴄʜs 」──╯`;

    await sock.sendMessage(chatId, {
        text: fallbackMessage
    }, { quoted: message });
}

module.exports = quoteCommand;
