-- =============================================
-- Linux the Game — Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS `linux_game` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `linux_game`;

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_update` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `activity` BOOLEAN NOT NULL DEFAULT 1,
    `email` VARCHAR(255) NOT NULL,
    `login` VARCHAR(100) NOT NULL,
    `pass` CHAR(32) NOT NULL COMMENT 'MD5 hash',
    `filesystem` LONGTEXT COMMENT 'User filesystem JSON tree',
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_login` (`login`),
    UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
