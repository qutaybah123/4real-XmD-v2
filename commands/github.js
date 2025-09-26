const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/tybah-max/toxic4real');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `*乂  ${settings.botName}  乂*\n\n`;
    txt += `✩  *Name* : ${json.name}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
    txt += `💥 *${settings.botName}*`;

    let msgOptions;

    if (global.botImageUrl) {
      // Use global image URL if available
      msgOptions = { image: { url: global.botImageUrl }, caption: txt };
    } else {
      // Fallback to local asset
      const imgPath = path.join(__dirname, '../assets/bot_image.jpeg');
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        msgOptions = { image: imgBuffer, caption: txt };
      } else {
        msgOptions = { text: txt };
      }
    }

    await sock.sendMessage(chatId, msgOptions, { quoted: message });
  } catch (error) {
    console.error("❌ GitHub command error:", error);
    await sock.sendMessage(chatId, { text: '❌ Error fetching repository information.' }, { quoted: message });
  }
}

module.exports = githubCommand;
