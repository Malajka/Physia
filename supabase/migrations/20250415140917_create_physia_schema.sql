/*
migration: create_physia_schema
purpose: initial setup of the database schema for the physia mvp
tables created:
  - body_parts
  - muscle_tests
  - exercises
  - exercise_images
  - sessions
  - generation_error_logs
  - user_disclaimers
  - user_sessions
helper functions:
  - check_max_tests_per_body_part
  - check_max_sessions_per_user
security: row level security enabled for all user-related tables
author: physia development team
date: 2025-04-15
*/

-- helper functions for constraint checks

-- function to check if a body part has not exceeded maximum allowed tests
create or replace function check_max_tests_per_body_part(body_part_id bigint, max_count integer)
returns boolean as $$
begin
  return (
    select count(*) <= max_count
    from muscle_tests
    where muscle_tests.body_part_id = $1
  );
end;
$$ language plpgsql security definer;

-- function to check if a user has not exceeded maximum allowed sessions
create or replace function check_max_sessions_per_user(user_id uuid, max_count integer)
returns boolean as $$
begin
  return (
    select count(*) <= max_count
    from sessions
    where sessions.user_id = $1
    and sessions.deleted_at is null
  );
end;
$$ language plpgsql security definer;

-- function to automatically delete data older than 3 days
create or replace function delete_old_data()
returns trigger as $$
begin
  -- delete sessions older than 3 days
  delete from sessions where created_at < now() - interval '3 days';
  
  -- delete error logs older than 3 days
  delete from generation_error_logs where created_at < now() - interval '3 days';
  
  -- delete user session records older than 3 days
  delete from user_sessions where created_at < now() - interval '3 days';
  
  return null;
end;
$$ language plpgsql security definer;

-- body_parts table - stores the 6 main body areas that can be selected
create table if not exists body_parts (
  id bigserial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- enable rls on body_parts (public read access, admin write access)
alter table body_parts enable row level security;

-- muscle_tests table - stores the muscle pain assessment tests for each body part
create table if not exists muscle_tests (
  id bigserial primary key,
  name text not null,
  description text not null,
  body_part_id bigint not null references body_parts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint max_tests_per_body_part check (check_max_tests_per_body_part(body_part_id, 3))
);

-- enable rls on muscle_tests (public read access, admin write access)
alter table muscle_tests enable row level security;

-- exercises table - stores exercise descriptions linked to muscle tests
create table if not exists exercises (
  id bigserial primary key,
  muscle_test_id bigint not null references muscle_tests(id) on delete cascade,
  description text not null,
  created_at timestamptz not null default now()
);

-- enable rls on exercises (public read access, admin write access)
alter table exercises enable row level security;

-- exercise_images table - stores paths to exercise images
create table if not exists exercise_images (
  id bigserial primary key,
  exercise_id bigint not null references exercises(id) on delete cascade,
  file_path text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- enable rls on exercise_images (public read access, admin write access)
alter table exercise_images enable row level security;

-- sessions table - stores user exercise sessions with feedback
create table if not exists sessions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body_part_id bigint not null references body_parts(id),
  pain_intensity integer not null check (pain_intensity between 1 and 10),
  rating boolean,
  rated_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint max_sessions_per_user check (check_max_sessions_per_user(user_id, 10))
);

-- enable rls on sessions (user-specific access)
alter table sessions enable row level security;

-- generation_error_logs table - tracks errors during exercise generation
create table if not exists generation_error_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  error_code varchar(100) not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

-- enable rls on generation_error_logs (user-specific access)
alter table generation_error_logs enable row level security;

-- user_disclaimers table - tracks acceptance of medical disclaimer
create table if not exists user_disclaimers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  accepted_at timestamptz not null
);

-- enable rls on user_disclaimers (user-specific access)
alter table user_disclaimers enable row level security;

-- user_sessions table - tracks user login/logout activity
create table if not exists user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  login_time timestamptz not null,
  logout_time timestamptz,
  ip_address text,
  user_agent text,
  location_guess text,
  is_mobile boolean,
  created_at timestamptz not null default now()
);

-- enable rls on user_sessions (user-specific access)
alter table user_sessions enable row level security;

-- create indexes for performance optimization
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_created_at on sessions(created_at);
create index if not exists idx_sessions_body_part_id on sessions(body_part_id);
create index if not exists idx_muscle_tests_body_part_id on muscle_tests(body_part_id);
create index if not exists idx_exercises_muscle_test_id on exercises(muscle_test_id);
create index if not exists idx_exercise_images_exercise_id on exercise_images(exercise_id);
create index if not exists idx_user_sessions_user_id on user_sessions(user_id);
create index if not exists idx_generation_error_logs_user_id on generation_error_logs(user_id);
create index if not exists idx_generation_error_logs_created_at on generation_error_logs(created_at);

-- create scheduled trigger for automatic data deletion
create trigger trigger_delete_old_data
  after insert on sessions
  execute procedure delete_old_data();

-- row level security policies

-- body_parts policies
-- allow anyone to view body parts
create policy "body_parts_select_policy_for_anon" 
  on body_parts for select 
  to anon 
  using (true);

create policy "body_parts_select_policy_for_authenticated" 
  on body_parts for select 
  to authenticated 
  using (true);

-- only allow authenticated users with admin rights to modify body parts
-- these would need to be implemented based on your admin role setup

-- muscle_tests policies
-- allow anyone to view muscle tests
create policy "muscle_tests_select_policy_for_anon" 
  on muscle_tests for select 
  to anon 
  using (true);

create policy "muscle_tests_select_policy_for_authenticated" 
  on muscle_tests for select 
  to authenticated 
  using (true);

-- exercises policies
-- allow anyone to view exercises
create policy "exercises_select_policy_for_anon" 
  on exercises for select 
  to anon 
  using (true);

create policy "exercises_select_policy_for_authenticated" 
  on exercises for select 
  to authenticated 
  using (true);

-- exercise_images policies
-- allow anyone to view exercise images
create policy "exercise_images_select_policy_for_anon" 
  on exercise_images for select 
  to anon 
  using (true);

create policy "exercise_images_select_policy_for_authenticated" 
  on exercise_images for select 
  to authenticated 
  using (true);

-- sessions policies
-- users can only see their own sessions
create policy "sessions_select_policy_for_authenticated" 
  on sessions for select 
  to authenticated 
  using (user_id = auth.uid());

-- users can onlfdisclaimery insert their own sessions
create policy "sessions_insert_policy_for_authenticated" 
  on sessions for insert 
  to authenticated 
  with check (user_id = auth.uid());

-- users can only update their own sessions
create policy "sessions_update_policy_for_authenticated" 
  on sessions for update 
  to authenticated 
  using (user_id = auth.uid()) 
  with check (user_id = auth.uid());

-- users can only delete their own sessions
create policy "sessions_delete_policy_for_authenticated" 
  on sessions for delete 
  to authenticated 
  using (user_id = auth.uid());

-- generation_error_logs policies
-- users can only see their own error logs
create policy "error_logs_select_policy_for_authenticated" 
  on generation_error_logs for select 
  to authenticated 
  using (user_id = auth.uid());

-- user_disclaimers policies
-- users can only see their own disclaimer acceptance
create policy "disclaimers_select_policy_for_authenticated" 
  on user_disclaimers for select 
  to authenticated 
  using (user_id = auth.uid());

-- users can only insert their own disclaimer acceptance
create policy "disclaimers_insert_policy_for_authenticated" 
  on user_disclaimers for insert 
  to authenticated 
  with check (user_id = auth.uid());

-- users can only update their own disclaimer acceptance
create policy "disclaimers_update_policy_for_authenticated" 
  on user_disclaimers for update 
  to authenticated 
  using (user_id = auth.uid()) 
  with check (user_id = auth.uid());

-- user_sessions policies
-- users can only see their own session records
create policy "user_sessions_select_policy_for_authenticated" 
  on user_sessions for select 
  to authenticated 
  using (user_id = auth.uid());

-- insert policy for user_sessions would typically be handled by the application or a trigger
-- based on authentication events

-- seed initial body parts data (the 6 required body parts)
insert into body_parts (name) values
  ('Neck and upper back'),
  ('Lower back'),
  ('Wrists and forearms'),
  ('Hips'),
  ('Shoulders'),
  ('Knees')
on conflict (name) do nothing;

create or replace function validate_rating_with_timestamp()
returns trigger as $$
begin
  if new.rating is not null and new.rated_at is null then
    raise exception 'Rating cannot be set without rated_at timestamp';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_rating_timestamp
before insert or update on sessions
for each row execute function validate_rating_with_timestamp(); 