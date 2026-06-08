const mysql = require('mysql2/promise');

// Create a connection pool to the MySQL database container
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'myeduconnect',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Database connection pool initialized.");

module.exports = pool;
