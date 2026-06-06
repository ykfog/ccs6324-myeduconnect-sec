const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/enroll', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { course_id } = req.body;
    await db.query('INSERT INTO enrollments (user_id, course_id, payment_status) VALUES (?, ?, ?)', [req.session.user.id, course_id, 'paid']);
    res.send('Enrolled successfully');
});

router.get('/checkout/:courseId', (req, res) => res.render('payment', { courseId: req.params.courseId }));
module.exports = router;
