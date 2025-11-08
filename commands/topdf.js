const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');
const settings = require("../settings");

async function topdfCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const q = args.slice(1).join(" ");

        await sock.sendMessage(chatId, {
            react: { text: '📄', key: message.key }
        });

        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please provide text to convert to PDF.*\n\n📌 *Usage:* .topdf [text]\n*Example:* .topdf Hello World"
            }, { quoted: message });
        }

        try {
            const doc = new PDFDocument();
            let buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', async () => {
                try {
                    const pdfData = Buffer.concat(buffers);
                    const fileName = `document_${Date.now()}.pdf`;

                    await sock.sendMessage(chatId, {
                        document: pdfData,
                        mimetype: 'application/pdf',
                        fileName: fileName,
                        caption: `*📄 PDF Created Successfully!*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`
                    }, { quoted: message });

                } catch (sendError) {
                    console.error('PDF Send Error:', sendError);
                    await sock.sendMessage(chatId, {
                        text: "❌ Failed to send PDF file."
                    }, { quoted: message });
                }
            });

            // PDF Styling
            doc.fontSize(20);
            doc.text('Document', {
                align: 'center'
            });
            
            doc.moveDown();
            doc.fontSize(12);
            doc.text('Created: ' + new Date().toLocaleString());
            
            doc.moveDown();
            doc.fontSize(10);
            doc.text(q, {
                align: 'left',
                width: 500,
                lineGap: 5
            });

            doc.end();

        } catch (pdfError) {
            console.error('PDF Creation Error:', pdfError);
            await sock.sendMessage(chatId, {
                text: "❌ Error creating PDF document: " + pdfError.message
            }, { quoted: message });
        }

    } catch (error) {
        console.error('TopDF Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = topdfCommand;
