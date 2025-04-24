# REST API Plan for Physia - MVP

## 1. Resources
- **Body Parts** - Anatomical areas that can experience pain
- **Muscle Tests** - Muscles tests linked to Body Parts(maximum 3 per body part)
- **Exercises** - Exercise recommendations linked to muscle tests
- **Excercise Image** - Image linekd to each excercise
- **Sessions** - Records of user pain data and exercise recommendations
- **Disclaimers** - Medical disclaimers that users must accept
- **Feedback** - User ratings of exercise effectiveness

## 2. Endpoints

> **Note on Authentication:** All endpoints requiring authentication automatically identify the user from the JWT token. The `user_id` is never required in requests and is implicitly used by the server for all operations.

### Disclaimers

#### GET /api/disclaimers/content
- **Description**: Retrieve the medical disclaimer content
- **Response**: 
  ```json
  {
    "text": "string"
  }
  ```
- **Success**: 200 OK
- **Errors**: 500 Internal Server Error

#### POST /api/disclaimers
- **Description**: Check and/or update current user's disclaimer acceptance status. If no disclaimer has been accepted, this endpoint will record the acceptance.
- **Authorization**: Requires authentication - user is identified from JWT token
- **Response**: 
  ```json
  {
    "user_id": "uuid", // The authenticated user's ID
    "accepted_at": "timestamp"|null
  }
  ```
- **Success**: 200 OK (for status check), 201 Created (for new acceptance)
- **Errors**: 401 Unauthorized

### Body Parts

#### GET /api/body-parts
- **Description**: Retrieve list of available body parts
- **Response**: 
  ```json
  [
    {
      "id": "number",
      "name": "string"
    }
  ]
  ```
- **Success**: 200 OK
- **Errors**: 401 Unauthorized

### Sessions

#### POST /api/sessions
- **Description**: Create new pain data session
- **Request**: 
  ```json
  {
    "body_part_id": "number",
    "pain_intensity": "number"
  }
  ```
- **Response**: 
  ```json
  {
    "id": "number",
    "body_part": {
      "id": "number",
      "name": "string"
    },
    "pain_intensity": "number",
    "created_at": "timestamp"
  }
  ```
- **Success**: 201 Created
- **Errors**: 
  - 400 Bad Request (invalid data)
  - 401 Unauthorized
  - 403 Forbidden (disclaimer not accepted)
  - 429 Too Many Requests (session limit reached)

#### GET /api/sessions
- **Description**: Retrieve user's most recent pain data sessions
- **Response**: 
  ```json
  [
    {
      "id": "number",
      "body_part": {
        "id": "number",
        "name": "string"
      },
      "pain_intensity": "number",
      "created_at": "timestamp",
      "rating": "boolean|null",
      "rated_at": "timestamp|null"
    }
  ]
  ```
- **Success**: 200 OK
- **Errors**: 401 Unauthorized

### Exercises

#### GET /api/sessions/{sessionId}/exercises
- **Description**: Generate or retrieve exercises for a session
- **Process**:
  1. Retrieves session data (body part, pain intensity)
  2. Fetches related muscle tests and exercises from the database
  3. Calls OpenRouter AI with context data
  4. Stores AI-enhanced exercise descriptions
  5. Returns combined original and AI-enhanced data
- **Response**: 
  ```json
  [
    {
      "id": "number",
      "description": "string",
      "ai_enhanced_description": "string",
      "image": {
        "url": "string",
        "metadata": {}
      },
      "muscle_test": {
        "id": "number",
        "name": "string",
        "description": "string"
      }
    }
  ]
  ```
- **Success**: 200 OK
- **Errors**: 
  - 401 Unauthorized
  - 403 Forbidden (not own session)
  - 404 Not Found
  - 500 Internal Server Error (LLM generation failure)

### Feedback

#### POST /api/sessions/{sessionId}/rating
- **Description**: Submit rating for session exercises
- **Request**: 
  ```json
  {
    "rating": true|false
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "rated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 
  - 400 Bad Request (invalid rating)
  - 401 Unauthorized
  - 403 Forbidden (not own session or rating window expired)
  - 404 Not Found
  - 409 Conflict (already rated)

## 3. Authentication and Authorization

The API relies on Supabase's built-in authentication system:

- JWT-based authentication using access tokens
- Tokens are included in the `Authorization` header as `Bearer {token}`
- Row-Level Security (RLS) in Supabase ensures users can only access their own data
- All API endpoints (except public ones like body parts list and disclaimer content) require authentication

## 4. Validation and Business Logic

### Disclaimer-related
- User must accept disclaimer before creating any sessions
- Acceptance timestamp is recorded for audit purposes

### Session-related
- Maximum 10 sessions per user (enforced by DB constraint)
- Only 1 body part can be selected per session
- Pain intensity must be between 1-10
- Data retention: sessions older than 3 days are automatically deleted

### Exercise-related
- after user choses body part and set intensity and click generate excercise button, AI service is called to generate excercise and display to user.
- Exercises are generated using Ai based on body part and pain intensity chosen by user
- Error handling ensures graceful failure if LLM generation fails

### AI Integration Details
- OpenRouter API is used for AI-based exercise generation
- When requesting exercises for a session, the system:
  1. Retrieves relevant muscle tests for the selected body part
  2. Fetches existing exercises and their images from the database
  3. Provides this data to the AI model along with pain intensity
  4. AI enhances or modifies exercise descriptions based on pain intensity
  5. Enhanced exercises with original images are returned to the user
- The session_exercises table links sessions with exercises and stores AI-enhanced descriptions
- AI requests and responses are logged for quality improvement

### Feedback-related
- Rating can only be submitted within 2 hours of session creation
- Each session can only be rated once
- Rating must be boolean (thumbs up/down)

## 5. Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

Common error codes:
- `authentication_required`: User is not authenticated
- `authorization_failed`: User lacks permission for the requested operation
- `resource_not_found`: Requested resource does not exist
- `validation_failed`: Request data failed validation
- `limit_exceeded`: User has reached a usage limit
- `already_exists`: Resource already exists (for unique constraints)
- `expired`: Operation window has expired (e.g., rating time window)
- `generation_failed`: Error in exercise generation
- `server_error`: Unexpected server error

All errors are logged, with `generation_failed` errors stored in the `generation_error_logs` table for analysis.

## 6. Data Model Relations

The API relies on the following key data model relations:

- `body_parts` contains the 6 main anatomical areas
- `muscle_tests` are linked to specific body parts
- `exercises` are linked to specific muscle tests
- `exercise_images` store paths to images for each exercise
- `sessions` track user pain data for specific body parts
- `session_exercises` link sessions with exercises and store AI enhancements
- `user_disclaimers` track user acceptance of medical disclaimers
- `generation_error_logs` track AI generation errors

The `session_exercises` table is central to the AI integration, storing:
- Links between user sessions and recommended exercises
- AI-enhanced descriptions of exercises based on pain intensity
- Creation timestamps for tracking