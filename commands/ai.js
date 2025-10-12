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
                // Option 1: OpenRouter GPT
                if (global.OPENGEMINI2_0FLASH_KEY) {
                    try {
                        const keyValid = await testOpenRouterKey(global.OPENGEMINI2_0FLASH_KEY);
                        if (!keyValid) {
                            throw new Error('OpenRouter API key is invalid or expired');
                        }

                        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${global.OPENGEMINI2_0FLASH_KEY}`,
                                "HTTP-Referer": "https://github.com/your-bot",
                                "X-Title": "WhatsApp AI Bot",
                                "Content-Type": "application/json",
                                "User-Agent": "WhatsApp-Bot/1.0"
                            },
                            body: JSON.stringify({
                                "model": "google/gemini-2.0-flash-001",
                                "messages": [{"role": "user", "content": query}],
                                "temperature": 0.7,
                                "max_tokens": 2048
                            })
                        });

                        if (!response.ok) {
                            const errorData = await response.text();
                            if (response.status === 429) {
                                throw new Error('Rate limit exceeded for GPT. Please try again in a few minutes.');
                            }
                            throw new Error(`OpenRouter error: ${response.status}`);
                        }

                        const data = await response.json();
                        if (data.choices?.[0]?.message?.content) {
                            return await sock.sendMessage(chatId, {
                                text: data.choices[0].message.content.trim()
                            }, { quoted: message });
                        } else {
                            throw new Error('No content in response from OpenRouter');
                        }
                    } catch (openRouterError) {
                        console.error('OpenRouter GPT Error:', openRouterError);
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
            } else if (command === '.gemini') {
                // Option 1: OpenRouter Gemini
                if (global.OPENGEMINI1_5FLASH_KEY) {
                    try {
                        const keyValid = await testOpenRouterKey(global.OPENGEMINI1_5FLASH_KEY);
                        if (!keyValid) {
                            throw new Error('OpenRouter API key is invalid or expired');
                        }

                        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${global.OPENGEMINI1_5FLASH_KEY}`,
                                "HTTP-Referer": "https://github.com/your-bot",
                                "X-Title": "WhatsApp AI Bot",
                                "Content-Type": "application/json",
                                "User-Agent": "WhatsApp-Bot/1.0"
                            },
                            body: JSON.stringify({
                                "model": "google/gemini-flash-1.5",
                                "messages": [{"role": "user", "content": query}],
                                "temperature": 0.7,
                                "max_tokens": 2048
                            })
                        });

                        if (!response.ok) {
                            const errorData = await response.text();
                            if (response.status === 429) {
                                throw new Error('Rate limit exceeded for Gemini. Please try again in a few minutes.');
                            }
                            throw new Error(`OpenRouter error: ${response.status}`);
                        }

                        const data = await response.json();
                        if (data.choices?.[0]?.message?.content) {
                            return await sock.sendMessage(chatId, {
                                text: data.choices[0].message.content.trim()
                            }, { quoted: message });
                        } else {
                            throw new Error('No content in response from OpenRouter');
                        }
                    } catch (openRouterError) {
                        console.error('OpenRouter Gemini Error:', openRouterError);
                        // Continue to fallback
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

                let fallbackSuccess = false;
                for (const api of apis) {
                    try {
                        const response = await fetch(api, { timeout: 10000 });
                        const data = await response.json();

                        if (data.message || data.data || data.answer || data.result) {
                            const answer = data.message || data.data || data.answer || data.result;
                            await sock.sendMessage(chatId, {
                                text: answer
                            }, {
                                quoted: message
                            });
                            fallbackSuccess = true;
                            break;
                        }
                    } catch (e) {
                        console.log(`Fallback API failed: ${api}`);
                        continue;
                    }
                }
                
                if (!fallbackSuccess) {
                    throw new Error('All Gemini APIs failed. Please try again later.');
                }
            } else if (command === '.deepseek' || command === '.deepseekr1') {
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
