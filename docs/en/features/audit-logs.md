# Audit Logs System

## Overview

The **Audit Logs System** provides comprehensive tracking of all administrative actions performed in the WytNet platform. Every create, update, delete, and configuration change is automatically logged with full context, enabling accountability, security monitoring, and compliance auditing.

**Access**: Engine Admin → System → Audit Logs

---

## Purpose

- **Accountability**: Track who did what and when
- **Security**: Detect suspicious or unauthorized activities
- **Compliance**: Meet regulatory requirements (GDPR, SOC 2, HIPAA)
- **Debugging**: Trace the source of configuration issues
- **Analytics**: Understand platform usage patterns

---

## What Gets Logged

### Administrative Actions

**User Management**:
- User creation, updates, deletions
- Role assignments and permission changes
- Password resets and email changes
- User activation/deactivation

**Hub Management**:
- Hub creation, updates, deletions
- Domain configuration changes
- Hub settings modifications
- Hub admin role assignments

**Module & App Management**:
- Module installations and removals
- App creations, updates, deletions
- Route configuration changes
- Version deployments

**System Configuration**:
- Platform settings changes
- RBAC policy updates
- Integration configurations
- API key rotations

**Data Operations**:
- Bulk imports/exports
- Database schema migrations
- Mass deletions or updates

### Excluded Actions

For performance and privacy reasons, these actions are NOT logged:

- Regular user logins (only admin logins logged)
- Page views and navigation
- Read-only queries (GET requests)
- Failed authentication attempts (logged separately in security logs)

---

## Log Entry Structure

Each audit log entry contains:

```typescript
{
  id: string,                  // Unique log ID
  timestamp: Date,             // When action occurred
  userId: string,              // Who performed the action
  userName: string,            // User's display name
  userEmail: string,           // User's email
  action: string,              // What was done (e.g., "user.create")
  resource: string,            // What was affected (e.g., "User")
  resourceId: string,          // Specific resource ID
  details: object,             // Action-specific details
  ipAddress: string,           // Source IP address
  userAgent: string,           // Browser/client info
  tenantId: string,            // Which tenant (for multi-tenancy)
  severity: string,            // info | warning | critical
  changes?: {                  // Before/after for updates
    before: object,
    after: object
  }
}
```

### Action Naming Convention

Actions follow the pattern: `<resource>.<operation>`

**Examples**:
- `user.create` - New user created
- `user.update` - User details updated
- `user.delete` - User deleted
- `hub.create` - New hub created
- `role.assign` - Role assigned to user
- `setting.update` - Platform setting changed
- `module.install` - Module installed
- `app.deploy` - Application deployed

---

## User Interface

### List View

**Features**:
- **Timeline Display**: Chronological list of all actions
- **Filtering**: Filter by user, action type, resource, date range
- **Search**: Full-text search across all log fields
- **Pagination**: Navigate large log histories
- **Export**: Download logs as CSV or JSON

**Columns**:
- Timestamp (with relative time, e.g., "2 hours ago")
- User (with avatar and email)
- Action (color-coded by severity)
- Resource (with link to resource if still exists)
- Details (expandable)

### Detail View

Click any log entry to see full details:

**Information Shown**:
- Complete action context
- All metadata (IP, user agent, etc.)
- Before/after comparison (for updates)
- Related logs (other actions on same resource)
- JSON export of raw log data

**Color Coding**:
- 🔵 **Info** (blue): Normal operations
- 🟡 **Warning** (yellow): Potentially risky actions
- 🔴 **Critical** (red): Destructive or security-sensitive actions

---

## Filtering and Search

### Quick Filters

Pre-defined filters for common queries:

- **My Actions**: See only your own actions
- **Today**: Actions in last 24 hours
- **This Week**: Actions in last 7 days
- **Critical Only**: High-severity actions
- **User Changes**: All user-related actions
- **System Changes**: Configuration modifications

### Advanced Filters

**By User**:
- Select from dropdown of all users
- Filter by user role
- Filter by tenant

**By Action Type**:
- Multiple action types (OR logic)
- Action category (create, update, delete)

**By Date Range**:
- Custom start/end dates
- Relative ranges (last N days/weeks/months)

**By Resource**:
- Filter by resource type (User, Hub, App, etc.)
- Filter by specific resource ID

### Search

Full-text search across:
- User names and emails
- Action descriptions
- Resource names and IDs
- Log details (JSON content)
- IP addresses

**Example Search Queries**:
- `john@example.com` - All actions by this user
- `delete` - All deletion actions
- `Hub00001` - All actions on this hub
- `192.168.1.100` - All actions from this IP

---

## Automatic Logging Implementation

### Backend Middleware

Audit logging is implemented as Express middleware:

```typescript
// server/middleware/auditLog.ts

export function auditLog(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = (body: any) => {
      // Log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        createAuditLog({
          userId: req.user?.id,
          userName: req.user?.name,
          userEmail: req.user?.email,
          action,
          resource,
          resourceId: body.id || req.params.id,
          details: {
            request: req.body,
            response: body
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          tenantId: req.user?.tenantId,
          severity: getSeverity(action)
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
}
```

### Usage in Routes

```typescript
// Apply to specific routes
app.post('/api/admin/users', 
  auditLog('user.create', 'User'),
  async (req, res) => {
    // Create user logic
  }
);

app.delete('/api/admin/users/:id',
  auditLog('user.delete', 'User'),
  async (req, res) => {
    // Delete user logic
  }
);
```

### Change Tracking

For update operations, capture before/after state:

```typescript
app.patch('/api/admin/users/:id',
  auditLog('user.update', 'User'),
  async (req, res) => {
    // Get current state
    const before = await db.query.users.findFirst({
      where: eq(users.id, req.params.id)
    });
    
    // Perform update
    const after = await db.update(users)
      .set(req.body)
      .where(eq(users.id, req.params.id))
      .returning();
    
    // Log includes before/after in details
    res.json(after[0]); // Middleware logs automatically
  }
);
```

---

## Retention and Archival

### Retention Policy

**Default Retention**: 90 days

**Configurable Retention** (per tenant):
- **Standard**: 30 days
- **Professional**: 90 days  
- **Enterprise**: 365 days
- **Custom**: Unlimited (with manual archival)

### Automatic Cleanup

Cron job runs daily at midnight:

```typescript
// Clean up old logs beyond retention period
await db.delete(auditLogs)
  .where(
    and(
      lt(auditLogs.timestamp, retentionCutoff),
      eq(auditLogs.tenantId, tenantId)
    )
  );
```

### Manual Archival

Admins can export logs before deletion:

1. Go to Audit Logs → Export
2. Select date range
3. Choose format (CSV, JSON, or database dump)
4. Download archive file
5. Store securely (S3, compliance archives, etc.)

---

## Security and Privacy

### Access Control

- **Super Admin**: Full access to all tenant logs
- **Hub Admin**: Access only to their hub's logs
- **Regular Users**: No access to audit logs

**Permission**: `audit_logs.view`

### Data Protection

- **Encrypted Storage**: Logs stored with encryption at rest
- **TLS in Transit**: All log viewing uses HTTPS
- **IP Anonymization**: Optional IP masking for GDPR compliance
- **PII Redaction**: Sensitive fields can be auto-redacted

### Tamper Protection

- **Immutable Logs**: Logs cannot be edited or deleted by users
- **Cryptographic Hashing**: Each log entry includes integrity hash
- **Blockchain Option** (Enterprise): Write hashes to blockchain for ultimate tamper-proofing

---

## Analytics and Reporting

### Usage Dashboard

**Metrics Shown**:
- Total actions per day/week/month
- Top users by activity
- Action distribution (creates vs updates vs deletes)
- Most modified resources
- Peak usage times

### Compliance Reports

Pre-built reports for compliance auditors:

**SOC 2 Report**:
- All administrative access to production data
- Configuration changes affecting security
- User permission modifications
- Failed access attempts

**GDPR Report**:
- All actions on user personal data
- Data exports and deletions
- Consent modifications
- Third-party data sharing

**HIPAA Report** (Healthcare):
- Access to protected health information
- Data breaches or suspected incidents
- Administrative actions affecting PHI

### Custom Reports

Build custom reports with filters:
1. Select date range
2. Choose action types
3. Filter by users/resources
4. Group by time period or category
5. Export as PDF or schedule email delivery

---

## API Reference

### GET /api/admin/audit-logs

List audit logs with filtering and pagination.

**Query Parameters**:
```typescript
{
  page?: number,           // Page number (default: 1)
  limit?: number,          // Logs per page (default: 50, max: 500)
  userId?: string,         // Filter by user
  action?: string[],       // Filter by action types
  resource?: string,       // Filter by resource type
  startDate?: string,      // ISO 8601 date
  endDate?: string,        // ISO 8601 date
  search?: string,         // Full-text search
  severity?: string[]      // Filter by severity
}
```

**Response**:
```typescript
{
  logs: AuditLog[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}
```

### GET /api/admin/audit-logs/:id

Get single audit log entry details.

**Response**: Full `AuditLog` object with all fields

### GET /api/admin/audit-logs/export

Export audit logs in specified format.

**Query Parameters**:
```typescript
{
  format: 'csv' | 'json' | 'sql',
  startDate?: string,
  endDate?: string,
  // ... same filters as list endpoint
}
```

**Response**: File download (CSV, JSON, or SQL dump)

---

## Related Documentation

- [Engine Admin Panel](/en/admin/engine-admin)
- [RBAC System](/en/architecture/rbac)
- [Security Architecture](/en/architecture/security)
- [Multi-Tenancy](/en/architecture/multi-tenancy)

---

## Best Practices

### For Administrators

1. **Regular Reviews**: Check audit logs weekly for suspicious activity
2. **Export Critical Logs**: Archive logs for compliance before retention expiry
3. **Set Alerts**: Configure notifications for critical actions
4. **Investigate Anomalies**: Follow up on unexpected actions immediately

### For Developers

1. **Log Meaningful Actions**: Only log actions that matter for accountability
2. **Include Context**: Provide enough detail to understand the action
3. **Protect Secrets**: Never log passwords, API keys, or sensitive tokens
4. **Use Severity Correctly**: Critical = security/data risk, Warning = risky but valid

---

## Troubleshooting

**Problem**: Can't find a specific action in logs

**Solution**: Try broader search terms, expand date range, check if action was before retention cutoff

---

**Problem**: Logs showing wrong user for automated actions

**Solution**: System actions use service account; check `userId` field for actual user or "System" for automated tasks

---

## Access Control

**Required Permission**: `audit_logs.view`

Only Engine Admin and Hub Admin users (with appropriate permissions) can view audit logs.
