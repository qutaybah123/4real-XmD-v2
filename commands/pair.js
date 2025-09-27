const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "Please provide valid WhatsApp number\nExample: .pair 2557865XXX",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });
        }

        const numbers = q.split(',')
            .map((v) => v.replace(/[^0-9]/g, ''))
            .filter((v) => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "Invalid number❌️ Please use the correct format!",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });
        }

        for (const number of numbers) {
            const whatsappID = number + '@s.whatsapp.net';
            const result = await sock.onWhatsApp(whatsappID);

            if (!result[0]?.exists) {
                return await sock.sendMessage(chatId, {
                    text: `That number is not registered on WhatsApp ❗️`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });
            }

            await sock.sendMessage(chatId, {
                text: "Wait a moment for the code",
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });

            try {
                const response = await axios.get(`https://3d50a6e70235469b91a535cf0245ca52.serveo.net/code?number=${number}`);
                
                if (response.data && response.data.code) {
                    const code = response.data.code;
                    if (code === "Service Unavailable") {
                        throw new Error('Service Unavailable');
                    }
                    
                    await sleep(5000);
                    await sock.sendMessage(chatId, {
                        text: `Your pairing code: ${code}`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    });
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                const errorMessage = apiError.message === 'Service Unavailable' 
                    ? "Service is currently unavailable. Please try again later."
                    : "Failed to generate pairing code. Please try again later.";
                
                await sock.sendMessage(chatId, {
                    text: errorMessage,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });
            }
        }
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, {
            text: "An error occurred. Please try again later.",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });
    }
}

module.exports = pairCommand; 
