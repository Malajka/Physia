# Database Schema for Physia MVP

## 1. Tables with Columns, Data Types and Constraints

### 1.1 users
*Managed by Supabase Auth with default fields*
Authentication and basic user information handled by Supabase Auth
- id: UUID PRIMARY KEY
- email: VARCHAR(254) NOT NULL UNIQUE
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ

### 1.2 body_parts
- id: BIGSERIAL PRIMARY KEY
- name: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.3 muscle_tests
- id: BIGSERIAL PRIMARY KEY
- name: TEXT NOT NULL
- description: TEXT NOT NULL
- body_part_id: BIGINT NOT NULL REFERENCES body_parts(id) ON DELETE CASCADE  
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.4 exercises
- id: BIGSERIAL PRIMARY KEY
- muscle_test_id: BIGINT NOT NULL REFERENCES muscle_tests(id) ON DELETE CASCADE
- description: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.5 exercise_images
- id: BIGSERIAL PRIMARY KEY
- exercise_id: BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE
- file_path: TEXT NOT NULL
- metadata: JSONB
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.6 sessions
- id: BIGSERIAL PRIMARY KEY
- user_id: UUID REFERENCES users(id)
- body_part_id: BIGINT NOT NULL REFERENCES body_parts(id)
- pain_intensity: INTEGER NOT NULL CHECK (pain_intensity BETWEEN 1 AND 10)
- rating: BOOLEAN
- rated_at: ENUM('positive', 'negative')
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- deleted_at: TIMESTAMPTZ
- CONSTRAINT `max_sessions_per_user` CHECK (check_max_sessions_per_user(user_id, 10))

### generation_error_logs
- id:BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- error_code: VARCHAR(100) NOT NULL
- error_message: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### user_disclaimers
- user_id: UUID NOT NULL REFERENCES users(id)
- accepted_at: TIMESTAMPTZ NOT NULL

### user_sessions
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES users(id)
- login_time: TIMESTAMPTZ NOT NULL
- logout_time: TIMESTAMPTZ
- ip_address: TEXT
- user_agent: TEXT
- location_guess: TEXT
- is_mobile: BOOLEAN
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relationships Between Tables

### One-to-Many Relationships
- Users (1) → Sessions (Many)
- Users (1) → User Sessions (Many)
- Users (1) → Error Logs (Many)
- Users (1) → User Disclaimers (1) [One-to-One]
- Body Parts (1) → Muscle Tests (Many, max 3)
- Muscle Tests (1) → Exercises (1) [One-to-One]
- Exercises (1) → Exercise Images (1) [One-to-One]
- Body Parts (1) → Sessions (Many)

## 3. Indexes

- `idx_sessions_user_id` ON sessions(user_id)
- `idx_sessions_created_at` ON sessions(created_at)
- `idx_sessions_body_part_id` ON sessions(body_part_id)
- `idx_muscle_tests_body_part_id` ON muscle_tests(body_part_id)
- `idx_exercises_muscle_test_id` ON exercises(muscle_test_id)
- `idx_exercise_images_exercise_id` ON exercise_images(exercise_id)
- `idx_user_sessions_user_id` ON user_sessions(user_id)
- `idx_generation_error_logs_user_id` ON generation_error_logs(user_id)
- `idx_generation_error_logs_created_at` ON generation_error_logs(created_at)

## 4. Row Level Security Policies

### sessions
- Enable RLS
- Create policy `sessions_user_policy` to restrict users to only see and modify their own sessions
- Policy should verify user id from Supabase Auth for example auth.uid()

### generation_error_logs
- Enable RLS
- Create policy `error_logs_user_policy` to restrict users to only see their own error logs
- Policy should verify user id from Supabase Auth for example auth.uid()

### user_disclaimers
- Enable RLS
- Create policy `disclaimers_user_policy` to restrict users to only see and modify their own disclaimer records
- Policy should verify user_id = auth.uid()

### user_sessions
- Enable RLS
- Create policy `user_sessions_policy` to restrict users to only see their own session records
- Policy should verify user id from Supabase Auth for example auth.uid()

## 5. Additional Design Notes

### Data Retention
- Implement a scheduled function to run daily that deletes data older than 3 days
- This can be implemented using a Supabase Edge Function or PostgreSQL trigger
- The function should target the following tables:
  - sessions
  - generation_error_logs
  - user_sessions

### Helper Functions
1. Create a function `check_max_tests_per_body_part(body_part_id UUID, max_count INTEGER)` to enforce the maximum of 3 tests per body part
2. Create a function `check_max_sessions_per_user(user_id UUID, max_count INTEGER)` to enforce the maximum of 6 sessions per user

### Soft Delete Strategy
- The `deleted_at` column in the sessions table implements a soft delete mechanism
- Records with a non-null `deleted_at` should be excluded from normal queries using views or RLS policies
- The data retention mechanism will handle the hard delete after 3 days

### Security Considerations
- All user-related data is protected by RLS
- Medical data is stored in compliance with GDPR
- All access to data is restricted to the owning user
- Authentication is handled by Supabase Auth

### Performance Considerations
- UUIDs are used as primary keys for all tables to support potential future sharding
- Indexes are created on frequently queried columns
- Foreign key constraints include CASCADE for automatic cleanup on deletion
- TIMESTAMPTZ type is used for all timestamps to handle timezone issues properly 