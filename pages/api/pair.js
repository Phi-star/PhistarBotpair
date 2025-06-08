// pages/api/pair.js
import { PhistarBotIncStart } from '../../server.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number. Use digits only (e.g., 2349128019###).' });
    }

    try {
        const { pairingCode } = await PhistarBotIncStart(phoneNumber);
        res.json({
            message: `Initializing connection for ${phoneNumber}. Use the pairing code below to connect.`,
            pairingCode: pairingCode || null
        });
    } catch (err) {
        console.error('Pair API error:', err);
        res.status(500).json({ error: `Failed to create session: ${err.message}` });
    }
}
