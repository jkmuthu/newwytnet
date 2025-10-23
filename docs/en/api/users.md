# User Management API Reference

:::danger PRODUCTION API STANDARDS
All user endpoints MUST implement:
- ✅ **Session Validation** - Verify user is authenticated
- 🔒 **Data Ownership** - Users can only access/modify their own data
- 📊 **Input Sanitization** - Prevent XSS attacks on user-generated content
- ⚠️ **Privacy Protection** - Respect privacy settings, don't leak sensitive data
- 🎯 **Tenant Isolation** - Filter by tenant_id where applicable

See [Production Standards](/en/production-standards/) for complete requirements.
:::

## Overview

The User Management API provides endpoints for managing user profiles, settings, notifications, and sessions. All endpoints require authentication via the WytPass session cookie.

---

## Base URL

```
Production: https://wytnet.com
Development: https://your-replit-dev-domain.replit.dev
```

---

## Authentication

All user management endpoints require a valid session cookie:

```http
Cookie: wytpass.sid=<session-id>
```

Unauthenticated requests will receive a `401 Unauthorized` response.

---

## User Profile Management

### GET /api/user/profile

Get the current user's complete profile information.

**Authentication Required**: Yes

**Request**

```http
GET /api/user/profile
Cookie: wytpass.sid=<session-id>
```

**Example Request**

```bash
curl -X GET https://wytnet.com/api/user/profile \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Success Response (200 OK)**

```typescript
{
  // Basic Information
  id: string;                    // User UUID
  displayId: string;             // WytID (e.g., UR0000001)
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  
  // Contact Information
  whatsappNumber?: string;
  
  // Profile Details
  username?: string;
  nickName?: string;
  bio?: string;
  mobileNumber?: string;
  gender?: string;
  dateOfBirth?: string;          // ISO 8601 date
  maritalStatus?: string;
  motherTongue?: string;
  homeLocation?: string;
  livingIn?: string;
  languagesKnown?: Array<{
    code: string;                // 'en', 'ta', 'hi'
    name: string;                // 'English', 'Tamil'
    speak: boolean;
    write: boolean;
  }>;
  
  // Professional Information
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  skills?: string[];
  interests?: string[];
  
  // Social Links
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
  };
  
  // Address
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  
  // Privacy Settings
  privacySettings?: {
    email?: 'public' | 'private';
    mobileNumber?: 'public' | 'private';
    whatsappNumber?: 'public' | 'private';
    // ... other fields
  };
  
  // Metadata
  profileCompletionPercentage?: number;  // 0-100
  profileComplete: boolean;
  role: string;
  isVerified: boolean;
  lastLoginAt?: string;          // ISO 8601 datetime
  createdAt: string;
  updatedAt: string;
  
  // Authentication Methods
  authMethods: string[];         // ['password', 'google', 'email_otp']
  socialProviders: string[];     // ['google', 'linkedin']
}
```

**Error Responses**

```typescript
// 401 Unauthorized
{
  message: "Not authenticated"
}

// 500 Internal Server Error
{
  message: "Failed to fetch user profile"
}
```

---

### PATCH /api/user/profile

Update the current user's profile information.

**Authentication Required**: Yes

**Request**

```typescript
PATCH /api/user/profile
Content-Type: application/json
Cookie: wytpass.sid=<session-id>

{
  // All fields are optional
  name?: string;
  firstName?: string;
  lastName?: string;
  nickName?: string;
  bio?: string;
  mobileNumber?: string;
  gender?: string;
  dateOfBirth?: string;          // ISO 8601 date
  maritalStatus?: string;
  motherTongue?: string;
  homeLocation?: string;
  livingIn?: string;
  languagesKnown?: Array<{
    code: string;
    name: string;
    speak: boolean;
    write: boolean;
  }>;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  skills?: string[];
  interests?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
  };
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}
```

**Example Request**

```bash
curl -X PATCH https://wytnet.com/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: wytpass.sid=<session-id>" \
  -d '{
    "name": "John Doe",
    "bio": "Software developer passionate about AI",
    "company": "Tech Corp",
    "jobTitle": "Senior Developer",
    "skills": ["JavaScript", "TypeScript", "React"],
    "location": "Chennai, India"
  }'
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Profile updated successfully";
  user: {
    // Updated user object with all fields
    id: string;
    displayId: string;
    email: string;
    name: string;
    // ... (same as GET /api/user/profile response)
  }
}
```

**Error Responses**

```typescript
// 400 Bad Request - Validation error
{
  success: false;
  message: "Invalid input data";
  errors: {
    email?: string;
    mobileNumber?: string;
    // ... field-specific errors
  }
}

// 401 Unauthorized
{
  message: "Not authenticated"
}

// 500 Internal Server Error
{
  success: false;
  message: "Failed to update profile"
}
```

---

### PATCH /api/user/profile-photo

Update the user's profile photo.

**Authentication Required**: Yes

**Request**

```typescript
PATCH /api/user/profile-photo
Content-Type: multipart/form-data
Cookie: wytpass.sid=<session-id>

{
  photo: File;  // Image file (JPEG, PNG, WebP)
}
```

**Example Request**

```bash
curl -X PATCH https://wytnet.com/api/user/profile-photo \
  -H "Cookie: wytpass.sid=<session-id>" \
  -F "photo=@/path/to/photo.jpg"
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Profile photo updated successfully";
  profileImageUrl: string;  // URL to the uploaded image
}
```

**File Requirements**

- Max file size: 5MB
- Allowed formats: JPEG, PNG, WebP
- Recommended resolution: 500x500px (square)

---

## User Settings Management

### GET /api/user/settings

Get the current user's settings and preferences.

**Authentication Required**: Yes

**Request**

```http
GET /api/user/settings
Cookie: wytpass.sid=<session-id>
```

**Success Response (200 OK)**

```typescript
{
  // Notification Preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  
  // Notification Categories
  notificationPreferences: {
    wytwall: boolean;           // WytWall post notifications
    matches: boolean;           // WytMatch notifications
    messages: boolean;          // Direct messages
    payments: boolean;          // Payment & transaction updates
    security: boolean;          // Security alerts
    marketing: boolean;         // Marketing & promotional emails
  };
  
  // Appearance Preferences
  theme: 'light' | 'dark' | 'system';
  language: string;             // 'en', 'ta', etc.
  timezone: string;             // 'Asia/Kolkata'
  dateFormat: string;           // 'DD/MM/YYYY', 'MM/DD/YYYY'
  timeFormat: '12h' | '24h';
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'connections';
  showOnlineStatus: boolean;
  allowSearchEngineIndexing: boolean;
  
  // Communication Preferences
  allowDirectMessages: boolean;
  allowConnectionRequests: boolean;
  
  // Data & Security
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  
  // Metadata
  updatedAt: string;
}
```

---

### PATCH /api/user/settings

Update user settings and preferences.

**Authentication Required**: Yes

**Request**

```typescript
PATCH /api/user/settings
Content-Type: application/json
Cookie: wytpass.sid=<session-id>

{
  // All fields are optional
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  notificationPreferences?: {
    wytwall?: boolean;
    matches?: boolean;
    messages?: boolean;
    payments?: boolean;
    security?: boolean;
    marketing?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  profileVisibility?: 'public' | 'private' | 'connections';
  showOnlineStatus?: boolean;
  allowSearchEngineIndexing?: boolean;
  allowDirectMessages?: boolean;
  allowConnectionRequests?: boolean;
  twoFactorEnabled?: boolean;
  loginAlerts?: boolean;
}
```

**Example Request**

```bash
curl -X PATCH https://wytnet.com/api/user/settings \
  -H "Content-Type: application/json" \
  -H "Cookie: wytpass.sid=<session-id>" \
  -d '{
    "theme": "dark",
    "emailNotifications": true,
    "notificationPreferences": {
      "wytwall": true,
      "messages": true,
      "marketing": false
    }
  }'
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Settings updated successfully";
  settings: {
    // Updated settings object
  }
}
```

---

## Notifications

### GET /api/user/notifications

Get user notifications with pagination.

**Authentication Required**: Yes

**Request**

```http
GET /api/user/notifications?page=1&limit=20&filter=unread
Cookie: wytpass.sid=<session-id>
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| filter | string | 'all' | 'all', 'unread', 'read' |
| category | string | - | Filter by category ('wytwall', 'matches', 'messages', etc.) |

**Success Response (200 OK)**

```typescript
{
  notifications: Array<{
    id: string;
    userId: string;
    type: string;              // 'wytwall_post', 'wytmatch', 'message', 'payment'
    category: string;          // 'wytwall', 'matches', 'messages', 'payments'
    title: string;
    message: string;
    data?: Record<string, any>;  // Additional data (post ID, user ID, etc.)
    isRead: boolean;
    actionUrl?: string;        // URL to navigate when clicked
    imageUrl?: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount: number;
}
```

**Example Request**

```bash
curl -X GET "https://wytnet.com/api/user/notifications?page=1&limit=10&filter=unread" \
  -H "Cookie: wytpass.sid=<session-id>"
```

---

### GET /api/user/notifications/unread-count

Get the count of unread notifications.

**Authentication Required**: Yes

**Request**

```http
GET /api/user/notifications/unread-count
Cookie: wytpass.sid=<session-id>
```

**Success Response (200 OK)**

```typescript
{
  unreadCount: number;
}
```

---

### PATCH /api/user/notifications/:id/read

Mark a specific notification as read.

**Authentication Required**: Yes

**Request**

```http
PATCH /api/user/notifications/:id/read
Cookie: wytpass.sid=<session-id>
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Notification marked as read";
  notification: {
    id: string;
    isRead: true;
    readAt: string;
  }
}
```

---

### POST /api/user/notifications/mark-all-read

Mark all notifications as read.

**Authentication Required**: Yes

**Request**

```http
POST /api/user/notifications/mark-all-read
Cookie: wytpass.sid=<session-id>
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "All notifications marked as read";
  updatedCount: number;
}
```

---

## Session Management

### GET /api/user/sessions

Get all active sessions for the current user.

**Authentication Required**: Yes

**Request**

```http
GET /api/user/sessions
Cookie: wytpass.sid=<session-id>
```

**Success Response (200 OK)**

```typescript
{
  sessions: Array<{
    id: string;              // Session ID
    deviceName: string;      // 'Chrome on Windows'
    deviceType: string;      // 'desktop', 'mobile', 'tablet'
    browser: string;         // 'Chrome', 'Safari', 'Firefox'
    os: string;              // 'Windows', 'macOS', 'iOS', 'Android'
    ipAddress: string;
    location?: string;       // 'Chennai, India' (based on IP)
    isCurrent: boolean;      // Is this the current session?
    createdAt: string;       // ISO 8601
    lastActive: string;      // ISO 8601
    expiresAt: string;       // ISO 8601
  }>;
}
```

**Example Response**

```json
{
  "sessions": [
    {
      "id": "sess_abc123",
      "deviceName": "Chrome on Windows",
      "deviceType": "desktop",
      "browser": "Chrome",
      "os": "Windows",
      "ipAddress": "103.21.58.12",
      "location": "Chennai, India",
      "isCurrent": true,
      "createdAt": "2025-10-20T10:00:00Z",
      "lastActive": "2025-10-20T12:30:00Z",
      "expiresAt": "2025-10-27T10:00:00Z"
    },
    {
      "id": "sess_def456",
      "deviceName": "Safari on iPhone",
      "deviceType": "mobile",
      "browser": "Safari",
      "os": "iOS",
      "ipAddress": "103.21.58.45",
      "location": "Mumbai, India",
      "isCurrent": false,
      "createdAt": "2025-10-18T08:00:00Z",
      "lastActive": "2025-10-19T20:15:00Z",
      "expiresAt": "2025-10-25T08:00:00Z"
    }
  ]
}
```

---

### DELETE /api/user/sessions/:id

Revoke a specific session (logout from another device).

**Authentication Required**: Yes

**Request**

```http
DELETE /api/user/sessions/:id
Cookie: wytpass.sid=<session-id>
```

**Example Request**

```bash
curl -X DELETE https://wytnet.com/api/user/sessions/sess_def456 \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Session revoked successfully";
}
```

**Error Responses**

```typescript
// 400 Bad Request - Cannot revoke current session
{
  success: false;
  message: "Cannot revoke current session. Use logout instead."
}

// 404 Not Found - Session not found
{
  success: false;
  message: "Session not found"
}
```

---

### POST /api/user/sessions/revoke-all

Revoke all sessions except the current one.

**Authentication Required**: Yes

**Request**

```http
POST /api/user/sessions/revoke-all
Cookie: wytpass.sid=<session-id>
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "All other sessions revoked successfully";
  revokedCount: number;
}
```

---

## Account Management

### PATCH /api/user/password

Change user password.

**Authentication Required**: Yes

**Request**

```typescript
PATCH /api/user/password
Content-Type: application/json
Cookie: wytpass.sid=<session-id>

{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Example Request**

```bash
curl -X PATCH https://wytnet.com/api/user/password \
  -H "Content-Type: application/json" \
  -H "Cookie: wytpass.sid=<session-id>" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass456!",
    "confirmPassword": "NewPass456!"
  }'
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Password changed successfully";
}
```

**Error Responses**

```typescript
// 400 Bad Request - Validation error
{
  success: false;
  message: "Passwords do not match"
}

// 401 Unauthorized - Wrong current password
{
  success: false;
  message: "Current password is incorrect"
}
```

---

### PATCH /api/user/email

Change user email address.

**Authentication Required**: Yes

**Request**

```typescript
PATCH /api/user/email
Content-Type: application/json
Cookie: wytpass.sid=<session-id>

{
  newEmail: string;
  password: string;  // Confirmation
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Verification email sent to new address";
  requiresVerification: true;
}
```

---

### DELETE /api/user/account

Delete user account (soft delete).

**Authentication Required**: Yes

**Request**

```typescript
DELETE /api/user/account
Content-Type: application/json
Cookie: wytpass.sid=<session-id>

{
  password: string;          // Confirmation
  reason?: string;           // Optional deletion reason
  feedback?: string;         // Optional feedback
}
```

**Success Response (200 OK)**

```typescript
{
  success: true;
  message: "Account deleted successfully";
}
```

**Note**: Accounts are soft-deleted and can be recovered within 30 days by contacting support.

---

## Frontend Integration

### React Example

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Get user profile
const { data: profile, isLoading } = useQuery({
  queryKey: ['/api/user/profile'],
});

// Update profile
const updateProfileMutation = useMutation({
  mutationFn: async (data: Partial<UserProfile>) => {
    const res = await apiRequest('/api/user/profile', 'PATCH', data);
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    queryClient.invalidateQueries({ queryKey: ['user-auth'] });
  },
});

// Get notifications
const { data: notifications } = useQuery({
  queryKey: ['/api/user/notifications', { page: 1, limit: 20 }],
});

// Mark notification as read
const markReadMutation = useMutation({
  mutationFn: async (notificationId: string) => {
    const res = await apiRequest(
      `/api/user/notifications/${notificationId}/read`,
      'PATCH'
    );
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/notifications'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/notifications/unread-count'] });
  },
});

// Update settings
const updateSettingsMutation = useMutation({
  mutationFn: async (settings: Partial<UserSettings>) => {
    const res = await apiRequest('/api/user/settings', 'PATCH', settings);
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
  },
});

// Usage in component
function ProfileSettings() {
  const handleUpdateProfile = async (data: any) => {
    await updateProfileMutation.mutateAsync(data);
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
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Not authenticated, session expired |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email/username already exists |
| 422 | Unprocessable Entity | Invalid data format |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| PATCH /api/user/profile | 10 requests | 1 minute |
| PATCH /api/user/password | 3 requests | 15 minutes |
| PATCH /api/user/email | 3 requests | 1 hour |
| POST /api/user/profile-photo | 5 requests | 10 minutes |

---

## Testing

### cURL Examples

**Get Profile**

```bash
curl -X GET https://wytnet.com/api/user/profile \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Update Profile**

```bash
curl -X PATCH https://wytnet.com/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: wytpass.sid=<session-id>" \
  -d '{
    "name": "John Doe Updated",
    "bio": "New bio",
    "location": "Mumbai"
  }'
```

**Get Notifications**

```bash
curl -X GET "https://wytnet.com/api/user/notifications?filter=unread" \
  -H "Cookie: wytpass.sid=<session-id>"
```

**Update Settings**

```bash
curl -X PATCH https://wytnet.com/api/user/settings \
  -H "Content-Type: application/json" \
  -H "Cookie: wytpass.sid=<session-id>" \
  -d '{
    "theme": "dark",
    "emailNotifications": false
  }'
```
