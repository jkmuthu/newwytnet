# API Reference Overview

WytNet provides a comprehensive RESTful API for all platform operations. All APIs follow consistent patterns for authentication, error handling, and data formatting.

## API Base URL

**Development**: `http://localhost:5000/api`  
**Production**: `https://your-domain.com/api`

## Authentication

All API requests (except public endpoints) require authentication via session cookies or API tokens.

### Session-Based Authentication (Web Apps)
```typescript
// Login first
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Session cookie is automatically set
// Subsequent requests include session automatically
```

### Token-Based Authentication (Mobile/External)
```typescript
// Include in request headers
Authorization: Bearer YOUR_API_TOKEN
```

[View Authentication APIs →](/en/api/authentication)

## API Sections

### 1. Authentication APIs
Complete authentication system covering:
- Email/Password login
- Google OAuth integration
- LinkedIn OAuth integration
- Email OTP (passwordless)
- Session management
- Multi-context authentication (Engine Admin, Hub Admin, User)

[View Authentication APIs →](/en/api/authentication)

### 2. User Management APIs
User-related operations:
- User registration and profile management
- Role assignment and permissions
- User search and filtering
- Profile updates
- Avatar upload
- User preferences

[View User APIs →](/en/api/users)

### 3. WytWall APIs
Social networking and content management:
- Post creation and management
- Comments and reactions
- User connections and following
- Feed generation
- Hashtag management
- Content moderation

[View WytWall APIs →](/en/api/wytwall)

### 4. Admin APIs
Platform administration endpoints:
- Module management (create, update, delete)
- App management and activation
- Hub management and configuration
- User management (admin view)
- Audit logs and analytics
- Platform settings configuration

[View Admin APIs →](/en/api/admin)

## Common API Patterns

### Request Format

**JSON Payload**:
```typescript
POST /api/endpoint
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

**Query Parameters**:
```typescript
GET /api/users?page=1&limit=20&search=john
```

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "UR0000001",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User retrieved successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_FAILED",
  "statusCode": 401
}
```

**Paginated Response**:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

## Error Codes

WytNet uses semantic error codes for better error handling:

| Error Code | Description |
|------------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `AUTH_FAILED` | Invalid credentials |
| `AUTH_EXPIRED` | Session expired |
| `PERMISSION_DENIED` | Insufficient permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Resource not found |
| `RESOURCE_CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

All APIs are rate-limited to prevent abuse:

- **Default**: 100 requests per minute per IP
- **Authenticated Users**: 300 requests per minute per user
- **Admin APIs**: 500 requests per minute per admin

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432
```

## CORS Policy

**Development**: All origins allowed  
**Production**: Whitelist specific domains

Allowed headers:
- `Content-Type`
- `Authorization`
- `X-Requested-With`

Allowed methods:
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

## API Versioning

Current API version: **v1**

All endpoints are prefixed with `/api/` (implied version 1).

Future versions will use explicit versioning:
- `/api/v2/...`

## Webhooks

WytNet supports webhooks for real-time event notifications:

**Supported Events**:
- `user.created`
- `user.updated`
- `post.created`
- `module.activated`
- `hub.created`

**Webhook Payload**:
```json
{
  "event": "user.created",
  "timestamp": "2025-10-21T15:30:00Z",
  "data": {
    "userId": "UR0000001",
    "email": "user@example.com"
  }
}
```

## GraphQL Support

GraphQL API is planned for future releases. Currently, all operations use REST.

## SDK & Client Libraries

**Official SDKs** (Coming Soon):
- JavaScript/TypeScript SDK
- Python SDK
- PHP SDK

**Community SDKs**:
- Open for community contributions

## API Exploration

### Postman Collection
Download the complete Postman collection for WytNet APIs:
- [Download Postman Collection](#) *(Coming Soon)*

### OpenAPI Specification
View the OpenAPI (Swagger) specification:
- [View OpenAPI Docs](#) *(Coming Soon)*

## Related Documentation

- [Authentication APIs](/en/api/authentication) - Login, OAuth, sessions
- [User APIs](/en/api/users) - User management endpoints
- [WytWall APIs](/en/api/wytwall) - Social networking endpoints
- [Admin APIs](/en/api/admin) - Platform administration
- [Architecture](/en/architecture/) - Technical architecture
- [RBAC System](/en/architecture/rbac) - Permission model
