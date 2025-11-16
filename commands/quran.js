const axios = require("axios");
const settings = require("../settings");

async function quranCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const args = text ? text.trim().split(/\s+/) : [];
        const surahInput = args[1];

        await sock.sendMessage(chatId, {
            react: { text: '🕋', key: message.key }
        });

        if (!surahInput) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Please specify the surah number or name.*\n\n*Examples:*
.quran 1          - Surah Al-Fatihah
.quran yasin      - Surah Yasin
.quran al-baqarah - Surah Al-Baqarah
.quran 36         - Surah Ya-Sin

*Use .quran list to see all surahs*`
            }, { quoted: message });
        }

        // Handle list command
        if (surahInput.toLowerCase() === 'list') {
            return await sendSurahList(sock, chatId, message);
        }

        try {
            // Using Al-Quran Cloud API as alternative
            const surahNumber = await getSurahNumber(surahInput);
            
            if (!surahNumber) {
                return await sock.sendMessage(chatId, {
                    text: `❌ *Surah not found.*\n\nCouldn't find surah with number or name "${surahInput}"\n\nUse *.quran list* to see all available surahs.`
                }, { quoted: message });
            }

            // Fetch surah data from Al-Quran Cloud API
            const surahRes = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}`, { timeout: 15000 });
            const surahData = surahRes.data;

            if (surahData.code !== 200 || !surahData.data) {
                throw new Error("Failed to fetch surah details");
            }

            const surah = surahData.data;

            const quranMessage = 
`🕋 *THE HOLY QURAN*

*Surah ${surah.number}: ${surah.englishName}*
*${surah.englishNameTranslation} (${surah.name})*

📖 *Type:* ${surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
🔢 *Verses:* ${surah.numberOfAyahs}
${surah.pages ? `📚 *Pages:* ${Array.isArray(surah.pages) ? surah.pages.join('-') : surah.pages}` : ''}

💫 *Description:*
${surah.englishNameTranslation} - ${surah.revelationType === 'Meccan' ? 'Revealed in Mecca' : 'Revealed in Medina'}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

            // Send the surah information
            await sock.sendMessage(chatId, {
                text: quranMessage
            }, { quoted: message });

            // Send FULL surah audio recitation
            await sendFullSurahAudio(sock, chatId, surah.number, surah.englishName, surah.numberOfAyahs);

            // Fetch verses with translation
            const versesRes = await axios.get(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,en.asad`, { timeout: 15000 });
            const versesData = versesRes.data;
            
            if (versesData.code === 200 && versesData.data && versesData.data.length >= 2) {
                let versesMessage = `📖 *First 3 Verses of Surah ${surah.englishName}:*\n\n`;
                
                const arabicVerses = versesData.data[0].ayahs;
                const englishVerses = versesData.data[1].ayahs;
                
                for (let i = 0; i < Math.min(3, arabicVerses.length); i++) {
                    const arabic = arabicVerses[i].text;
                    const english = englishVerses[i]?.text || 'Translation not available';
                    
                    versesMessage += `*${arabicVerses[i].numberInSurah}.* ${arabic}\n`;
                    versesMessage += `   _${english}_\n\n`;
                }
                
                await sock.sendMessage(chatId, {
                    text: versesMessage
                });
            }

        } catch (error) {
            console.error("Quran API Error:", error);
            
            if (error.response) {
                await sock.sendMessage(chatId, {
                    text: `❌ *API Error (${error.response.status})*\n\nUnable to fetch Quran data at the moment. Please try again later.`
                }, { quoted: message });
            } else if (error.request) {
                await sock.sendMessage(chatId, {
                    text: "❌ *Network Error*\n\nUnable to connect to the Quran service. Please check your connection."
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Error:* ${error.message}`
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Quran Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: message });
    }
}

// Function to send FULL surah audio recitation
async function sendFullSurahAudio(sock, chatId, surahNumber, surahName, numberOfAyahs) {
    try {
        // Multiple audio sources for full surah recitations
        const audioSources = [
            {
                name: "Mishary Rashid Alafasy",
                url: `https://download.quranicaudio.com/quran/mishari_al_afasy/${surahNumber.toString().padStart(3, '0')}.mp3`
            },
            {
                name: "Abdul Rahman Al-Sudais",
                url: `https://download.quranicaudio.com/quran/abdulrahman_al_sudais/${surahNumber.toString().padStart(3, '0')}.mp3`
            },
            {
                name: "Saad al-Ghamdi",
                url: `https://download.quranicaudio.com/quran/saad_al_ghamdi/${surahNumber.toString().padStart(3, '0')}.mp3`
            },
            {
                name: "Abdul Basit Abdul Samad",
                url: `https://download.quranicaudio.com/quran/abdulbaset_mujawwad/${surahNumber.toString().padStart(3, '0')}.mp3`
            }
        ];

        // Try each audio source until one works
        for (const source of audioSources) {
            try {
                const audioMessage = 
`🎧 *FULL SURAH RECITATION*

*Surah:* ${surahName}
*Reciter:* ${source.name}
*Verses:* ${numberOfAyahs} verses
*Duration:* Full surah recitation

📥 *Downloading audio...*`;

                await sock.sendMessage(chatId, {
                    text: audioMessage
                });

                // Send the full surah audio
                await sock.sendMessage(chatId, {
                    audio: { url: source.url },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `surah_${surahName.replace(/\s+/g, '_')}_${source.name.replace(/\s+/g, '_')}.mp3`,
                });

                console.log(`Successfully sent audio from: ${source.name}`);
                return; // Exit if successful

            } catch (sourceError) {
                console.log(`Audio source failed (${source.name}):`, sourceError.message);
                continue; // Try next source
            }
        }

        // If all sources fail, try alternative API
        await tryAlternativeAudio(sock, chatId, surahNumber, surahName, numberOfAyahs);

    } catch (audioError) {
        console.error("All Audio Sources Failed:", audioError);
        await sock.sendMessage(chatId, {
            text: `🔇 *Audio Unavailable*\n\nFull audio recitation for Surah ${surahName} is currently not available. Please try another surah.`
        });
    }
}

// Alternative audio source using different API
async function tryAlternativeAudio(sock, chatId, surahNumber, surahName, numberOfAyahs) {
    try {
        // Alternative: Use Quran.com API
        const alternativeUrl = `https://quran.com/api/api/v3/chapter_recitations/7/${surahNumber}`;
        
        const response = await axios.get(alternativeUrl, { timeout: 10000 });
        
        if (response.data && response.data.audio_file) {
            const audioUrl = response.data.audio_file.audio_url;
            
            const audioMessage = 
`🎧 *FULL SURAH RECITATION*

*Surah:* ${surahName}
*Reciter:* Alafasy (Alternative Source)
*Verses:* ${numberOfAyahs} verses
*Duration:* Full surah recitation`;

            await sock.sendMessage(chatId, {
                text: audioMessage
            });

            await sock.sendMessage(chatId, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `surah_${surahName.replace(/\s+/g, '_')}.mp3`,
            });
            
            return true;
        }
    } catch (altError) {
        console.error("Alternative audio also failed:", altError);
        return false;
    }
}

// Helper function to get surah number from input
async function getSurahNumber(input) {
    const surahMap = {
        // Complete mapping of all 114 surahs
        'fatihah': 1, 'fatiha': 1, 'opening': 1, 'alfatiha': 1, 'alfatihah': 1,
        'baqarah': 2, 'baqara': 2, 'cow': 2, 'albaqarah': 2, 'albaqara': 2,
        'imran': 3, 'ali': 3, 'alimran': 3, 'familyofimran': 3,
        'nisa': 4, 'women': 4, 'annisaa': 4, 'annisa': 4,
        'maidah': 5, 'table': 5, 'almaidah': 5,
        'anam': 6, 'cattle': 6, 'alanam': 6,
        'araf': 7, 'heights': 7, 'alaraf': 7,
        'anfal': 8, 'spoils': 8, 'alanfal': 8,
        'taubah': 9, 'repentance': 9, 'attaubah': 9,
        'yunus': 10, 'jonah': 10, 'alyunus': 10,
        'hud': 11, 'alhud': 11,
        'yusuf': 12, 'joseph': 12, 'alyusuf': 12,
        'rad': 13, 'thunder': 13, 'arrad': 13, 'alrad': 13,
        'ibrahim': 14, 'abraham': 14,
        'hijr': 15, 'alhijr': 15,
        'nahl': 16, 'bee': 16, 'annahl': 16,
        'isra': 17, 'night': 17, 'alisra': 17,
        'kahf': 18, 'cave': 18, 'alkahf': 18,
        'mariam': 19, 'mary': 19,
        'taha': 20, 'ta-ha': 20,
        'anbiya': 21, 'prophets': 21, 'alanbiya': 21,
        'hajj': 22, 'pilgrimage': 22, 'alhajj': 22,
        'muminun': 23, 'believers': 23, 'almuminun': 23,
        'nur': 24, 'light': 24, 'annur': 24,
        'furqan': 25, 'criterion': 25, 'alfurqan': 25,
        'shuara': 26, 'poets': 26, 'ashshuara': 26,
        'naml': 27, 'ant': 27, 'annaml': 27,
        'qasas': 28, 'stories': 28, 'alqasas': 28,
        'ankabut': 29, 'spider': 29, 'alankabut': 29,
        'rum': 30, 'romans': 30, 'arroom': 30,
        'luqman': 31,
        'sajdah': 32, 'prostration': 32, 'assajdah': 32,
        'ahzab': 33, 'confederates': 33, 'alahzab': 33,
        'saba': 34, 'sheba': 34,
        'fatir': 35, 'originator': 35,
        'yasin': 36, 'ya-sin': 36, 'sin': 36,
        'saffat': 37, 'ranks': 37, 'assaffat': 37,
        'sad': 38,
        'zumar': 39, 'troops': 39, 'azzumar': 39,
        'ghafir': 40, 'forgiver': 40, 'alghafir': 40,
        'fussilat': 41, 'explained': 41,
        'shura': 42, 'consultation': 42, 'ashshura': 42,
        'zukhruf': 43, 'ornaments': 43, 'azzukhruf': 43,
        'dukhan': 44, 'smoke': 44, 'addukhan': 44,
        'jathiya': 45, 'kneeling': 45, 'aljathiya': 45,
        'ahqaf': 46, 'wind': 46, 'alahqaf': 46,
        'muhammad': 47,
        'fath': 48, 'victory': 48, 'alfath': 48,
        'hujurat': 49, 'rooms': 49, 'alhujurat': 49,
        'qaf': 50,
        'dhariyat': 51, 'scatterers': 51, 'adhariyat': 51,
        'tur': 52, 'mount': 52, 'attur': 52,
        'najm': 53, 'star': 53, 'annajm': 53,
        'qamar': 54, 'moon': 54, 'alqamar': 54,
        'rahman': 55, 'merciful': 55, 'arrahman': 55,
        'waqiah': 56, 'event': 56, 'alwaqiah': 56,
        'hadid': 57, 'iron': 57, 'alhadid': 57,
        'mujadila': 58, 'pleading': 58, 'almujadila': 58,
        'hashr': 59, 'exile': 59, 'alhashr': 59,
        'mumtahina': 60, 'examined': 60, 'almumtahina': 60,
        'saff': 61, 'ranks': 61, 'assaff': 61,
        'jumua': 62, 'congregation': 62, 'aljumua': 62,
        'munafiqun': 63, 'hypocrites': 63, 'almunafiqun': 63,
        'taghabun': 64, 'dispossession': 64, 'attaghabun': 64,
        'talaq': 65, 'divorce': 65, 'attalaq': 65,
        'tahrim': 66, 'prohibition': 66, 'attahrim': 66,
        'mulk': 67, 'kingdom': 67, 'almulk': 67,
        'qalam': 68, 'pen': 68, 'alqalam': 68,
        'haqqah': 69, 'reality': 69, 'alhaqqah': 69,
        'maarij': 70, 'ascending': 70, 'almaarij': 70,
        'nuh': 71, 'noah': 71,
        'jinn': 72, 'aljinn': 72,
        'muzzammil': 73, 'enwrapped': 73, 'almuzzammil': 73,
        'muddathir': 74, 'cloaked': 74, 'almuddathir': 74,
        'qiyamah': 75, 'resurrection': 75, 'alqiyamah': 75,
        'insan': 76, 'man': 76, 'alinsan': 76,
        'mursalat': 77, 'emissaries': 77, 'almursalat': 77,
        'naba': 78, 'tidings': 78, 'annaba': 78,
        'naziat': 79, 'pluckers': 79, 'annaziat': 79,
        'abasa': 80, 'frowned': 80,
        'takwir': 81, 'folded': 81, 'attakwir': 81,
        'infitar': 82, 'cleft': 82, 'alinfitar': 82,
        'mutaffifin': 83, 'defrauding': 83, 'almutaffifin': 83,
        'inshiqaq': 84, 'sundered': 84, 'alinshiqaq': 84,
        'buruj': 85, 'mansions': 85, 'alburuj': 85,
        'tariq': 86, 'nightcomer': 86, 'attariq': 86,
        'ala': 87, 'most high': 87, 'alaa': 87,
        'ghashiyah': 88, 'overwhelming': 88, 'alghashiyah': 88,
        'fajr': 89, 'dawn': 89, 'alfajr': 89,
        'balad': 90, 'city': 90, 'albalad': 90,
        'shams': 91, 'sun': 91, 'ashshams': 91,
        'lail': 92, 'night': 92, 'allail': 92,
        'duha': 93, 'morning': 93, 'adduha': 93,
        'sharh': 94, 'relief': 94, 'asharh': 94,
        'tin': 95, 'fig': 95, 'attin': 95,
        'alaq': 96, 'clot': 96, 'alalaq': 96,
        'qadr': 97, 'power': 97, 'alqadr': 97,
        'bayyinah': 98, 'clear': 98, 'albayyinah': 98,
        'zalzalah': 99, 'earthquake': 99, 'azzalzalah': 99,
        'adiyat': 100, 'coursers': 100, 'aladiyat': 100,
        'qariah': 101, 'calamity': 101, 'alqariah': 101,
        'takathur': 102, 'rivalry': 102, 'attakathur': 102,
        'asr': 103, 'time': 103, 'alasr': 103,
        'humazah': 104, 'slanderer': 104, 'alhumazah': 104,
        'fil': 105, 'elephant': 105, 'alfil': 105,
        'quraish': 106, 'quraysh': 106, 'alquraish': 106,
        'maun': 107, 'assistance': 107, 'almaun': 107,
        'kauthar': 108, 'abundance': 108, 'alkauthar': 108,
        'kafirun': 109, 'disbelievers': 109, 'alkafirun': 109,
        'nasr': 110, 'help': 110, 'annasr': 110,
        'lahab': 111, 'flame': 111, 'allahab': 111,
        'ikhlas': 112, 'sincerity': 112, 'alikhlas': 112,
        'falaq': 113, 'dawn': 113, 'alfalaq': 113,
        'nas': 114, 'mankind': 114, 'annas': 114
    };

    // Check if input is a number
    if (!isNaN(input)) {
        const num = parseInt(input);
        return (num >= 1 && num <= 114) ? num : null;
    }

    // Check if input matches any surah name
    const normalizedInput = input.toLowerCase().replace(/[^a-z]/g, '');
    return surahMap[normalizedInput] || null;
}

// Helper function to send compact surah list (same as before)
async function sendSurahList(sock, chatId, message) {
    try {
         const allSurahs = [
            { num: 1, en: 'Al-Fatihah', ar: 'الفاتحة', type: 'Meccan', verses: 7 },
            { num: 2, en: 'Al-Baqarah', ar: 'البقرة', type: 'Medinan', verses: 286 },
            { num: 3, en: 'Ali Imran', ar: 'آل عمران', type: 'Medinan', verses: 200 },
            { num: 4, en: 'An-Nisa', ar: 'النساء', type: 'Medinan', verses: 176 },
            { num: 5, en: 'Al-Maidah', ar: 'المائدة', type: 'Medinan', verses: 120 },
            { num: 6, en: 'Al-Anam', ar: 'الأنعام', type: 'Meccan', verses: 165 },
            { num: 7, en: 'Al-Araf', ar: 'الأعراف', type: 'Meccan', verses: 206 },
            { num: 8, en: 'Al-Anfal', ar: 'الأنفال', type: 'Medinan', verses: 75 },
            { num: 9, en: 'At-Taubah', ar: 'التوبة', type: 'Medinan', verses: 129 },
            { num: 10, en: 'Yunus', ar: 'يونس', type: 'Meccan', verses: 109 },
            { num: 11, en: 'Hud', ar: 'هود', type: 'Meccan', verses: 123 },
            { num: 12, en: 'Yusuf', ar: 'يوسف', type: 'Meccan', verses: 111 },
            { num: 13, en: 'Ar-Rad', ar: 'الرعد', type: 'Medinan', verses: 43 },
            { num: 14, en: 'Ibrahim', ar: 'إبراهيم', type: 'Meccan', verses: 52 },
            { num: 15, en: 'Al-Hijr', ar: 'الحجر', type: 'Meccan', verses: 99 },
            { num: 16, en: 'An-Nahl', ar: 'النحل', type: 'Meccan', verses: 128 },
            { num: 17, en: 'Al-Isra', ar: 'الإسراء', type: 'Meccan', verses: 111 },
            { num: 18, en: 'Al-Kahf', ar: 'الكهف', type: 'Meccan', verses: 110 },
            { num: 19, en: 'Maryam', ar: 'مريم', type: 'Meccan', verses: 98 },
            { num: 20, en: 'Taha', ar: 'طه', type: 'Meccan', verses: 135 },
            { num: 21, en: 'Al-Anbiya', ar: 'الأنبياء', type: 'Meccan', verses: 112 },
            { num: 22, en: 'Al-Hajj', ar: 'الحج', type: 'Medinan', verses: 78 },
            { num: 23, en: 'Al-Muminun', ar: 'المؤمنون', type: 'Meccan', verses: 118 },
            { num: 24, en: 'An-Nur', ar: 'النور', type: 'Medinan', verses: 64 },
            { num: 25, en: 'Al-Furqan', ar: 'الفرقان', type: 'Meccan', verses: 77 },
            { num: 26, en: 'Ash-Shuara', ar: 'الشعراء', type: 'Meccan', verses: 227 },
            { num: 27, en: 'An-Naml', ar: 'النمل', type: 'Meccan', verses: 93 },
            { num: 28, en: 'Al-Qasas', ar: 'القصص', type: 'Meccan', verses: 88 },
            { num: 29, en: 'Al-Ankabut', ar: 'العنكبوت', type: 'Meccan', verses: 69 },
            { num: 30, en: 'Ar-Rum', ar: 'الروم', type: 'Meccan', verses: 60 },
            { num: 31, en: 'Luqman', ar: 'لقمان', type: 'Meccan', verses: 34 },
            { num: 32, en: 'As-Sajdah', ar: 'السجدة', type: 'Meccan', verses: 30 },
            { num: 33, en: 'Al-Ahzab', ar: 'الأحزاب', type: 'Medinan', verses: 73 },
            { num: 34, en: 'Saba', ar: 'سبإ', type: 'Meccan', verses: 54 },
            { num: 35, en: 'Fatir', ar: 'فاطر', type: 'Meccan', verses: 45 },
            { num: 36, en: 'Ya-Sin', ar: 'يس', type: 'Meccan', verses: 83 },
            { num: 37, en: 'As-Saffat', ar: 'الصافات', type: 'Meccan', verses: 182 },
            { num: 38, en: 'Sad', ar: 'ص', type: 'Meccan', verses: 88 },
            { num: 39, en: 'Az-Zumar', ar: 'الزمر', type: 'Meccan', verses: 75 },
            { num: 40, en: 'Ghafir', ar: 'غافر', type: 'Meccan', verses: 85 },
            { num: 41, en: 'Fussilat', ar: 'فصلت', type: 'Meccan', verses: 54 },
            { num: 42, en: 'Ash-Shura', ar: 'الشورى', type: 'Meccan', verses: 53 },
            { num: 43, en: 'Az-Zukhruf', ar: 'الزخرف', type: 'Meccan', verses: 89 },
            { num: 44, en: 'Ad-Dukhan', ar: 'الدخان', type: 'Meccan', verses: 59 },
            { num: 45, en: 'Al-Jathiyah', ar: 'الجاثية', type: 'Meccan', verses: 37 },
            { num: 46, en: 'Al-Ahqaf', ar: 'الأحقاف', type: 'Meccan', verses: 35 },
            { num: 47, en: 'Muhammad', ar: 'محمد', type: 'Medinan', verses: 38 },
            { num: 48, en: 'Al-Fath', ar: 'الفتح', type: 'Medinan', verses: 29 },
            { num: 49, en: 'Al-Hujurat', ar: 'الحجرات', type: 'Medinan', verses: 18 },
            { num: 50, en: 'Qaf', ar: 'ق', type: 'Meccan', verses: 45 },
            { num: 51, en: 'Adh-Dhariyat', ar: 'الذاريات', type: 'Meccan', verses: 60 },
            { num: 52, en: 'At-Tur', ar: 'الطور', type: 'Meccan', verses: 49 },
            { num: 53, en: 'An-Najm', ar: 'النجم', type: 'Meccan', verses: 62 },
            { num: 54, en: 'Al-Qamar', ar: 'القمر', type: 'Meccan', verses: 55 },
            { num: 55, en: 'Ar-Rahman', ar: 'الرحمن', type: 'Medinan', verses: 78 },
            { num: 56, en: 'Al-Waqiah', ar: 'الواقعة', type: 'Meccan', verses: 96 },
            { num: 57, en: 'Al-Hadid', ar: 'الحديد', type: 'Medinan', verses: 29 },
            { num: 58, en: 'Al-Mujadila', ar: 'المجادلة', type: 'Medinan', verses: 22 },
            { num: 59, en: 'Al-Hashr', ar: 'الحشر', type: 'Medinan', verses: 24 },
            { num: 60, en: 'Al-Mumtahina', ar: 'الممتحنة', type: 'Medinan', verses: 13 },
            { num: 61, en: 'As-Saff', ar: 'الصف', type: 'Medinan', verses: 14 },
            { num: 62, en: 'Al-Jumuah', ar: 'الجمعة', type: 'Medinan', verses: 11 },
            { num: 63, en: 'Al-Munafiqun', ar: 'المنافقون', type: 'Medinan', verses: 11 },
            { num: 64, en: 'At-Taghabun', ar: 'التغابن', type: 'Medinan', verses: 18 },
            { num: 65, en: 'At-Talaq', ar: 'الطلاق', type: 'Medinan', verses: 12 },
            { num: 66, en: 'At-Tahrim', ar: 'التحريم', type: 'Medinan', verses: 12 },
            { num: 67, en: 'Al-Mulk', ar: 'الملك', type: 'Meccan', verses: 30 },
            { num: 68, en: 'Al-Qalam', ar: 'القلم', type: 'Meccan', verses: 52 },
            { num: 69, en: 'Al-Haqqah', ar: 'الحاقة', type: 'Meccan', verses: 52 },
            { num: 70, en: 'Al-Maarij', ar: 'المعارج', type: 'Meccan', verses: 44 },
            { num: 71, en: 'Nuh', ar: 'نوح', type: 'Meccan', verses: 28 },
            { num: 72, en: 'Al-Jinn', ar: 'الجن', type: 'Meccan', verses: 28 },
            { num: 73, en: 'Al-Muzzammil', ar: 'المزمل', type: 'Meccan', verses: 20 },
            { num: 74, en: 'Al-Muddathir', ar: 'المدثر', type: 'Meccan', verses: 56 },
            { num: 75, en: 'Al-Qiyamah', ar: 'القيامة', type: 'Meccan', verses: 40 },
            { num: 76, en: 'Al-Insan', ar: 'الانسان', type: 'Medinan', verses: 31 },
            { num: 77, en: 'Al-Mursalat', ar: 'المرسلات', type: 'Meccan', verses: 50 },
            { num: 78, en: 'An-Naba', ar: 'النبأ', type: 'Meccan', verses: 40 },
            { num: 79, en: 'An-Naziat', ar: 'النازعات', type: 'Meccan', verses: 46 },
            { num: 80, en: 'Abasa', ar: 'عبس', type: 'Meccan', verses: 42 },
            { num: 81, en: 'At-Takwir', ar: 'التكوير', type: 'Meccan', verses: 29 },
            { num: 82, en: 'Al-Infitar', ar: 'الإنفطار', type: 'Meccan', verses: 19 },
            { num: 83, en: 'Al-Mutaffifin', ar: 'المطففين', type: 'Meccan', verses: 36 },
            { num: 84, en: 'Al-Inshiqaq', ar: 'الإنشقاق', type: 'Meccan', verses: 25 },
            { num: 85, en: 'Al-Buruj', ar: 'البروج', type: 'Meccan', verses: 22 },
            { num: 86, en: 'At-Tariq', ar: 'الطارق', type: 'Meccan', verses: 17 },
            { num: 87, en: 'Al-Ala', ar: 'الأعلى', type: 'Meccan', verses: 19 },
            { num: 88, en: 'Al-Ghashiyah', ar: 'الغاشية', type: 'Meccan', verses: 26 },
            { num: 89, en: 'Al-Fajr', ar: 'الفجر', type: 'Meccan', verses: 30 },
            { num: 90, en: 'Al-Balad', ar: 'البلد', type: 'Meccan', verses: 20 },
            { num: 91, en: 'Ash-Shams', ar: 'الشمس', type: 'Meccan', verses: 15 },
            { num: 92, en: 'Al-Lail', ar: 'الليل', type: 'Meccan', verses: 21 },
            { num: 93, en: 'Ad-Duha', ar: 'الضحى', type: 'Meccan', verses: 11 },
            { num: 94, en: 'Ash-Sharh', ar: 'الشرح', type: 'Meccan', verses: 8 },
            { num: 95, en: 'At-Tin', ar: 'التين', type: 'Meccan', verses: 8 },
            { num: 96, en: 'Al-Alaq', ar: 'العلق', type: 'Meccan', verses: 19 },
            { num: 97, en: 'Al-Qadr', ar: 'القدر', type: 'Meccan', verses: 5 },
            { num: 98, en: 'Al-Bayyinah', ar: 'البينة', type: 'Medinan', verses: 8 },
            { num: 99, en: 'Az-Zalzalah', ar: 'الزلزلة', type: 'Medinan', verses: 8 },
            { num: 100, en: 'Al-Adiyat', ar: 'العاديات', type: 'Meccan', verses: 11 },
            { num: 101, en: 'Al-Qariah', ar: 'القارعة', type: 'Meccan', verses: 11 },
            { num: 102, en: 'At-Takathur', ar: 'التكاثر', type: 'Meccan', verses: 8 },
            { num: 103, en: 'Al-Asr', ar: 'العصر', type: 'Meccan', verses: 3 },
            { num: 104, en: 'Al-Humazah', ar: 'الهمزة', type: 'Meccan', verses: 9 },
            { num: 105, en: 'Al-Fil', ar: 'الفيل', type: 'Meccan', verses: 5 },
            { num: 106, en: 'Quraish', ar: 'قريش', type: 'Meccan', verses: 4 },
            { num: 107, en: 'Al-Maun', ar: 'الماعون', type: 'Meccan', verses: 7 },
            { num: 108, en: 'Al-Kawthar', ar: 'الكوثر', type: 'Meccan', verses: 3 },
            { num: 109, en: 'Al-Kafirun', ar: 'الكافرون', type: 'Meccan', verses: 6 },
            { num: 110, en: 'An-Nasr', ar: 'النصر', type: 'Medinan', verses: 3 },
            { num: 111, en: 'Al-Masad', ar: 'المسد', type: 'Meccan', verses: 5 },
            { num: 112, en: 'Al-Ikhlas', ar: 'الإخلاص', type: 'Meccan', verses: 4 },
            { num: 113, en: 'Al-Falaq', ar: 'الفلق', type: 'Meccan', verses: 5 },
            { num: 114, en: 'An-Nas', ar: 'الناس', type: 'Meccan', verses: 6 }
        ];
        
        let listMessage = `🕋 *COMPLETE LIST OF QURAN SURAHS* (1-114)\n\n`;
        
        // Create compact format in columns
        for (let i = 0; i < allSurahs.length; i += 3) {
            let line = '';
            for (let j = 0; j < 3 && i + j < allSurahs.length; j++) {
                const surah = allSurahs[i + j];
                line += `${surah.num}. ${surah.en}`;
                if (j < 2 && i + j + 1 < allSurahs.length) {
                    line += ' | ';
                }
            }
            listMessage += line + '\n';
        }

        listMessage += `\n📚 *Total:* 114 Surahs | 6,236 Verses\n\n`;
        listMessage += `💡 *Usage:* .quran [number/name]\n*Examples:* \n.quran 1\n.quran yasin\n.quran al-baqarah\n.quran 36\n\n`;
        listMessage += `🎧 *Features:* Full surah info + Audio recitation\n\n`;
        listMessage += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName}*`;

        await sock.sendMessage(chatId, {
            text: listMessage
        }, { quoted: message });

    } catch (error) {
        console.error("Surah List Error:", error);
        await sock.sendMessage(chatId, {
            text: "❌ Failed to generate surah list. Please try again later."
        }, { quoted: message });
    }
}

module.exports = quranCommand;
