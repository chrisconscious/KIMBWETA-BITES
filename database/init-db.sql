-- Create user if not exists
DO $$ BEGIN
    CREATE ROLE kimbweta_user WITH LOGIN PASSWORD 'kimbweta2024' CREATEDB;
    RAISE NOTICE 'User kimbweta_user created';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'User kimbweta_user already exists';
END $$;

-- Create database if not exists
DO $$ BEGIN
    CREATE DATABASE kimbweta OWNER kimbweta_user;
    RAISE NOTICE 'Database kimbweta created';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Database kimbweta already exists';
END $$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kimbweta TO kimbweta_user;

-- Connect to database and add extensions
\c kimbweta

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Verify
SELECT current_database() as database, current_user as user;
