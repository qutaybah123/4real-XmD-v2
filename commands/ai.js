const axios = require('axios');
const fetch = require('node-fetch');

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after the AI command\n\nExample: .katcoder write a basic html code"
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
                text: "Please provide a question after the AI command"
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

            // Generic AI Model Function with separate API keys
            async function callAIModel(modelName, apiKey, query, systemPrompt = null) {
                if (!apiKey) {
                    throw new Error(`${modelName} API key not configured.`);
                }

                const keyValid = await testOpenRouterKey(apiKey);
                if (!keyValid) {
                    throw new Error(`${modelName} API key is invalid or expired`);
                }

                const messages = [];
                
                // Add system prompt if provided
                if (systemPrompt) {
                    messages.push({
                        "role": "system",
                        "content": systemPrompt
                    });
                }
                
                // Add user query
                messages.push({
                    "role": "user",
                    "content": query
                });

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "https://github.com/your-bot",
                        "X-Title": "WhatsApp AI Bot",
                        "Content-Type": "application/json",
                        "User-Agent": "WhatsApp-Bot/1.0"
                    },
                    body: JSON.stringify({
                        "model": modelName,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 2048
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    if (response.status === 429) {
                        throw new Error(`Rate limit exceeded for ${modelName}. Please try again in a few minutes.`);
                    }
                    throw new Error(`${modelName} API error: ${response.status}`);
                }

                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    return data.choices[0].message.content.trim();
                } else {
                    throw new Error(`No content in response from ${modelName}`);
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
                
            } else if (command === '.katcoder' || command === '.kat') {
                // Kwaipilot Kat Coder Pro - Coding specialist
                if (!global.OPENKATCODER_KEY) {
                    throw new Error('Kat Coder API key not configured. Set global.OPENKATCODER_KEY');
                }

                const response = await callAIModel(
                    "kwaipilot/kat-coder-pro:free", 
                    global.OPENKATCODER_KEY,
                    query,
                    "You are Kat Coder Pro, an expert programming assistant. Provide clean, efficient code solutions with explanations."
                );
                
                await sock.sendMessage(chatId, {
                    text: `💻 *Kat Coder Pro*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.longcat' || command === '.long') {
                // Meituan Longcat Flash Chat - Fast general AI
                if (!global.OPENLONGCAT_KEY) {
                    throw new Error('Longcat API key not configured. Set global.OPENLONGCAT_KEY');
                }

                const response = await callAIModel(
                    "meituan/longcat-flash-chat:free", 
                    global.OPENLONGCAT_KEY,
                    query,
                    "You are Longcat Flash Chat, a fast and efficient AI assistant. Provide quick, helpful responses."
                );
                
                await sock.sendMessage(chatId, {
                    text: `🐱 *Longcat Flash Chat*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.glm' || command === '.glm45') {
                // Z-AI GLM 4.5 Air - General language model
                if (!global.OPENGLM_KEY) {
                    throw new Error('GLM API key not configured. Set global.OPENGLM_KEY');
                }

                const response = await callAIModel(
                    "z-ai/glm-4.5-air:free", 
                    global.OPENGLM_KEY,
                    query,
                    "You are GLM 4.5 Air, a versatile AI assistant. Provide comprehensive and helpful responses."
                );
                
                await sock.sendMessage(chatId, {
                    text: `🌀 *GLM 4.5 Air*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.qwen' || command === '.qwencoder') {
                // Qwen Coder - Coding specialist
                if (!global.OPENQWEN_KEY) {
                    throw new Error('Qwen API key not configured. Set global.OPENQWEN_KEY');
                }

                const response = await callAIModel(
                    "qwen/qwen3-coder:free", 
                    global.OPENQWEN_KEY,
                    query,
                    "You are Qwen Coder, an expert programming assistant. Write clean, efficient code with best practices."
                );
                
                await sock.sendMessage(chatId, {
                    text: `🔧 *Qwen Coder*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.kimi' || command === '.kimi2') {
                // Moonshot Kimi K2 - General AI
                if (!global.OPENKIMI_KEY) {
                    throw new Error('Kimi API key not configured. Set global.OPENKIMI_KEY');
                }

                const response = await callAIModel(
                    "moonshotai/kimi-k2:free", 
                    global.OPENKIMI_KEY,
                    query,
                    "You are Kimi K2, a helpful AI assistant. Provide clear and accurate responses."
                );
                
                await sock.sendMessage(chatId, {
                    text: `🌙 *Kimi K2*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.hermes' || command === '.hermes405') {
                // NousResearch Hermes 3 - Large model
                if (!global.OPENHERMES_KEY) {
                    throw new Error('Hermes API key not configured. Set global.OPENHERMES_KEY');
                }

                const response = await callAIModel(
                    "nousresearch/hermes-3-llama-3.1-405b:free", 
                    global.OPENHERMES_KEY,
                    query,
                    "You are Hermes 3, a highly advanced AI model with 405B parameters. Provide detailed, comprehensive responses."
                );
                
                await sock.sendMessage(chatId, {
                    text: `⚡ *Hermes 3 (405B)*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.mistral') {
                // Mistral
                if (!global.OPENMISTRAL_KEY) {
                    throw new Error('Mistral API key not configured. Set global.OPENMISTRAL_KEY');
                }

                const response = await callAIModel(
                    "mistralai/mistral-7b-instruct:free", 
                    global.OPENMISTRAL_KEY,
                    query,
                    "You are Mistral 7B, an efficient AI assistant. Provide helpful responses."
                );
                
                await sock.sendMessage(chatId, {
                    text: `🌪️ *Mistral 7B*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.metaai') {
                // Meta AI
                if (!global.OPENMETA_KEY) {
                    throw new Error('Meta AI API key not configured. Set global.OPENMETA_KEY');
                }

                const response = await callAIModel(
                    "meta-llama/llama-3.3-70b-instruct:free", 
                    global.OPENMETA_KEY,
                    query,
                    "You are Meta Llama 3.3, a powerful AI assistant. Provide helpful and accurate responses."
                );
                
                await sock.sendMessage(chatId, {
                    text: `🦙 *Meta Llama 3.3*:\n\n${response}`
                }, { quoted: message });
                
            } else if (command === '.nemotron' || command === '.nvidia') {
                // NVIDIA
                if (!global.OPENNVIDIA_KEY) {
                    throw new Error('NVIDIA API key not configured. Set global.OPENNVIDIA_KEY');
                }

                const response = await callAIModel(
                    "nvidia/nemotron-nano-9b-v2:free", 
                    global.OPENNVIDIA_KEY,
                    query,
                    "You are NVIDIA Nemotron, an AI assistant. Provide helpful responses."
                );
                
                await sock.sendMessage(chatId, {
                    text: `🎮 *NVIDIA Nemotron*:\n\n${response}`
                }, { quoted: message });
                
            } else {
                return await sock.sendMessage(chatId, {
                    text: `❌ Unknown AI command. Available commands:\n\n` +
                          `• .grok - Grok 4.1 Fast with reasoning\n` +
                          `• .grokfollow - Follow-up questions\n` +
                          `• .katcoder/.kat - Kat Coder Pro (coding)\n` +
                          `• .longcat/.long - Longcat Flash Chat\n` +
                          `• .glm/.glm45 - GLM 4.5 Air\n` +
                          `• .qwen/.qwencoder - Qwen Coder\n` +
                          `• .kimi/.kimi2 - Kimi K2\n` +
                          `• .hermes/.hermes405 - Hermes 3 (405B)\n` +
                          `• .mistral - Mistral 7B\n` +
                          `• .metaai - Meta Llama 3.3\n` +
                          `• .nemotron/.nvidia - NVIDIA Nemotron`
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
