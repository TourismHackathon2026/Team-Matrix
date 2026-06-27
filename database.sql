-- ============================================================
-- TravelVoice Database Schema
-- Run this file in phpMyAdmin or via MySQL CLI to set up the DB
-- ============================================================

CREATE DATABASE IF NOT EXISTS travelvoice;
USE travelvoice;

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== COMPLAINTS TABLE ====================
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    place VARCHAR(200) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== REVIEWS TABLE ====================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    place VARCHAR(200) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== SEED DATA ====================
-- Default admin account (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@travelvoice.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE name = name;

-- Seed complaints
INSERT INTO complaints (name, place, title, description, status) VALUES
('Admin', 'Hotel Himalayan', 'Overcharged in Hotel', 'The hotel charged me extra for services I did not use.', 'pending'),
('Admin', 'Lakeside Area', 'Dirty Environment', 'The lakeside area was very dirty with trash everywhere.', 'resolved');
