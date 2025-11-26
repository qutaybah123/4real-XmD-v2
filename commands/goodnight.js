const fetch = require('node-fetch');

async function goodnightCommand(sock, chatId, message) {
    try {
        if (!global.OPENMETA_KEY) {
            throw new Error("Meta AI API key not configured. Set global.OPENMETA_KEY");
        }

        // Strict system prompt for goodnight messages
        const systemPrompt = `
You are a goodnight message generator.
Your ONLY task is to output one sweet, warm, or romantic goodnight message.
❌ Do NOT add explanations, greetings, or extra text.
✅ Use 1-2 emojis maximum when appropriate (like 🌙, 💤, ✨, 😴).
✅ Keep it short and heartfelt (one sentence only).
✅ Just give one goodnight message.
        `.trim();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${global.OPENMETA_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Give me one goodnight message." }
                ],
                temperature: 0.7,
                max_tokens: 80
            })
        });

        if (!response.ok) throw new Error(`Meta AI API error: ${response.status}`);
        const data = await response.json();
        const goodnightMessage = data.choices?.[0]?.message?.content?.trim();

        if (!goodnightMessage) throw new Error("No goodnight message received from AI");

        await sock.sendMessage(chatId, { text: goodnightMessage }, { quoted: message });

    } catch (error) {
        console.error("Error in goodnight command:", error);
        await sock.sendMessage(chatId, { 
            text: "❌ Failed to get goodnight message. Please try again later!" 
        }, { quoted: message });
    }
}

module.exports = { goodnightCommand };
