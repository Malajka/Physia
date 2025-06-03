# The Product Requirements Document (PRD) – Physia

## 1. Product overview

The purpose of Project Physia is to enable users with overload-related muscle pain to quickly
create a personalized exercise plan based on the selected body part and the intensity of the pain.
The exercise sets have been previously developed by a physiotherapist.

## 2.User problem

Difficulties with access to physiotherapists. Dealing with overload-related muscle pain requires
many visits and needs modifications depending on intensity.

## 3. Functional requirements

1. 6 body parts (Neck and upper back, Lower back , Wrists and forearms, Hips) selector with a limit of 1 selections per session:

   - Mandatory medical disclaimer before first session.
   - After reading and accepting the disclaimer, the user selects 1 of the 6 body parts that are affected by muscle strain pain.
   - User sets pain intensity for selected muscle tests.
   - The application sends data to the LLM model via API.
   - The LLM model offers a set of exercises.
   - The user can evaluate the helpfulness of the generated exercises.

2. Manual creation and management of pain data:

   - buttons for body part selection and a slider for setting pain intensity.
   - Options to edit and delete existing data.
   - Manual creation and display within a list view "My pain data"

3. Basic authentication and user accounts system:

   - Registration and login.
   - Ability to delete the account and associated medical data upon request.

4. Storage and scalability:

   - Pain location and user data stored in a manner ensuring scalability and security.

5. Exercise Feedback Statistics:

   - Collecting information on how many exercises were rated positively (thumbs up/down feedback system after each session)

6. Legal requirements and constraints:
   - User personal data and their health data stored in compliance with GDPR.
   - Right to access and delete data (account along with data) upon user request.

## 4. Product Boundaries

1. Out of MVP scope:
   - Does not replace medical consultation
   - Advanced, custom algorithm for creating and modifying exercises (we use pre-prepared data).
   - Gamification mechanisms.
   - Mobile applications (currently web version only).
   - Import of multiple document formats (PDF, DOCX, etc.).
   - Publicly available API.
   - Extensive notification system.

## 5. User Stories

### US-001: Body part selection

**Description**: As an office worker, I want to select a maximum of 1 painful area.
**Acceptance Criteria**:

- System blocks a 2nd selection with the message "Select max 1 area".
- Icons change color upon selection (grey → blue).

### US-002: Pain intensity assessment

**Description**: As a user, I want to rate the pain on a scale of 1-10 with example descriptions.
**Acceptance Criteria**:

- Tooltip on hover: "1 - slight discomfort, 10 - prevents work".
- Automatic assignment of exercise type based on the range.

### US-003: Feedback system

**Description**: As a product owner, I want to collect satisfaction ratings.
**Acceptance Criteria**:

- "Thumb" button visible only for 2h after the session.
- Data saved anonymously in the format {session_id, vote, timestamp}.

### US-004: Medical safety

**Description**: As a lawyer, I want to ensure compliance with legal requirements.
**Acceptance Criteria**:

- Display of a disclaimer before the first interaction.
- Link to the full terms and conditions in the PDF footer.

### ID: US-005

Title: Account Registration
**Description**:: As a new user, I want to register an account to access my own data and be able to view/delete it.
**Acceptance Criteria**:

- The registration form includes fields for email address and password.
- After successful form submission and data verification, the account is activated.
- The user receives confirmation of successful registration and is logged in.
