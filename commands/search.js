const axios = require("axios");

async function searchCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const query = args.slice(1).join(" ");

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: "❌ Please provide a search query\nExample: .search cats"
            }, { quoted: message });
        }

        try {
            const data = JSON.stringify({
                "q": query,
                "num": 10 // Get more images to have better success rate
            });

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://google.serper.dev/images',
                headers: { 
                    'X-API-KEY': 'beec5ccbb4b89f20f336d80f2be956f1c0c57cbf', 
                    'Content-Type': 'application/json'
                },
                data: data,
                timeout: 10000
            };

            const response = await axios.request(config);

            if (response.status === 200 && response.data?.images && response.data.images.length > 0) {
                const images = response.data.images;
                let successfulSends = 0;
                const maxImages = 5; // Maximum number of images to send
                
                // Try to send images one by one
                for (let i = 0; i < images.length && successfulSends < maxImages; i++) {
                    const image = images[i];
                    
                    if (!image.imageUrl) continue; // Skip if no image URL
                    
                    try {
                        // Send image without any caption or text
                        await sock.sendMessage(chatId, {
                            image: { url: image.imageUrl }
                        });
                        
                        successfulSends++;
                        
                        // Add small delay between sends (except for last one)
                        if (successfulSends < maxImages && i < images.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }
                        
                    } catch (imageError) {
                        // Silently continue to next image if this one fails
                        console.log(`[SEARCH] Image ${i+1} failed: ${imageError.message}`);
                        continue;
                    }
                }
                
                // If no images were successfully sent
                if (successfulSends === 0) {
                    await sock.sendMessage(chatId, {
                        text: "❌ Could not load any images for your search"
                    }, { quoted: message });
                }
                
            } else {
                await sock.sendMessage(chatId, {
                    text: "❌ No images found for your search"
                }, { quoted: message });
            }

        } catch (error) {
            console.error("Search API Error:", error);
            await sock.sendMessage(chatId, {
                text: "❌ Search failed. Please try again."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Search Command Error:', error);
    }
}

module.exports = searchCommand;
