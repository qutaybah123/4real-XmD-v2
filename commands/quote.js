const fetch = require('node-fetch');

module.exports = async function quoteCommand(sock, chatId, message) {
    try {
        if (!global.OPENMETA_KEY) {
            throw new Error("Meta AI API key not configured. Set global.OPENMETA_KEY");
        }

        // Strict system prompt for quotes only
        const systemPrompt = `
You are a quote generator.
Your ONLY task is to output one inspirational quote.
❌ Do NOT add explanations, introductions, or extra text.
❌ Do NOT add author names, source information, or credits.
❌ Do NOT say "here's a quote" or similar introductions.
❌ Do NOT use quotation marks around the quote.
✅ Just give one quote only - direct and concise.
✅ Keep it inspirational and appropriate.
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
                    { role: "user", content: "Give me an inspirational quote." }
                ],
                temperature: 0.7,
                max_tokens: 80
            })
        });

        if (!response.ok) throw new Error(`Meta AI API error: ${response.status}`);
        const data = await response.json();
        const quote = data.choices?.[0]?.message?.content?.trim();

        if (!quote) throw new Error("No quote received from AI");

        // Send the quote message
        await sock.sendMessage(chatId, { text: quote }, { quoted: message });
    } catch (error) {
        console.error('Error in quote command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get quote. Please try again later!' }, { quoted: message });
    }
};
