const axios = require("axios");

async function npmCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const packageName = args.slice(1).join(" ");

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '📦', key: message.key }
        });

        if (!packageName) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please provide an npm package name.*\n\n📌 *Usage:* .npm <package-name>\n*Example:* .npm express\n*Example:* .npm axios\n*Example:* .npm react"
            }, { quoted: message });
        }

        try {
            const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
            const response = await axios.get(apiUrl, { timeout: 10000 });

            if (response.status !== 200) {
                throw new Error("Package not found");
            }

            const packageData = response.data;
            const latestVersion = packageData["dist-tags"]?.latest || "Unknown";
            const description = packageData.description || "No description available.";
            const npmUrl = `https://www.npmjs.com/package/${packageName}`;
            const license = packageData.license || "Unknown";
            const repository = packageData.repository ? 
                packageData.repository.url.replace('git+', '').replace('.git', '') : 
                "Not available";
            
            const author = packageData.author?.name || "Unknown";
            const homepage = packageData.homepage || "Not available";
            const keywords = packageData.keywords ? packageData.keywords.join(', ') : "None";

            const resultText = 
`╭──「 📦 NPM PACKAGE INFO 」──╮
│
│ *📦 Package:* ${packageName}
│ *📄 Version:* ${latestVersion}
│ *👤 Author:* ${author}
│ *📝 Description:* ${description}
│ *🪪 License:* ${license}
│ *🏠 Homepage:* ${homepage}
│ *🔗 Repository:* ${repository}
│ *🏷️ Keywords:* ${keywords}
│ *🌐 NPM URL:* ${npmUrl}
│
╰──「 🚀 ʟɪɢᴀɴɢ ᴛᴇᴄʜs 」──╯`;

            await sock.sendMessage(chatId, {
                text: resultText
            }, { quoted: message });

        } catch (error) {
            console.error("NPM API Error:", error);
            
            if (error.response?.status === 404) {
                await sock.sendMessage(chatId, {
                    text: `❌ *Package not found:* \"${packageName}\"\n\n🔍 *Check the spelling or try these popular packages:*\n• express\n• axios\n• react\n• lodash\n• moment`
                }, { quoted: message });
            } else if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: "⏳ *Request timeout.* Please try again."
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error:* ${error.message}\n\nTry: .npm express`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('NPM Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = npmCommand;
