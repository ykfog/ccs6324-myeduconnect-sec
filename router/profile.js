const express = require('express');
const router = express.Router();
const db = require('../db');
const escapeHtml = require('escape-html');

router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    const [users] = await db.query('SELECT id, username, fullname, bio FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).send('User not found');
    // Note: No check was performed to confirm if it was yourself.
    res.render('profile', { profile: users[0], own: req.session.user?.id == userId });
});

router.post('/:id/update', async (req, res) => {
    if (!req.session.user || req.session.user.id != req.params.id) return res.status(403).send('Unauthorised');
    const safeBio = escapeHtml(req.body.bio);
    await db.query('UPDATE users SET bio = ? WHERE id = ?', [safeBio, req.params.id]);
    res.redirect(`/profile/${req.params.id}`);
});

module.exports = router;