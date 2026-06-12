# Authentication System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Entry                        │
│                      (src/App.tsx)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              AuthProvider (Context)                          │
│         (src/contexts/AuthContext.tsx)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Manages:                                               │ │
│  │ • User state                                           │ │
│  │ • Authentication functions (login, signup, logout)   │ │
│  │ • Loading & error states                             │ │
│  │ • Session persistence                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐      ┌──────────────┐
   │  Login  │         │ Signup  │      │ Protected    │
   │  Page   │         │  Page   │      │ Routes       │
   │         │         │         │      │              │
   │/login   │         │/signup  │      │All main pages│
   └─────────┘         └─────────┘      └──────────────┘
        │                   │                   │
        │                   │                   └──────────────────┐
        └───────────┬───────┘                                      │
                    ▼                                              │
        ┌─────────────────────────┐                               │
        │  Auth Service           │                               │
        │ (authService.ts)        │                               │
        │ • Login Logic           │                               │
        │ • Signup Logic          │                               │
        │ • localStorage Mgmt     │                               │
        └─────────────────────────┘                               │
                    │                                              │
                    └──────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │  User State             │
                    │  ┌───────────────────┐ │
                    │  │ userId            │ │
                    │  │ email             │ │
                    │  │ firstName         │ │
                    │  │ lastName          │ │
                    │  │ businessName      │ │
                    │  │ businessType      │ │
                    │  └───────────────────┘ │
                    └─────────────────────────┘
```

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    USER SIGNUP FLOW                          │
└──────────────────────────────────────────────────────────────┘

User visits /signup
        │
        ▼
┌─────────────────────┐
│ Signup Form         │
│ • First Name        │
│ • Last Name         │
│ • Email             │
│ • Password          │
│ • Confirm Password  │
│ • Business Info     │
│ • Terms Agreement   │
└─────────────────────┘
        │
        ▼ User fills form
┌─────────────────────┐
│ Client-side         │
│ Validation          │
│ ✓ Fields required   │
│ ✓ Email format      │
│ ✓ Passwords match   │
│ ✓ Password strength │
│ ✓ Terms accepted    │
└─────────────────────┘
        │
        ▼ Valid
┌─────────────────────┐
│ Call authService    │
│ .signup()           │
└─────────────────────┘
        │
        ▼ Mock API call
┌─────────────────────┐
│ Create User         │
│ Generate Token      │
│ Store in localStorage
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Update Auth Context │
│ • Set user          │
│ • Set isAuthenticated
│ • Clear errors      │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Redirect to /       │
│ (Dashboard)         │
└─────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│                    USER LOGIN FLOW                           │
└──────────────────────────────────────────────────────────────┘

User visits /login
        │
        ▼
┌─────────────────────┐
│ Login Form          │
│ • Email             │
│ • Password          │
│ • Remember Me? (opt)│
└─────────────────────┘
        │
        ▼ User submits
┌─────────────────────┐
│ Client-side         │
│ Validation          │
│ ✓ Email required    │
│ ✓ Password required │
│ ✓ Valid email format│
└─────────────────────┘
        │
        ▼ Valid
┌─────────────────────┐
│ Call authService    │
│ .login()            │
│ Show loading state  │
└─────────────────────┘
        │
        ▼ Mock API call
┌─────────────────────┐
│ Verify Credentials  │
│ ✓ Email exists?     │
│ ✓ Password matches? │
└─────────────────────┘
        │
        ├─ Invalid ─→ Show error
        │
        ▼ Valid
┌─────────────────────┐
│ Store in localStorage
│ • auth_token        │
│ • auth_user         │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Update Auth Context │
│ • Set user          │
│ • Set isAuthenticated
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Redirect to /       │
│ (Dashboard)         │
└─────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│               PROTECTED ROUTE FLOW                           │
└──────────────────────────────────────────────────────────────┘

User tries to access protected page (e.g., /inventory)
        │
        ▼
┌──────────────────────┐
│ Router checks route  │
│ Finds ProtectedRoute │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│ ProtectedRoute       │
│ Checks auth state    │
│ isLoading? ────┐     │
│ isAuthenticated? │   │
└──────────────────┴───┘
        │
        ├─ Loading ──→ Show skeleton
        │
        ├─ Not authenticated ─→ Redirect to /login
        │
        └─ Authenticated ──→ Render page
                │
                ▼
          ┌──────────┐
          │ Dashboard│
          │ Page     │
          └──────────┘
```

## Component Communication

```
                        useAuth Hook
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐      ┌──────────────┐
    │  Login  │         │ Signup  │      │ Header/      │
    │  Page   │         │  Page   │      │ Sidebar      │
    │         │         │         │      │              │
    │ Uses:   │         │ Uses:   │      │ Uses:        │
    │ • login │         │ • signup│      │ • user       │
    │ • error │         │ • error │      │ • logout     │
    │ •isLoad │         │ •isLoad │      │ • isAuth     │
    └─────────┘         └─────────┘      └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │  AuthContext Provider     │
            │                           │
            │  State Management:        │
            │  • user object            │
            │  • isAuthenticated bool   │
            │  • isLoading bool         │
            │  • error string           │
            │                           │
            │  Functions:               │
            │  • login()                │
            │  • signup()               │
            │  • logout()               │
            │  • clearError()           │
            └───────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │  Auth Service             │
            │                           │
            │  • Mocked API calls       │
            │  • localStorage manager   │
            │  • User validation        │
            └───────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │  Browser Storage          │
            │  localStorage             │
            │  • auth_token             │
            │  • auth_user (JSON)       │
            └───────────────────────────┘
```

## Data Flow - Login

```
Login Form Input
    │
    ├─ email: "test@example.com"
    └─ password: "password123"
            │
            ▼
    Form Validation
            │
            ▼
    useAuth.login(email, password)
            │
            ├─ isLoading = true
            │
            ▼
    authService.login()
            │
            ├─ Validate credentials
            │
            ├─ Create response:
            │  {
            │    user: { id, email, firstName... },
            │    token: "mock_token_123"
            │  }
            │
            ├─ Save to localStorage
            │
            └─ Return response
            │
            ▼
    AuthContext update
            │
            ├─ setUser(response.user)
            ├─ isLoading = false
            └─ error = null
            │
            ▼
    Component re-render
            │
            ├─ Show user in Header
            ├─ Show user in Sidebar
            └─ Navigate to /
```

## State Management

```
AuthContext State:
┌─────────────────────────────────────────────┐
│ user: User | null                           │
│ ├─ null (not logged in)                     │
│ └─ { id, email, firstName, ... } (logged in)
│                                              │
│ isAuthenticated: boolean                    │
│ ├─ false (not logged in)                    │
│ └─ true (logged in)                         │
│                                              │
│ isLoading: boolean                          │
│ ├─ true (during API call)                   │
│ └─ false (ready)                            │
│                                              │
│ error: string | null                        │
│ ├─ null (no error)                          │
│ └─ "Error message" (error occurred)         │
│                                              │
│ Functions:                                   │
│ ├─ login(email, password)                   │
│ ├─ signup(userData)                         │
│ ├─ logout()                                 │
│ └─ clearError()                             │
└─────────────────────────────────────────────┘
```

## Page Structure

```
┌─ /login
│  ├─ Logo/Branding
│  ├─ Form
│  │  ├─ Email input
│  │  ├─ Password input
│  │  └─ Submit button
│  ├─ Links
│  │  ├─ Forgot password?
│  │  └─ Sign up
│  └─ Demo credentials
│
├─ /signup
│  ├─ Logo/Branding
│  ├─ Form
│  │  ├─ First/Last name
│  │  ├─ Email input
│  │  ├─ Business info
│  │  ├─ Password input
│  │  ├─ Confirm password
│  │  ├─ Terms checkbox
│  │  └─ Submit button
│  └─ Link to login
│
├─ /forgot-password
│  ├─ Email input
│  ├─ Submit button
│  ├─ Back to login link
│  └─ Success confirmation (post-submit)
│
└─ Protected Pages (all require /login first)
   ├─ / (Dashboard)
   ├─ /inventory
   ├─ /analytics
   ├─ /orders
   ├─ /suppliers
   ├─ /reports
   ├─ /notifications
   └─ /settings
```

## Security Flow

```
┌──────────────────────────────────────┐
│  User enters password                │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  Client-side validation              │
│  • Min 6 characters                  │
│  • Not empty                         │
│  • Type-to-clear error message       │
└──────────────────────────────────────┘
    │
    ▼ Valid
┌──────────────────────────────────────┐
│  Send to "API" (mocked)              │
│  Over HTTPS (in production)          │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  Server validates                    │
│  • Email exists                      │
│  • Password matches hash (mock)      │
└──────────────────────────────────────┘
    │
    ▼ Valid
┌──────────────────────────────────────┐
│  Generate secure token               │
│  Return token + user info            │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  Store in localStorage               │
│  (Use sessionStorage or secure       │
│   cookie in production)              │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  Include token in API requests       │
│  Authorization: Bearer <token>       │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  On logout: clear storage            │
│  • Remove token                      │
│  • Remove user data                  │
│  • Redirect to /login                │
└──────────────────────────────────────┘
```

---

This architecture provides a secure, scalable foundation for user authentication in Shop Stock Zen.
