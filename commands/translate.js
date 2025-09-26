const fetch = require('node-fetch');

// 🌍 Full language code map (ISO 639-1)
const supportedLangs = {
    af: "Afrikaans", sq: "Albanian", am: "Amharic", ar: "Arabic", hy: "Armenian",
    az: "Azerbaijani", eu: "Basque", be: "Belarusian", bn: "Bengali", bs: "Bosnian",
    bg: "Bulgarian", ca: "Catalan", ceb: "Cebuano", zh: "Chinese (Simplified)", zh-TW: "Chinese (Traditional)",
    co: "Corsican", hr: "Croatian", cs: "Czech", da: "Danish", nl: "Dutch",
    en: "English", eo: "Esperanto", et: "Estonian", fi: "Finnish", fr: "French",
    fy: "Frisian", gl: "Galician", ka: "Georgian", de: "German", el: "Greek",
    gu: "Gujarati", ht: "Haitian Creole", ha: "Hausa", haw: "Hawaiian", he: "Hebrew",
    hi: "Hindi", hmn: "Hmong", hu: "Hungarian", is: "Icelandic", ig: "Igbo",
    id: "Indonesian", ga: "Irish", it: "Italian", ja: "Japanese", jv: "Javanese",
    kn: "Kannada", kk: "Kazakh", km: "Khmer", rw: "Kinyarwanda", ko: "Korean",
    ku: "Kurdish", ky: "Kyrgyz", lo: "Lao", la: "Latin", lv: "Latvian",
    lt: "Lithuanian", lb: "Luxembourgish", mk: "Macedonian", mg: "Malagasy", ms: "Malay",
    ml: "Malayalam", mt: "Maltese", mi: "Maori", mr: "Marathi", mn: "Mongolian",
    my: "Myanmar (Burmese)", ne: "Nepali", no: "Norwegian", ny: "Nyanja (Chichewa)", or: "Odia (Oriya)",
    ps: "Pashto", fa: "Persian", pl: "Polish", pt: "Portuguese", pa: "Punjabi",
    ro: "Romanian", ru: "Russian", sm: "Samoan", gd: "Scots Gaelic", sr: "Serbian",
    st: "Sesotho", sn: "Shona", sd: "Sindhi", si: "Sinhala", sk: "Slovak",
    sl: "Slovenian", so: "Somali", es: "Spanish", su: "Sundanese", sw: "Swahili",
    sv: "Swedish", tl: "Tagalog (Filipino)", tg: "Tajik", ta: "Tamil", tt: "Tatar",
    te: "Telugu", th: "Thai", tr: "Turkish", tk: "Turkmen", uk: "Ukrainian",
    ur: "Urdu", ug: "Uyghur", uz: "Uzbek", vi: "Vietnamese", cy: "Welsh",
    xh: "Xhosa", yi: "Yiddish", yo: "Yoruba", zu: "Zulu"
};

async function handleTranslateCommand(sock, chatId, message, match) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);

        let textToTranslate = '';
        let lang = '';

        // If reply
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMessage) {
            textToTranslate =
                quotedMessage.conversation ||
                quotedMessage.extendedTextMessage?.text ||
                quotedMessage.imageMessage?.caption ||
                quotedMessage.videoMessage?.caption ||
                '';
            lang = match.trim();
        } else {
            // Direct command
            const args = match.trim().split(' ');
            if (args.length < 2) {
                return sock.sendMessage(chatId, {
                    text: `*TRANSLATOR*\n\nUsage:\n.translate <text> <lang>\n\nExample:\n.translate hello fr\n\nFull list of language codes:\n${Object.entries(supportedLangs).map(([k, v]) => `${k} - ${v}`).join('\n')}`,
                    quoted: message
                });
            }
            lang = args.pop();
            textToTranslate = args.join(' ');
        }

        if (!textToTranslate) {
            return sock.sendMessage(chatId, { text: '❌ No text found to translate.', quoted: message });
        }

        // Validate lang
        if (!supportedLangs[lang]) {
            return sock.sendMessage(chatId, {
                text: `❌ Unsupported language code: ${lang}\n\nSupported codes:\n${Object.entries(supportedLangs).map(([k, v]) => `${k} - ${v}`).join('\n')}`,
                quoted: message
            });
        }

        const openRouterKey = global.OPENNVIDIA_KEY;
        if (!openRouterKey) {
            return sock.sendMessage(chatId, {
                text: '❌ OpenRouter API key is not set (OPENROUTER_KEY).',
                quoted: message
            });
        }

        const translationPrompt = `Translate to ${supportedLangs[lang]} (${lang}). ONLY output the translated text:\n"${textToTranslate}"`;

        let translatedText = null;

        // Try AI translation
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "nvidia/nemotron-nano-9b-v2:free",
                    messages: [
                        { role: "system", content: "You are a translation assistant. Respond with only the translated text." },
                        { role: "user", content: translationPrompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 500
                })
            });

            if (!response.ok) throw new Error(`AI failed with ${response.status}`);
            const data = await response.json();
            translatedText = data.choices?.[0]?.message?.content?.trim();
        } catch (err) {
            console.error('⚠️ AI translation failed:', err);
        }

        // Fallback
        if (!translatedText) {
            const [googleResp, myMemoryResp] = await Promise.allSettled([
                fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`),
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`)
            ]);

            if (googleResp.status === "fulfilled" && googleResp.value.ok) {
                const gData = await googleResp.value.json();
                translatedText = gData?.[0]?.[0]?.[0];
            }

            if (!translatedText && myMemoryResp.status === "fulfilled" && myMemoryResp.value.ok) {
                const mData = await myMemoryResp.value.json();
                translatedText = mData?.responseData?.translatedText;
            }
        }

        if (!translatedText) {
            throw new Error("Translation failed on all methods");
        }

        await sock.sendMessage(chatId, { text: translatedText }, { quoted: message });

    } catch (error) {
        console.error("❌ Translate command error:", error);
        await sock.sendMessage(chatId, {
            text: "❌ Failed to translate. Try again.\n\nUsage: .translate <text> <lang>\nExample: .translate hello es",
            quoted: message
        });
    }
}

module.exports = { handleTranslateCommand };
