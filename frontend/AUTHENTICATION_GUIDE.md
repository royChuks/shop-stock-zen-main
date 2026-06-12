# Authentication System Documentation

## Overview

This document describes the complete authentication system implemented for Shop Stock Zen. The system includes user registration, login, logout, password recovery, and protected routes.

## Features

### 1. **User Authentication**
   - Secure user registration with email validation
   - Password strength validation
   - User login with persistent sessions
   - Logout functionality

### 2. **User Management**
   - User profile creation during signup
   - Business information collection
   - User data persistence in localStorage
   - User state management via React Context

### 3. **Security Features**
   - Password confirmation during signup
   - Password visibility toggle
   - Form validation on both client-side
   - Protected routes (authentication required)
   - Automatic redirect to login for unauthenticated users

### 4. **User Experience**
   - Clean, modern authentication pages
   - Error handling and user feedback
   - Loading states during API calls
   - Password recovery functionality
   - Demo credentials for testing

## Project Structure

### Core Authentication Files

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth state management and hooks
├── services/
│   └── authService.ts           # Authentication service (mocked)
├── types/
│   └── auth.ts                  # TypeScript interfaces for auth
└── components/
    └── auth/
        └── ProtectedRoute.tsx   # Route protection wrapper
```

### Authentication Pages

```
src/pages/
├── Login.tsx                    # Login page
├── Signup.tsx                   # User registration page
└── ForgotPassword.tsx           # Password recovery page
```

### Updated Components

```
src/components/layout/
├── Header.tsx                   # Updated with user profile dropdown
└── Sidebar.tsx                  # Updated with logout functionality
```

## Usage Guide

### Setup

1. The `AuthProvider` is already wrapped around the entire app in `src/App.tsx`
2. All app pages are protected with the `ProtectedRoute` component
3. Auth routes (login, signup, forgot-password) are accessible without authentication

### Using the useAuth Hook

```typescript
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Protected Routes

All main app routes are already protected. To add a new protected page:

```typescript
<Route
  path="/my-page"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>
```

## Authentication Flow

### Login Flow
1. User enters email and password
2. Form validation
3. API call to authenticate user
4. User data stored in localStorage and React Context
5. Redirect to dashboard on success

### Signup Flow
1. User fills out registration form
2. Form validation (password match, email format, etc.)
3. API call to create new user
4. User data stored
5. Redirect to dashboard on success

### Protected Route Flow
1. User attempts to access protected page
2. `ProtectedRoute` checks authentication status
3. If not authenticated, redirect to `/login`
4. If authenticated, render the page

## Demo Credentials

For testing purposes, use these credentials:

- **Email:** test@example.com
- **Password:** password123

These credentials are displayed on the login page and can be used to test the system.

## TypeScript Types

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
}
```

### Auth Context Interface
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}
```

### Signup Data Interface
```typescript
interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  businessName: string;
  businessType: string;
  agreeToTerms: boolean;
}
```

## API Integration (Mock Implementation)

The current implementation uses a mocked authentication service (`authService.ts`) for demonstration. To integrate with a real backend API:

### 1. Update `authService.ts`

Replace the mock implementations with real API calls:

```typescript
// Example with fetch
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  // ... other methods
};
```

### 2. Or use axios for better type safety

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Add token to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  // ... other methods
};
```

## Storage

User authentication data is stored in localStorage:

- **auth_token:** JWT or session token
- **auth_user:** Serialized user object

To clear stored data:
```typescript
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
```

## Routes

### Public Routes
- `/login` - Login page
- `/signup` - Sign up page
- `/forgot-password` - Password recovery page

### Protected Routes (Authentication required)
- `/` - Dashboard
- `/inventory` - Inventory management
- `/analytics` - Analytics
- `/orders` - Orders
- `/suppliers` - Suppliers
- `/reports` - Reports
- `/notifications` - Notifications
- `/settings` - Settings

## Error Handling

All authentication errors are caught and displayed to the user:

- Invalid credentials
- Email already registered
- Password mismatch
- Network errors

Errors are cleared when the user starts typing in form fields.

## Loading States

Loading states are handled throughout the authentication flow:

- `isLoading` flag prevents multiple submissions
- Button shows loading spinner during API calls
- Form inputs are disabled while loading

## Customization

### Branding

Update the logo/branding in authentication pages:

1. **Login Page:** `src/pages/Login.tsx` - Update the logo in CardHeader
2. **Signup Page:** `src/pages/Signup.tsx` - Update the logo
3. **Forgot Password Page:** `src/pages/ForgotPassword.tsx` - Update the logo

### Form Validation

Update validation rules in:
- `src/pages/Login.tsx` - `validateForm()` function
- `src/pages/Signup.tsx` - `validateForm()` function

### Business Types

Modify available business types in `src/pages/Signup.tsx`:

```typescript
<select id="businessType" name="businessType" ...>
  <option value="">Select a type</option>
  <option value="retail">Retail</option>
  <option value="wholesale">Wholesale</option>
  {/* Add more types */}
</select>
```

## Testing

### Manual Testing

1. **Sign Up:**
   - Navigate to `/signup`
   - Fill in the form with test data
   - Verify form validation works
   - Verify passwords must match
   - Create an account

2. **Login:**
   - Navigate to `/login`
   - Use demo credentials or newly created account
   - Verify protected pages become accessible

3. **Protected Routes:**
   - Try accessing `/` without logging in
   - Should redirect to `/login`

4. **Logout:**
   - Click logout in sidebar or header
   - Should redirect to login page
   - Protected pages should be inaccessible

5. **Password Recovery:**
   - Navigate to `/forgot-password`
   - Enter email
   - Verify success message

## Future Enhancements

- Two-factor authentication (2FA)
- OAuth/Social login (Google, GitHub)
- Email verification
- Password strength meter improvements
- Session timeout
- Remember me functionality
- Role-based access control (RBAC)
- User profile editing page
- Admin user management

## Security Considerations

For production deployment:

1. **HTTPS Only:** Always use HTTPS
2. **Secure Storage:** Consider using secure storage instead of localStorage
3. **Token Expiration:** Implement token refresh logic
4. **Rate Limiting:** Add rate limiting to prevent brute force attacks
5. **CORS:** Configure CORS properly
6. **Password Hashing:** Use bcrypt or similar for password hashing
7. **Input Sanitization:** Sanitize all user inputs
8. **SQL Injection Prevention:** Use parameterized queries

## Troubleshooting

### User stays logged in after refresh
- This is intended behavior - user is persisted in localStorage
- Clear localStorage to force logout

### Routes not protected
- Verify `ProtectedRoute` wraps the route
- Check `AuthProvider` wraps the entire app

### useAuth hook not working
- Ensure component is inside `AuthProvider`
- Check for console errors

## Support

For issues or questions about the authentication system, refer to the component files' inline comments or reach out to the development team.
