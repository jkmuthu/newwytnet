# Audit Logs System

:::warning PRODUCTION QUALITY REQUIREMENTS
Audit Logging MUST include:
- ✅ **Comprehensive Coverage** - Log ALL admin actions (create, update, delete)
- 🔒 **Tamper Protection** - Prevent log modification or deletion
- 📊 **Structured Data** - Use consistent JSON format for details
- ⚠️ **Performance** - Async logging to avoid blocking main operations
- 🎯 **Retention Policy** - Archive old logs, maintain searchable history

See [Production Standards](/en/production-standards/) for complete requirements.
:::

## Overview

WytNet's **Audit Logs System** provides comprehensive tracking of all administrative actions across the platform, enabling security monitoring, compliance, debugging, and accountability with filtering, pagination, search, and detailed activity timelines.

**Key Features:**
- Tracks ALL admin actions (create, update, delete)
- User identification and IP tracking
- Resource-level event logging
- Advanced filtering and search
- Timeline visualization
- Export capabilities (CSV, JSON)
- Real-time event streaming

---

## Audit Log Architecture

### Complete Logging System

```mermaid
flowchart TD
    AdminAction([Admin Performs Action]) --> Middleware[Audit Middleware]
    
    Middleware --> ExtractContext["Extract Context:<br/>- user_id<br/>- action<br/>- resource_type<br/>- resource_id<br/>- details (JSON)<br/>- ip_address<br/>- user_agent"]
    
    ExtractContext --> ValidateAction{Action Auditable?}
    
    ValidateAction -->|No| SkipLog[Skip Logging]
    ValidateAction -->|Yes| CreateLog[Create Audit Log Entry]
    
    CreateLog --> SaveDB[(Save to Database)]
    SaveDB --> IndexSearch[Index in Search Engine]
    
    IndexSearch --> NotifyStream[Notify Real-time Stream]
    NotifyStream --> ProcessAction[Process Original Action]
    
    ProcessAction --> ActionSuccess{Action Successful?}
    
    ActionSuccess -->|Yes| UpdateLogSuccess[Update Log: success]
    ActionSuccess -->|No| UpdateLogFail[Update Log: failed + error]
    
    UpdateLogSuccess --> Complete[Action Complete]
    UpdateLogFail --> Complete
    
    SkipLog --> ProcessAction
    
    Complete --> End([End])
    
    style CreateLog fill:#90EE90
    style SaveDB fill:#87CEEB
    style UpdateLogFail fill:#FF6B6B
```

---

## Logged Events

### Comprehensive Event Categories

```mermaid
mindmap
  root((Audit<br/>Logs))
    User Management
      user_created
      user_updated
      user_deleted
      user_role_changed
      user_activated
      user_deactivated
    Organization
      org_created
      org_updated
      org_deleted
      org_member_added
      org_member_removed
      org_settings_changed
    Module System
      module_installed
      module_activated
      module_deactivated
      module_config_updated
    App Management
      app_created
      app_published
      app_updated
      app_deleted
    Content Management
      content_created
      content_published
      content_updated
      content_deleted
    System Security
      login_success
      login_failed
      logout
      permission_denied
      password_changed
      2fa_enabled
    Financial
      payment_received
      subscription_created
      invoice_generated
      refund_processed
```

---

## Audit Log Creation Flow

### Event Capture Sequence

```mermaid
sequenceDiagram
    participant A as Admin User
    participant UI as Frontend
    participant API as API Route
    participant M as Audit Middleware
    participant DB as Database
    participant L as Audit Logs Table
    participant S as Search Index
    
    Note over A,S: Admin Deletes a User
    A->>UI: Click "Delete User" (ID: 456)
    UI->>API: DELETE /api/users/456
    
    Note over A,S: Pre-Action Logging
    API->>M: Pass through Audit Middleware
    M->>M: Extract Request Data
    Note right of M: - userId: 123 (admin)<br/>- action: 'user_deleted'<br/>- resourceType: 'user'<br/>- resourceId: 456<br/>- ipAddress: "203.0.113.5"<br/>- userAgent: "Mozilla/5.0..."
    
    M->>DB: Get User Details (before deletion)
    DB-->>M: User Data {name: "John Doe", email: "john@example.com"}
    
    M->>L: INSERT INTO audit_logs
    Note right of L: - performed_by: 123<br/>- action: 'user_deleted'<br/>- resource_type: 'user'<br/>- resource_id: 456<br/>- details: {<br/>    "userName": "John Doe",<br/>    "userEmail": "john@example.com"<br/>  }<br/>- ip_address: "203.0.113.5"<br/>- status: 'pending'
    
    L-->>M: Log ID: 789
    
    Note over A,S: Execute Action
    M->>API: Continue to Handler
    API->>DB: DELETE FROM users WHERE id = 456
    
    alt Delete Successful
        DB-->>API: User Deleted
        API->>L: UPDATE audit_logs SET status = 'success'
        API-->>UI: 200 OK
        UI-->>A: "User deleted successfully"
    else Delete Failed
        DB-->>API: Error: Foreign Key Constraint
        API->>L: UPDATE audit_logs SET status = 'failed', error = '...'
        API-->>UI: 400 Bad Request
        UI-->>A: "Cannot delete user (has dependencies)"
    end
    
    Note over A,S: Post-Action Indexing
    L->>S: Index Log Entry for Search
    S-->>L: Indexed
```

---

## Audit Logs Viewing Flow

### Admin UI Interaction

```mermaid
flowchart TD
    Admin([Admin Opens Audit Logs]) --> LoadUI[Load Audit Logs Page]
    
    LoadUI --> DefaultView["Default View:<br/>- Last 100 entries<br/>- All users<br/>- All actions<br/>- Last 7 days"]
    
    DefaultView --> ApplyFilters{Apply Filters?}
    
    ApplyFilters -->|Yes| FilterOptions["Filter Options:<br/>- User (dropdown)<br/>- Action (checkbox)<br/>- Resource Type<br/>- Date Range<br/>- Status"]
    
    ApplyFilters -->|No| DisplayLogs[Display Log Entries]
    
    FilterOptions --> FetchFiltered[API: GET /api/audit-logs?filters]
    FetchFiltered --> DisplayLogs
    
    DisplayLogs --> LogTable["Table View:<br/>- Timestamp<br/>- User<br/>- Action<br/>- Resource<br/>- Status<br/>- Details"]
    
    LogTable --> UserAction{User Action}
    
    UserAction -->|Click Entry| ViewDetails[Show Detailed Modal]
    UserAction -->|Search| SearchLogs[Full-Text Search]
    UserAction -->|Export| ExportData[Export CSV/JSON]
    UserAction -->|Pagination| LoadMore[Load Next Page]
    
    ViewDetails --> DetailedInfo["Detailed View:<br/>- Full User Info<br/>- Complete Details JSON<br/>- IP Address<br/>- User Agent<br/>- Before/After Data"]
    
    SearchLogs --> FetchSearch[API: GET /api/audit-logs/search?q=...]
    FetchSearch --> DisplayLogs
    
    ExportData --> DownloadFile[Download Logs File]
    LoadMore --> FetchFiltered
    
    DetailedInfo --> End([End])
    DownloadFile --> End
    
    style DisplayLogs fill:#90EE90
    style DetailedInfo fill:#87CEEB
```

---

## Database Schema

### Audit Logs Table

```sql
-- Audit Logs Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  performed_by INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success',  -- 'success', 'failed', 'pending'
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_audit_logs_user ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_details ON audit_logs USING GIN(details);  -- JSONB index

-- Example Entry
{
  "id": 12345,
  "performed_by": 123,
  "action": "user_deleted",
  "resource_type": "user",
  "resource_id": 456,
  "details": {
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "userRole": "member",
    "deletedBy": "Admin",
    "reason": "Account closure request"
  },
  "ip_address": "203.0.113.5",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "status": "success",
  "error": null,
  "created_at": "2025-10-21T16:45:30Z"
}
```

---

## Audit Middleware Implementation

### Express Middleware

```typescript
// middleware/auditLog.ts
export function auditLog(action: string, resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const userId = req.session?.userId;
    
    if (!userId) {
      return next(); // Skip audit for unauthenticated requests
    }
    
    // Extract resource ID from URL params or body
    const resourceId = req.params.id || req.body.id;
    
    // Capture request details
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];
    
    // Get original data before modification (for updates/deletes)
    let originalData;
    if (['update', 'delete'].some(a => action.includes(a)) && resourceId) {
      originalData = await getResourceData(resourceType, resourceId);
    }
    
    // Create audit log entry
    const logEntry = await db.auditLogs.create({
      performed_by: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId ? parseInt(resourceId) : null,
      details: {
        originalData,
        requestBody: sanitizeBody(req.body),
        path: req.path,
        method: req.method
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'pending'
    });
    
    // Store log ID in request for later update
    req.auditLogId = logEntry.id;
    
    // Capture response
    const originalSend = res.send;
    res.send = function(data: any) {
      const responseTime = Date.now() - startTime;
      
      // Update audit log with result
      db.auditLogs.update(req.auditLogId, {
        status: res.statusCode < 400 ? 'success' : 'failed',
        error: res.statusCode >= 400 ? data : null,
        details: {
          ...logEntry.details,
          responseTime,
          statusCode: res.statusCode
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

// Usage in routes
app.delete('/api/users/:id',
  requirePermission('users:delete'),
  auditLog('user_deleted', 'user'),
  async (req, res) => {
    await db.users.delete(req.params.id);
    res.json({ message: 'User deleted' });
  }
);
```

---

## API Endpoints

### Audit Logs Routes

```typescript
// Get audit logs with filters
GET /api/audit-logs
Query Parameters:
  - userId: Filter by user
  - action: Filter by action type
  - resourceType: Filter by resource
  - startDate: Date range start
  - endDate: Date range end
  - status: success | failed
  - page: Pagination page
  - limit: Results per page
Response: {
  logs: [...],
  total: 1234,
  page: 1,
  totalPages: 13
}

// Get single audit log details
GET /api/audit-logs/:id
Response: Detailed log entry with full JSON

// Search audit logs (full-text)
GET /api/audit-logs/search
Query: ?q=user+deleted&startDate=2025-10-01
Response: Matching log entries

// Export audit logs
GET /api/audit-logs/export
Query: ?format=csv|json&filters=...
Response: File download

// Get audit logs for specific resource
GET /api/audit-logs/resource/:type/:id
Example: /api/audit-logs/resource/user/123
Response: All logs related to user ID 123

// Get activity timeline
GET /api/audit-logs/timeline
Query: ?userId=123&startDate=...
Response: Chronological timeline of user actions
```

---

## Frontend Implementation

### Audit Logs UI Component

```typescript
// pages/admin/AuditLogs.tsx
export function AuditLogsPage() {
  const [filters, setFilters] = useState({
    userId: null,
    action: null,
    resourceType: null,
    startDate: null,
    endDate: null,
    status: null
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/audit-logs', filters],
    queryFn: () => fetch(`/api/audit-logs?${new URLSearchParams(filters)}`).then(r => r.json())
  });
  
  const exportMutation = useMutation({
    mutationFn: async (format: 'csv' | 'json') => {
      const response = await fetch(`/api/audit-logs/export?format=${format}&${new URLSearchParams(filters)}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs.${format}`;
      a.click();
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        
        <div className="flex gap-2">
          <Button onClick={() => exportMutation.mutate('csv')}>
            Export CSV
          </Button>
          <Button onClick={() => exportMutation.mutate('json')}>
            Export JSON
          </Button>
        </div>
      </div>
      
      <AuditLogFilters filters={filters} onChange={setFilters} />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {data?.logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.created_at)}</TableCell>
              <TableCell>{log.userName}</TableCell>
              <TableCell>
                <Badge variant={getActionVariant(log.action)}>
                  {formatAction(log.action)}
                </Badge>
              </TableCell>
              <TableCell>
                {log.resource_type} #{log.resource_id}
              </TableCell>
              <TableCell>
                <Badge variant={log.status === 'success' ? 'success' : 'destructive'}>
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDetailsModal(log)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Pagination
        currentPage={data?.page}
        totalPages={data?.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

---

## Real-Time Event Streaming

### WebSocket Audit Stream

```mermaid
sequenceDiagram
    participant A as Admin UI
    participant WS as WebSocket Server
    participant DB as Database
    participant L as Audit Logs
    
    A->>WS: Connect to /ws/audit-logs
    WS-->>A: Connection Established
    
    Note over A,L: Admin Action Occurs
    L->>L: New Audit Log Created
    L->>WS: Emit New Log Event
    
    WS->>WS: Check Admin Permissions
    alt Admin Has Access
        WS->>A: Send Real-time Update
        A->>A: Add to Log Table (top)
        A->>A: Show Toast Notification
    else No Access
        WS->>WS: Skip (don't send)
    end
    
    Note over A,L: Continuous Streaming
    loop Every New Log
        L->>WS: New Event
        WS->>A: Stream Update
    end
```

---

## Advanced Features

### 1. Activity Timeline

```typescript
// Get user activity timeline
GET /api/audit-logs/timeline?userId=123

Response:
{
  "timeline": [
    {
      "date": "2025-10-21",
      "events": [
        {
          "time": "16:45",
          "action": "user_deleted",
          "details": "Deleted user John Doe"
        },
        {
          "time": "14:30",
          "action": "org_created",
          "details": "Created organization 'Tech Startup'"
        }
      ]
    }
  ]
}
```

### 2. Full-Text Search

```typescript
// Search across all log details
GET /api/audit-logs/search?q=john+doe

// Uses PostgreSQL full-text search
SELECT * FROM audit_logs
WHERE to_tsvector('english', details::text) @@ plainto_tsquery('english', 'john doe')
ORDER BY created_at DESC;
```

### 3. Retention Policy

```sql
-- Auto-delete logs older than 1 year (compliance)
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';

-- Or archive to cold storage
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Security & Compliance

### 1. Access Control
```typescript
// Only Super Admins and specific roles can view audit logs
app.get('/api/audit-logs',
  requirePermission('audit:view'),
  async (req, res) => {
    // Fetch logs
  }
);
```

### 2. Immutable Logs
```sql
-- Audit logs cannot be updated or deleted (except by system)
-- No UPDATE or DELETE grants to application users
REVOKE UPDATE, DELETE ON audit_logs FROM app_user;
GRANT INSERT, SELECT ON audit_logs TO app_user;
```

### 3. Sensitive Data Masking
```typescript
function sanitizeBody(body: any): any {
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'apiKey', 'secret', 'token'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
}
```

---

## Performance Optimization

### 1. Partitioning
```sql
-- Partition by month for faster queries
CREATE TABLE audit_logs_2025_10 PARTITION OF audit_logs
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```

### 2. Async Logging
```typescript
// Don't block request processing for logging
async function logAuditEvent(event: AuditEvent) {
  // Queue for background processing
  await auditQueue.add(event);
}
```

---

## Related Flows

- [RBAC Role-Based Access Control](/en/use-case-flows/rbac-permissions) - Permission tracking
- [Super Admin Panel Switching](/en/use-case-flows/admin-panel-switching) - Admin actions
- [WytAI Agent Workflow](/en/use-case-flows/wytai-agent-workflow) - AI usage logs
- [App Subscription Flow](/en/use-case-flows/app-subscription-flow) - Payment logs

---

**Complete:** All 10 use case flows documented with comprehensive diagrams and workflows.
