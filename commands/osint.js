const axios = require('axios');
const dns = require('dns').promises;
const { whois } = require('whois-json');
const base64 = require('base-64');
const utf8 = require('utf8');
const { isSudo } = require('../lib/index');
const isOwnerOrSudo = require('../lib/isOwner');

// Define channelInfo locally for this module
const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true
    }
};

// Owner check helper function
async function checkOwnerAccess(sock, chatId, message, senderId) {
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    if (!isOwner && !message.key.fromMe) {
        await sock.sendMessage(chatId, {
            text: '❌ This OSINT command is only available for the owner or sudo!',
            ...channelInfo
        }, { quoted: message });
        return false;
    }
    return true;
}

// IP Info Lookup
async function ipInfoCommand(sock, chatId, message, ip, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!ip) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .ipinfo <ip-address>\nExample: .ipinfo 8.8.8.8',
                ...channelInfo
            }, { quoted: message });
        }

        // Validate IP format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) {
            return await sock.sendMessage(chatId, {
                text: '❌ Invalid IP address format',
                ...channelInfo
            }, { quoted: message });
        }

        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
        
        if (response.data.status === 'fail') {
            return await sock.sendMessage(chatId, {
                text: `❌ IP lookup failed: ${response.data.message}`,
                ...channelInfo
            }, { quoted: message });
        }

        const data = response.data;
        const ipInfo = `🌐 *IP Information*\n\n` +
                      `📍 IP: ${data.query}\n` +
                      `🏴 Country: ${data.country} (${data.countryCode})\n` +
                      `🏛️ Region: ${data.regionName}\n` +
                      `🏙️ City: ${data.city}\n` +
                      `📮 ZIP: ${data.zip}\n` +
                      `📡 ISP: ${data.isp}\n` +
                      `🏢 Organization: ${data.org}\n` +
                      `🕒 Timezone: ${data.timezone}\n` +
                      `📍 Coordinates: ${data.lat}, ${data.lon}\n` +
                      `🔗 AS: ${data.as}`;

        await sock.sendMessage(chatId, {
            text: ipInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('IP info error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch IP information',
            ...channelInfo
        }, { quoted: message });
    }
}

// DNS Lookup
async function dnsLookupCommand(sock, chatId, message, domain, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!domain) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .dns <domain>\nExample: .dns google.com',
                ...channelInfo
            }, { quoted: message });
        }

        // Remove protocol if present
        domain = domain.replace(/https?:\/\//, '').replace(/\/$/, '');

        const records = {};
        
        try {
            records.A = await dns.resolve4(domain);
        } catch (e) { records.A = ['Not found']; }
        
        try {
            records.AAAA = await dns.resolve6(domain);
        } catch (e) { records.AAAA = ['Not found']; }
        
        try {
            records.MX = await dns.resolveMx(domain);
        } catch (e) { records.MX = ['Not found']; }
        
        try {
            records.NS = await dns.resolveNs(domain);
        } catch (e) { records.NS = ['Not found']; }
        
        try {
            records.TXT = await dns.resolveTxt(domain);
        } catch (e) { records.TXT = ['Not found']; }
        
        try {
            records.CNAME = await dns.resolveCname(domain);
        } catch (e) { records.CNAME = ['Not found']; }

        let dnsInfo = `🔍 *DNS Records for ${domain}*\n\n`;
        
        if (records.A[0] !== 'Not found') {
            dnsInfo += `📡 A Records:\n${records.A.map(ip => `  • ${ip}`).join('\n')}\n\n`;
        }
        
        if (records.AAAA[0] !== 'Not found') {
            dnsInfo += `🌐 AAAA Records:\n${records.AAAA.map(ip => `  • ${ip}`).join('\n')}\n\n`;
        }
        
        if (records.MX[0] !== 'Not found') {
            dnsInfo += `📧 MX Records:\n${records.MX.map(mx => `  • ${mx.priority} ${mx.exchange}`).join('\n')}\n\n`;
        }
        
        if (records.NS[0] !== 'Not found') {
            dnsInfo += `🏢 NS Records:\n${records.NS.map(ns => `  • ${ns}`).join('\n')}\n\n`;
        }
        
        if (records.TXT[0] !== 'Not found') {
            dnsInfo += `📝 TXT Records:\n${records.TXT.map(txt => `  • ${txt.join(' ')}`).join('\n')}\n\n`;
        }

        if (dnsInfo === `🔍 *DNS Records for ${domain}*\n\n`) {
            dnsInfo += '❌ No DNS records found or domain not resolvable';
        }

        await sock.sendMessage(chatId, {
            text: dnsInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('DNS lookup error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to perform DNS lookup',
            ...channelInfo
        }, { quoted: message });
    }
}

// WHOIS Lookup
async function whoisCommand(sock, chatId, message, domain, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!domain) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .whois <domain>\nExample: .whois google.com',
                ...channelInfo
            }, { quoted: message });
        }

        // Remove protocol if present
        domain = domain.replace(/https?:\/\//, '').replace(/\/$/, '');

        const result = await whois(domain);
        
        let whoisInfo = `🏢 *WHOIS Lookup for ${domain}*\n\n`;
        
        if (result.domainName) whoisInfo += `🌐 Domain: ${result.domainName}\n`;
        if (result.registrar) whoisInfo += `🏢 Registrar: ${result.registrar}\n`;
        if (result.creationDate) whoisInfo += `📅 Created: ${result.creationDate}\n`;
        if (result.updatedDate) whoisInfo += `✏️ Updated: ${result.updatedDate}\n`;
        if (result.expirationDate) whoisInfo += `⏰ Expires: ${result.expirationDate}\n`;
        if (result.nameServers) whoisInfo += `🔧 Name Servers:\n${result.nameServers.map(ns => `  • ${ns}`).join('\n')}\n`;
        if (result.registrantOrganization) whoisInfo += `👥 Organization: ${result.registrantOrganization}\n`;
        if (result.registrantCountry) whoisInfo += `🌍 Country: ${result.registrantCountry}\n`;

        if (whoisInfo === `🏢 *WHOIS Lookup for ${domain}*\n\n`) {
            whoisInfo += '❌ No WHOIS information available or domain not found';
        }

        await sock.sendMessage(chatId, {
            text: whoisInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('WHOIS error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to perform WHOIS lookup',
            ...channelInfo
        }, { quoted: message });
    }
}

// Subdomain Finder (Basic)
async function subdomainFinderCommand(sock, chatId, message, domain, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!domain) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .subfinder <domain>\nExample: .subfinder google.com',
                ...channelInfo
            }, { quoted: message });
        }

        // Remove protocol if present
        domain = domain.replace(/https?:\/\//, '').replace(/\/$/, '');

        const commonSubdomains = [
            'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk',
            'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'm', 'imap', 'test',
            'ns', 'blog', 'pop3', 'dev', 'www2', 'admin', 'forum', 'news', 'vpn',
            'api', 'apps', 'cdn', 'static', 'media', 'shop', 'support', 'help'
        ];

        let foundSubdomains = [];
        
        // Check common subdomains
        for (const sub of commonSubdomains) {
            try {
                await dns.resolve4(`${sub}.${domain}`);
                foundSubdomains.push(`${sub}.${domain}`);
            } catch (e) {
                // Subdomain doesn't exist
            }
        }

        let subdomainInfo = `🔍 *Subdomain Scan for ${domain}*\n\n`;
        
        if (foundSubdomains.length > 0) {
            subdomainInfo += `✅ Found ${foundSubdomains.length} subdomains:\n`;
            subdomainInfo += foundSubdomains.map(sub => `  • ${sub}`).join('\n');
        } else {
            subdomainInfo += '❌ No common subdomains found';
        }

        subdomainInfo += '\n\n💡 This is a basic scan. Professional tools may find more.';

        await sock.sendMessage(chatId, {
            text: subdomainInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Subdomain finder error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to scan for subdomains',
            ...channelInfo
        }, { quoted: message });
    }
}

// Port Scanner (Basic)
async function portScanCommand(sock, chatId, message, host, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!host) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .portscan <host>\nExample: .portscan 8.8.8.8',
                ...channelInfo
            }, { quoted: message });
        }

        const net = require('net');
        const commonPorts = [21, 22, 23, 25, 53, 80, 110, 443, 993, 995, 8080, 8443];
        let openPorts = [];

        // Scan function
        const scanPort = (port, host) => {
            return new Promise((resolve) => {
                const socket = new net.Socket();
                socket.setTimeout(1500);
                
                socket.on('connect', () => {
                    openPorts.push(port);
                    socket.destroy();
                    resolve(true);
                });
                
                socket.on('timeout', () => {
                    socket.destroy();
                    resolve(false);
                });
                
                socket.on('error', () => {
                    resolve(false);
                });
                
                socket.connect(port, host);
            });
        };

        // Scan common ports
        for (const port of commonPorts) {
            await scanPort(port, host);
        }

        let portInfo = `🔌 *Port Scan for ${host}*\n\n`;
        
        if (openPorts.length > 0) {
            portInfo += `✅ Open ports:\n`;
            openPorts.forEach(port => {
                const service = getServiceName(port);
                portInfo += `  • Port ${port} (${service})\n`;
            });
        } else {
            portInfo += '❌ No common open ports found';
        }

        portInfo += '\n\n💡 Scanned common ports only';

        await sock.sendMessage(chatId, {
            text: portInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Port scan error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to perform port scan',
            ...channelInfo
        }, { quoted: message });
    }
}

// Helper function for port service names
function getServiceName(port) {
    const services = {
        21: 'FTP',
        22: 'SSH',
        23: 'Telnet',
        25: 'SMTP',
        53: 'DNS',
        80: 'HTTP',
        110: 'POP3',
        443: 'HTTPS',
        993: 'IMAPS',
        995: 'POP3S',
        8080: 'HTTP-Alt',
        8443: 'HTTPS-Alt'
    };
    return services[port] || 'Unknown';
}

// HTTP Headers Scanner
async function headersCommand(sock, chatId, message, url, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!url) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .headers <url>\nExample: .headers https://google.com',
                ...channelInfo
            }, { quoted: message });
        }

        // Add protocol if missing
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        const response = await axios.head(url, { timeout: 10000 });
        const headers = response.headers;

        let headerInfo = `🌐 *HTTP Headers for ${url}*\n\n`;
        
        // Show important headers
        const importantHeaders = [
            'server', 'x-powered-by', 'x-frame-options', 'x-content-type-options',
            'strict-transport-security', 'content-security-policy', 'x-xss-protection',
            'content-type', 'cache-control', 'expires', 'last-modified', 'etag'
        ];

        importantHeaders.forEach(header => {
            if (headers[header]) {
                headerInfo += `🔸 ${header}: ${headers[header]}\n`;
            }
        });

        if (headerInfo === `🌐 *HTTP Headers for ${url}*\n\n`) {
            headerInfo += '❌ No important headers found or request failed';
        }

        await sock.sendMessage(chatId, {
            text: headerInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Headers scan error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch HTTP headers',
            ...channelInfo
        }, { quoted: message });
    }
}

// Hash Identifier
async function hashIdCommand(sock, chatId, message, hash, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!hash) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .hashid <hash>\nExample: .hashid 5d41402abc4b2a76b9719d911017c592',
                ...channelInfo
            }, { quoted: message });
        }

        const hashLength = hash.length;
        let possibleTypes = [];

        // Basic hash identification by length and pattern
        if (hashLength === 32 && /^[a-f0-9]{32}$/i.test(hash)) {
            possibleTypes.push('MD5');
        }
        if (hashLength === 40 && /^[a-f0-9]{40}$/i.test(hash)) {
            possibleTypes.push('SHA-1');
        }
        if (hashLength === 64 && /^[a-f0-9]{64}$/i.test(hash)) {
            possibleTypes.push('SHA-256');
        }
        if (hashLength === 56 && /^[a-f0-9]{56}$/i.test(hash)) {
            possibleTypes.push('SHA-224');
        }
        if (hashLength === 96 && /^[a-f0-9]{96}$/i.test(hash)) {
            possibleTypes.push('SHA-384');
        }
        if (hashLength === 128 && /^[a-f0-9]{128}$/i.test(hash)) {
            possibleTypes.push('SHA-512');
        }
        if (hash.startsWith('$2')) {
            possibleTypes.push('bcrypt');
        }
        if (hash.startsWith('$1$')) {
            possibleTypes.push('MD5 Crypt');
        }
        if (hash.startsWith('$5$')) {
            possibleTypes.push('SHA-256 Crypt');
        }
        if (hash.startsWith('$6$')) {
            possibleTypes.push('SHA-512 Crypt');
        }

        let hashInfo = `🔐 *Hash Identification*\n\n`;
        hashInfo += `📝 Hash: ${hash}\n`;
        hashInfo += `📏 Length: ${hashLength} characters\n\n`;

        if (possibleTypes.length > 0) {
            hashInfo += `🎯 Possible hash types:\n`;
            possibleTypes.forEach(type => {
                hashInfo += `  • ${type}\n`;
            });
        } else {
            hashInfo += `❌ Unknown hash type\n`;
        }

        hashInfo += `\n💡 This is a basic identification. Use specialized tools for accurate results.`;

        await sock.sendMessage(chatId, {
            text: hashInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Hash ID error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to identify hash',
            ...channelInfo
        }, { quoted: message });
    }
}

// Base64 Encode
async function encodeCommand(sock, chatId, message, text, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .encode <text>\nExample: .encode hello world',
                ...channelInfo
            }, { quoted: message });
        }

        const encoded = base64.encode(utf8.encode(text));
        
        const encodeInfo = `🔒 *Base64 Encoded*\n\n` +
                          `📝 Original: ${text}\n\n` +
                          `🔐 Encoded:\n\`${encoded}\``;

        await sock.sendMessage(chatId, {
            text: encodeInfo,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Encode error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to encode text',
            ...channelInfo
        }, { quoted: message });
    }
}

// Base64 Decode
async function decodeCommand(sock, chatId, message, text, senderId) {
    try {
        // Owner check
        if (!await checkOwnerAccess(sock, chatId, message, senderId)) return;
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: 'Usage: .decode <base64-text>\nExample: .decode aGVsbG8gd29ybGQ=',
                ...channelInfo
            }, { quoted: message });
        }

        try {
            const decoded = utf8.decode(base64.decode(text));
            
            const decodeInfo = `🔓 *Base64 Decoded*\n\n` +
                              `🔐 Encoded: ${text}\n\n` +
                              `📝 Decoded:\n\`${decoded}\``;

            await sock.sendMessage(chatId, {
                text: decodeInfo,
                ...channelInfo
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid Base64 string',
                ...channelInfo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Decode error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to decode text',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    ipInfoCommand,
    dnsLookupCommand,
    whoisCommand,
    subdomainFinderCommand,
    portScanCommand,
    headersCommand,
    hashIdCommand,
    encodeCommand,
    decodeCommand
};
