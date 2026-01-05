-- Create Database
CREATE DATABASE IF NOT EXISTS mess_rating_system;
USE mess_rating_system;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messes Table
CREATE TABLE messes (
    mess_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ratings Table
CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mess_id INT NOT NULL,
    rating_value TINYINT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    feedback TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (mess_id) REFERENCES messes(mess_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_mess (user_id, mess_id),
    INDEX idx_mess (mess_id),
    INDEX idx_user (user_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Sample Messes
INSERT INTO messes (name, location, description) VALUES
('North Campus Mess', 'North Wing, Building A', 'Vegetarian meals with daily special thalis'),
('South Campus Dining', 'South Block, Level 1', 'Multi-cuisine with separate Jain counter'),
('Hostel Mess Block C', 'Hostel C Ground Floor', 'Budget-friendly meals for residents'),
('Central Cafeteria', 'Main Campus Center', 'Quick bites and full meals available'),
('West Wing Food Court', 'West Building, Floor 2', 'Premium dining with variety options');

-- Insert Sample Admin User (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@mess.edu', '$2a$10$jdXQT1T6uiXyiAblpapy7ec32PJSlsds14yKaRf7NyKBAnCHy9UwK', 'admin');

-- Views for Analytics
CREATE VIEW mess_ratings_summary AS
SELECT 
    m.mess_id,
    m.name,
    m.location,
    COUNT(r.rating_id) as total_ratings,
    COALESCE(AVG(r.rating_value), 0) as avg_rating,
    COALESCE(MAX(r.date), NULL) as last_rated
FROM messes m
LEFT JOIN ratings r ON m.mess_id = r.mess_id
WHERE m.is_active = TRUE
GROUP BY m.mess_id, m.name, m.location;