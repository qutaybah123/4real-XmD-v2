const fetch = require('node-fetch');

module.exports = async function (sock, chatId, message) {
    try {
        if (!global.OPENNVIDIA_KEY) {
            throw new Error("NVIDIA API key not configured. Set global.OPENNVIDIA_KEY");
        }

        // Strict system prompt to only return one fact
        const systemPrompt = `
You are a fact generator.
Your ONLY task is to output one interesting fact in English.
❌ Do NOT add explanations, emojis, greetings, or extra text.
✅ Just give one fact only.
        `.trim();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${global.OPENNVIDIA_KEY}`,
                "HTTP-Referer": "https://github.com/your-bot",
                "X-Title": "WhatsApp Fact Bot",
                "Content-Type": "application/json",
                "User-Agent": "WhatsApp-Bot/1.0"
            },
            body: JSON.stringify({
                model: "nvidia/nemotron-nano-9b-v2:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Give me one random fact." }
                ],
                temperature: 0.7,
                max_tokens: 120
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`NVIDIA API error: ${response.status}`);
        }

        const data = await response.json();
        const fact = data.choices?.[0]?.message?.content?.trim();

        if (!fact) throw new Error("No fact received from AI");

        await sock.sendMessage(chatId, { text: fact }, { quoted: message });

    } catch (error) {
        console.error("Error fetching fact:", error);
        await sock.sendMessage(chatId, { 
            text: "❌ Sorry, I could not fetch a fact right now." 
        }, { quoted: message });
    }
};
