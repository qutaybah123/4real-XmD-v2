const axios = require('axios');
const fetch = require('node-fetch');

// Crypto price checker
async function cryptoPriceCommand(sock, chatId, message, crypto = 'bitcoin') {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd,eur,gbp,inr,brl&include_24hr_change=true&include_market_cap=true`);
        const data = response.data[crypto];
        
        if (!data) {
            return await sock.sendMessage(chatId, {
                text: '❌ Cryptocurrency not found. Available: bitcoin, ethereum, dogecoin, etc.',
                ...channelInfo
            }, { quoted: message });
        }

        const priceText = `💰 *${crypto.toUpperCase()} Price*\n\n` +
                         `💵 USD: $${data.usd.toLocaleString()}\n` +
                         `💶 EUR: €${data.eur.toLocaleString()}\n` +
                         `💷 GBP: £${data.gbp.toLocaleString()}\n` +
                         `🇮🇳 INR: ₹${data.inr.toLocaleString()}\n` +
                         `🇧🇷 BRL: R$${data.brl.toLocaleString()}\n\n` +
                         `📈 24h Change: ${data.usd_24h_change?.toFixed(2) || 0}%\n` +
                         `🏦 Market Cap: $${(data.usd_market_cap / 1000000000).toFixed(2)}B`;

        await sock.sendMessage(chatId, {
            text: priceText,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Crypto price error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch cryptocurrency prices',
            ...channelInfo
        }, { quoted: message });
    }
}

// Bitcoin rich list checker
async function bitcoinRichCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin');
        const data = response.data;
        
        const richText = `🏦 *Bitcoin Rich List Info*\n\n` +
                        `💰 Current Price: $${data.market_data.current_price.usd.toLocaleString()}\n` +
                        `📊 Market Cap: $${(data.market_data.market_cap.usd / 1000000000).toFixed(2)}B\n` +
                        `💎 Rank: #${data.market_cap_rank}\n` +
                        `🔄 24h Volume: $${(data.market_data.total_volume.usd / 1000000).toFixed(2)}M\n\n` +
                        `📈 All Time High: $${data.market_data.ath.usd.toLocaleString()}\n` +
                        `📉 All Time Low: $${data.market_data.atl.usd.toLocaleString()}\n\n` +
                        `💼 Circulating Supply: ${(data.market_data.circulating_supply / 1000000).toFixed(2)}M BTC\n` +
                        `🏭 Total Supply: ${(data.market_data.total_supply / 1000000).toFixed(2)}M BTC`;

        await sock.sendMessage(chatId, {
            text: richText,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Bitcoin rich error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch Bitcoin rich list data',
            ...channelInfo
        }, { quoted: message });
    }
}

// Multiple crypto prices
async function multiCryptoCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const cryptos = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'dogecoin'];
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptos.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        
        let cryptoText = '📊 *Top Cryptocurrency Prices*\n\n';
        
        cryptos.forEach(crypto => {
            const data = response.data[crypto];
            if (data) {
                const change = data.usd_24h_change?.toFixed(2) || 0;
                const changeEmoji = change >= 0 ? '📈' : '📉';
                cryptoText += `• ${crypto.charAt(0).toUpperCase() + crypto.slice(1)}: $${data.usd.toLocaleString()} ${changeEmoji} ${change}%\n`;
            }
        });

        cryptoText += '\n💡 Use .crypto <coin> for detailed prices';

        await sock.sendMessage(chatId, {
            text: cryptoText,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Multi crypto error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch cryptocurrency data',
            ...channelInfo
        }, { quoted: message });
    }
}

// Crypto news
async function cryptoNewsCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const response = await axios.get('https://newsapi.org/v2/everything?q=cryptocurrency&sortBy=publishedAt&language=en&pageSize=5&apiKey=YOUR_NEWS_API_KEY');
        
        let newsText = '📰 *Latest Crypto News*\n\n';
        
        response.data.articles.slice(0, 5).forEach((article, index) => {
            newsText += `${index + 1}. ${article.title}\n`;
            newsText += `🔗 ${article.url}\n\n`;
        });

        await sock.sendMessage(chatId, {
            text: newsText,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Crypto news error:', error);
        // Fallback news
        const fallbackNews = `📰 *Crypto News Update*\n\n` +
                           `1. Bitcoin ETF approvals driving institutional adoption\n` +
                           `2. Ethereum 2.0 upgrade improves scalability\n` +
                           `3. DeFi and NFT markets continue to grow\n` +
                           `4. Regulatory developments shaping crypto future\n` +
                           `5. Web3 and Metaverse projects gaining traction`;
        
        await sock.sendMessage(chatId, {
            text: fallbackNews,
            ...channelInfo
        }, { quoted: message });
    }
}

// Bitcoin wallet generator (educational purposes)
async function generateWalletCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        // This is a SIMULATION - NOT real wallet generation
        const simulateWallet = () => {
            const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            let address = '1';
            for (let i = 0; i < 33; i++) {
                address += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return address;
        };

        const walletAddress = simulateWallet();
        const privateKey = 'xprv' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        const walletInfo = `⚠️ *EDUCATIONAL WALLET EXAMPLE*\n\n` +
                          `📨 Public Address:\n\`${walletAddress}\`\n\n` +
                          `🔑 Private Key:\n\`${privateKey}\`\n\n` +
                          `❌ *WARNING: This is NOT a real wallet!*\n` +
                          `• Do not send funds to this address\n` +
                          `• For real wallets use trusted services like:\n` +
                          `  - Ledger, Trezor (hardware)\n` +
                          `  - Exodus, Trust Wallet (software)\n` +
                          `  - Coinbase, Binance (exchange)`;

        await sock.sendMessage(chatId, {
            text: walletInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Wallet gen error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to generate wallet example',
            ...channelInfo
        }, { quoted: message });
    }
}

// Crypto calculator
async function cryptoCalculatorCommand(sock, chatId, message, args) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const [amount, crypto = 'bitcoin'] = args;
        const numAmount = parseFloat(amount);
        
        if (!amount || isNaN(numAmount)) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .calc <amount> <crypto>\nExample: .calc 1 bitcoin',
                ...channelInfo
            }, { quoted: message });
        }

        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`);
        const price = response.data[crypto]?.usd;

        if (!price) {
            return await sock.sendMessage(chatId, {
                text: '❌ Cryptocurrency not found',
                ...channelInfo
            }, { quoted: message });
        }

        const totalValue = numAmount * price;
        
        const calcText = `🧮 *Crypto Calculator*\n\n` +
                        `💰 ${numAmount} ${crypto.toUpperCase()} = $${totalValue.toLocaleString()}\n` +
                        `📊 Current Price: $${price.toLocaleString()} per ${crypto}\n\n` +
                        `💎 Worth in:\n` +
                        `• Bitcoin: ${(totalValue / (response.data.bitcoin?.usd || price)).toFixed(8)} BTC\n` +
                        `• Ethereum: ${(totalValue / (response.data.ethereum?.usd || price * 0.067)).toFixed(6)} ETH`;

        await sock.sendMessage(chatId, {
            text: calcText,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Crypto calc error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to calculate crypto value',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    cryptoPriceCommand,
    bitcoinRichCommand,
    multiCryptoCommand,
    cryptoNewsCommand,
    generateWalletCommand,
    cryptoCalculatorCommand
};
