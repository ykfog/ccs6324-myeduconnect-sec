const express = require('express');
const router = express.Router();
const db = require('../db');
const escapeHtml = require('escape-html');

router.get('/', async (req, res) => {
    let search = req.query.search || '';
    const [courses] = await db.query('SELECT * FROM courses WHERE title LIKE ?', [`%${search}%`]);
    res.render('courses', { courses, search });
});

router.get('/:id', async (req, res) => {
    const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    const [comments] = await db.query('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE course_id = ?', [req.params.id]);
    res.render('course_detail', { course: course[0], comments });
});

router.post('/:id/comment', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { comment } = req.body;
    // No escaping or filtering performed
    await db.query('INSERT INTO comments (user_id, course_id, comment) VALUES (?, ?, ?)', [req.session.user.id, req.params.id, comment]);
    res.redirect(`/courses/${req.params.id}`);
});

module.exports = router;