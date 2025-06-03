-- Migration to add Google OAuth tokens to users table
-- Run this in your database console if the columns don't exist

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token VARCHAR,
ADD COLUMN IF NOT EXISTS google_refresh_token VARCHAR;
