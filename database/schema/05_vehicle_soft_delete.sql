-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: 05_vehicle_soft_delete.sql
-- Description: Adds lifecycle status column to vehicle table to support soft
--              deletion without violating referential integrity for historical
--              reservations, charging sessions, and tax invoices.
-- ============================================================================

USE voltix_db;

-- 1. Add status column if not already present
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'voltix_db' 
  AND TABLE_NAME = 'vehicle' 
  AND COLUMN_NAME = 'status';

SET @stmt = IF(@col_exists = 0,
    'ALTER TABLE vehicle ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT \'ACTIVE\';',
    'SELECT \'Column status already exists on table vehicle\' AS info;');

PREPARE exec_stmt FROM @stmt;
EXECUTE exec_stmt;
DEALLOCATE PREPARE exec_stmt;
