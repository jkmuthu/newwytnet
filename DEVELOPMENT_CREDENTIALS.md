# WytNet Authentication Credentials

⚠️ **PRODUCTION-READY OAUTH AUTHENTICATION** ⚠️

## Authentication Methods

WytNet uses modern OAuth-based authentication following global best practices. **Email is the exclusive identifier** for all authentication methods:

### Available Authentication Methods (All Email-Based)
1. **Google OAuth** - Sign in with Google account
2. **Email OTP** - Passwordless login via MSG91 Email OTP
3. **Email + Password** - Traditional email/password authentication

## Migration from Mobile Number to Email-Based Auth

**What Changed:**
- ❌ **REMOVED:** Mobile number + password login (deprecated `LoginPage.tsx`)
- ❌ **REMOVED:** WhatsApp OTP authentication (mobile number-based)
- ❌ **REMOVED:** All mobile number-based authentication flows
- ✅ **ADDED:** Email as exclusive identifier for all users
- ✅ **ADDED:** Google OAuth for social login
- ✅ **ADDED:** Email OTP for passwordless authentication

**Current Authentication:**
- All authentication methods use email as the primary identifier
- No mobile number-based authentication available
- Clean OAuth-based architecture following global best practices

## Super Admin Access

### Super Admin (Platform Owner)
- **Email:** jkm@jkmuthu.com
- **Password:** SuperAdmin@2025
- **Access:** Full platform access, all permissions
- **Login URL:** `/admin` (dedicated admin portal)
- **Role:** super_admin

## Test User Accounts

### Demo User 1
- **Email:** demo@wytnet.com
- **Password:** Demo@123
- **Access:** Standard user access
- **Role:** user

### Demo User 2  
- **Email:** test@wytnet.com
- **Password:** Test@123
- **Access:** Standard user access
- **Role:** user

## Login Instructions

### For Regular Users:
1. Go to `/wytpass-login` page (WytPass authentication)
2. Choose your preferred method:
   - **Google OAuth:** Click "Sign in with Google"
   - **Email OTP:** Click "Email OTP" → Enter email → Verify OTP
   - **Email/Password:** Enter email + password → Sign In

### For Super Admin:
1. Go to `/admin` page (Admin portal)
2. Enter email: jkm@jkmuthu.com
3. Enter password: SuperAdmin@2025
4. Access full admin dashboard

## Login Routes

- **Main Login:** `/login` or `/wytpass-login` (OAuth authentication portal)
- **Email OTP Only:** `/email-otp-login` (Direct passwordless authentication)
- **Admin Portal:** `/admin` (Super admin access)

## Security Notes

- All passwords are securely hashed with scrypt (Node.js crypto)
- Google OAuth uses official Google OAuth 2.0
- Email OTP uses MSG91 service for delivery
- Sessions are stored in PostgreSQL with httpOnly cookies
- Production domain: wytnet.com

## OAuth Backend Configuration

### Authentication Strategies

1. **LocalStrategy (Email/Password)**
   - Implementation: `passport-local` in `server/wytpass-auth.ts`
   - Username field: `email`
   - Password verification: scrypt-based hashing with salt
   - User lookup: `whatsappUsers` table by email

2. **GoogleStrategy (OAuth 2.0)**
   - Implementation: `passport-google-oauth20` in `server/wytpass-auth.ts`
   - Client ID: From `GOOGLE_CLIENT_ID` environment variable
   - Client Secret: From `GOOGLE_CLIENT_SECRET` environment variable
   - Callback URL: `${baseUrl}/api/auth/google/callback`
   - Scopes: `["profile", "email"]`
   - Auto-linking: Links Google account to existing email users

3. **Email OTP (MSG91)**
   - Implementation: `MSG91Service` in `server/services/msg91Service.ts`
   - Template: From `MSG91_EMAIL_TEMPLATE_ID` environment variable
   - Auth Key: From `MSG91_AUTH_KEY` environment variable
   - OTP lifetime: 10 minutes
   - Verification endpoint: `/api/auth/email-otp/verify`

### Session Management

- **Store**: PostgreSQL session store (`connect-pg-simple`)
- **Table**: `sessions` (auto-created)
- **Connection**: Uses `DATABASE_URL` environment variable
- **Cookie settings**:
  - httpOnly: true
  - secure: true (production only)
  - maxAge: 7 days
  - domain: `.wytnet.com` (production only)
- **Secret**: From `SESSION_SECRET` environment variable

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/email-otp/send` - Send email OTP
- `POST /api/auth/email-otp/verify` - Verify email OTP
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/status` - Check authentication status

#### Admin Endpoints
- `POST /api/auth/admin/login` - Admin login (email-based)
- `POST /api/auth/admin/verify-mfa` - Admin MFA verification (development mode)
- `GET /api/auth/admin/status` - Check admin authentication
- `POST /api/auth/admin/logout` - Admin logout

### Database Schema

**Table: `whatsappUsers`** (Main user table)
- `id` - UUID primary key
- `email` - Email address (unique)
- `name` - User's full name
- `passwordHash` - Scrypt-hashed password (for email/password auth)
- `role` - User role (user, admin, super_admin)
- `authMethods` - Array of auth methods used (google, email_otp, password)
- `socialProviders` - Array of social providers (google, facebook)
- `socialIds` - JSON object mapping provider to social ID
- `profileImageUrl` - User's profile picture URL
- `tenantId` - Associated tenant (for multi-tenancy)
- `lastLoginAt` - Last login timestamp
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

**Table: `sessions`** (Session storage)
- Auto-managed by `connect-pg-simple`
- Stores serialized session data
- Automatic cleanup of expired sessions

### Environment Variables Required

```bash
# Session Security
SESSION_SECRET=<random-secret-key>

# Google OAuth
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>

# MSG91 Email OTP
MSG91_AUTH_KEY=<msg91-auth-key>
MSG91_EMAIL_TEMPLATE_ID=<msg91-template-id>

# Database
DATABASE_URL=<postgresql-connection-string>
```

---
*Modern OAuth Authentication - Updated October 2025*
