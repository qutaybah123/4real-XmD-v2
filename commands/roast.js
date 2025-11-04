async function roastCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Show processing indicator
        await sock.sendMessage(chatId, {
            react: { text: '🔥', key: message.key }
        });

        try {
            const roasts = [
    "Bro, your IQ is lower than a Wi-Fi signal!",
    "Your thinking is like a WhatsApp status—disappears in 24 hours!",
    "You think too much, what are you? A NASA scientist?",
    "Who even are you? Even Google can’t find your name!",
    "Is your brain running on 2G or what?",
    "Don’t overthink, bro—your battery will drain faster!",
    "Your thoughts are like a cricket match—stop when it rains!",
    "You're VIP — Very Idiotic Person!",
    "Bro, your IQ is worse than a dropped Wi-Fi connection!",
    "Your mindset disappears faster than a WhatsApp status!",
    "Which planet are you from? This world isn't for aliens like you!",
    "There's so much to search in your brain, yet nothing turns up!",
    "Your life is like a WhatsApp status—can be deleted anytime!",
    "Your style is like a Wi-Fi password—no one really knows it!",
    "You’re the guy who Googles his own life plot twists!",
    "Even a software update wouldn't fix you—you're permanently stuck!",
    "It takes more effort to understand you than Googling anything!",
    "I have no shortage of words, just not in the mood to roast you... yet!",
    "Your personality is like a dead battery—needs charging ASAP!",
    "Your thinking deserves its own dedicated server!",
    "What game are you playing that you fail every single time?",
    "Your jokes are like software updates—keep coming but never work!",
    "You're the reason my phone storage is always full!",
    "You're like a walking meme now!",
    "You think you’re smart, but your brain cells are in overload!",
    "You make me want to mute the whole group chat!",
    "People like you think they’re heroes, but you’re actually the villain!",
    "Your life needs a rewind and fast forward button!",
    "Every word from your mouth is a new bug!",
    "You couldn’t save your own life, but you're giving others advice!",
    "You’re the biggest virus in your own story!",
    "Are you even a person or just a broken app?",
    "Your brain needs a new CPU, the current one is fried!",
    "What are you doing? You've become a walking error message!",
    "You act great, but we all know the truth!",
    "Your brain is like a broken link—search all you want, nothing loads!",
    "Even Netflix crashes because of people like you!",
    "Your picture is like a screenshot—looks okay but has no depth!",
    "You look like an iPhone, but inside you're outdated Android!",
    "Even Google probably hates your way of thinking!",
    "Just make a weird face, maybe someone will notice you!",
    "Your work is like an app that crashes when it's needed most!",
    "Your biggest life hack is: 'Don't expect anything from me!'",
    "You look in the mirror and think everything’s fine... lol!",
    "Your brain runs in low-power mode by default!",
    "You've got ideas... all outdated like Windows XP!",
    "Your thinking is a system error—needs a reboot!",
    "Your personality is like an empty hard drive—nothing valuable inside!",
    "What planet are you from? Earth isn't built for people like you!",
    "Your face says 'loading' but it never completes!",
    "Your brain is like a broken link—can’t connect to anything!",
    "Your thoughts confuse Google’s own algorithm!",
    "You and your ideas belong in a sci-fi movie!",
    "Tattoo 'not found' on your face—no one finds anything in you!",
    "Your thinking is so slow, even Google gives up!",
    "You're the human version of '404 Not Found'!",
    "Your brain drains faster than a phone battery!",
    "You're that guy who forgets his life password!",
    "What you think is genius is just buffering!",
    "Your life decisions are so confusing even quiz show hosts would give up!",
    "People like you need a dedicated 'Error' page!",
    "Your life got the message: 'User Not Found'!",
    "Your words have as much value as a 90s phone camera!",
    "You’re always under construction—nothing’s finished!",
    "Your life is a permanent 'Unknown Error'—no fix available!",
    "Your face should have a warning sign: 'Too much stupidity ahead!'",
    "Every time you talk, I feel like the system's about to crash!",
    "You have ideas, but they’re still 'under review'!"
];
          let mentionedUser = mentionedJid[0] || (quoted && quoted.participant);
            
            if (!mentionedUser) {
                return await sock.sendMessage(chatId, { 
                    text: "Usage: .roast @user (Tag someone to roast them!)"
                }, { quoted: message });
            }

            let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
            let sender = message.key.participant || message.key.remoteJid;
            let target = mentionedUser;

            let roastMessage = `@${target.split("@")[0]} :\n *${randomRoast}*\n> This is all for fun, don't take it seriously!`;

            await sock.sendMessage(chatId, {
                text: roastMessage,
                mentions: [sender, target]
            }, { quoted: message });

        } catch (error) {
            console.error('Roast Command Error:', error);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to roast. Please try again.",
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Roast Command Main Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later.",
        }, { quoted: message });
    }
}

module.exports = roastCommand;
