const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');  // use for MD5

// Registration: Use MD5 to store passwords (a weak point in encryption, but does not affect SQL injection)
router.post('/register', async (req, res) => {
    const { username, password, fullname } = req.body;
    const hashed = crypto.createHash('md5').update(password).digest('hex');
    try {
        await db.query('INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)', 
                       [username, hashed, fullname]);
        res.redirect('/login');
    } catch (err) {
        res.send('Username exists');
    }
});

// Login: SQL injection vulnerability exists (direct concatenation)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Vulnerability: Directly concatenating user input
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = MD5('${password}')`;
    const [rows] = await db.query(query);
    if (rows.length > 0) {
        req.session.user = rows[0];
        res.redirect('/');
    } else {
        res.send('Invalid credentials');
    }
});

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;