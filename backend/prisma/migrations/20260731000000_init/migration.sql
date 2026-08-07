-- Create initial tables for Aether Social Media Platform
-- This is the production schema migration

-- Users table already exists via Prisma generate

-- Add any additional indexes and constraints if needed
CREATE INDEX IF NOT EXISTS idx_user_email ON "User" (email);
CREATE INDEX IF NOT EXISTS idx_post_status ON "Post" (status);
CREATE INDEX IF NOT EXISTS idx_scheduled_date ON "ScheduledPost" (scheduledFor);
