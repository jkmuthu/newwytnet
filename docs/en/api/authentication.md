# Authentication API Reference

## Overview

WytNet provides a comprehensive authentication system called **WytPass** that supports multiple authentication methods:
- Email/Password registration and login
- Email OTP (One-Time Password) passwordless authentication
- Google OAuth 2.0
- LinkedIn OAuth 2.0
- Unified session management across all contexts

All authentication endpoints use **session-based authentication** with httpOnly cookies. Sessions are stored in PostgreSQL and last for 7 days by default.

---

## Base URL

```
Production: https://wytnet.com
Development: https://your-replit-dev-domain.replit.dev
```

---

## Authentication Methods

### 1. Email/Password Authentication

#### POST /api/auth/register

Register a new user account with email and password.

**Request**

```typescript
POST /api/auth/register
Content-Type: application/json

{
  name: string;              // Full name (required)
  email: string;             // Valid email address (required)
  password: string;          // Minimum 8 characters (required)
  whatsappNumber?: string;   // WhatsApp number (optional)
}
```

**Example Request**

```bash
curl -X POST https://wytnet.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "whatsappNumber": "+919876543210"
  }'
```

**Success Response (201 Created)**

```typescript
{
  id: string;                 // User UUID
  name: string;               // User's full name
  email: string;              // User's email
  profileImageUrl: string | null;
  role: string;               // "user" by default
}
```

**Error Responses**

```typescript
// 400 Bad Request - User already exists
{
  message: "User already exists with this email or WhatsApp number"
}

// 500 Internal Server Error
{
  message: "Internal server error"
}
```

**Session Cookie**

Upon successful registration, a session cookie `wytpass.sid` is set:

```http
Set-Cookie: wytpass.sid=<session-id>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

---

#### POST /api/auth/login

Login with email and password.

**Request**

```typescript
POST /api/auth/login
Content-Type: application/json

{
  email: string;      // User's email address
  password: string;   // User's password
}
```

**Example Request**

```bash
curl -X POST https://wytnet.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Success Response (200 OK)**

```typescript
{
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  role: string;
}
```

**Error Responses**

```typescript
// 401 Unauthorized - Invalid credentials
{
  message: "Invalid credentials"
}

// 500 Internal Server Error
{
  message: "Internal server error"
}
```

**Password Requirements**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (recommended)

---

### 2. Email OTP Authentication

#### POST /api/auth/send-email-otp

Send a one-time password to the user's email address.

**Request**

```typescript
POST /api/auth/send-email-otp
Content-Type: application/json

{
  email: string;   // Valid email address
}
```

**Example Request**

```bash
curl -X POST https://wytnet.com/api/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "OTP sent to your email";
  expiresIn: number;  // Expiry time in seconds (300 = 5 minutes)
}
```

**Error Responses**

```typescript
// 400 Bad Request - Invalid email
{
  success: false;
  message: "Invalid email address"
}

// 429 Too Many Requests - Rate limit exceeded
{
  success: false;
  message: "Too many OTP requests. Please try again in 15 minutes"
}

// 500 Internal Server Error
{
  success: false;
  message: "Failed to send OTP"
}
```

**OTP Security Features**

- OTP expires after 5 minutes
- Rate limit: 3 requests per 15 minutes per email
- OTP is single-use only
- Secure random 6-digit generation

---

#### POST /api/auth/verify-email-otp

Verify the OTP and authenticate the user.

**Request**

```typescript
POST /api/auth/verify-email-otp
Content-Type: application/json

{
  email: string;   // Email address where OTP was sent
  otp: string;     // 6-digit OTP code
}
```

**Example Request**

```bash
curl -X POST https://wytnet.com/api/auth/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "OTP verified successfully";
  user: {
    id: string;
    displayId: string;         // WytID (e.g., UR0000001)
    email: string;
    name: string | null;
    profileImageUrl: string | null;
    role: string;
    authMethods: string[];     // ["email_otp"]
  }
}
```

**Error Responses**

```typescript
// 400 Bad Request - Invalid OTP
{
  success: false;
  message: "Invalid or expired OTP"
}

// 404 Not Found - User not found
{
  success: false;
  message: "User not found"
}

// 500 Internal Server Error
{
  success: false;
  message: "Internal server error"
}
```

---

### 3. Google OAuth 2.0

#### GET /api/auth/google

Initiates the Google OAuth flow.

**Request**

```http
GET /api/auth/google
```

**Example**

```bash
# In browser, navigate to:
https://wytnet.com/api/auth/google

# Or use a link:
<a href="/api/auth/google">Sign in with Google</a>
```

**Flow**

1. User is redirected to Google's OAuth consent screen
2. User grants permissions to WytNet
3. Google redirects back to callback URL with authorization code
4. Backend exchanges code for user profile
5. User is created/updated in database
6. Session is created
7. User is redirected to dashboard

**Scopes Requested**

- `profile` - Access to user's name and profile picture
- `email` - Access to user's email address

---

#### GET /api/auth/google/callback

Google OAuth callback endpoint (handled automatically).

**Request**

```http
GET /api/auth/google/callback?code=<authorization_code>&state=<state>
```

**Success**

Redirects to `/` (dashboard) with session cookie set.

**Error**

Redirects to `/login?error=google_failed` if authentication fails.

---

### 4. LinkedIn OAuth 2.0

#### GET /api/auth/linkedin

Initiates the LinkedIn OAuth flow.

**Request**

```http
GET /api/auth/linkedin
```

**Example**

```bash
# In browser, navigate to:
https://wytnet.com/api/auth/linkedin

# Or use a link:
<a href="/api/auth/linkedin">Sign in with LinkedIn</a>
```

**Scopes Requested**

- `r_emailaddress` - Access to user's email
- `r_liteprofile` - Access to user's basic profile

---

#### GET /api/auth/linkedin/callback

LinkedIn OAuth callback endpoint (handled automatically).

**Request**

```http
GET /api/auth/linkedin/callback?code=<authorization_code>&state=<state>
```

**Success**

Redirects to `/` (dashboard) with session cookie set.

**Error**

Redirects to `/login?error=linkedin_failed` if authentication fails.

---

### 5. Session Management

#### GET /api/auth/user

Get the currently authenticated user's information.

**Authentication Required**: Yes

**Request**

```http
GET /api/auth/user
Cookie: wytpass.sid=<session-id>
```

**Example Request**

```bash
curl -X GET https://wytnet.com/api/auth/user \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Success Response (200 OK)**

```typescript
{
  id: string;                    // User UUID
  name: string;                  // User's full name
  email: string;                 // User's email
  profileImageUrl: string | null;
  role: string;                  // User role
  authMethods: string[];         // ["password", "google", "email_otp"]
  socialProviders: string[];     // ["google", "linkedin"]
  profileComplete: boolean;      // Profile completion status
}
```

**Error Response**

```typescript
// 401 Unauthorized - Not authenticated
{
  message: "Not authenticated"
}
```

---

#### POST /api/auth/logout

Logout the current user and destroy the session.

**Authentication Required**: Yes

**Request**

```http
POST /api/auth/logout
Cookie: wytpass.sid=<session-id>
```

**Example Request**

```bash
curl -X POST https://wytnet.com/api/auth/logout \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Logged out successfully"
}
```

**Session Cookie Cleared**

```http
Set-Cookie: connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

## Frontend Integration

### React Example with TanStack Query

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Login mutation
const loginMutation = useMutation({
  mutationFn: async (credentials: { email: string; password: string }) => {
    const res = await apiRequest('/api/auth/login', 'POST', credentials);
    return await res.json();
  },
  onSuccess: () => {
    // Invalidate and refetch user data
    queryClient.invalidateQueries({ queryKey: ['user-auth'] });
  },
});

// Register mutation
const registerMutation = useMutation({
  mutationFn: async (data: { 
    name: string; 
    email: string; 
    password: string;
    whatsappNumber?: string;
  }) => {
    const res = await apiRequest('/api/auth/register', 'POST', data);
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user-auth'] });
  },
});

// OTP send mutation
const sendOtpMutation = useMutation({
  mutationFn: async (email: string) => {
    const res = await apiRequest('/api/auth/send-email-otp', 'POST', { email });
    return await res.json();
  },
});

// OTP verify mutation
const verifyOtpMutation = useMutation({
  mutationFn: async (data: { email: string; otp: string }) => {
    const res = await apiRequest('/api/auth/verify-email-otp', 'POST', data);
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user-auth'] });
  },
});

// Get current user
const { data: user, isLoading } = useQuery({
  queryKey: ['user-auth'],
  queryFn: async () => {
    const res = await fetch('/api/auth/user', { credentials: 'include' });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error('Failed to fetch user');
    return await res.json();
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: false,
});

// Logout mutation
const logoutMutation = useMutation({
  mutationFn: async () => {
    const res = await apiRequest('/api/auth/logout', 'POST');
    return await res.json();
  },
  onSuccess: () => {
    queryClient.clear(); // Clear all cached data
    window.location.href = '/login';
  },
});

// Usage in component
function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      // Success - redirect or show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Invalid input, user already exists |
| 401 | Unauthorized | Invalid credentials, not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User not found |
| 409 | Conflict | Duplicate email/phone |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

All error responses follow this structure:

```typescript
{
  message: string;       // Human-readable error message
  error?: string;        // Error code or type (optional)
  success?: false;       // For endpoints that return success flag
}
```

---

## Security Considerations

### Session Security

- Sessions stored in PostgreSQL
- HttpOnly cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- SameSite=Strict prevents CSRF attacks
- Sessions expire after 7 days of inactivity

### Password Security

- Passwords hashed using bcrypt with cost factor 10
- Never stored in plain text
- Password strength validation on registration
- Account lockout after 5 failed login attempts

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 5 attempts | 15 minutes |
| POST /api/auth/register | 10 attempts | 1 hour |
| POST /api/auth/send-email-otp | 3 attempts | 15 minutes |

### CORS Configuration

```javascript
{
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://wytnet.com', 'https://www.wytnet.com']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}
```

---

## Testing

### cURL Examples

**Test Registration**

```bash
curl -X POST https://wytnet.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }' \
  -c cookies.txt
```

**Test Login**

```bash
curl -X POST https://wytnet.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }' \
  -c cookies.txt
```

**Test Get User**

```bash
curl -X GET https://wytnet.com/api/auth/user \
  -b cookies.txt
```

**Test Logout**

```bash
curl -X POST https://wytnet.com/api/auth/logout \
  -b cookies.txt
```

---

## WytPass Unified Identity

WytPass provides a unified identity system where one login gives access to multiple contexts:

- **User Context**: Regular user access to WytNet.com
- **Hub Admin Context**: Admin access to specific hubs
- **Super Admin Context**: Full Engine-level admin access

Users can switch between contexts without re-authentication. Each context has its own permissions and access controls.

**Session Principal Structure**

```typescript
{
  id: string;
  email: string;
  name: string;
  roles: string[];           // ['user', 'hub_admin', 'super_admin']
  isSuperAdmin: boolean;
  isHubAdmin: boolean;
  systemRoles: Array<{
    id: string;
    name: string;
    description: string;
    scope: string;
  }>;
  permissions: {
    [resource: string]: string[];  // { "users": ["view", "create"] }
  };
  panels: {
    engine?: { access: boolean; role: string };
    hubAdmin?: { access: boolean; hubId: string; hubName: string };
    user?: { access: boolean };
  };
}
```

---

## Migration from Other Auth Systems

If you're migrating from another authentication system:

1. **Export User Data**: Export user emails and encrypted passwords
2. **Import Users**: Use the registration endpoint to create accounts
3. **Link Social Accounts**: Users can link Google/LinkedIn after registration
4. **Session Migration**: Implement a one-time token system for seamless migration

For bulk user imports, contact the platform admin to use the admin API.

---

## FAQ

**Q: Can a user have multiple authentication methods?**

A: Yes, users can link multiple methods (password + Google + LinkedIn + OTP). The `authMethods` array tracks all linked methods.

**Q: How long does a session last?**

A: Sessions last for 7 days by default. They are automatically renewed on user activity.

**Q: What happens if I forget my password?**

A: Use the Email OTP method to login passwordless, then update your password in account settings.

**Q: Can I use WytPass for my own app?**

A: Yes, if your app is registered on the WytNet platform, you can leverage WytPass for authentication.

**Q: How do I revoke a user's session?**

A: Admin users can revoke sessions via the Admin Panel under User Management > Sessions.
