# UI Architecture for Physia

## 1. Overview of UI Structure

Physia is a web application designed to help users with overload-related muscle pain create personalized exercise plans. The UI architecture is organized around a step-by-step flow for creating exercise plans and managing past sessions, with a focus on simplicity and accessibility. The application uses Astro for static pages with React for interactive components, incorporating Shadcn/ui components styled with Tailwind.

The application follows a hierarchical structure:
- Authentication layer (login/registration)
- Medical disclaimer gateway
- Main application shell with navigation
- Core functionality (body part selection → muscle tests → exercise plan)
- Supporting views (session history, account management)

## 2. View List

### Authentication View
- **Path**: `/auth`
- **Primary Purpose**: Allow users to register or log in to the application
- **Key Information**:
  - Login form with email/password fields
  - Registration form with required fields
  - Form validation with error messaging
- **Key Components**:
  - AuthForm (with toggle between login/register)
  - FormField components from Shadcn/ui
  - SubmitButton with loading state
- **UX/Accessibility/Security**:
  - Clear error states for invalid credentials
  - Password strength indicator for registration
  - Supabase JWT authentication
  - Protected routes redirect to login

### Medical Disclaimer View
- **Path**: Popup modal (triggered after first login)
- **Primary Purpose**: Inform users about medical limitations and collect informed consent
- **Key Information**:
  - Medical disclaimer text
  - Acceptance button
- **Key Components**:
  - Dialog component from Shadcn/ui
  - ScrollArea for long disclaimer text
  - AcceptButton
- **UX/Accessibility/Security**:
  - Cannot be dismissed without explicit action
  - Scrollable content with minimum viewing time
  - Stores acceptance status in database via API

### Home View
- **Path**: `/`
- **Primary Purpose**: Provide introduction and entry point to the application
- **Key Information**:
  - Application purpose and benefits
  - Call to action to start creating a plan
- **Key Components**:
  - Hero section with descriptive text
  - StartButton leading to body part selection
- **UX/Accessibility/Security**:
  - Clear path to getting started
  - Checks for disclaimer acceptance
  - Redirects unauthenticated users to login

### Body Area Selection View
- **Path**: `/body-parts`
- **Primary Purpose**: Allow selection of body area for exercise plan
- **Key Information**:
  - Four body areas as clickable buttons (only one button can be clicked per time)
- **Key Components**:
  - 2x2 grid of BodyPartButton components
  - Optional icons for visual representation
  - NavigationButtons (next step)
- **UX/Accessibility/Security**:
  - Large clickable areas
  - Visual indication of selection
  - Keyboard navigable options
  - Protected route requiring authentication

### Muscle Tests View
- **Path**: `/muscle-tests/:bodyPartId`
- **Primary Purpose**: Assess pain levels for specific muscle tests
- **Key Information**:
  - Test descriptions from database
  - Pain intensity sliders (0-10) below each test
- **Key Components**:
  - MuscleTestList component
  - Slider components with min/max labels
  - GeneratePlanButton
- **UX/Accessibility/Security**:
  - Clear instructions for each test
  - Accessible sliders with aria-labels
  - Validation (at least one slider must have non-zero value)
  - Path validation to prevent access without body part selection

### Session Generation Loading View
- **Path**: `/session/generate`
- **Primary Purpose**: Indicate plan generation in progress
- **Key Information**:
  - Loading status
  - Explanation of AI + Physio generation process
- **Key Components**:
  - LoadingIndicator with animation
  - StatusMessage
  - Skeleton placeholders for upcoming content
- **UX/Accessibility/Security**:
  - Engaging loading animation
  - Status updates for long operations
  - Aria-live regions for screen readers

### Exercise Plan View
- **Path**: `/sessions/:id`
- **Primary Purpose**: Display generated exercise plan
- **Key Information**:
  - Three sections: Warm-up, Exercises, Relaxation
  - Exercise details with images, descriptions, sets/reps
- **Key Components**:
  - SectionContainer components
  - ExerciseCard components
  - FeedbackButtons (thumbs up/down)
  - ExportPDFButton
- **UX/Accessibility/Security**:
  - Responsive layout (single column on mobile, two columns on desktop)
  - Image lazy loading
  - Print-friendly styles
  - Session owner validation

### Session History View
- **Path**: `/sessions`
- **Primary Purpose**: List previous exercise sessions
- **Key Information**:
  - Chronological list of past sessions
  - Date and body area for each session
- **Key Components**:
  - SessionCard components with dates
  - ViewDetailsButton for each session
  - EmptyState for no sessions
- **UX/Accessibility/Security**:
  - Clear date formatting
  - Pagination for many sessions
  - Only shows current user's sessions

### Session Detail View
- **Path**: Connected to Session History via Accordion
- **Primary Purpose**: Show detailed exercise plan from history
- **Key Information**:
  - Complete plan with all exercises
  - Feedback status
  - Export options
- **Key Components**:
  - Accordion from Shadcn/ui
  - ExerciseCard components (same as Exercise Plan View)
  - DeleteSessionButton
- **UX/Accessibility/Security**:
  - Collapsible sections for better information management
  - Confirmation dialog for deletion
  - Session owner validation

### Account Settings View
- **Path**: `/account`
- **Primary Purpose**: Manage account settings and data
- **Key Information**:
  - Account information
  - Data deletion options
- **Key Components**:
  - AccountInfoCard
  - DeleteAccountButton with confirmation
- **UX/Accessibility/Security**:
  - Clear warnings about data deletion
  - Two-step confirmation for destructive actions
  - Password re-entry for critical operations

## 3. User Journey Map

### Primary Journey: Creating an Exercise Plan
1. **Authentication**
   - User navigates to the application
   - User logs in or registers for an account
   - System checks if user has accepted the disclaimer

2. **Medical Disclaimer** (if not previously accepted)
   - System displays medical disclaimer popup
   - User reads and accepts the disclaimer
   - System records acceptance

3. **Plan Creation**
   - User lands on home page and clicks "Start" button
   - User selects a body area from four options
   - User is presented with muscle tests for the selected area
   - User rates pain intensity for at least one test using sliders
   - User clicks "Generate Plan" button

4. **Plan Generation and Viewing**
   - System displays loading screen while AI generates the plan
   - System presents the generated exercise plan in three sections
   - User views exercises with images and instructions
   - User can rate the plan with thumbs up/down
   - User can export the plan as PDF or print it

### Secondary Journey: Managing Session History
1. **Accessing History**
   - User clicks "My Sessions" in the navigation bar
   - System displays chronological list of past sessions

2. **Viewing Session Details**
   - User clicks "View Details" on a session card
   - System expands an accordion showing the complete exercise plan
   - User can export or delete the session

### Tertiary Journey: Account Management
1. **Accessing Account Settings**
   - User clicks account icon in navigation bar
   - User selects "Account Settings" from dropdown

2. **Managing Account**
   - User views account information
   - User has option to delete account and associated data
   - System requires confirmation for account deletion

## 4. Layout and Navigation Structure

### Primary Navigation
- **Top Navigation Bar**
  - Left: Logo/Home link
  - Center: Main navigation links
    - "Create Plan" (or "Home" if on another page)
    - "My Sessions"
  - Right: User dropdown menu
    - Account settings
    - Logout

### Flow Navigation
- **Step Indicators**
  - Progress indicators for plan creation flow
  - Back/Next buttons where appropriate
  - Clear highlighting of current step

### Contextual Navigation
- **Exercise Plan View**
  - Section tabs or Jump-to links
  - Back to History link
  - Export/Print options

- **Session History**
  - Sort/Filter options
  - New Plan button

### Responsive Considerations
- On mobile: Navigation collapses to hamburger menu
- Streamlined layouts for small screens
- Touch-friendly tap targets
- Single column layout for content on mobile

## 5. Key Components

### AuthForm
A flexible authentication component that handles both login and registration with form validation and error handling.

### DisclaimerDialog
A modal dialog that displays the medical disclaimer text and requires explicit acceptance.

### BodyPartSelector
A grid of selectable buttons representing body areas, providing clear visual feedback on selection.

### MuscleTestSlider
A specialized slider component for rating pain intensity with descriptive labels for minimum and maximum values.

### ExerciseCard
A card component displaying exercise details including image, description, sets/reps information, and potentially video content.

### SectionContainer
A container component that groups exercises by their category (Warm-up, Exercises, Relaxation) with appropriate headings.

### SessionCard
A card component displaying summary information about a session including date, body area, and a button to view details.

### FeedbackButtons
Simple thumbs up/down buttons for collecting user feedback on exercise plans.

### ExportPDFButton
A button that triggers the generation and download of a PDF version of the exercise plan.

### LoadingIndicator
An animated component indicating that content is being generated or loaded, with status messaging.

### NavigationBar
The main navigation component providing access to key areas of the application and user account functions.

### ConfirmationDialog
A reusable dialog component for confirming potentially destructive actions like deletion.

### AccountInfoCard
A component displaying user account information with options for management.

## Key Decisions
1. Disclaimer acceptance will be implemented as a popup where the user must click an acceptance button.
2. Only logged-in users can generate sessions.
3. Body areas will be represented as a list of 4 buttons with optional icons.
4. For muscle tests, the description from the database and a slider to assess pain intensity on a scale of 0-10 with descriptions at the extremes will be displayed.
5. The exercise plan structure will always be the same: warm-up, exercises with images, relaxation (content generated by AI).
6. Feedback (thumbs up/down) should be available directly under the generated session.
7. Session history will be sorted chronologically.
8. Users should be able to export the plan to PDF with all data.
9. The session generation flow will be implemented as separate pages rather than sliders.
10. Session history preview will be implemented as an accordion for displaying session details.
11. When evaluating muscle tests, at least 1 slider must have a value other than 0.
12. For MVP, no additional session statuses or user-defined session names are needed.
13. All data (body parts, muscle tests, exercises, sessions) will be fetched from the Supabase database, and sessions will be filtered by authenticated user ID using RLS.