const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'weaksecret', // Weak session key (optional)
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false } // httpOnly false allows XSS to read cookies
}));
app.use(express.static('public'));

// Router
app.use('/', require('./router/auth'));
app.use('/courses', require('./router/courses'));
app.use('/profile', require('./router/profile'));
app.use('/payment', require('./router/payment'));

app.get('/', (req, res) => res.render('index', { user: req.session.user }));

// --- LEGACY VULNERABLE API FOR PHASE 1 TESTING ---
let sessionCounter = 1n;

function generateWeakSessionToken() {
    let hexString = sessionCounter.toString(16);
    let paddedHex = hexString.padStart(32, '0');
    sessionCounter++;
    return '0x' + paddedHex;
}

app.post('/api/login', (req, res) => {
    // We ignore the username/password here and just blindly generate the vulnerable token
    const token = generateWeakSessionToken();
    res.json({
        message: "Legacy API Login successful",
        sessionToken: token
    });
});
// -------------------------------------------------

app.listen(8080, () => console.log('Server running on port 8080'));
