const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

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
app.use('/', require('./routes/auth'));
app.use('/courses', require('./routes/courses'));
app.use('/profile', require('./routes/profile'));
app.use('/payment', require('./routes/payment'));

app.get('/', (req, res) => res.render('index', { user: req.session.user }));

app.listen(3000, () => console.log('Server running on port 3000'));