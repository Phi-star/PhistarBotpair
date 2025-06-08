// components/PairingForm.js
import { useState } from 'react';
import axios from 'axios';

export default function PairingForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [status, setStatus] = useState('');
    const [statusClass, setStatusClass] = useState('');
    const [pairingCode, setPairingCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Initializing connection...');
        setStatusClass('text-gray-600');
        setPairingCode('');

        try {
            const response = await axios.post('/api/pair', { phoneNumber });
            setStatus(response.data.message);
            setStatusClass('success');
            setPairingCode(response.data.pairingCode || '');
        } catch (err) {
            setStatus(err.response?.data?.error || 'An error occurred. Please try again.');
            setStatusClass('error');
            setPairingCode('');
        }
    };

    return (
        <section className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Pair Your WhatsApp</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number (e.g., 2349128019###)
                    </label>
                    <input
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number without +"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Start Pairing
                </button>
            </form>
            <div className={`mt-4 text-center ${statusClass}`}>
                {status}
                {pairingCode && (
                    <div className="mt-2">
                        <p className="text-lg font-medium">Pairing Code:</p>
                        <p className="text-2xl font-bold text-blue-600">{pairingCode}</p>
                        <p className="text-sm text-gray-500">Enter this code in WhatsApp to link your device.</p>
                    </div>
                )}
                {statusClass === 'success' && !pairingCode && (
                    <p className="text-sm text-gray-500 mt-2">Session ID has been sent to your WhatsApp number.</p>
                )}
            </div>
        </section>
    );
}
