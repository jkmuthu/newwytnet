# WytNet Authentication Credentials

⚠️ **PRODUCTION-READY OAUTH AUTHENTICATION** ⚠️

## Authentication Methods

WytNet uses modern OAuth-based authentication following global best practices:

1. **Google OAuth** - Sign in with Google account
2. **Email OTP** - Passwordless login via MSG91 Email OTP
3. **Email + Password** - Traditional email/password authentication

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

## Alternative Login Routes

- **WytPass Login:** `/wytpass-login` (Main user authentication)
- **Email OTP Only:** `/email-otp-login` (Passwordless authentication)
- **Admin Portal:** `/admin` (Super admin access)

## Security Notes

- All passwords are securely hashed with bcrypt
- Google OAuth uses official Google OAuth 2.0
- Email OTP uses MSG91 service for delivery
- Sessions are stored in PostgreSQL with httpOnly cookies
- Production domain: wytnet.com

---
*Modern OAuth Authentication - Updated October 2025*
