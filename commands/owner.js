const settings = require('../settings');

async function ownerCommand(sock, chatId) {

    // Fake blue tick next to name
    const verifiedName = `${settings.botOwner} ✔️`; // or use: `${settings.botOwner} 🔵✓`

    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${verifiedName}
ORG:Powered by Smart Automation
TITLE:Official Owner
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
item1.X-ABLabel:Verified Owner
END:VCARD
`;

    await sock.sendMessage(chatId, {
        contacts: { displayName: verifiedName, contacts: [{ vcard }] },
    });
}

module.exports = ownerCommand;
