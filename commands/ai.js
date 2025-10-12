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

            // Test API key function
            async function testOpenRouterKey(apiKey) {
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json"
                        }
                    });
                    return response.ok;
                } catch (error) {
                    return false;
                }
            }

            // DeepSeek Fallback APIs
            async function deepSeekFallback(query) {
                const fallbackApis = [
                    `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`,
                    `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                    `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`
                ];

                for (const api of fallbackApis) {
                    try {
                        console.log(`Trying DeepSeek fallback: ${api}`);
                        const response = await fetch(api, { timeout: 10000 });
                        const data = await response.json();

                        if (data.message || data.data || data.answer || data.result || data.success) {
                            const answer = data.message || data.data || data.answer || data.result || (data.success && data.result);
                            return answer;
                        }
                    } catch (e) {
                        console.log(`DeepSeek fallback API failed: ${api}`);
                        continue;
                    }
                }
                throw new Error('All fallback APIs failed');
            }

            if (command === '.gpt') {
                // Option 1: OpenRouter OpenAI Models
                if (global.OPENAI_API_KEY) {
                    try {
                        const keyValid = await testOpenRouterKey(global.OPENAI_API_KEY);
                        if (!keyValid) {
                            throw new Error('OpenAI API key is invalid or expired');
                        }

                        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${global.OPENAI_API_KEY}`,
                                "HTTP-Referer": "https://github.com/your-bot",
                                "X-Title": "WhatsApp AI Bot",
                                "Content-Type": "application/json",
                                "User-Agent": "WhatsApp-Bot/1.0"
                            },
                            body: JSON.stringify({
                                "model": "openai/gpt-5-pro", // You can change to other OpenAI models
                                "messages": [{"role": "user", "content": query}],
                                "temperature": 0.7,
                                "max_tokens": 2048
                            })
                        });

                        if (!response.ok) {
                            const errorData = await response.text();
                            if (response.status === 429) {
                                throw new Error('Rate limit exceeded for OpenAI. Please try again in a few minutes.');
                            }
                            throw new Error(`OpenAI API error: ${response.status}`);
                        }

                        const data = await response.json();
                        if (data.choices?.[0]?.message?.content) {
                            return await sock.sendMessage(chatId, {
                                text: data.choices[0].message.content.trim()
                            }, { quoted: message });
                        } else {
                            throw new Error('No content in response from OpenAI');
                        }
                    } catch (openAIError) {
                        console.error('OpenAI API Error:', openAIError);
                        // Continue to fallback
                    }
                }

                // Fallback to original GPT API
                try {
                    const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`);
                    
                    if (response.data && response.data.success && response.data.result) {
                        const answer = response.data.result.prompt;
                        await sock.sendMessage(chatId, {
                            text: answer
                        }, {
                            quoted: message
                        });
                    } else {
                        throw new Error('Invalid response from fallback API');
                    }
                } catch (fallbackError) {
                    throw new Error(`GPT Error: ${fallbackError.message}`);
                }
            } else if (command === '.claude') {
    if (!global.OPENANTHROPIC_KEY) {
        throw new Error('Anthropic API key not configured. Set global.OPENANTHROPIC_KEY');
    }

    const keyValid = await testOpenRouterKey(global.OPENANTHROPIC_KEY);
    if (!keyValid) {
        throw new Error('Anthropic API key is invalid or expired');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${global.OPENANTHROPIC_KEY}`,
            "HTTP-Referer": "https://github.com/your-bot",
            "X-Title": "WhatsApp AI Bot",
            "Content-Type": "application/json",
            "User-Agent": "WhatsApp-Bot/1.0"
        },
        body: JSON.stringify({
            "model": "anthropic/claude-sonnet-4.5",
            "messages": [
                { "role": "system", "content": "You are Claude Sonnet 4.5, a highly advanced AI model. Be clear, concise, and helpful in your responses." },
                { "role": "user", "content": query }
            ],
            "temperature": 0.7,
            "max_tokens": 4096
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 429) {
            throw new Error('Rate limit exceeded for Claude. Please try again in a few minutes.');
        }
        throw new Error(`Claude API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
        await sock.sendMessage(chatId, {
            text: data.choices[0].message.content.trim()
        }, { quoted: message });
    } else {
        throw new Error('Invalid response from Claude Sonnet 4.5');
    }
}
 else if (command === '.deepseek' || command === '.deepseekr1') {
                // Try OpenRouter DeepSeek first
                if (global.OPENDEEPSEEKR1_KEY) {
                    try {
                        const keyValid = await testOpenRouterKey(global.OPENDEEPSEEKR1_KEY);
                        if (!keyValid) {
                            throw new Error('DeepSeek API key is invalid or expired');
                        }

                        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${global.OPENDEEPSEEKR1_KEY}`,
                                "HTTP-Referer": "https://github.com/your-bot",
                                "X-Title": "WhatsApp AI Bot",
                                "Content-Type": "application/json",
                                "User-Agent": "WhatsApp-Bot/1.0"
                            },
                            body: JSON.stringify({
                                "model": "deepseek/deepseek-r1:free",
                                "messages": [{"role": "user", "content": query}],
                                "temperature": 0.7,
                                "max_tokens": 2048
                            })
                        });

                        if (!response.ok) {
                            const errorData = await response.text();
                            if (response.status === 429) {
                                console.log('DeepSeek rate limit hit, using fallback...');
                                // Continue to fallback instead of throwing error
                                throw new Error('RATE_LIMIT');
                            }
                            throw new Error(`DeepSeek API error: ${response.status}`);
                        }

                        const data = await response.json();
                        if (data.choices?.[0]?.message?.content) {
                            return await sock.sendMessage(chatId, {
                                text: data.choices[0].message.content.trim()
                            }, { quoted: message });
                        } else {
                            throw new Error('Invalid response from DeepSeek');
                        }
                    } catch (openRouterError) {
                        if (openRouterError.message !== 'RATE_LIMIT') {
                            console.error('OpenRouter DeepSeek Error:', openRouterError);
                        }
                        // Continue to fallback
                    }
                }

                // DeepSeek Fallback - Use GPT/Gemini APIs as backup
                try {
                    const fallbackResponse = await deepSeekFallback(query);
                    await sock.sendMessage(chatId, {
                        text: `⚠️ DeepSeek rate limit exceeded. Using alternative AI:\n\n${fallbackResponse}`
                    }, { quoted: message });
                } catch (fallbackError) {
                    throw new Error('DeepSeek is currently rate limited. Please try again in a few minutes or use .gpt or .gemini commands instead.');
                }
            } else if (command === '.mistral') {
                if (!global.OPENMISTRAL_KEY) {
                    throw new Error('Mistral API key not configured. Set global.OPENMISTRAL_KEY');
                }

                const keyValid = await testOpenRouterKey(global.OPENMISTRAL_KEY);
                if (!keyValid) {
                    throw new Error('Mistral API key is invalid or expired');
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENMISTRAL_KEY}`,
                        "HTTP-Referer": "https://github.com/your-bot",
                        "X-Title": "WhatsApp AI Bot",
                        "Content-Type": "application/json",
                        "User-Agent": "WhatsApp-Bot/1.0"
                    },
                    body: JSON.stringify({
                        "model": "mistralai/devstral-small-2505:free",
                        "messages": [{"role": "user", "content": query}],
                        "temperature": 0.7,
                        "max_tokens": 2048
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    if (response.status === 429) {
                        throw new Error('Rate limit exceeded for Mistral. Please try again in a few minutes.');
                    }
                    throw new Error(`Mistral API error: ${response.status}`);
                }

                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    await sock.sendMessage(chatId, {
                        text: data.choices[0].message.content.trim()
                    }, { quoted: message });
                } else {
                    throw new Error('Invalid response from Mistral');
                }
            } else if (command === '.metaai') {
                if (!global.OPENMETA_KEY) {
                    throw new Error('Meta AI API key not configured. Set global.OPENMETA_KEY');
                }

                const keyValid = await testOpenRouterKey(global.OPENMETA_KEY);
                if (!keyValid) {
                    throw new Error('Meta AI API key is invalid or expired');
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENMETA_KEY}`,
                        "HTTP-Referer": "https://github.com/your-bot",
                        "X-Title": "WhatsApp AI Bot",
                        "Content-Type": "application/json",
                        "User-Agent": "WhatsApp-Bot/1.0"
                    },
                    body: JSON.stringify({
                        "model": "meta-llama/llama-4-maverick:free",
                        "messages": [{"role": "user", "content": query}],
                        "temperature": 0.7,
                        "max_tokens": 2048
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    if (response.status === 429) {
                        throw new Error('Rate limit exceeded for Meta AI. Please try again in a few minutes.');
                    }
                    throw new Error(`Meta AI API error: ${response.status}`);
                }

                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    await sock.sendMessage(chatId, {
                        text: data.choices[0].message.content.trim()
                    }, { quoted: message });
                } else {
                    throw new Error('Invalid response from Meta AI');
                }
            } else if (command === '.nemotron' || command === '.nvidia') {
                if (!global.OPENNVIDIA_KEY) {
                    throw new Error('NVIDIA API key not configured. Set global.OPENNVIDIA_KEY');
                }

                const keyValid = await testOpenRouterKey(global.OPENNVIDIA_KEY);
                if (!keyValid) {
                    throw new Error('NVIDIA API key is invalid or expired');
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENNVIDIA_KEY}`,
                        "HTTP-Referer": "https://github.com/your-bot",
                        "X-Title": "WhatsApp AI Bot",
                        "Content-Type": "application/json",
                        "User-Agent": "WhatsApp-Bot/1.0"
                    },
                    body: JSON.stringify({
                        "model": "nvidia/nemotron-nano-9b-v2:free",
                        "messages": [{"role": "user", "content": query}],
                        "temperature": 0.7,
                        "max_tokens": 2048
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    if (response.status === 429) {
                        throw new Error('Rate limit exceeded for NVIDIA. Please try again in a few minutes.');
                    }
                    throw new Error(`NVIDIA API error: ${response.status}`);
                }

                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    await sock.sendMessage(chatId, {
                        text: data.choices[0].message.content.trim()
                    }, { quoted: message });
                } else {
                    throw new Error('Invalid response from NVIDIA');
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
