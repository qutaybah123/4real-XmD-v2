const axios = require('axios');
const fetch = require('node-fetch');

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after .gpt or .gemini\n\nExample: .gpt write a basic html code"
            }, {
                quoted: message
            });
        }

        // Get the command and query
        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after .gpt or .gemini"
            }, {quoted:message});
        }

        try {
            // Show processing message
            await sock.sendMessage(chatId, {
                react: { text: '🤖', key: message.key }
            });

            if (command === '.gpt') {
                // Option 1: OpenRouter GPT
                if (global.OPENGEMINI2_0FLASH_KEY) {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${global.OPENGEMINI2_0FLASH_KEY}`,
                            "HTTP-Referer": "https://your-bot-domain.com",
                            "X-Title": "GPT AI Bot",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": "google/gemini-2.0-flash-001",
                            "messages": [{"role": "user", "content": query}],
                            "temperature": 0.7,
                            "max_tokens": 1024
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices?.[0]?.message?.content) {
                            return await sock.sendMessage(chatId, {
                                text: data.choices[0].message.content.trim()
                            }, { quoted: message });
                        }
                    }
                }

                // Fallback to original GPT API
                const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`);
                
                if (response.data && response.data.success && response.data.result) {
                    const answer = response.data.result.prompt;
                    await sock.sendMessage(chatId, {
                        text: answer
                    }, {
                        quoted: message
                    });
                } else {
                    throw new Error('Invalid response from API');
                }
            } else if (command === '.gemini') {
                // Option 1: OpenRouter Gemini
                if (global.OPENGEMINI1_5FLASH_KEY) {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${global.OPENGEMINI1_5FLASH_KEY}`,
                            "HTTP-Referer": "https://your-bot-domain.com",
                            "X-Title": "Gemini AI Bot",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": "google/gemini-flash-1.5",
                            "messages": [{"role": "user", "content": query}],
                            "temperature": 0.7,
                            "max_tokens": 1024
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices?.[0]?.message?.content) {
                            return await sock.sendMessage(chatId, {
                                text: data.choices[0].message.content.trim()
                            }, { quoted: message });
                        }
                    }
                }

                // Fallback to original Gemini APIs
                const apis = [
                    `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                    `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                    `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                    `https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                    `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
                ];

                for (const api of apis) {
                    try {
                        const response = await fetch(api);
                        const data = await response.json();

                        if (data.message || data.data || data.answer || data.result) {
                            const answer = data.message || data.data || data.answer || data.result;
                            await sock.sendMessage(chatId, {
                                text: answer
                            }, {
                                quoted: message
                            });
                            return;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                throw new Error('All Gemini APIs failed');
            } else if (command === '.deepseek' || command === '.deepseekr1') {
                if (!global.OPENDEEPSEEKR1_KEY) {
                    throw new Error('DeepSeek API key not configured');
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENDEEPSEEKR1_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "deepseek/deepseek-r1:free",
                        "messages": [{"role": "user", "content": query}],
                        "temperature": 0.7,
                        "max_tokens": 1024
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices?.[0]?.message?.content) {
                        await sock.sendMessage(chatId, {
                            text: data.choices[0].message.content.trim()
                        }, { quoted: message });
                    } else {
                        throw new Error('Invalid response from DeepSeek');
                    }
                } else {
                    throw new Error(`DeepSeek API error: ${response.status}`);
                }
            } else if (command === '.mistral') {
                if (!global.OPENMISTRAL_KEY) {
                    throw new Error('Mistral API key not configured');
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENMISTRAL_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "mistralai/devstral-small-2505:free",
                        "messages": [{"role": "user", "content": query}],
                        "temperature": 0.7,
                        "max_tokens": 1024
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices?.[0]?.message?.content) {
                        await sock.sendMessage(chatId, {
                            text: data.choices[0].message.content.trim()
                        }, { quoted: message });
                    } else {
                        throw new Error('Invalid response from Mistral');
                    }
                } else {
                    throw new Error(`Mistral API error: ${response.status}`);
                }
            } else if (command === '.metaai') {
                if (!global.OPENMETA_KEY) {
                    throw new Error('Meta AI API key not configured');
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENMETA_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "meta-llama/llama-4-maverick:free",
                        "messages": [{"role": "user", "content": query}],
                        "temperature": 0.7,
                        "max_tokens": 1024
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices?.[0]?.message?.content) {
                        await sock.sendMessage(chatId, {
                            text: data.choices[0].message.content.trim()
                        }, { quoted: message });
                    } else {
                        throw new Error('Invalid response from Meta AI');
                    }
                } else {
                    throw new Error(`Meta AI API error: ${response.status}`);
                }
            } else if (command === '.nemotron' || command === '.nvidia') {
                if (!global.OPENNVIDIA_KEY) {
                    throw new Error('NVIDIA API key not configured');
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENNVIDIA_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "nvidia/nemotron-nano-9b-v2:free",
                        "messages": [{"role": "user", "content": query}],
                        "temperature": 0.7,
                        "max_tokens": 1024
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices?.[0]?.message?.content) {
                        await sock.sendMessage(chatId, {
                            text: data.choices[0].message.content.trim()
                        }, { quoted: message });
                    } else {
                        throw new Error('Invalid response from NVIDIA');
                    }
                } else {
                    throw new Error(`NVIDIA API error: ${response.status}`);
                }
            } else {
                return await sock.sendMessage(chatId, {
                    text: "❌ Unknown AI command. Available commands: .gpt, .gemini, .deepseek, .mistral, .metaai, .nemotron"
                }, { quoted: message });
            }
        } catch (error) {
            console.error('API Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ ${error.message || "Failed to get response. Please try again later."}`,
            }, {
                quoted: message
            });
        }
    } catch (error) {
        console.error('AI Command Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, {
            quoted: message
        });
    }
}

module.exports = aiCommand;
