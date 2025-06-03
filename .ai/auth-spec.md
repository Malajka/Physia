# Authentication Module Specification – Physia

## 1. USER INTERFACE ARCHITECTURE

### 1.1. Pages and Layouts
- New Astro pages:
  - `/register.astro` – registration form.
  - `/login.astro` – login form.
- Layouts:
  - `src/layouts/AuthLayout.astro` – minimal header and container for authentication forms (used by all auth pages).
  - `src/layouts/MainLayout.astro` – main application layout with a navbar showing “Log in” / “Register” for unauthenticated users and “Log out” for authenticated users, and a content slot.

### 1.2. React Components (Client-Side)
- `AuthForm` – wrapper component managing `loading`, `errors`, and handling `onSubmit`.
- `InputField` – email and password input fields with built-in validation (based on Shadcn/ui `Input`).
- `PasswordField` – extends `InputField` with a toggle to show/hide password.
- `ErrorAlert` – displays a list of error messages.
- `LinkButton` – styled navigation buttons using Astro `Link` and Tailwind.

### 1.3. Responsibility Separation
- **Astro Pages**:
  - Define routing and choose the appropriate layout.
  - Inject props (e.g., the `token` from the query string) into React components.
  - Perform server-side session checks in `getStaticPaths`/`getServerSideProps` when needed.
- **React Components**:
  - Client-side form validation (using Zod schemas or manual checks).
  - Fetch calls to the authentication API endpoints (`/api/auth/*`).
  - Handle API responses and navigate (redirect) on success.

### 1.4. Validation and Error Messages
- **Registration**:
  - Email: required and must have a valid format.
  - Password: required and minimum length of 8 characters.
  - Password confirmation: must match the password.
  - Show inline validation messages under each field and aggregate errors in `ErrorAlert`.
- **Login**:
  - Email and password: both required.
  - On authentication failure, show "Invalid login credentials.".
- **Password Reset**:
  - Email: required.
  - Token: validated server-side for correctness and expiration.
  - New password: same rules as registration password.

### 1.5. Primary User Flows
1. **Registration** – User fills out the form, client-side validation runs, the app sends `POST /api/auth/register`, then redirects to `/login` with a success message.
2. **Login** – User submits credentials via `POST /api/auth/login`, on success the app redirects to `/` and updates the navbar state to show “Log out.”

## 2. BACKEND LOGIC

### 2.1. API Endpoint Structure (`src/pages/api/auth`)
- `register.ts` – accepts `{ email, password }`, validates with Zod, calls `supabase.auth.signUp`, and handles errors (400 for validation, 409 for email already in use).
- `login.ts` – accepts `{ email, password }`, calls `supabase.auth.signInWithPassword`, and returns session data or a 401 Unauthorized error.
- `logout.ts` – calls `supabase.auth.signOut`, clears the authentication cookie, and returns success.

### 2.2. Data Models
- **User** – stored in Supabase’s built-in `auth.users` table.
- **Session** – managed by Supabase Auth and persisted in an HTTP-only, Secure cookie.

### 2.3. Input Validation
- Use Zod schemas for request bodies in each API endpoint.
- Perform early returns with HTTP 400 if validation fails.

### 2.4. Error Handling
- Wrap each handler in `try/catch`, log errors with `console.error`, and return a structured JSON response:
  ```json
  { "error": "Detailed error message" }
  ```
- Use appropriate HTTP status codes:
  - 400 Bad Request (validation failure)
  - 401 Unauthorized (invalid credentials or missing session)
  - 409 Conflict (email already exists)
  - 500 Internal Server Error (unexpected errors)

### 2.5. SSR and Astro Integration
- On protected Astro pages (e.g., `/my-sessions.astro`), use `Astro.serverSide` to read the authentication cookie and validate the session via `supabase.auth.getSession()`.
- Redirect unauthenticated requests to `/login`.
- No changes needed to `astro.config.mjs` (still uses `node({ mode: "standalone" })` adapter and `output: "server"`).

## 3. AUTHENTICATION SYSTEM

### 3.1. Supabase Auth Integration
- Install the client library: `@supabase/supabase-js`.
- Initialize a Supabase client in `src/lib/supabaseClient.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js';
  export const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
  );
  ```

### 3.2. Session Management
- **Client side**: listen to `supabase.auth.onAuthStateChange` to update React application state.
- **Server side**: read the `sb-auth-token` cookie in `Astro.request` and forward it to Supabase for session verification.

### 3.3. Logout
- Expose `POST /api/auth/logout`, call `supabase.auth.signOut()`, clear the auth cookie, and redirect to `/login`.

### 3.4. Security and GDPR Compliance
- Store session identifiers in HTTP-only, Secure cookies.
- Retain only minimal user data.
- Optionally extend the module later with an account deletion endpoint at `/api/auth/delete-account`.

---