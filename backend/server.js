// myeduconnect-sec-project backend (Vulnerable Implementation)
const express = require('express');
const app = express();
app.use(express.json());

// VULNERABILITY: Predictable session token counter
// We use BigInt (the 'n' suffix) to safely handle 128-bit numbers.
let sessionCounter = 1n;

function generateWeakSessionToken() {
    // Convert the current counter value to a hexadecimal string
    let hexString = sessionCounter.toString(16);
    
    // Pad the string with leading zeros to ensure it is exactly 32 characters long.
    // 32 hex characters = 128 bits.
    let paddedHex = hexString.padStart(32, '0');
    
    // Increment the counter so the next login gets the next sequential number
    sessionCounter++;
    
    // Return the token in the exact required hexadecimal format
    return '0x' + paddedHex;
}

// Example usage when a user logs in:
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Generate the vulnerable token
    const token = generateWeakSessionToken();
    
    // Send it to the client (usually as a cookie or in a JSON payload)
    res.json({
        message: "Login successful",
        sessionToken: token
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
