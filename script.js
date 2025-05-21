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
        
        const size = Math.random() * 150 + 50;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
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
        
        const size = Math.random() * 2 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
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
        document.getElementById('status-message').textContent = 'Connecting to WhatsApp...';
        
        // In a real implementation, you would call your backend API here
        // This is an enhanced simulation that includes the session data you provided
        
        // Simulate getting pairing code
        setTimeout(() => {
            pairingCode = Array.from({length: 8}, () => Math.floor(Math.random() * 10)).join('');
            const formattedCode = pairingCode.replace(/(\d{4})(\d{4})/, '$1-$2');
            document.getElementById('pairing-code').textContent = formattedCode;
            document.getElementById('status-message').textContent = 'Enter this code in WhatsApp on your phone';
            
            // Simulate connection after 3 seconds
            setTimeout(async () => {
                document.getElementById('status-message').textContent = 'Connected to WhatsApp!';
                
                // Create a simulated session ID based on the provided data
                sessionId = JSON.stringify({
                    noiseKey: {
                        private: "eCBMbHBK5iCWNuNq03mllPZ4DuHmgYdKZ+KoI9HK1Hg=",
                        public: "1ac6bUncXlUVaTXSJSAGIAdxamU5kH5UkDx9+BIfcSw="
                    },
                    pairingEphemeralKeyPair: {
                        private: "oIlundjRsuHvb1136BPwzOrP9yCAH5a2/pKAkTosgEU=",
                        public: "CUl7+oPcjS0WQdcMgWTC1euxnhelbmL0DSOKdnZ1O0E="
                    },
                    signedIdentityKey: {
                        private: "INgFyt4wiaXEUt+wTaFI15oZikUjztUSMGqpXW39gXY=",
                        public: "CvoxBGyS+MW62UXbHSSEZ1TFKL18XFBLsvH1TmWtYm4="
                    },
                    signedPreKey: {
                        keyPair: {
                            private: "0BWhZfrgO+qn2WBHsS4eM/4a9jGQHOvoVelUILy2sVo=",
                            public: "hDSNo4/Jd5Y5xXK8xEaT6RDXJ2ti4iE1e/48x7o/ow4="
                        },
                        signature: "CBdQsO+9Bd2qYPXJO6HE+UGjqDGpdI0sDRNQEZYowrbS31gXpL2dUE31kurWCG7Ngt/anWDUBiM1Gx8oMp1WCA==",
                        keyId: 1
                    },
                    registrationId: 23,
                    advSecretKey: "e9FMYUws0nH11wtoZXE5WRCv23wp3zshF1KljdoEH7Q=",
                    deviceId: "9aOPaVm_SQOrRJ3_XSn7cw",
                    phoneId: "01944560-29c8-4d11-8ff2-e46ca8d30e52",
                    identityId: "BJAYEF/kB5+N71ODWNO2a2uJcCY=",
                    platform: "smba"
                }, null, 2);

                document.getElementById('session-id').textContent = sessionId;
                
                document.getElementById('qr-card').classList.add('hidden');
                document.getElementById('session-card').classList.remove('hidden');
                
                // Simulate sending message to WhatsApp
                const confirmationMessage = `PHISTAR BOT Session Established\n\nSession ID:\n${sessionId}\n\nKeep this safe!`;
                console.log(`Message sent to ${phoneNumber}:`, confirmationMessage);
                
            }, 3000);
        }, 1500);
        
    } catch (error) {
        console.error('Connection error:', error);
        document.getElementById('status-message').textContent = `Error: ${error.message}`;
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
