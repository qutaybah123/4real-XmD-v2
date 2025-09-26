const fetch = require('node-fetch');

async function dareCommand(sock, chatId, message) {
    try {
        if (!global.OPENDEEPSEEKR1_KEY) {
            throw new Error("DeepSeek API key not configured. Set global.OPENDEEPSEEKR1_KEY");
        }

        // Strict system prompt to only return a dare
        const systemPrompt = `
You are a Dare generator for a WhatsApp game.
Your ONLY task is to output a dare in a short, clear sentence.
❌ Do NOT add explanations, emojis, or extra text.
✅ Just give one dare only.
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
                    { role: "user", content: "Give me a dare." }
                ],
                temperature: 0.8,
                max_tokens: 100
            })
        });

        if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);
        const data = await response.json();
        const dareMessage = data.choices?.[0]?.message?.content?.trim();

        if (!dareMessage) throw new Error("No dare received from AI");

        await sock.sendMessage(chatId, { text: dareMessage }, { quoted: message });

    } catch (error) {
        console.error("Error in dare command:", error);
        await sock.sendMessage(chatId, { 
            text: "❌ Failed to get dare. Please try again later!" 
        }, { quoted: message });
    }
}

module.exports = { dareCommand };
