-- Create the missing tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255),
    bio TEXT
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    course_id INT,
    comment TEXT
);

CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    course_id INT,
    payment_status VARCHAR(50)
);

-- Insert dummy courses for the website
INSERT IGNORE INTO courses (title, description) VALUES 
('Introduction to Cybersecurity', 'Learn the basics of securing networks and identifying vulnerabilities.'),
('Advanced Web Exploitation', 'Dive deep into XSS, SQLi, and IDOR vulnerabilities.');

-- Insert a test admin user (Password is 'admin123' hashed in MD5)
INSERT IGNORE INTO users (username, password, fullname, bio) VALUES
('admin', MD5('admin123'), 'System Administrator', 'I am the platform administrator.');
