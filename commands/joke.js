const fetch = require('node-fetch');

async function jokeCommand(sock, chatId, message) {
    try {
        if (!global.OPENMETA_KEY) {
            throw new Error("Meta AI API key not configured. Set global.OPENMETA_KEY");
        }

        // Strict system prompt for jokes only
        const systemPrompt = `
You are a joke generator.
Your ONLY task is to output one joke.
❌ Do NOT add explanations, introductions, or extra text.
❌ Do NOT add emojis, laughter comments, or follow-up text.
❌ Do NOT say "here's a joke" or similar introductions.
✅ Just give one joke only - setup and punchline in one line.
✅ Keep it clean and appropriate.
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
                    { role: "user", content: "Tell me a joke." }
                ],
                temperature: 0.8,
                max_tokens: 100
            })
        });

        if (!response.ok) throw new Error(`Meta AI API error: ${response.status}`);
        const data = await response.json();
        const joke = data.choices?.[0]?.message?.content?.trim();

        if (!joke) throw new Error("No joke received from AI");

        await sock.sendMessage(chatId, { text: joke }, { quoted: message });

    } catch (error) {
        console.error("Error in joke command:", error);
        await sock.sendMessage(chatId, { 
            text: "❌ Failed to get a joke. Please try again later!" 
        }, { quoted: message });
    }
}

module.exports = { jokeCommand };
