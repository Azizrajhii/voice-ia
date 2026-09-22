-- Run this once against your XAMPP MySQL instance, e.g. via phpMyAdmin's
-- "Import" tab, or from a terminal:
--   mysql -u root -p < backend/sql/schema.sql

CREATE DATABASE IF NOT EXISTS souty
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE souty;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  transcript TEXT NOT NULL,
  reply TEXT NOT NULL,
  language VARCHAR(20) NOT NULL DEFAULT 'derja',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_messages_user_id ON messages(user_id);
