# Database Schema for Physia MVP

## 1. Tables

### users  
*Managed by Supabase Auth*  
- **id** UUID PRIMARY KEY  
- **email** VARCHAR(255) NOT NULL UNIQUE  
- **encrypted_password** VARCHAR NOT NULL  
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()  
- **confirmed_at** TIMESTAMPTZ  

### body_parts  
- **id** BIGSERIAL PRIMARY KEY  
- **name** TEXT NOT NULL UNIQUE  
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()  

### muscle_tests  
- **id** BIGSERIAL PRIMARY KEY  
- **body_part_id** BIGINT NOT NULL  
  REFERENCES body_parts(id) ON DELETE RESTRICT  
- **name** TEXT NOT NULL  
- **description** TEXT  
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()  
- UNIQUE(body_part_id, name)  

### exercises  
- **id** BIGSERIAL PRIMARY KEY  
- **muscle_test_id** BIGINT NOT NULL  
  REFERENCES muscle_tests(id) ON DELETE RESTRICT  
- **description** TEXT NOT NULL  
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()  

### exercise_images  
- **id** BIGSERIAL PRIMARY KEY  
- **exercise_id** BIGINT NOT NULL  
  REFERENCES exercises(id) ON DELETE CASCADE  
- **file_path** TEXT NOT NULL  
- **metadata** JSONB  
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()  

### sessions  
- **id** BIGSERIAL PRIMARY KEY  
- **user_id** UUID NOT NULL  
  REFERENCES users(id)  
- **body_part_id** BIGINT NOT NULL  
  REFERENCES body_parts(id) ON DELETE RESTRICT  
- **disclaimer_accepted_at** TIMESTAMPTZ NOT NULL DEFAULT now()  
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()  
- **training_plan** JSONB NOT NULL  

### session_tests  
- **id** BIGSERIAL PRIMARY KEY  
- **session_id** BIGINT NOT NULL  
  REFERENCES sessions(id) ON DELETE CASCADE  
- **muscle_test_id** BIGINT NOT NULL  
  REFERENCES muscle_tests(id) ON DELETE RESTRICT  
- **pain_intensity** SMALLINT NOT NULL  
  CHECK(pain_intensity BETWEEN 0 AND 10)  
- UNIQUE(session_id, muscle_test_id)  

### feedback_ratings  
- **session_id** BIGINT NOT NULL  
  REFERENCES sessions(id) ON DELETE CASCADE  
- **user_id** UUID NOT NULL  
  REFERENCES users(id)  
- **rating** SMALLINT  
  CHECK(rating IN (0,1)) — defaults to NULL  
- **rated_at** TIMESTAMPTZ DEFAULT NULL  
- PRIMARY KEY(session_id, user_id)  
- Optional consistency check:  
  ```sql
  CHECK(
    (rating IS NULL AND rated_at IS NULL)
    OR
    (rating IS NOT NULL AND rated_at IS NOT NULL)
  )
  ```  

### generation_error_logs  
- **id** BIGSERIAL PRIMARY KEY  
- **user_id** UUID NOT NULL  
  REFERENCES users(id)  
- **error_code** TEXT NOT NULL  
- **error_message** TEXT NOT NULL  
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()  

---

## 2. Relationships

- **body_parts** 1:N **muscle_tests**  
- **muscle_tests** 1:N **exercises**  
- **exercises** 1:N **exercise_images**  
- **sessions** 1:N **session_tests**  
- **sessions** 1:N **feedback_ratings**  
- **sessions** 1:N **generation_error_logs**  

---

## 3. Indexes

```sql
CREATE INDEX ON sessions(user_id);
CREATE INDEX ON sessions(body_part_id);

CREATE INDEX ON session_tests(session_id);
CREATE INDEX ON session_tests(muscle_test_id);

CREATE INDEX ON feedback_ratings(session_id);
CREATE INDEX ON feedback_ratings(user_id);

CREATE INDEX ON generation_error_logs(user_id);

-- (Optional in future) GIN INDEX ON sessions(training_plan);
```

---

## 4. Row-Level Security (RLS)

Enable RLS and restrict to own rows:

```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_sessions ON sessions
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE session_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_session_tests ON session_tests
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
  );

ALTER TABLE feedback_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_feedback ON feedback_ratings
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
  );

ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_error_logs ON generation_error_logs
  FOR ALL USING (user_id = auth.uid());
```

---

## 5. Additional Notes

- We store the entire AI‑generated exercise plan (including repetitions, AI descriptions and recommendations) in `sessions.training_plan` (JSONB), eliminating the need for a separate `session_exercises` table in the MVP.  
- JSONB provides flexible, nested storage for future enhancements.  
- ON DELETE CASCADE on session‑scoped tables ensures automatic cleanup when a session is deleted.  
- MVP does not require disclaimer versioning or advanced JSONB indexing; these can be added later if needed.  