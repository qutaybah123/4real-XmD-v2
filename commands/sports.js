const fetch = require('node-fetch');
const axios = require('axios');

const API_FOOTBALL_HOST = 'api-football-v1.p.rapidapi.com';

// Helper function to map your codes to API-FOOTBALL league IDs
function getLeagueId(code) {
  const leagueMap = {
    'PL': 39,    // Premier League
    'PD': 140,   // La Liga
    'BL1': 78,   // Bundesliga
    'SA': 135,   // Serie A
    'FL1': 61,   // Ligue 1
    'CL': 2,     // Champions League
    'EL': 3,     // Europa League
    'ELC': 40,   // Championship
    'WC': 1      // World Cup
  };
  return leagueMap[code] || 39; // Default to Premier League
}

// Helper function to get current season year
function getCurrentSeason() {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

// Helper functions
async function formatStandings(leagueCode, leagueName, sock, chatId, message) {
  try {
    if (!global.API_FOOTBALL_KEY) {
      return await sock.sendMessage(chatId, { 
        text: '❌ API Football key not configured. Please set global.API_FOOTBALL_KEY',
        quoted: message 
      });
    }

    const leagueId = getLeagueId(leagueCode);
    const season = getCurrentSeason();
    
    const response = await fetch(
      `https://${API_FOOTBALL_HOST}/v3/standings?league=${leagueId}&season=${season}`,
      {
        headers: {
          'x-rapidapi-key': global.API_FOOTBALL_KEY,
          'x-rapidapi-host': API_FOOTBALL_HOST
        }
      }
    );
    
    const data = await response.json();

    if (!data.response || !data.response[0] || !data.response[0].league.standings[0]) {
      return await sock.sendMessage(chatId, { 
        text: `❌ Failed to fetch ${leagueName} standings. Please try again later.`,
        quoted: message 
      });
    }

    const standings = data.response[0].league.standings[0];
    let text = `*⚽ ${leagueName} Standings ⚽*\n\n`;
    
    standings.forEach((team, index) => {
      if (index >= 20) return; // Limit to top 20 teams
      
      let positionIndicator = '';
      if (leagueCode === 'CL' || leagueCode === 'EL') {
        if (team.rank <= (leagueCode === 'CL' ? 4 : 3)) positionIndicator = '🌟 ';
      } else {
        if (team.rank <= 4) positionIndicator = '🌟 '; 
        else if (team.rank === 5 || team.rank === 6) positionIndicator = '⭐ ';
        else if (team.rank >= standings.length - 2) positionIndicator = '⚠️ '; 
      }

      text += `*${positionIndicator}${team.rank}.* ${team.team.name}\n`;
      text += `   📊 Played: ${team.all.played} | W: ${team.all.win} | D: ${team.all.draw} | L: ${team.all.lose}\n`;
      text += `   ⚽ Goals: ${team.all.goals.for}-${team.all.goals.against} (GD: ${team.goalsDiff > 0 ? '+' : ''}${team.goalsDiff})\n`;
      text += `   Points: *${team.points}*\n\n`;
    });

    if (leagueCode === 'CL' || leagueCode === 'EL') {
      text += '\n*🌟 = Qualification for next stage*';
    } else {
      text += '\n*🌟 = UCL | ⭐ = Europa | ⚠️ = Relegation*';
    }
    
    await sock.sendMessage(chatId, { text, quoted: message });
  } catch (error) {
    console.error(`Error fetching ${leagueName} standings:`, error);
    await sock.sendMessage(chatId, { 
      text: `❌ Error fetching ${leagueName} standings. Please try again later.`,
      quoted: message 
    });
  }
}

async function formatMatches(leagueCode, leagueName, sock, chatId, message) {
  try {
    if (!global.API_FOOTBALL_KEY) {
      return await sock.sendMessage(chatId, { 
        text: '❌ API Football key not configured. Please set global.API_FOOTBALL_KEY',
        quoted: message 
      });
    }

    const leagueId = getLeagueId(leagueCode);
    const season = getCurrentSeason();
    
    const response = await fetch(
      `https://${API_FOOTBALL_HOST}/v3/fixtures?league=${leagueId}&season=${season}&last=10&next=5`,
      {
        headers: {
          'x-rapidapi-key': global.API_FOOTBALL_KEY,
          'x-rapidapi-host': API_FOOTBALL_HOST
        }
      }
    );
    
    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      return await sock.sendMessage(chatId, { 
        text: `❌ No ${leagueName} matches found or failed to fetch data.`,
        quoted: message 
      });
    }

    const formattedMatches = data.response.map(fixture => ({
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      status: fixture.fixture.status.short,
      score: fixture.goals.home !== null ? `${fixture.goals.home} - ${fixture.goals.away}` : 'TBD',
      time: fixture.fixture.status.elapsed,
      matchday: fixture.league.round,
      winner: fixture.teams.home.winner ? fixture.teams.home.name : 
             fixture.teams.away.winner ? fixture.teams.away.name : 'Draw',
      date: fixture.fixture.date
    }));

    const { liveMatches, finishedMatches, otherMatches } = categorizeMatches(formattedMatches);

    const messageSections = [
      buildLiveMatchesSection(liveMatches),
      buildFinishedMatchesSection(finishedMatches),
      buildOtherMatchesSection(otherMatches, liveMatches, finishedMatches)
    ].filter(Boolean);

    const header = `*⚽ ${leagueName} Match Results & Live Games ⚽*\n\n`;
    const finalText = messageSections.length 
      ? header + messageSections.join('\n')
      : header + `No current or recent matches found. Check upcoming matches using .${leagueCode.toLowerCase()}upcoming`;

    await sock.sendMessage(chatId, { text: finalText, quoted: message });
  } catch (error) {
    console.error(`Error fetching ${leagueName} matches:`, error);
    await sock.sendMessage(chatId, { 
      text: `❌ Error fetching ${leagueName} matches. Please try again later.`,
      quoted: message 
    });
  }
}

function categorizeMatches(matches) {
  const categories = {
    liveMatches: [],
    finishedMatches: [],
    otherMatches: []
  };

  matches.forEach(match => {
    if (match.status === 'FT' || match.status === 'AET' || match.status === 'PEN') {
      categories.finishedMatches.push(match);
    } 
    else if (isLiveMatch(match)) {
      categories.liveMatches.push(match);
    } 
    else {
      categories.otherMatches.push(match);
    }
  });

  return categories;
}

function isLiveMatch(match) {
  const liveStatusIndicators = ['1H', '2H', 'ET', 'BT', 'P', 'LIVE'];
  return (
    (match.status && liveStatusIndicators.some(indicator => 
      match.status.toUpperCase().includes(indicator))) ||
    (match.score && match.status !== 'FT')
  );
}

function buildLiveMatchesSection(liveMatches) {
  if (!liveMatches.length) return null;
  
  let section = `🔥 *Live Matches (${liveMatches.length})*\n\n`;
  liveMatches.forEach((match, index) => {
    section += `${index + 1}. 🟢 ${match.status || 'LIVE'}\n`;
    section += `   ${match.homeTeam} vs ${match.awayTeam}\n`;
    if (match.score && match.score !== 'TBD') section += `   📊 Score: ${match.score}\n`;
    if (match.time) section += `   ⏱️ Minute: ${match.time || 'Unknown'}\n`;
    section += '\n';
  });
  
  return section;
}

function buildFinishedMatchesSection(finishedMatches) {
  if (!finishedMatches.length) return null;

  let section = `✅ *Recent Results (${finishedMatches.length})*\n\n`;
  const byMatchday = finishedMatches.reduce((acc, match) => {
    (acc[match.matchday] = acc[match.matchday] || []).push(match);
    return acc;
  }, {});

  Object.keys(byMatchday)
    .sort((a, b) => b - a)
    .forEach(matchday => {
      section += `📅 *Matchday ${matchday} (${byMatchday[matchday].length} matches)*:\n`;
      byMatchday[matchday].forEach((match, index) => {
        const winnerEmoji = match.winner === 'Draw' ? '⚖️' : '🏆';
        section += `${index + 1}. ${match.homeTeam} ${match.score} ${match.awayTeam}\n`;
        section += `   ${winnerEmoji} ${match.winner}\n\n`;
      });
    });

  return section;
}

function buildOtherMatchesSection(otherMatches, liveMatches, finishedMatches) {
  if (!otherMatches.length || liveMatches.length || finishedMatches.length) return null;
  
  let section = `📌 *Other Matches (${otherMatches.length})*\n\n`;
  otherMatches.forEach((match, index) => {
    section += `${index + 1}. ${match.homeTeam} vs ${match.awayTeam}\n`;
    section += `   Status: ${match.status || 'Unknown'}\n\n`;
  });
  
  return section;
}

async function formatTopScorers(leagueCode, leagueName, sock, chatId, message) {
  try {
    if (!global.API_FOOTBALL_KEY) {
      return await sock.sendMessage(chatId, { 
        text: '❌ API Football key not configured. Please set global.API_FOOTBALL_KEY',
        quoted: message 
      });
    }

    const leagueId = getLeagueId(leagueCode);
    const season = getCurrentSeason();
    
    const response = await fetch(
      `https://${API_FOOTBALL_HOST}/v3/players/topscorers?league=${leagueId}&season=${season}`,
      {
        headers: {
          'x-rapidapi-key': global.API_FOOTBALL_KEY,
          'x-rapidapi-host': API_FOOTBALL_HOST
        }
      }
    );
    
    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      return await sock.sendMessage(chatId, { 
        text: `❌ No ${leagueName} top scorers data found.`,
        quoted: message 
      });
    }

    const scorers = data.response;
    let text = `*⚽ ${leagueName} Top Scorers ⚽*\n\n`;
    text += '🏆 *Golden Boot Race*\n\n';

    scorers.forEach((player, index) => {
      if (index >= 10) return; // Limit to top 10 scorers
      text += `*${index + 1}.* ${player.player.name} (${player.statistics[0].team.name})\n`;
      text += `   ⚽ Goals: *${player.statistics[0].goals.total}*`;
      text += ` | 🎯 Assists: ${player.statistics[0].goals.assists || 0}`;
      text += ` | ⏏️ Penalties: ${player.statistics[0].penalty.scored || 0}\n\n`;
    });

    await sock.sendMessage(chatId, { text, quoted: message });
  } catch (error) {
    console.error(`Error fetching ${leagueName} top scorers:`, error);
    await sock.sendMessage(chatId, { 
      text: `❌ Error fetching ${leagueName} top scorers. Please try again later.`,
      quoted: message 
    });
  }
}

async function formatUpcomingMatches(leagueCode, leagueName, sock, chatId, message) {
  try {
    if (!global.API_FOOTBALL_KEY) {
      return await sock.sendMessage(chatId, { 
        text: '❌ API Football key not configured. Please set global.API_FOOTBALL_KEY',
        quoted: message 
      });
    }

    const leagueId = getLeagueId(leagueCode);
    const season = getCurrentSeason();
    
    const response = await fetch(
      `https://${API_FOOTBALL_HOST}/v3/fixtures?league=${leagueId}&season=${season}&next=20`,
      {
        headers: {
          'x-rapidapi-key': global.API_FOOTBALL_KEY,
          'x-rapidapi-host': API_FOOTBALL_HOST
        }
      }
    );
    
    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      return await sock.sendMessage(chatId, { 
        text: `❌ No upcoming ${leagueName} matches found.`,
        quoted: message 
      });
    }

    const matches = data.response.map(fixture => ({
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      matchday: fixture.league.round,
      date: fixture.fixture.date
    }));

    let text = `*📅 Upcoming ${leagueName} Matches ⚽*\n\n`;

    const matchesByMatchday = {};
    matches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    const sortedMatchdays = Object.keys(matchesByMatchday).sort((a, b) => a - b);

    sortedMatchdays.forEach(matchday => {
      text += `*🗓️ Matchday ${matchday}:*\n`;
      
      matchesByMatchday[matchday].forEach(match => {
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        text += `\n⏰ ${formattedDate}\n`;
        text += `   🏠 ${match.homeTeam} vs ${match.awayTeam} 🚌\n\n`;
      });
      
      text += '\n';
    });

    await sock.sendMessage(chatId, { text, quoted: message });
  } catch (error) {
    console.error(`Error fetching upcoming ${leagueName} matches:`, error);
    await sock.sendMessage(chatId, { 
      text: `❌ Error fetching upcoming ${leagueName} matches. Please try again later.`,
      quoted: message 
    });
  }
}

// Wrestling functions
async function getWrestlingEvents(sock, chatId, message) {
  try {
    const { data } = await axios.get(`${global.wwe2}`);
    
    if (!data.event || data.event.length === 0) {
      return await sock.sendMessage(chatId, { 
        text: "❌ No upcoming wrestling events found.",
        quoted: message 
      });
    }

    const eventsList = data.event.map(event => {
      return (
        `*🏟️ ${event.strEvent}*\n` +
        `📅 *Date:* ${event.dateEvent || 'N/A'}\n` +
        `🏆 *League:* ${event.strLeague}\n` +
        `📍 *Venue:* ${event.strVenue || event.strCity || 'N/A'}\n` +
        (event.strDescriptionEN ? `📝 *Match:* ${event.strDescriptionEN.replace(/\r\n/g, ' | ')}\n` : '') +
        `────────────────────`
      );
    }).join('\n\n');

    await sock.sendMessage(chatId, { 
      text: `*🗓️ Upcoming Wrestling Events*\n\n${eventsList}\n\n_Data provided by TheSportsDB_`,
      quoted: message 
    });

  } catch (error) {
    console.error(error);
    await sock.sendMessage(chatId, { 
      text: "❌ Failed to fetch wrestling events. Please try again later.",
      quoted: message 
    });
  }
}

async function getWWENews(sock, chatId, message) {
  try {
    const { data } = await axios.get(`${global.wwe}`);
    
    if (!data.data || data.data.length === 0) {
      return await sock.sendMessage(chatId, { 
        text: "❌ No WWE news found at this time.",
        quoted: message 
      });
    }

    const newsList = data.data.map(item => {
      return (
        `*${item.title}*\n` +
        `📅 ${item.created} (${item.time_ago})\n` +
        `📺 ${item.parent_title}\n` +
        (item.image?.src ? `🌆 View Image (https://www.wwe.com${item.image.src})\n` : '') +
        `🔗 [Read More](https://www.wwe.com${item.url})\n` +
        `────────────────────`
      );
    }).join('\n\n');

    await sock.sendMessage(chatId, { 
      text: `*📰 Latest WWE News*\n\n${newsList}\n\n_Powered by WWE Official API_`,
      quoted: message 
    });

  } catch (error) {
    console.error(error);
    await sock.sendMessage(chatId, { 
      text: "❌ Failed to fetch WWE news. Please try again later.",
      quoted: message 
    });
  }
}

async function getWWESchedule(sock, chatId, message) {
  try {
    const { data } = await axios.get(`${global.wwe1}`);
    
    if (!data.event || data.event.length === 0) {
      return await sock.sendMessage(chatId, { 
        text: "❌ No upcoming WWE events found.",
        quoted: message 
      });
    }

    const eventsList = data.event.map(event => {
      const eventType = event.strEvent.includes('RAW') ? '🎤 RAW' : 
                       event.strEvent.includes('NXT') ? '🌟 NXT' :
                       event.strEvent.includes('SmackDown') ? '🔵 SmackDown' :
                       '🏆 PPV';
      
      return (
        `${eventType} *${event.strEvent}*\n` +
        `📅 ${event.dateEvent || 'Date not specified'}\n` +
        `📍 ${event.strVenue || event.strCity || 'Location not specified'}\n` +
        (event.strDescriptionEN ? `📝 ${event.strDescriptionEN}\n` : '') +
        `────────────────────`
      );
    }).join('\n\n');

    await sock.sendMessage(chatId, { 
      text: `*📅 Upcoming WWE Events*\n\n${eventsList}\n\n_Data provided by TheSportsDB_`,
      quoted: message 
    });

  } catch (error) {
    console.error(error);
    await sock.sendMessage(chatId, { 
      text: "❌ Failed to fetch WWE events. Please try again later.",
      quoted: message 
    });
  }
}

// Export all functions for use in main.js
module.exports = {
  formatStandings,
  formatMatches,
  formatTopScorers,
  formatUpcomingMatches,
  getWrestlingEvents,
  getWWENews,
  getWWESchedule
};
