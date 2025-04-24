-- Migration: 20241017120000_create_initial_schema.sql
-- Description: Initial schema setup for Physia MVP
-- Purpose: Creates all required tables, relationships, indexes, and security policies
-- Author: Automated Migration Generator
-- Date: 2024-10-17

-- -----------------------------------------
-- table: disclaimers
-- purpose: stores the current disclaimer text for the MVP
-- -----------------------------------------
create table if not exists disclaimers (
  id bigserial primary key,
  content text not null,
  updated_at timestamptz not null default now()
);

-- enable row level security on disclaimers
alter table disclaimers enable row level security;
comment on table disclaimers is 'Table holding current disclaimer text visible in the app';

-- public access policies for disclaimers (read-only)
create policy "Anyone can view disclaimers"
  on disclaimers for select to anon using (true);
create policy "Authenticated users can view disclaimers"
  on disclaimers for select to authenticated using (true);

-- only service role can modify disclaimer content
create policy "Service role can insert disclaimers"
  on disclaimers for insert to authenticated with check (auth.role() = 'service_role');
create policy "Service role can update disclaimers"
  on disclaimers for update to authenticated using (auth.role() = 'service_role');
create policy "Service role can delete disclaimers"
  on disclaimers for delete to authenticated using (auth.role() = 'service_role');

-- -----------------------------------------
-- table: body_parts
-- purpose: stores anatomical body parts that users can select for assessments
-- -----------------------------------------
create table if not exists body_parts (
  id bigserial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- enable row level security for body_parts table
alter table body_parts enable row level security;

-- public access policies for body_parts
-- anyone can read body parts (both anonymous and authenticated users)
comment on table body_parts is 'List of anatomical body parts available for selection';

create policy "Anyone can view body parts" 
  on body_parts 
  for select 
  to anon 
  using (true);

create policy "Authenticated users can view body parts" 
  on body_parts 
  for select 
  to authenticated 
  using (true);

-- only authenticated service roles can modify body parts
create policy "Only service role can insert body parts" 
  on body_parts 
  for insert 
  to authenticated 
  with check (auth.role() = 'service_role');

create policy "Only service role can update body parts" 
  on body_parts 
  for update 
  to authenticated 
  using (auth.role() = 'service_role');

create policy "Only service role can delete body parts" 
  on body_parts 
  for delete 
  to authenticated 
  using (auth.role() = 'service_role');

-- -----------------------------------------
-- table: muscle_tests
-- purpose: stores tests associated with body parts to assess pain/function
-- -----------------------------------------
create table if not exists muscle_tests (
  id bigserial primary key,
  body_part_id bigint not null references body_parts(id) on delete restrict,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique(body_part_id, name)
);

-- enable row level security for muscle_tests table
alter table muscle_tests enable row level security;

comment on table muscle_tests is 'Tests for assessing muscle pain/function for specific body parts';

-- public access policies for muscle_tests
create policy "Anyone can view muscle tests" 
  on muscle_tests 
  for select 
  to anon 
  using (true);

create policy "Authenticated users can view muscle tests" 
  on muscle_tests 
  for select 
  to authenticated 
  using (true);

-- only authenticated service roles can modify muscle tests
create policy "Only service role can insert muscle tests" 
  on muscle_tests 
  for insert 
  to authenticated 
  with check (auth.role() = 'service_role');

create policy "Only service role can update muscle tests" 
  on muscle_tests 
  for update 
  to authenticated 
  using (auth.role() = 'service_role');

create policy "Only service role can delete muscle tests" 
  on muscle_tests 
  for delete 
  to authenticated 
  using (auth.role() = 'service_role');

-- -----------------------------------------
-- table: exercises
-- purpose: stores exercise prescriptions associated with muscle tests
-- -----------------------------------------
create table if not exists exercises (
  id bigserial primary key,
  muscle_test_id bigint not null references muscle_tests(id) on delete restrict,
  description text not null,
  created_at timestamptz not null default now()
);

-- enable row level security for exercises table
alter table exercises enable row level security;

comment on table exercises is 'Exercise prescriptions associated with specific muscle tests';

-- public access policies for exercises
create policy "Anyone can view exercises" 
  on exercises 
  for select 
  to anon 
  using (true);

create policy "Authenticated users can view exercises" 
  on exercises 
  for select 
  to authenticated 
  using (true);

-- only authenticated service roles can modify exercises
create policy "Only service role can insert exercises" 
  on exercises 
  for insert 
  to authenticated 
  with check (auth.role() = 'service_role');

create policy "Only service role can update exercises" 
  on exercises 
  for update 
  to authenticated 
  using (auth.role() = 'service_role');

create policy "Only service role can delete exercises" 
  on exercises 
  for delete 
  to authenticated 
  using (auth.role() = 'service_role');

-- -----------------------------------------
-- table: exercise_images
-- purpose: stores images associated with exercises
-- -----------------------------------------
create table if not exists exercise_images (  
  id bigserial primary key,
  exercise_id bigint not null references exercises(id) on delete cascade,
  file_path text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- enable row level security for exercise_images table
alter table exercise_images enable row level security; 

comment on table exercise_images is 'Images associated with exercises for visual guidance';

-- public access policies for exercise_images
create policy "Anyone can view exercise images" 
  on exercise_images 
  for select 
  to anon 
  using (true);

create policy "Authenticated users can view exercise images" 
  on exercise_images 
  for select 
  to authenticated 
  using (true);

-- only authenticated service roles can modify exercise images
create policy "Only service role can insert exercise images" 
  on exercise_images 
  for insert 
  to authenticated 
  with check (auth.role() = 'service_role');

create policy "Only service role can update exercise images" 
  on exercise_images 
  for update 
  to authenticated 
  using (auth.role() = 'service_role');

create policy "Only service role can delete exercise images" 
  on exercise_images 
  for delete 
  to authenticated 
  using (auth.role() = 'service_role');

-- -----------------------------------------
-- table: sessions
-- purpose: stores user assessment sessions
-- -----------------------------------------
create table if not exists sessions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body_part_id bigint not null references body_parts(id) on delete restrict,
  disclaimer_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  training_plan jsonb not null
);

-- enable row level security for sessions table
alter table sessions enable row level security;

comment on table sessions is 'User assessment sessions with generated training plans';

-- user-specific access policies for sessions
create policy "Users can view their own sessions" 
  on sessions 
  for select 
  to authenticated 
  using (user_id = auth.uid());

create policy "Users can insert their own sessions" 
  on sessions 
  for insert 
  to authenticated 
  with check (user_id = auth.uid());

create policy "Users can update their own sessions" 
  on sessions 
  for update 
  to authenticated 
  using (user_id = auth.uid());

create policy "Users can delete their own sessions" 
  on sessions 
  for delete 
  to authenticated 
  using (user_id = auth.uid());

-- -----------------------------------------
-- table: session_tests
-- purpose: stores test results for each session
-- -----------------------------------------
create table if not exists session_tests (
  id bigserial primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  muscle_test_id bigint not null references muscle_tests(id) on delete restrict,
  pain_intensity smallint not null check(pain_intensity between 0 and 10),
  unique(session_id, muscle_test_id)
);

-- enable row level security for session_tests table
alter table session_tests enable row level security;

comment on table session_tests is 'Pain assessment results for specific tests in a session';

-- user-specific access policies for session_tests
create policy "Users can view their own session tests" 
  on session_tests 
  for select 
  to authenticated 
  using (
    session_id in (select id from sessions where user_id = auth.uid())
  );

create policy "Users can insert their own session tests" 
  on session_tests 
  for insert 
  to authenticated 
  with check (
    session_id in (select id from sessions where user_id = auth.uid())
  );

create policy "Users can update their own session tests" 
  on session_tests 
  for update 
  to authenticated 
  using (
    session_id in (select id from sessions where user_id = auth.uid())
  );

create policy "Users can delete their own session tests" 
  on session_tests 
  for delete 
  to authenticated 
  using (
    session_id in (select id from sessions where user_id = auth.uid())
  );

-- -----------------------------------------
-- table: feedback_ratings
-- purpose: stores user feedback on generated plans
-- -----------------------------------------
create table if not exists feedback_ratings (
  session_id bigint not null references sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  rating smallint check(rating in (0,1)),
  rated_at timestamptz default null,
  primary key(session_id, user_id),
  check(
    (rating is null and rated_at is null)
    or
    (rating is not null and rated_at is not null)
  )
);

-- enable row level security for feedback_ratings table
alter table feedback_ratings enable row level security;

comment on table feedback_ratings is 'User feedback on generated training plans';

-- user-specific access policies for feedback_ratings
create policy "Users can view their own feedback" 
  on feedback_ratings 
  for select 
  to authenticated 
  using (user_id = auth.uid());

create policy "Users can insert their own feedback" 
  on feedback_ratings 
  for insert 
  to authenticated 
  with check (user_id = auth.uid());

create policy "Users can update their own feedback" 
  on feedback_ratings 
  for update 
  to authenticated 
  using (user_id = auth.uid());

create policy "Users can delete their own feedback" 
  on feedback_ratings 
  for delete 
  to authenticated 
  using (user_id = auth.uid());

-- -----------------------------------------
-- table: generation_error_logs
-- purpose: logs errors that occur during plan generation
-- -----------------------------------------
create table if not exists generation_error_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id),
  error_code text not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

-- enable row level security for generation_error_logs table
alter table generation_error_logs enable row level security;

comment on table generation_error_logs is 'Logs of errors during training plan generation';

-- user and service access policies for generation_error_logs
create policy "Users can view their own error logs" 
  on generation_error_logs 
  for select 
  to authenticated 
  using (user_id = auth.uid());

create policy "Users can insert their own error logs" 
  on generation_error_logs 
  for insert 
  to authenticated 
  with check (user_id = auth.uid());

create policy "Service role can view all error logs" 
  on generation_error_logs 
  for select 
  to authenticated 
  using (auth.role() = 'service_role');

-- -----------------------------------------
-- create indexes for performance optimization
-- -----------------------------------------
create index on sessions(user_id);
create index on sessions(body_part_id);

create index on session_tests(session_id);
create index on session_tests(muscle_test_id);

create index on feedback_ratings(session_id);
create index on feedback_ratings(user_id);

create index on generation_error_logs(user_id); 