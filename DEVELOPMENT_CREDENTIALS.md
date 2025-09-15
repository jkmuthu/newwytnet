# Standard User Credentials

⚠️ **FIXED STANDARD CREDENTIALS - DO NOT CHANGE** ⚠️

## Standard User Accounts

### 1. Super Admin
- **Username:** 9345228184
- **Password:** sadmin12
- **Access:** Full system access, all permissions
- **Can Change Password:** ✅ Yes (via WytPanel → My Account)

### 2. Admin User  
- **Username:** 8220449933
- **Password:** admin123
- **Access:** Admin panel access
- **Can Change Password:** ✅ Yes (via WytPanel → My Account)

### 3. Demo User
- **Username:** 9876543210
- **Password:** demo1234
- **Access:** Standard user access (read-only)
- **Can Change Password:** ❌ No (locked for demo purposes)

## Login Instructions

1. Go to `/login` page
2. Select country code (default: India +91)
3. Enter mobile number (username)
4. Enter password
5. Click "Sign In"

## Alternative Login Methods

- **WhatsApp OTP:** `/whatsapp-auth` (OTP-based authentication)
- **Social Login:** Google/Facebook (requires API setup)

## Security Notes

- Mobile numbers are always the username
- Super Admin & Admin can change passwords from WytPanel
- Demo User password is locked (cannot be changed)
- All passwords are securely hashed with bcrypt

---
*Standard Instructions - Do Not Modify*