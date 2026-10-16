-- V1_1__add_vehicle_status.sql
-- Adds status column to vehicle table for soft delete support

ALTER TABLE vehicle ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
