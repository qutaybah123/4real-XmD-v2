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

            // Grok with Reasoning Function
            async function grokWithReasoning(query, followUpQuestion = null) {
                if (!global.OPENROUTER_API_KEY) {
                    throw new Error('OpenRouter API key not configured. Set global.OPENROUTER_API_KEY');
                }

                const keyValid = await testOpenRouterKey(global.OPENROUTER_API_KEY);
                if (!keyValid) {
                    throw new Error('OpenRouter API key is invalid or expired');
                }

                // First API call with reasoning
                let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "x-ai/grok-4.1-fast:free",
                        "messages": [
                            {
                                "role": "user",
                                "content": query
                            }
                        ],
                        "reasoning": {"enabled": true}
                    })
                });

                if (!response.ok) {
                    throw new Error(`Grok API error: ${response.status}`);
                }

                // Extract the assistant message with reasoning_details
                const result = await response.json();
                const assistantMessage = result.choices[0].message;

                // If no follow-up question, return the first response
                if (!followUpQuestion) {
                    return {
                        content: assistantMessage.content,
                        reasoning_details: assistantMessage.reasoning_details
                    };
                }

                // Preserve the assistant message with reasoning_details for follow-up
                const messages = [
                    {
                        role: 'user',
                        content: query,
                    },
                    {
                        role: 'assistant',
                        content: assistantMessage.content,
                        reasoning_details: assistantMessage.reasoning_details,
                    },
                    {
                        role: 'user',
                        content: followUpQuestion,
                    },
                ];

                // Second API call - model continues reasoning from where it left off
                const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${global.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "model": "x-ai/grok-4.1-fast:free",
                        "messages": messages  // Includes preserved reasoning_details
                    })
                });

                if (!response2.ok) {
                    throw new Error(`Grok follow-up API error: ${response2.status}`);
                }

                const result2 = await response2.json();
                return {
                    content: result2.choices[0].message.content,
                    reasoning_details: result2.choices[0].message.reasoning_details
                };
            }

            if (command === '.grok') {
                // Use Grok with reasoning
                const grokResponse = await grokWithReasoning(query);
                
                let responseText = `🤖 *Grok Response*:\n\n${grokResponse.content}\n\n`;
                
                if (grokResponse.reasoning_details) {
                    responseText += `🧠 *Reasoning Available*: Yes\n`;
                }
                
                responseText += `\n💡 *Tip*: Use .grokfollow [question] for follow-up questions with continued reasoning`;
                
                await sock.sendMessage(chatId, {
                    text: responseText
                }, { quoted: message });
                
            } else if (command === '.grokfollow') {
                // Handle follow-up questions with continued reasoning
                const followUpResponse = await grokWithReasoning(
                    "Previous context not stored in this implementation", 
                    query
                );
                
                await sock.sendMessage(chatId, {
                    text: `🤖 *Grok Follow-up*:\n\n${followUpResponse.content}`
                }, { quoted: message });
                
            } else if (command === '.gpt') {
                // OpenRouter OpenAI Models
                if (!global.OPENAI_API_KEY) {
                    throw new Error('OpenAI API key not configured. Set global.OPENAI_API_KEY');
                }

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
                        "model": "openai/gpt-5.1-codex",
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
                    await sock.sendMessage(chatId, {
                        text: data.choices[0].message.content.trim()
                    }, { quoted: message });
                } else {
                    throw new Error('No content in response from OpenAI');
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
                        "model": "anthropic/claude-opus-4",
                        "messages": [
                            { "role": "system", "content": "You are Claude opus-4, a highly advanced AI model. Be clear, concise, and helpful in your responses." },
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
                    throw new Error('Invalid response from Claude Opus 4');
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
                        "model": "mistralai/mistral-7b-instruct:free",
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
                        "model": "meta-llama/llama-3.3-70b-instruct:free",
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
                    text: "❌ Unknown AI command. Available commands: .gpt, .claude, .mistral, .metaai, .nemotron, .grok, .grokfollow"
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
