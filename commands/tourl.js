const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const settings = require("../settings");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

async function tourlCommand(sock, chatId, message) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        await sock.sendMessage(chatId, {
            react: { text: "🖇️", key: message.key }
        });

        // Check if user replied to a valid media message
        if (!quotedMsg || !Object.keys(quotedMsg)[0].includes("Message")) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please reply to an image, video, audio, or sticker message.*\n\n📌 *Usage:* Reply to media with .tourl"
            }, { quoted: message });
        }

        const type = Object.keys(quotedMsg)[0]; // e.g. imageMessage, videoMessage
        const mediaMessage = quotedMsg[type];
        const mimeType = mediaMessage?.mimetype || "";

        if (!mimeType) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Unsupported or missing media type.*"
            }, { quoted: message });
        }

        // Download media safely
        let mediaBuffer;
        try {
            const stream = await downloadContentFromMessage(mediaMessage, type.replace("Message", ""));
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            mediaBuffer = Buffer.concat(chunks);
        } catch (err) {
            console.error("Download Error:", err);
            return await sock.sendMessage(chatId, {
                text: "❌ *Cannot download media.* It may be expired or inaccessible."
            }, { quoted: message });
        }

        // Try uploading to Catbox first, fallback to File.io
        let mediaUrl;
        let serviceUsed = "Catbox";

        try {
            mediaUrl = await uploadToCatbox(mediaBuffer, mimeType);
        } catch (catboxError) {
            console.log("Catbox upload failed, trying File.io...");
            try {
                mediaUrl = await uploadToFileIO(mediaBuffer, mimeType);
                serviceUsed = "File.io";
            } catch (fileioError) {
                console.error("File.io Upload Error:", fileioError);
                throw new Error("All upload services failed");
            }
        }

        // Detect type for response
        let mediaType = "File";
        if (mimeType.includes("image")) mediaType = "Image";
        else if (mimeType.includes("video")) mediaType = "Video";
        else if (mimeType.includes("audio")) mediaType = "Audio";
        else if (mimeType.includes("sticker")) mediaType = "Sticker";

        const resultText =
`╭╼━━━━━━━━━━━━━━━━╾╮
┃ *📥 ᴛᴏᴜʀʟ ᴜᴘʟᴏᴀᴅᴇʀ*
┃ *🏋️‍♂️ sɪᴢᴇ:* ${formatBytes(mediaBuffer.length)}
┃ *📝 ᴍᴇᴅɪᴀ:* ${mediaType}
┃ *🌐 sᴇʀᴠɪᴄᴇ:* ${serviceUsed}
┃ *⏳ ᴜʀʟ:* ${mediaUrl}
╰╼━━━━━━━━━━━━━━━━╾╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

        await sock.sendMessage(chatId, { text: resultText }, { quoted: message });

    } catch (err) {
        console.error("Tourl Command Error:", err);
        await sock.sendMessage(chatId, {
            text: "❌ *An unexpected error occurred while processing the command.*"
        }, { quoted: message });
    }
}

async function uploadToCatbox(mediaBuffer, mimeType) {
    const tempPath = path.join(os.tmpdir(), `upload_${Date.now()}`);
    fs.writeFileSync(tempPath, mediaBuffer);

    let extension = ".bin";
    if (mimeType.includes("jpeg")) extension = ".jpg";
    else if (mimeType.includes("png")) extension = ".png";
    else if (mimeType.includes("video")) extension = ".mp4";
    else if (mimeType.includes("audio")) extension = ".mp3";
    else if (mimeType.includes("webp")) extension = ".webp";

    const fileName = `file${extension}`;
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempPath), fileName);

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
        timeout: 30000,
        validateStatus: () => true
    });

    fs.unlinkSync(tempPath);

    if (res.data && typeof res.data === "string" && res.data.includes("https://files.catbox.moe/")) {
        return res.data;
    }
    throw new Error("Catbox upload failed");
}

async function uploadToFileIO(mediaBuffer, mimeType) {
    const form = new FormData();
    form.append("file", mediaBuffer, {
        filename: "file",
        contentType: mimeType
    });

    const res = await axios.post("https://file.io", form, {
        headers: form.getHeaders(),
        timeout: 30000
    });

    if (res.data && res.data.success && res.data.link) {
        return res.data.link;
    }
    throw new Error("File.io upload failed");
}

function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

module.exports = tourlCommand;
