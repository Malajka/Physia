-- Migration: 20241018000000_disable_policies.sql
-- Description: Disable row level security for specific tables
-- Purpose: Completely disables security policies by turning off RLS
-- Author: Physia Team
-- Date: 2024-10-18

-- Note: 'generations' table was not found in the previous migrations

-- -----------------------------------------
-- Disable row level security for sessions
-- -----------------------------------------
alter table sessions disable row level security;

-- -----------------------------------------
-- Disable row level security for session_tests
-- -----------------------------------------
alter table session_tests disable row level security;

-- -----------------------------------------
-- Disable row level security for exercises
-- -----------------------------------------
alter table exercises disable row level security;

-- -----------------------------------------
-- Disable row level security for generation_error_logs
-- -----------------------------------------
alter table generation_error_logs disable row level security;

-- Note: Disabling row level security allows unrestricted access to these tables
-- The existing policies remain in the database but are no longer enforced 