# REST API Plan

## 1. Resources
- **Users** – Supabase Auth (managed externally by Supabase)
- **BodyParts** – table `body_parts`
- **MuscleTests** – table `muscle_tests`
- **Exercises** – table `exercises`
- **ExerciseImages** – table `exercise_images`
- **Sessions** – table `sessions`
- **SessionTests** – table `session_tests`
- **FeedbackRatings** – table `feedback_ratings`
- **GenerationErrorLogs** – table `generation_error_logs` (internal error logging)
- **Disclaimers** – static medical disclaimer content

## 2. Endpoints

### 2.1 Disclaimers
- **GET** `/api/disclaimers/content`
  - Description: Retrieve the current medical disclaimer text to display to the user.
  - Response: 200 OK, JSON:
    ```json
    { "text": "string" }
    ```
- **POST** `/api/disclaimers/accept`
  - Description: Record that the authenticated user has accepted the disclaimer.
  - Request: none
  - Response: 200 OK, JSON:
    ```json
    { "accepted_at": "2024-01-01T12:00:00Z" }
    ```

### 2.2 BodyParts
- **GET** `/api/body_parts`
  - Description: List all available body parts.
  - Query Parameters: None
  - Response: 200 OK, array of BodyPart objects

### 2.3 MuscleTests
- **GET** `/api/body_parts/:body_part_id/muscle_tests`
  - Description: List muscle tests for a given body part.
  - Path Parameters:
    - `body_part_id` (integer, required)
  - Response: 200 OK, array of MuscleTest objects

### 2.4 Exercises
- **GET** `/api/muscle_tests/:muscle_test_id/exercises`
  - Description: List exercises for a given muscle test along with images.
  - Path Parameters:
    - `muscle_test_id` (integer, required)
  - Response: 200 OK, array of Exercise objects with associated images

### 2.5 Sessions
- **GET** `/api/sessions`
  - Description: List all sessions for the authenticated user.
  - Query Parameters:
    - `page` (integer, optional, default=1)
    - `limit` (integer, optional, default=20)
    - `body_part_id` (integer, optional)
    - `start_date` (ISO 8601 string, optional)
    - `end_date` (ISO 8601 string, optional)
  - Response: 200 OK, paginated list of Session summary objects

- **GET** `/api/sessions/:session_id`
  - Description: Retrieve detailed information for a single session.
  - Path Parameters:
    - `session_id` (integer, required)
  - Response: 200 OK, detailed Session object including `training_plan`, `session_tests`, and `feedback_rating`

- **POST** `/api/sessions`
  - Description: Create a new session and orchestrate the full training_plan generation via LLM.
  - Process Details:
    1. Verify user has accepted the disclaimer.
    2. Validate `body_part_id` exists and each `muscle_test_id` belongs to it.
    3. Begin DB transaction: insert `sessions` record (without `training_plan`) and corresponding `session_tests` entries.
    4. Retrieve from DB:
       - Body part name
       - Selected muscle tests details (name, description)
       - All exercises and associated images for those tests
    5. Construct LLM prompt by combining:
       - User inputs (bodyPart name, muscleTest names & pain intensities)
       - Exercise descriptions and image metadata
       - Instructions for generating a personalized exercise plan
    6. Call the LLM API (via OpenRouter) with the prompt and receive a structured `training_plan` JSON.
    7. Parse and validate the `training_plan` from the LLM response.
    8. Update the `sessions` record with `training_plan`.
    9. Commit the transaction. On any error, rollback and handle accordingly.
  - Request Body (JSON):
    ```json
    {
      "body_part_id": 1,
      "tests": [
        { "muscle_test_id": 10, "pain_intensity": 4 },
        { "muscle_test_id": 12, "pain_intensity": 7 }
      ]
    }
    ```
  - Response: 201 Created, detailed Session object including populated `training_plan` and inserted `session_tests`
  - Errors:
    - 400 Bad Request (invalid body_part_id or tests values)
    - 401 Unauthorized (missing/invalid token)
    - 403 Forbidden (if the user has not accepted the disclaimer; error code: `disclaimer_required`)
    - 500 Internal Server Error (LLM generation failure or transaction errors)

- **DELETE** `/api/sessions/:session_id`
  - Description: Delete a session and all related tests and feedback.
  - Path Parameters:
    - `session_id` (integer, required)
  - Response: 204 No Content

### 2.6 FeedbackRatings
- **GET** `/api/sessions/:session_id/feedback`
  - Description: Retrieve the feedback record for a session, if any. Returns rating fields even if unfilled (null).
  - Path Parameters:
    - `session_id` (integer, required)
  - Response: 200 OK, object:
    ```json
    {
      "rating": 0 | 1 | null,
      "rated_at": "2024-01-01T12:00:00Z" | null
    }
    ```
  - If no feedback record exists yet, returns 200 OK with `{ rating: null, rated_at: null }`.

- **POST** `/api/sessions/:session_id/feedback`
  - Description: Submit or update a feedback rating for a session.
  - Request Body (JSON):
    ```json
    {
      "rating": 1
    }
    ```
  - Response: 200 OK, updated FeedbackRating object

### 2.7 Account Management
- **DELETE** `/api/account`
  - Description: Delete the authenticated user and all associated data (sessions, tests, feedback, etc.).
  - Response: 204 No Content

## 3. Authentication & Authorization
- Mechanism: Supabase Auth using JWT Bearer tokens.
- Requirement: All endpoints under `/api/` (except `/api/body_parts` and static content) require `Authorization: Bearer <token>` header.
- Row-Level Security (RLS) in PostgreSQL restricts access so users can only operate on their own `sessions`, `session_tests`, `feedback_ratings`, and `generation_error_logs`.

## 4. Validation & Business Logic
- **painIntensity**: integer between 0 and 10 (DB CHECK constraint).
- **rating**: nullable integer (0 or 1) (DB CHECK constraint); unique per `(sessionId, userId)`; defaults to null until user submits feedback.
- **Session Creation Flow**:
  1. Check disclaimer acceptance in auth context.
  2. Validate `bodyPartId` and associated `muscleTestId` values against DB.
  3. Create initial session and test records within a transaction.
  4. Fetch muscle_tests, exercises, and exercise_images for selected tests.
  5. Build LLM prompt:
     - Include body part name, test names & pain intensities.
     - Attach exercise descriptions and image metadata.
     - Ask for a structured plan (reps, sets, descriptions).
  6. Send prompt to LLM service (OpenRouter) and receive JSON response.
  7. Validate LLM output schema as `training_plan`.
  8. Update session record with `training_plan` and commit.
  9. On any error (validation or LLM failure), rollback, log to `generation_error_logs`, and return 500.
- **Session List** supports pagination, filtering by `bodyPartId`, and date range.
- **Error Codes**:
  - 400 Bad Request for validation errors
  - 401 Unauthorized for missing/invalid token
  - 403 Forbidden for RLS/permission violations or if disclaimer not accepted (`disclaimer_required`)
  - 404 Not Found for missing resources
  - 500 Internal Server Error for unexpected failures