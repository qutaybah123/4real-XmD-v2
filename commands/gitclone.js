const fetch = require("node-fetch");

async function gitcloneCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '📦', key: message.key }
        });

        try {
            if (!text || text.split(' ').length < 2) {
                return await sock.sendMessage(chatId, { 
                    text: "❌ Where is the GitHub link?\n\nExample:\n.gitclone https://github.com/username/repository"
                }, { quoted: message });
            }

            const query = text.split(' ').slice(1).join(' ').trim();
            
            if (!/^(https:\/\/)?github\.com\/.+/.test(query)) {
                return await sock.sendMessage(chatId, { 
                    text: "⚠️ Invalid GitHub link. Please provide a valid GitHub repository URL."
                }, { quoted: message });
            }

            const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i;
            const match = query.match(regex);

            if (!match) {
                throw new Error("Invalid GitHub URL format.");
            }

            const [, username, repo] = match;
            const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

            // Check if repository exists
            const response = await fetch(zipUrl, { method: "HEAD" });
            if (!response.ok) {
                throw new Error("Repository not found or access denied.");
            }

            const contentDisposition = response.headers.get("content-disposition");
            const fileName = contentDisposition ? 
                contentDisposition.match(/filename=(.*)/)[1] : 
                `${repo}-${Date.now()}.zip`;

            // Notify user of the download
            await sock.sendMessage(chatId, {
                text: `📥 *Downloading repository...*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`
            }, { quoted: message });

            // Send the zip file to the user
            await sock.sendMessage(chatId, {
                document: { url: zipUrl },
                fileName: fileName,
                mimetype: 'application/zip',
                contextInfo: {
                    mentionedJid: [message.key.participant || message.key.remoteJid],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });

        } catch (error) {
            console.error('GitClone Command Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to download repository: ${error.message}\n\nPlease check:\n• Repository URL is correct\n• Repository is public\n• Network connection is stable`,
            }, { quoted: message });
        }
    } catch (error) {
        console.error('GitClone Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = gitcloneCommand;
