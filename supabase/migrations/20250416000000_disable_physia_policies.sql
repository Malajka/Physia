/*
migration: disable_physia_policies
purpose: disable all row level security policies from physia tables and generation_error_logs
affected tables:
  - body_parts
  - muscle_tests
  - exercises
  - exercise_images
  - sessions
  - generation_error_logs
  - user_disclaimers
  - user_sessions
author: physia development team
date: 2025-04-16
*/

-- disable policies for body_parts table
drop policy if exists "body_parts_select_policy_for_anon" on body_parts;
drop policy if exists "body_parts_select_policy_for_authenticated" on body_parts;

-- disable policies for muscle_tests table
drop policy if exists "muscle_tests_select_policy_for_anon" on muscle_tests;
drop policy if exists "muscle_tests_select_policy_for_authenticated" on muscle_tests;

-- disable policies for exercises table
drop policy if exists "exercises_select_policy_for_anon" on exercises;
drop policy if exists "exercises_select_policy_for_authenticated" on exercises;

-- disable policies for exercise_images table
drop policy if exists "exercise_images_select_policy_for_anon" on exercise_images;
drop policy if exists "exercise_images_select_policy_for_authenticated" on exercise_images;

-- disable policies for sessions table
drop policy if exists "sessions_select_policy_for_authenticated" on sessions;
drop policy if exists "sessions_insert_policy_for_authenticated" on sessions;
drop policy if exists "sessions_update_policy_for_authenticated" on sessions;
drop policy if exists "sessions_delete_policy_for_authenticated" on sessions;

-- disable policies for generation_error_logs table
drop policy if exists "error_logs_select_policy_for_authenticated" on generation_error_logs;

-- disable policies for user_disclaimers table
drop policy if exists "disclaimers_select_policy_for_authenticated" on user_disclaimers;
drop policy if exists "disclaimers_insert_policy_for_authenticated" on user_disclaimers;
drop policy if exists "disclaimers_update_policy_for_authenticated" on user_disclaimers;

-- disable policies for user_sessions table
drop policy if exists "user_sessions_select_policy_for_authenticated" on user_sessions;

-- note: we're keeping row level security enabled on all tables
-- this migration only removes the specific policies 