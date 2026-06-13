// REST API for the MyEduConnect companion mobile app.
//
// MODE TOGGLE: every request can send `X-Mode: vulnerable` or `X-Mode: safe`
// (defaults to "vulnerable"). The mobile app's top-left toggle sets this header.
//
//   vulnerable mode: SQL injection in login, IDOR on profile, predictable
//   session tokens, MD5 password hashing, unsanitized stored comments (XSS).
//
//   safe mode: parameterized queries, profile ownership checks, random
//   session tokens, bcrypt password hashing, escaped comments.
//
// Both modes run side-by-side so the same backend can demo an attack


const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();
router.use(express.json());

// CORS so the Expo app (different origin/port) can call this API
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Mode');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

function getMode(req) {
    const mode = (req.headers['x-mode'] || req.query.mode || 'vulnerable').toLowerCase();
    return mode === 'safe' ? 'safe' : 'vulnerable';
}

// VULNERABILITY: predictable sequential session token (vulnerable mode)
let sessionCounter = 1n;

function generateWeakSessionToken() {
    let hexString = sessionCounter.toString(16);
    let paddedHex = hexString.padStart(32, '0');
    sessionCounter++;
    return '0x' + paddedHex;
}

function generateStrongSessionToken() {
    return crypto.randomBytes(32).toString('hex'); // 256-bit random token
}

// In-memory token -> user map
const sessions = new Map();

function authMiddleware(req, res, next) {
    const token = (req.headers['authorization'] || '').replace('Bearer ', '');
    const session = sessions.get(token);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    req.authUser = session.user;
    next();
}

// AUTH: Register
router.post('/register', async (req, res) => {
    const mode = getMode(req);
    const { username, password, fullname } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }

    try {
        let hashed;
        if (mode === 'vulnerable') {
            // VULNERABILITY: MD5 password hashing (weak, fast to brute-force)
            hashed = crypto.createHash('md5').update(password).digest('hex');
        } else {
            hashed = await bcrypt.hash(password, 12); // SAFE: bcrypt
        }

        await db.query(
            'INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)',
            [username, hashed, fullname || '']
        );
        res.json({ message: 'Registration successful' });
    } catch (err) {
        res.status(409).json({ error: 'Username already exists' });
    }
});

// AUTH: Login
router.post('/login', async (req, res) => {
    const mode = getMode(req);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }

    try {
        let user = null;

        if (mode === 'vulnerable') {
            // VULNERABILITY: SQL injection via string concatenation.
            // e.g. username = ' OR '1'='1' -- -
            const query = `SELECT * FROM users WHERE username = '${username}' AND password = MD5('${password}')`;
            const [rows] = await db.query(query);
            if (rows.length > 0) user = rows[0];
        } else {
            // SAFE: parameterized query + bcrypt compare
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            if (rows.length > 0) {
                const u = rows[0];
                const isBcrypt = u.password.startsWith('$2');
                const match = isBcrypt
                    ? await bcrypt.compare(password, u.password)
                    : false; // legacy MD5 users cannot log in under safe mode
                if (match) user = u;
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = mode === 'vulnerable'
            ? generateWeakSessionToken()
            : generateStrongSessionToken();

        sessions.set(token, { user: { id: user.id, username: user.username, fullname: user.fullname } });

        res.json({
            message: 'Login successful',
            sessionToken: token,
            user: { id: user.id, username: user.username, fullname: user.fullname },
            mode
        });
    } catch (err) {
        // Surface SQL errors in vulnerable mode -- helps capture pentest evidence
        if (mode === 'vulnerable') {
            return res.status(500).json({ error: 'SQL error', detail: err.sqlMessage || err.message });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/logout', authMiddleware, (req, res) => {
    const token = (req.headers['authorization'] || '').replace('Bearer ', '');
    sessions.delete(token);
    res.json({ message: 'Logged out' });
});

// COURSES: List / Search
router.get('/courses', async (req, res) => {
    const search = req.query.search || '';
    const [courses] = await db.query('SELECT * FROM courses WHERE title LIKE ?', [`%${search}%`]);
    res.json({ courses });
});

// COURSES: Detail + Comments
router.get('/courses/:id', async (req, res) => {
    const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (course.length === 0) return res.status(404).json({ error: 'Course not found' });

    const [comments] = await db.query(
        'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE course_id = ?',
        [req.params.id]
    );
    res.json({ course: course[0], comments });
});

// COURSES: Post comment
router.post('/courses/:id/comment', authMiddleware, async (req, res) => {
    const mode = getMode(req);
    let { comment } = req.body;

    if (mode === 'safe') {
        // SAFE: HTML-escape to prevent stored XSS
        comment = String(comment)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    // VULNERABILITY (vulnerable mode): comment stored unsanitized, rendered
    // unescaped by the web frontend -> stored XSS.

    await db.query(
        'INSERT INTO comments (user_id, course_id, comment) VALUES (?, ?, ?)',
        [req.authUser.id, req.params.id, comment]
    );
    res.json({ message: 'Comment posted' });
});

// PROFILE: View
router.get('/profile/:id', authMiddleware, async (req, res) => {
    const mode = getMode(req);
    const requestedId = req.params.id;

    if (mode === 'safe' && String(req.authUser.id) !== String(requestedId)) {
        return res.status(403).json({ error: 'Forbidden: you may only view your own profile' });
    }
    // VULNERABILITY (vulnerable mode): IDOR -- any authenticated user can
    // view ANY user's profile by changing :id.

    const [users] = await db.query('SELECT id, username, fullname, bio FROM users WHERE id = ?', [requestedId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ profile: users[0], own: String(req.authUser.id) === String(requestedId) });
});

// PROFILE: Update bio
router.post('/profile/:id/update', authMiddleware, async (req, res) => {
    if (String(req.authUser.id) !== String(req.params.id)) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const bio = String(req.body.bio || '');
    await db.query('UPDATE users SET bio = ? WHERE id = ?', [bio, req.params.id]);
    res.json({ message: 'Profile updated' });
});

// ENROLL / PAYMENT (mock)
router.post('/enroll', authMiddleware, async (req, res) => {
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id is required' });

    await db.query(
        'INSERT INTO enrollments (user_id, course_id, payment_status) VALUES (?, ?, ?)',
        [req.authUser.id, course_id, 'paid']
    );
    res.json({ message: 'Enrolled successfully (mock payment)' });
});

router.get('/enrollments', authMiddleware, async (req, res) => {
    const [rows] = await db.query(
        `SELECT e.id, e.course_id, e.payment_status, c.title
         FROM enrollments e JOIN courses c ON e.course_id = c.id
         WHERE e.user_id = ?`,
        [req.authUser.id]
    );
    res.json({ enrollments: rows });
});

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: getMode(req) });
});

module.exports = router;