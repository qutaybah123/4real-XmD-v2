const fetch = require('node-fetch');

async function flirtCommand(sock, chatId, message) {
    try {
        if (!global.OPENMETA_KEY) {
            throw new Error("Meta AI API key not configured. Set global.OPENMETA_KEY");
        }

        // Strict system prompt for flirt
        const systemPrompt = `
You are a flirt line generator.
Your ONLY task is to output one playful, romantic, or flirty line.
❌ Do NOT add explanations, emojis, greetings, or extra text.
✅ Just give one flirt line only.
        `.trim();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${global.OPENMETA_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-maverick:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Give me one flirt line." }
                ],
                temperature: 0.8,
                max_tokens: 100
            })
        });

        if (!response.ok) throw new Error(`Meta AI API error: ${response.status}`);
        const data = await response.json();
        const flirtMessage = data.choices?.[0]?.message?.content?.trim();

        if (!flirtMessage) throw new Error("No flirt line received from AI");

        await sock.sendMessage(chatId, { text: flirtMessage }, { quoted: message });

    } catch (error) {
        console.error("Error in flirt command:", error);
        await sock.sendMessage(chatId, { 
            text: "🚫 Failed to get flirt message. Please try again later!" 
        }, { quoted: message });
    }
}

module.exports = { flirtCommand };
