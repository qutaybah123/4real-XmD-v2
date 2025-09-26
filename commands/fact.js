const fetch = require('node-fetch');

module.exports = async function (sock, chatId, message) {
    try {
        if (!global.OPENDEEPSEEKR1_KEY) {
            throw new Error("DeepSeek API key not configured. Set global.OPENDEEPSEEKR1_KEY");
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
                "Authorization": `Bearer ${global.OPENDEEPSEEKR1_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Give me one random fact." }
                ],
                temperature: 0.7,
                max_tokens: 120
            })
        });

        if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);

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
