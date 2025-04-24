# API Endpoint Implementation Plan: POST /api/sessions

## 1. Endpoint Overview
Create a new muscle-testing session for an authenticated user, generate a personalized exercise plan using an LLM (OpenRouter.ai), and then save the result in the database.

## 2. Request Details
- HTTP Method: POST
- Endpoint: `/api/sessions`
- Headers:
  - `Authorization: Bearer <token>` (required)
- URL Parameters: none
- Body (JSON):
  ```json
  {
    "body_part_id": 1,
    "tests": [
      { "muscle_test_id": 10, "pain_intensity": 4 },
      { "muscle_test_id": 12, "pain_intensity": 7 }
    ]
  }
  ```
- Parameters:
  - Required:
    - `body_part_id`: number – an existing body part ID
    - `tests`: non-empty array of `{ muscle_test_id: number; pain_intensity: number (0–10) }`
  - Optional: none

## 3. Types Used
- `CreateSessionCommandDto` (request model)
- `SessionDetailDto` (response model)
- `SessionTestDto`
- `FeedbackRatingDto`
- `Json` (aliased from DB definitions) for the `training_plan` field

## 4. Response Details
- Status Code: `201 Created`
- Body (JSON): a `SessionDetailDto` object, for example:
  ```json
  {
    "id": 123,
    "body_part_id": 1,
    "user_id": "uuid-...",
    "disclaimer_accepted_at": "2024-01-01T12:00:00Z",
    "created_at": "2024-01-01T12:05:00Z",
    "training_plan": { /* complex JSON plan */ },
    "session_tests": [ /* array of SessionTestDto */ ],
    "feedback_rating": { /* FeedbackRatingDto or null */ }
  }
  ```

## 5. Data Flow
1. **Middleware / Auth**: retrieve `userId` via `context.locals.supabase.auth.getUser()` and validate the token.
2. **Input Validation (Zod)**: define `CreateSessionCommandDto` schema in `src/pages/api/sessions/index.ts` to validate `body_part_id` and `tests`.
3. **Disclaimer Check**: verify that the user has accepted the disclaimer; if not, return 403 (`disclaimer_required`).
4. **Service Layer** (`session.service.createSession`):
   1. Begin a Supabase transaction (RPC or SQL transaction).
   2. Confirm that `body_part_id` exists in `body_parts`; return 404 if absent.
   3. Fetch valid `muscle_test_id`s for that `body_part_id` and compare against request `tests`; return 404 on mismatch.
   4. Insert a new row into `sessions` (without `training_plan`) with `user_id`, `body_part_id`, and `disclaimer_accepted_at`.
   5. Batch-insert into `session_tests` (fields: `session_id`, `muscle_test_id`, `pain_intensity`).
   6. Retrieve prompt data: body part name, test details (name, description), exercises and their images.
   7. Construct the LLM prompt according to business guidelines.
   8. Call OpenRouter.ai and receive the raw JSON `training_plan`.
   9. Validate the structure of `training_plan` (using Zod or manually).
   10. Update the `sessions` row with the `training_plan` field.
   11. Commit the transaction.
5. **Response**: return the populated `SessionDetailDto`, including `training_plan`.

## 6. Security Considerations
- Authentication: Bearer JWT header required, validated in middleware.
- Authorization: Supabase row-level security (RLS) ensures access only to own resources.
- Data Validation: Zod enforces format and range (0–10 for `pain_intensity`).
- Request Size Limits: enforce a maximum number of tests (e.g. max 10).
- Prompt Sanitization: prevent injections and overly costly content.

## 7. Error Handling

| Status | Scenario                                                    | Action                                                                    |
|--------|-------------------------------------------------------------|---------------------------------------------------------------------------|
| 400    | Invalid JSON or Zod schema violation                        | `400 Bad Request` with validation details                                 |
| 401    | Missing or invalid token                                    | `401 Unauthorized`                                                        |
| 403    | Disclaimer not accepted (`disclaimer_required`)             | `403 Forbidden`, error code `disclaimer_required`                         |
| 404    | Non-existent `body_part_id` or `muscle_test_id`             | `404 Not Found`                                                           |
| 500    | Internal error: DB, LLM call, transaction failure           | Log to `generation_error_logs` and return `500 Internal Server Error`     |

## 8. Performance Considerations
- Batch-insert multiple `session_tests` records.
- Limit the number of tests per request (e.g. max 10–15) for load control.
- Efficiently fetch related records (`muscle_tests`, `exercises`, `exercise_images`) in one query or via `.select()`.
- Cache static exercise descriptions and image metadata when appropriate.
- Configure a 60-second timeout for the AI call; if the limit is exceeded, return a timeout error.
- Consider synchronous generation processing fallback under high-load scenarios.
- Implement monitoring and alerting to track endpoint and AI service performance (latency, error rates).

## 9. Implementation Steps
- Use mock AI service responses during development instead of real AI calls.
1. Add Zod schema `CreateSessionCommandDto` in `src/pages/api/sessions/index.ts`.
2. Configure authentication middleware (Supabase Auth) and disclaimer acceptance check.
3. Create `src/lib/services/session.service.ts` with a `createSession` method.
4. Implement transactional logic in the service following section 5.
5. Add OpenRouter.ai client and prompt-builder function.
6. Implement validation for the returned `training_plan`.
7. Log errors to `generation_error_logs` on generation failure.

---
*All changes must comply with project guidelines (Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui, Supabase, Zod).*