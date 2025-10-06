-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if not exists
-- This will be handled by docker-compose environment variables

-- Initial setup for the database
SELECT 'Database initialized successfully' as message;
