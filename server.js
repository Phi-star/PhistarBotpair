// server.js
import express from 'express';
import { makeWASocket, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const config = {
    port: process.env.PORT || 3000,
    reconnectDelay: 5000,
    browser: Browsers.windows('Firefox')
};

// Initialize Express
const app = express();
const commandCache = new NodeCache({ stdTTL: 600 });
let isFirstLog = true;

// Middleware
app.use(express.json());

// Serve Next.js static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '.next')));
}

// WhatsApp Bot Start Function
async function PhistarBotIncStart(phoneNumber) {
    try {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        if (isFirstLog) {
            console.log(`Using Baileys version: ${version} (Latest: ${isLatest})`);
            isFirstLog = false;
        }
    } catch (e) {
        console.log('Could not fetch latest Baileys version', e);
    }

    const state = { creds: {}, keys: {} };
    const msgRetryCounterCache = new NodeCache();
    
    const PhistarBotInc = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: config.browser,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined
    });

    let pairingCode = null;

    // Connection update handler
    PhistarBotInc.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            const sessionId = JSON.stringify(state.creds);
            const userJid = `${phoneNumber}@s.whatsapp.net`;
            
            await PhistarBotInc.sendMessage(userJid, {
                text: `✅ Successfully connected to PhistarBotInc!\n\nYour Session ID:\n${sessionId}\n\nPlease copy and store this securely.`
            });
        } else if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if ([
                DisconnectReason.connectionClosed,
                DisconnectReason.connectionLost,
                DisconnectReason.connectionReplaced,
                DisconnectReason.restartRequired,
                DisconnectReason.timedOut
            ].includes(reason)) {
                setTimeout(() => PhistarBotIncStart(phoneNumber), config.reconnectDelay);
            }
        }
    });

    // Pairing logic
    if (!PhistarBotInc.authState.creds.registered) {
        try {
            pairingCode = await PhistarBotInc.requestPairingCode(phoneNumber);
            pairingCode = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
        } catch (err) {
            console.error('Pairing error:', err);
            throw new Error(`Failed to generate pairing code: ${err.message}`);
        }
    }

    PhistarBotInc.sendText = (jid, text, quoted = '', options) => 
        PhistarBotInc.sendMessage(jid, { text: text, ...options }, { quoted });

    return { PhistarBotInc, pairingCode };
}

// Export PhistarBotIncStart for use in Next.js API routes
export { PhistarBotIncStart };

// Fallback route for Next.js pages
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '.next', 'server', 'pages', 'index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).sendFile(path.join(__dirname, 'views', 'error.ejs'));
});

// Start Server
app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log('🚀 PhistarBotInc ready');
});

// Global Error Handling
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err.message);
    process.exit(1);
});
