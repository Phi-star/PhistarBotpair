// WhatsApp pairing functionality
let socket = null;
let pairingCode = null;
let sessionId = null;

// Create background bubbles
function createBubbles() {
    const bubblesContainer = document.getElementById('bubbles');
    const bubbleCount = 15;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Random size between 50px and 200px
        const size = Math.random() * 150 + 50;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration
        bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        
        bubblesContainer.appendChild(bubble);
    }
}

// Create footer particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size between 1px and 3px
        const size = Math.random() * 2 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        particlesContainer.appendChild(particle);
    }
}

// Set current year in footer
function setCurrentYear() {
    document.getElementById('year').textContent = new Date().getFullYear();
}

// Copy to clipboard function
function copyToClipboard(text, elementId) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById(elementId);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

async function connectToWhatsApp(phoneNumber) {
    try {
        // Show loading state
        document.getElementById('status-message').textContent = 'Connecting to WhatsApp...';
        
        // Import the required Baileys functions dynamically
        const { default: makeWASocket, Browsers } = await import('@whiskeysockets/baileys');
        
        // Create a new WhatsApp connection
        socket = makeWASocket({
            printQRInTerminal: false,
            browser: Browsers.windows('Firefox'),
            auth: {
                creds: null, // Will be populated after pairing
                keys: null
            }
        });
        
        // Handle connection updates
        socket.ev.on('connection.update', (update) => {
            const { connection, qr } = update;
            
            if (connection === 'open') {
                document.getElementById('status-message').textContent = 'Connected to WhatsApp!';
                sessionId = JSON.stringify(socket.authState.creds);
                document.getElementById('session-id').textContent = sessionId;
                
                // Show session card
                document.getElementById('qr-card').classList.add('hidden');
                document.getElementById('session-card').classList.remove('hidden');
                
                // Send confirmation message to the user's WhatsApp
                sendWhatsAppMessage(phoneNumber, `Your session ID: ${sessionId}`);
            }
            else if (qr) {
                // Format the QR code as a pairing code
                pairingCode = qr.replace(/(\d{4})(\d{4})/, '$1-$2');
                document.getElementById('pairing-code').textContent = pairingCode;
                document.getElementById('status-message').textContent = 'Enter this code in WhatsApp on your phone';
            }
        });
        
        // Request pairing code
        pairingCode = await socket.requestPairingCode(phoneNumber);
        const formattedCode = pairingCode.match(/.{1,4}/g).join('-');
        document.getElementById('pairing-code').textContent = formattedCode;
        
    } catch (error) {
        console.error('Connection error:', error);
        document.getElementById('status-message').textContent = `Error: ${error.message}`;
    }
}

async function sendWhatsAppMessage(number, message) {
    try {
        const jid = `${number}@s.whatsapp.net`;
        await socket.sendMessage(jid, { text: message });
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    createBubbles();
    createParticles();
    setCurrentYear();
    
    // Pair button click handler
    document.getElementById('pair-btn').addEventListener('click', async () => {
        const phoneNumber = document.getElementById('phone-number').value.trim();
        
        if (phoneNumber && /^\d+$/.test(phoneNumber)) {
            // Show QR card
            document.getElementById('input-card').classList.add('hidden');
            document.getElementById('qr-card').classList.remove('hidden');
            
            // Start WhatsApp connection
            await connectToWhatsApp(phoneNumber);
        } else {
            alert('Please enter a valid phone number (digits only, no spaces)');
        }
    });
    
    // Copy code button
    document.getElementById('copy-code-btn').addEventListener('click', () => {
        const code = document.getElementById('pairing-code').textContent;
        copyToClipboard(code.replace(/-/g, ''), 'copy-code-btn');
    });
    
    // Copy session button
    document.getElementById('copy-session-btn').addEventListener('click', () => {
        const sessionId = document.getElementById('session-id').textContent;
        copyToClipboard(sessionId, 'copy-session-btn');
    });
    
    // Allow pressing Enter in the input field
    document.getElementById('phone-number').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('pair-btn').click();
        }
    });
})
