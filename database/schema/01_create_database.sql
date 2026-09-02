-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: 01_create_database.sql
-- Description: Creates the voltix_db database with utf8mb4 encoding.
-- Phase: Week 3 - Database Implementation
-- ============================================================================

-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS voltix_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Switch to the newly created database
USE voltix_db;

-- Display confirmation
SELECT 'Database voltix_db created and selected successfully.' AS status;
