# WytPass Authentication System

## Overview

**WytPass** is WytNet's universal authentication system that provides secure, multi-method user authentication with session management, OAuth integration, and seamless cross-platform support.

**Supported Authentication Methods:**
1. **Email OTP** (One-Time Password via MSG91)
2. **Google OAuth 2.0** (Social login)
3. **Email + Password** (Traditional credentials)

**Key Features:**
- Universal single sign-on across all WytNet services
- Session-based authentication with httpOnly cookies
- OAuth 2.0 integration (Google, LinkedIn, Facebook ready)
- OTP-based passwordless login
- Secure password hashing with bcrypt
- 30-day session persistence
- Cross-device session management

---

## WytPass Architecture

### Complete Authentication System

```mermaid
flowchart TD
    Start([User Initiates Auth]) --> ChooseMethod{Select Auth Method}
    
    ChooseMethod -->|Email OTP| OTPFlow[Email OTP Flow]
    ChooseMethod -->|Google OAuth| GoogleFlow[Google OAuth Flow]
    ChooseMethod -->|Email + Password| PasswordFlow[Password Flow]
    
    OTPFlow --> SendOTP[Generate & Send OTP]
    SendOTP --> MSG91[MSG91 Email Service]
    MSG91 --> UserEmail[User Receives Email]
    UserEmail --> EnterOTP[User Enters OTP]
    EnterOTP --> VerifyOTP{OTP Valid?}
    VerifyOTP -->|No| RetryOTP[Retry or Resend]
    VerifyOTP -->|Yes| CreateUser[Create/Fetch User]
    
    GoogleFlow --> RedirectGoogle[Redirect to Google]
    RedirectGoogle --> GoogleAuth[Google Authorization]
    GoogleAuth --> GoogleCallback[Callback with Auth Code]
    GoogleCallback --> ExchangeToken[Exchange Code for Token]
    ExchangeToken --> FetchProfile[Fetch Google Profile]
    FetchProfile --> CreateUser
    
    PasswordFlow --> ValidateCreds[Validate Credentials]
    ValidateCreds --> CheckHash{Password Match?}
    CheckHash -->|No| Error[Show Error]
    CheckHash -->|Yes| CreateUser
    
    CreateUser --> SessionCreate[Create Session]
    SessionCreate --> SetCookie[Set httpOnly Cookie]
    SetCookie --> UpdateUI[Update Frontend UI]
    UpdateUI --> Success([Authentication Complete])
    
    RetryOTP --> EnterOTP
    Error --> Start
    
    style CreateUser fill:#90EE90
    style SessionCreate fill:#90EE90
    style VerifyOTP fill:#FFD700
    style CheckHash fill:#FFD700
    style Error fill:#FF6B6B
```

---

## Email OTP Authentication Flow

### Detailed Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant MSG as MSG91 API
    participant E as User Email
    participant S as Session Store
    
    Note over U,S: Phase 1: Request OTP
    U->>F: Enter Email & Click "Send OTP"
    F->>F: Validate Email Format (Zod)
    F->>B: POST /api/auth/send-otp {email}
    
    B->>DB: SELECT * FROM users WHERE email = ?
    alt User Exists
        DB-->>B: User Found
    else New User
        DB-->>B: No User
        B->>DB: INSERT INTO users (email, display_id)
        DB-->>B: New User Created (UR0000XXX)
    end
    
    B->>B: Generate 6-digit OTP (crypto.randomInt)
    B->>DB: INSERT INTO otp_codes (email, code, expires_at)
    DB-->>B: OTP Stored
    
    B->>MSG: POST /api/v5/email/send
    Note right of MSG: Template: OTP Verification<br/>Code: 123456<br/>Valid: 5 minutes
    MSG->>E: Send Email
    E-->>U: Email Received
    MSG-->>B: 200 OK (Message ID)
    B-->>F: 200 OK {message: "OTP sent successfully"}
    F-->>U: Show OTP Input Field
    
    Note over U,S: Phase 2: Verify OTP
    U->>F: Enter OTP Code (123456)
    F->>B: POST /api/auth/verify-otp {email, otp}
    
    B->>DB: SELECT * FROM otp_codes WHERE email = ? AND code = ?
    DB-->>B: OTP Record
    
    alt OTP Valid & Not Expired
        B->>DB: UPDATE otp_codes SET used = true
        B->>DB: SELECT * FROM users WHERE email = ?
        DB-->>B: User Data
        
        B->>S: Create Session
        S-->>B: Session ID
        B->>B: Set Cookie (httpOnly, secure, 30 days)
        B-->>F: 200 OK + Session Cookie + User Data
        F->>F: Store User in Context
        F-->>U: Redirect to Dashboard
    else OTP Invalid or Expired
        B-->>F: 400 Bad Request {error: "Invalid OTP"}
        F-->>U: Show Error + Allow Retry
    end
```

---

## Google OAuth 2.0 Flow

### Complete OAuth Implementation

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as Google OAuth
    participant DB as Database
    participant S as Session Store
    
    Note over U,S: Phase 1: Initiate OAuth
    U->>F: Click "Continue with Google"
    F->>B: GET /api/auth/google
    B->>B: Generate State Token (CSRF protection)
    B->>B: Build OAuth URL with scope & redirect_uri
    B-->>F: 302 Redirect to Google
    F->>G: Redirect to accounts.google.com/o/oauth2/v2/auth
    
    Note over U,S: Phase 2: Google Authorization
    U->>G: Grant Permissions (Email, Profile)
    G->>G: User Approves Access
    G-->>B: 302 Redirect to /api/auth/google/callback?code=AUTH_CODE&state=STATE_TOKEN
    
    Note over U,S: Phase 3: Exchange Code for Token
    B->>B: Verify State Token (CSRF)
    B->>G: POST /token {code, client_id, client_secret}
    G->>G: Validate Authorization Code
    G-->>B: Access Token + ID Token
    
    Note over U,S: Phase 4: Fetch User Profile
    B->>G: GET /userinfo (Authorization: Bearer ACCESS_TOKEN)
    G-->>B: User Profile {email, name, picture, sub}
    
    Note over U,S: Phase 5: Create/Update User
    B->>DB: SELECT * FROM users WHERE google_id = sub
    alt Existing User
        DB-->>B: User Found
    else New User
        B->>DB: INSERT INTO users (email, name, google_id, avatar)
        B->>DB: INSERT INTO display_ids (UR0000XXX)
        DB-->>B: New User Created
    end
    
    Note over U,S: Phase 6: Create Session
    B->>S: Create Session with user_id
    S-->>B: Session ID
    B->>B: Set httpOnly Cookie
    B-->>F: 302 Redirect to /mypanel + Session Cookie
    F->>F: Check Session (/api/auth/user)
    F-->>U: Show Logged-In Dashboard
```

---

## Email + Password Authentication

### Registration & Login Flow

```mermaid
flowchart TD
    Start([User Action]) --> Action{Register or Login?}
    
    Action -->|Register| RegForm[Enter Email + Password + Name]
    Action -->|Login| LoginForm[Enter Email + Password]
    
    RegForm --> ValidateReg{Valid Input?}
    ValidateReg -->|No| RegError[Show Validation Error]
    RegError --> RegForm
    ValidateReg -->|Yes| CheckExists{Email Exists?}
    
    CheckExists -->|Yes| ExistsError[Show: Email already registered]
    CheckExists -->|No| HashPass[Hash Password bcrypt]
    HashPass --> CreateUser[INSERT INTO users]
    CreateUser --> GenDisplayID[Generate Display ID UR0000XXX]
    GenDisplayID --> CreateSession[Create Session]
    
    LoginForm --> ValidateLogin{Valid Input?}
    ValidateLogin -->|No| LoginError[Show Validation Error]
    LoginError --> LoginForm
    ValidateLogin -->|Yes| FetchUser[SELECT FROM users WHERE email]
    
    FetchUser --> UserFound{User Exists?}
    UserFound -->|No| NotFoundError[Show: Invalid credentials]
    UserFound -->|Yes| ComparePass{Password Match?}
    
    ComparePass -->|No| WrongPassError[Show: Invalid credentials]
    ComparePass -->|Yes| CreateSession
    
    CreateSession --> SetCookie[Set httpOnly Cookie]
    SetCookie --> UpdateUI[Update Frontend]
    UpdateUI --> Dashboard[Redirect to MyPanel]
    
    ExistsError --> End([End])
    NotFoundError --> LoginForm
    WrongPassError --> LoginForm
    Dashboard --> End
    
    style CreateSession fill:#90EE90
    style Dashboard fill:#90EE90
    style ExistsError fill:#FF6B6B
    style NotFoundError fill:#FF6B6B
    style WrongPassError fill:#FF6B6B
```

---

## Session Management System

### Session Creation & Validation

```mermaid
flowchart TD
    Auth([Successful Authentication]) --> GenSession[Generate Session ID]
    GenSession --> StoreDB[Store in PostgreSQL Session Store]
    StoreDB --> SessionData["Session Data:<br/>- user_id<br/>- email<br/>- display_id<br/>- role<br/>- created_at<br/>- expires_at"]
    SessionData --> SetCookie[Set httpOnly Cookie]
    
    SetCookie --> CookieSettings["Cookie Settings:<br/>httpOnly: true<br/>secure: true (prod)<br/>sameSite: 'lax'<br/>maxAge: 30 days"]
    CookieSettings --> SendClient[Send to Client]
    
    SendClient --> ClientStore[Browser Stores Cookie]
    ClientStore --> SubsequentReq[Subsequent Requests]
    
    SubsequentReq --> SendCookie[Browser Auto-Sends Cookie]
    SendCookie --> ValidateSession{Session Valid?}
    
    ValidateSession -->|Yes| FetchUser[Fetch User Data]
    ValidateSession -->|No| ClearCookie[Clear Cookie]
    
    FetchUser --> CheckExpiry{Expired?}
    CheckExpiry -->|No| GrantAccess[Grant Access]
    CheckExpiry -->|Yes| ClearCookie
    
    ClearCookie --> Redirect[Redirect to Login]
    GrantAccess --> Success([Authenticated Request])
    
    style GrantAccess fill:#90EE90
    style ClearCookie fill:#FF6B6B
```

---

## Database Schema

### WytPass Tables

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  display_id VARCHAR(20) UNIQUE NOT NULL,  -- UR0000001
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,                       -- NULL for OAuth users
  name VARCHAR(255),
  avatar TEXT,
  google_id VARCHAR(255) UNIQUE,           -- Google OAuth
  linkedin_id VARCHAR(255) UNIQUE,         -- LinkedIn OAuth
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP Codes Table
CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_email_code (email, code),
  INDEX idx_expires_at (expires_at)
);

-- Sessions Table (managed by connect-pg-simple)
CREATE TABLE session (
  sid VARCHAR PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX idx_session_expire ON session (expire);
```

---

## Security Features

### 1. Password Security

```typescript
// Password Hashing (Registration)
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Password Verification (Login)
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### 2. OTP Security

```typescript
// Generate Secure OTP
import crypto from 'crypto';

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Set Expiry
const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
```

**Features:**
- 6-digit random code
- 5-minute expiry
- One-time use only
- Rate limiting (1 per minute per email)
- Max 3 failed attempts before lockout

### 3. OAuth Security

```typescript
// State Token for CSRF Protection
const state = crypto.randomBytes(32).toString('hex');

// OAuth URL with PKCE
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
authUrl.searchParams.append('redirect_uri', CALLBACK_URL);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', 'email profile');
authUrl.searchParams.append('state', state);
```

### 4. Session Security

```javascript
// Cookie Configuration
{
  name: 'wytnet.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,        // Prevent XSS attacks
    secure: true,          // HTTPS only in production
    sameSite: 'lax',      // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
  },
  store: new PostgresStore({ pool: db })
}
```

---

## API Endpoints

### Authentication Routes

```typescript
// Email OTP Flow
POST /api/auth/send-otp
Body: { email: string }
Response: { message: "OTP sent successfully" }

POST /api/auth/verify-otp
Body: { email: string, otp: string }
Response: { user: User, displayId: string }
Cookies: wytnet.sid (httpOnly, 30 days)

// Google OAuth Flow
GET /api/auth/google
Response: 302 Redirect to Google OAuth

GET /api/auth/google/callback?code=XXX&state=YYY
Response: 302 Redirect to /mypanel
Cookies: wytnet.sid (httpOnly, 30 days)

// Email + Password Flow
POST /api/auth/register
Body: { email: string, password: string, name: string }
Response: { user: User, displayId: string }
Cookies: wytnet.sid (httpOnly, 30 days)

POST /api/auth/login
Body: { email: string, password: string }
Response: { user: User, displayId: string }
Cookies: wytnet.sid (httpOnly, 30 days)

// Session Management
GET /api/auth/user
Response: { id, email, displayId, name, role, avatar }
401 if not authenticated

POST /api/auth/logout
Response: { message: "Logged out successfully" }
Clears: wytnet.sid cookie

// Password Reset
POST /api/auth/forgot-password
Body: { email: string }
Response: { message: "OTP sent to email" }

POST /api/auth/reset-password
Body: { email: string, otp: string, newPassword: string }
Response: { message: "Password reset successful" }
```

---

## Error Handling

### Authentication Errors

| Error Code | Scenario | User Message | Action |
|------------|----------|--------------|--------|
| 400 | Invalid email format | "Please enter a valid email address" | Validate input |
| 400 | Weak password | "Password must be at least 8 characters with uppercase, number, and special character" | Show requirements |
| 400 | Invalid OTP | "Incorrect OTP. Please try again." | Allow retry (3 max) |
| 400 | OTP expired | "OTP has expired. Please request a new one." | Resend OTP |
| 400 | Email already exists | "Email already registered. Try logging in." | Redirect to login |
| 401 | Wrong password | "Invalid email or password" | Generic message for security |
| 401 | User not found | "Invalid email or password" | Generic message for security |
| 403 | Account locked | "Too many failed attempts. Try again in 15 minutes." | Wait or contact support |
| 429 | Rate limit exceeded | "Too many requests. Please try again later." | Wait 1 minute |
| 500 | OAuth error | "Unable to authenticate with Google. Please try again." | Retry or use different method |

---

## Frontend Implementation

### WytPass Hook

```typescript
// useWytPass.ts
export function useWytPass() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);
  
  async function checkSession() {
    try {
      const res = await fetch('/api/auth/user');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function loginWithOTP(email: string, otp: string) {
    const res = await apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: { email, otp }
    });
    setUser(res.user);
    return res;
  }
  
  async function loginWithGoogle() {
    window.location.href = '/api/auth/google';
  }
  
  async function logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }
  
  return { user, isLoading, loginWithOTP, loginWithGoogle, logout };
}
```

---

## Performance Optimization

### 1. Session Caching
- Store user data in React Context
- Avoid repeated `/api/auth/user` calls
- Refresh only on auth events

### 2. OAuth Callback Optimization
- Fast token exchange (<200ms)
- Parallel profile fetch and DB query
- Efficient redirect handling

### 3. OTP Delivery Speed
- MSG91 Email API (<1 second delivery)
- Background job for email sending
- Non-blocking response to user

---

## Related Flows

- [Unified Header Authentication](/en/use-case-flows/unified-header-authentication) - UI implementation
- [Public Pages & Unauthorized Visitor](/en/use-case-flows/public-pages-unauthorized-visitor) - Route protection
- [Super Admin Panel Switching](/en/use-case-flows/admin-panel-switching) - Multi-session management
- [Multi-Tenant Architecture](/en/use-case-flows/multi-tenant-architecture) - Tenant isolation

---

**Next:** Explore [Multi-Tenant Architecture](/en/use-case-flows/multi-tenant-architecture) for user isolation and Row Level Security.
