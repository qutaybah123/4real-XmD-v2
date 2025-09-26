const fetch = require('node-fetch');

async function truthCommand(sock, chatId, message) {
    try {
        if (!global.OPENMETA_KEY) {
            throw new Error("Meta AI API key not configured. Set global.OPENMETA_KEY");
        }

        // Strict system prompt for truth questions only
        const systemPrompt = `
You are a truth question generator for a fun game.
Your ONLY task is to output one challenging truth question.
❌ Do NOT add explanations, introductions, or extra text.
❌ Do NOT add numbers, bullet points, or formatting.
❌ Do NOT say "here's a truth question" or similar introductions.
❌ Do NOT use quotation marks around the question.
✅ Just give one truth question only - direct and challenging.
✅ Make it personal, thought-provoking, and game-appropriate.
✅ Keep it clean but engaging for a truth or dare game.
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
                    { role: "user", content: "Give me a challenging truth question for a game." }
                ],
                temperature: 0.8,
                max_tokens: 60
            })
        });

        if (!response.ok) throw new Error(`Meta AI API error: ${response.status}`);
        const data = await response.json();
        let truthQuestion = data.choices?.[0]?.message?.content?.trim();

        if (!truthQuestion) throw new Error("No truth question received from AI");

        // Clean up the response to ensure only the question is returned
        truthQuestion = truthQuestion
            .replace(/^(Truth question|Question|Truth):?\s*/i, '') // Remove prefixes
            .replace(/["']/g, '') // Remove quotes
            .trim();

        // Ensure it ends with a question mark
        if (!truthQuestion.endsWith('?')) {
            truthQuestion += '?';
        }

        // Send the truth question message
        await sock.sendMessage(chatId, { text: truthQuestion }, { quoted: message });
    } catch (error) {
        console.error('Error in truth command:', error);
        
        // Fallback to the original API if AI fails
        try {
            const shizokeys = 'shizo';
            const res = await fetch(`https://shizokeys.onrender.com/api/texts/truth?apikey=${shizokeys}`);
            
            if (res.ok) {
                const json = await res.json();
                const truthMessage = json.result;
                await sock.sendMessage(chatId, { text: truthMessage }, { quoted: message });
            } else {
                throw new Error('Fallback API also failed');
            }
        } catch (fallbackError) {
            await sock.sendMessage(chatId, { text: '❌ Failed to get truth question. Please try again later!' }, { quoted: message });
        }
    }
}

module.exports = { truthCommand };
