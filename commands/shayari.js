const fetch = require('node-fetch');

async function shayariCommand(sock, chatId, message, lang = "en") {
    try {
        if (!global.OPENMETA_KEY) {
            throw new Error("Meta AI API key not configured. Set global.OPENMETA_KEY");
        }

        // Supported language codes
        const languageMap = {
            en: "English",
            hi: "Hindi",
            ur: "Urdu",
            sw: "Swahili",
            ar: "Arabic",
            es: "Spanish",
            fr: "French",
            de: "German",
            it: "Italian",
            pt: "Portuguese",
            ru: "Russian",
            zh: "Chinese",
            ja: "Japanese",
            tr: "Turkish",
            fa: "Persian",
            bn: "Bengali",
            ta: "Tamil",
            te: "Telugu",
            ml: "Malayalam",
            kn: "Kannada"
        };

        const language = languageMap[lang] || "English";

        const systemPrompt = `
You are a shayari generator.
Your ONLY task is to output one complete romantic shayari in ${language}.
❌ Do NOT add explanations, introductions, or extra text.
❌ Do NOT add titles, author names, or source information.
❌ Do NOT say "here's a shayari" or similar introductions.
❌ Do NOT use emojis or decorative symbols.
✅ Just give one romantic shayari only - 2-4 lines maximum.
✅ Keep it authentic and poetic style.
✅ Make it romantic and emotional.
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
                    { role: "user", content: "Give me a romantic shayari." }
                ],
                temperature: 0.8,
                max_tokens: 120
            })
        });

        if (!response.ok) throw new Error(`Meta AI API error: ${response.status}`);
        const data = await response.json();
        const shayari = data.choices?.[0]?.message?.content?.trim();

        if (!shayari) throw new Error("No shayari received from AI");

        const buttons = [
            { buttonId: '.shayari en', buttonText: { displayText: 'English 🖊️' }, type: 1 },
            { buttonId: '.shayari hi', buttonText: { displayText: 'Hindi ❤️' }, type: 1 },
            { buttonId: '.shayari ur', buttonText: { displayText: 'Urdu 🌹' }, type: 1 },
            { buttonId: '.shayari sw', buttonText: { displayText: 'Swahili ✨' }, type: 1 }
        ];

        await sock.sendMessage(chatId, { 
            text: shayari,
            buttons: buttons,
            headerType: 1
        }, { quoted: message });
    } catch (error) {
        console.error('Error in shayari command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to fetch shayari. Please try again later.',
        }, { quoted: message });
    }
}

module.exports = { shayariCommand };
