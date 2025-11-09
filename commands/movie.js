const axios = require('axios');

async function movieCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const movieName = args.slice(1).join(" ");

        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🎬', key: message.key }
        });

        if (!movieName) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Please provide a movie name.*\n\n📌 *Usage:* .movie <movie-name>\n*Example:* .movie Iron Man\n*Example:* .movie The Dark Knight\n*Example:* .movie Avatar"
            }, { quoted: message });
        }

        try {
            const apiUrl = `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(movieName)}`;
            const response = await axios.get(apiUrl, { timeout: 15000 });

            if (!response.data.status || !response.data.movie) {
                return await sock.sendMessage(chatId, {
                    text: `❌ *Movie not found:* \"${movieName}\"\n\nPlease check the spelling and try again.\n*Examples:*\n• .movie Avengers\n• .movie Titanic\n• .movie Inception`
                }, { quoted: message });
            }

            const movie = response.data.movie;
            
            // Get Rotten Tomatoes rating
            const rottenTomatoes = movie.ratings?.find(r => r.source === 'Rotten Tomatoes')?.value || 'N/A';
            
            // Format the movie information
            const movieInfo = 
`🎬 *${movie.title}* (${movie.year}) ${movie.rated ? `- ${movie.rated}` : ''}

⭐ *IMDb Rating:* ${movie.imdbRating || 'N/A'}
🍅 *Rotten Tomatoes:* ${rottenTomatoes}
💰 *Box Office:* ${movie.boxoffice || 'N/A'}

📅 *Released:* ${movie.released ? new Date(movie.released).toLocaleDateString() : 'N/A'}
⏳ *Runtime:* ${movie.runtime || 'N/A'}
🎭 *Genre:* ${movie.genres || 'N/A'}

📝 *Plot:*
${movie.plot || 'No plot available'}

🎥 *Director:* ${movie.director || 'N/A'}
✍️ *Writer:* ${movie.writer || 'N/A'}
🌟 *Cast:* ${movie.actors || 'N/A'}

🌍 *Country:* ${movie.country || 'N/A'}
🗣️ *Language:* ${movie.languages || 'N/A'}
🏆 *Awards:* ${movie.awards || 'None'}

🔗 *IMDb URL:* ${movie.imdbUrl || 'N/A'}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟɪɢᴀɴɢ ᴛᴇᴄʜs*`;

            // Use fallback image if poster is not available
            const posterUrl = movie.poster && movie.poster !== 'N/A' 
                ? movie.poster 
                : 'https://files.catbox.moe/jzjli6.jpeg';

            // Send movie information with poster
            await sock.sendMessage(chatId, {
                image: { url: posterUrl },
                caption: movieInfo
            }, { quoted: message });

        } catch (error) {
            console.error("Movie API Error:", error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: "⏳ *Request timeout.* Please try again with a different movie name."
                }, { quoted: message });
            } else if (error.response?.status === 404) {
                await sock.sendMessage(chatId, {
                    text: `❌ *Movie not found:* \"${movieName}\"\n\nTry these popular movies:\n• .movie Avengers\n• .movie Titanic\n• .movie The Godfather\n• .movie Spider-Man\n• .movie Jurassic Park`
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error searching for movie:* ${error.message}\n\nTry: .movie Avengers`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Movie Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        }, { quoted: message });
    }
}

module.exports = movieCommand;
