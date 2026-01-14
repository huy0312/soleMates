-- Add audit columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Add audit columns to member_profile table
ALTER TABLE member_profile ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE member_profile ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Optional: Initialize created_at for existing records
UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
UPDATE member_profile SET created_at = NOW() WHERE created_at IS NULL;
