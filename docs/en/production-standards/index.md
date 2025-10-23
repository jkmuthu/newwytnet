---
requiredLevel: developer
---

# Production Standards & Enterprise Commitment

:::danger ⚠️ CRITICAL - READ BEFORE ANY IMPLEMENTATION
This document defines the **mandatory quality standards** for WytNet platform development. All code, features, and implementations MUST meet these enterprise-grade requirements. This is not optional - it's a commitment to building a production-ready platform for millions of users.
:::

## Table of Contents
- [Replit Production Capabilities](#replit-production-capabilities)
- [Enterprise Coding Standards](#enterprise-coding-standards)
- [Critical Launch Requirements](#critical-launch-requirements)
- [Quality Assurance Checklist](#quality-assurance-checklist)
- [Lessons Learned](#lessons-learned)

---

## Replit Production Capabilities

### Official Production Infrastructure

WytNet is built on Replit's **enterprise-grade infrastructure**, capable of serving millions of users with reliability and scale:

#### ✅ Infrastructure Specifications
- **Hosting**: Google Cloud Platform (GCP) - same infrastructure powering major enterprise applications
- **Uptime SLA**: **99.95%** for Autoscale Deployments
- **Uptime SLA**: **99.9%** for Reserved VM Deployments
- **Security Certification**: **SOC 2 Type II** certified
- **Geographic Distribution**: All apps hosted in United States with global CDN for static content

#### ✅ Deployment Types Available
1. **Autoscale Deployments** (Recommended for WytNet)
   - Automatically scale to multiple instances based on traffic
   - Scale down to zero when idle for cost optimization
   - Handle variable traffic patterns efficiently
   - Support for HTTP, HTTP/2, WebSockets, gRPC
   - Perfect for web applications and APIs

2. **Reserved VM Deployments**
   - Dedicated virtual machine for consistent performance
   - 99.9% uptime guarantee
   - Ideal for long-running processes and background tasks
   - Predictable costs

3. **Scheduled Deployments**
   - Execute background tasks at predetermined intervals
   - Cost-effective for batch processing and automated jobs

4. **Static Deployments**
   - Global CDN distribution for static content
   - Billed only for data transfer
   - Perfect for documentation and marketing pages

#### ✅ Scalability Features
- **Auto-scaling**: Resources automatically adjust based on traffic demand
- **Custom Instance Limits**: Configure maximum number of instances
- **Flexible Machine Power**: Choose CPU and RAM configuration per deployment needs
- **Load Balancing**: Built-in with WAF (Web Application Firewall) protection
- **Monitoring**: Real-time logs, performance metrics, analytics dashboard

#### ✅ Persistent Storage
- **Object Storage**: Backed by Google Cloud Storage for high availability
- **SQL Database**: PostgreSQL 16 on Neon with automatic scaling
- **ReplDB (KV)**: Key-value storage for simple data needs

#### ✅ Enterprise Features
- **Custom Domains**: Professional branding with your own domain
- **SSL/TLS**: Automatic HTTPS with certificate management
- **SSO**: Multiple SSO providers for flexible authentication
- **Role-Based Access**: Shared API keys with role-based controls
- **Usage Alerts**: Budget management and spending controls

### Conclusion: Replit IS Production-Ready

**WytNet can confidently serve millions of users on Replit's infrastructure.** The platform combines enterprise-grade reliability, security, and scalability with developer productivity.

---

## Enterprise Coding Standards

### Our Commitment: Zero Compromises on Quality

Every line of code written for WytNet MUST follow these mandatory standards:

### 1. No Hardcoded Logic

**❌ NEVER DO:**
```typescript
// Hardcoded user check
if (userId === '45346997') {
  return true; // Super Admin
}

// Hardcoded configuration
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

// Hardcoded credentials
const API_KEY = 'sk-proj-abc123';
```

**✅ ALWAYS DO:**
```typescript
// Database-driven role check
const [userRole] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId));
return userRole.isSuperAdmin;

// Configuration from database/env
const uploadConfig = await db
  .select()
  .from(platformSettings)
  .where(eq(platformSettings.key, 'max_upload_size'));
const MAX_UPLOAD_SIZE = uploadConfig.value;

// Secrets from environment
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  throw new Error('OPENAI_API_KEY not configured');
}
```

### 2. Comprehensive Input Validation

**❌ NEVER DO:**
```typescript
app.post('/api/users', async (req, res) => {
  const { email, password } = req.body;
  // Direct database insert without validation
  await db.insert(users).values({ email, password });
  res.json({ success: true });
});
```

**✅ ALWAYS DO:**
```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

app.post('/api/users', async (req, res) => {
  try {
    // Validate input
    const validated = createUserSchema.parse(req.body);
    
    // Check duplicates
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email));
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);
    
    // Insert with proper error handling
    const [newUser] = await db
      .insert(users)
      .values({
        email: validated.email,
        passwordHash,
        name: validated.name
      })
      .returning();
      
    res.json({ success: true, userId: newUser.id });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    
    console.error('User creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});
```

### 3. Proper Error Handling

**Every function MUST handle errors gracefully:**

```typescript
// ✅ Comprehensive error handling pattern
async function getUserProfile(userId: string) {
  try {
    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Query database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    // Handle not found
    if (!user) {
      throw new Error('User not found');
    }
    
    // Log success for monitoring
    logger.info('User profile retrieved', { userId });
    
    return user;
    
  } catch (error) {
    // Log error with context
    logger.error('Failed to get user profile', {
      userId,
      error: error.message,
      stack: error.stack
    });
    
    // Re-throw with context
    throw new Error(`Get user profile failed: ${error.message}`);
  }
}
```

### 4. Security Best Practices

**MANDATORY security measures:**

#### SQL Injection Prevention
```typescript
// ✅ Use parameterized queries (Drizzle ORM)
const users = await db
  .select()
  .from(users)
  .where(eq(users.email, userInput)); // Safe

// ❌ NEVER concatenate user input
const query = `SELECT * FROM users WHERE email = '${userInput}'`; // DANGEROUS!
```

#### XSS Prevention
```typescript
// ✅ Sanitize all user-generated content
import DOMPurify from 'isomorphic-dompurify';

const cleanContent = DOMPurify.sanitize(userInput);
```

#### CSRF Protection
```typescript
// ✅ Use CSRF tokens for state-changing operations
app.use(csrf({ cookie: true }));
```

#### Authentication Security
```typescript
// ✅ Secure session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET, // From environment
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
};
```

### 5. Database Best Practices

**Row Level Security (RLS) for Multi-Tenancy:**

```typescript
// ✅ Always filter by tenant_id for multi-tenant data
const tenantData = await db
  .select()
  .from(orders)
  .where(
    and(
      eq(orders.tenantId, currentUser.tenantId),
      eq(orders.userId, currentUser.id)
    )
  );

// ✅ Use transactions for related operations
await db.transaction(async (tx) => {
  // Create order
  const [order] = await tx
    .insert(orders)
    .values({ userId, total })
    .returning();
    
  // Create order items
  await tx
    .insert(orderItems)
    .values(items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity
    })));
    
  // Update inventory
  await tx
    .update(products)
    .set({ stock: sql`stock - ${item.quantity}` })
    .where(eq(products.id, item.productId));
});
```

### 6. Performance Optimization

```typescript
// ✅ Use database indexes
await db.execute(sql`
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_orders_user_id ON orders(user_id);
  CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
`);

// ✅ Paginate large datasets
const PAGE_SIZE = 20;
const users = await db
  .select()
  .from(users)
  .limit(PAGE_SIZE)
  .offset(page * PAGE_SIZE);

// ✅ Use query caching for expensive operations
import { cache } from './cache';

const getCachedStats = cache(async () => {
  return await db
    .select({ count: sql`count(*)` })
    .from(users);
}, { ttl: 3600 }); // Cache for 1 hour
```

---

## Critical Launch Requirements

### Pre-Launch Checklist

Before launching WytNet to production, ALL items below MUST be verified:

#### 1. Multi-Tenant Isolation ✅
- [ ] All tables have `tenant_id` column
- [ ] All queries filter by `tenant_id`
- [ ] Row Level Security (RLS) policies configured
- [ ] Cross-tenant data leakage tested and prevented
- [ ] Database indexes on `tenant_id` columns

#### 2. RBAC Implementation ✅
- [ ] All roles defined in `roles` table
- [ ] All permissions defined in `permissions` table
- [ ] Role-permission mappings complete
- [ ] User-role assignments functioning
- [ ] Permission checks on ALL protected routes
- [ ] Super Admin bypass properly configured

#### 3. Session Management ✅
- [ ] Secure session configuration (httpOnly, secure, sameSite)
- [ ] Session timeout configured (7 days default)
- [ ] Session regeneration on authentication
- [ ] Proper logout functionality
- [ ] Session persistence across server restarts (PostgreSQL store)

#### 4. API Security ✅
- [ ] All API endpoints have authentication middleware
- [ ] All API endpoints have permission checks
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified

#### 5. Error Handling & Logging ✅
- [ ] All endpoints have try-catch blocks
- [ ] Error responses don't leak sensitive information
- [ ] Comprehensive logging for debugging
- [ ] Error tracking system configured
- [ ] Alert system for critical errors

#### 6. Performance Optimization ✅
- [ ] Database queries optimized with indexes
- [ ] N+1 query problems eliminated
- [ ] Pagination implemented for large datasets
- [ ] Caching strategy for expensive operations
- [ ] Asset optimization (minification, compression)
- [ ] CDN configured for static assets

#### 7. Monitoring & Analytics ✅
- [ ] Application performance monitoring (APM) configured
- [ ] Database query performance monitored
- [ ] Error rate tracking
- [ ] User activity tracking
- [ ] Resource usage monitoring
- [ ] Uptime monitoring

---

## Quality Assurance Checklist

### Before ANY Feature Release

Every feature MUST pass this checklist before going to production:

#### Code Quality
- [ ] No hardcoded values (use database/env)
- [ ] All inputs validated with Zod schemas
- [ ] Proper error handling with try-catch
- [ ] Security best practices followed
- [ ] Database queries use parameterized statements
- [ ] No console.log in production code (use logger)

#### Testing
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Error scenarios tested
- [ ] Permission checks verified
- [ ] Multi-tenant isolation verified
- [ ] Performance tested with realistic data volume

#### Security
- [ ] Authentication required where needed
- [ ] Authorization (permission) checks in place
- [ ] Input sanitization for XSS prevention
- [ ] SQL injection prevention verified
- [ ] CSRF protection enabled
- [ ] Sensitive data not logged

#### Database
- [ ] Migrations tested
- [ ] Rollback plan prepared
- [ ] Indexes created for new queries
- [ ] Row Level Security policies updated
- [ ] Backup verified

#### Documentation
- [ ] API endpoints documented
- [ ] Database schema changes documented
- [ ] Configuration changes documented
- [ ] Deployment steps documented

---

## Lessons Learned

### Case Study: Authentication Bug (October 2025)

**Issue**: User with multiple roles (User, Engine Admin, Hub Admin) had to login separately for each panel instead of getting automatic access to all panels after single login.

**Root Cause**: Implementation assumed roles would be in `user_roles` and `platform_hub_admins` tables, but actual user account had `is_super_admin = true` flag directly on `users` table. Code didn't check the database structure before implementing logic.

**What Went Wrong**:
1. ❌ Assumed database structure without verification
2. ❌ Hardcoded logic based on assumptions
3. ❌ No validation of existing data
4. ❌ Didn't query actual user record to understand role storage

**Correct Approach**:
1. ✅ Query database to understand current user structure
2. ✅ Check which tables and columns store role information
3. ✅ Implement dynamic logic based on actual data structure
4. ✅ Test with real user accounts before deployment

**Prevention Strategy**:
- Always query database structure first
- Never assume data location
- Test with real production data patterns
- Document database schema thoroughly
- Use type-safe ORM queries (Drizzle)

**Code Fix Applied**:
```typescript
// ❌ Wrong: Assumed user_roles table
const engineAdminRecord = await db
  .select()
  .from(userRoles)
  .where(eq(userRoles.userId, userId));

// ✅ Correct: Check actual user record
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId));

if (user.isSuperAdmin) {
  // Grant Engine Admin access
  principal.isSuperAdmin = true;
  principal.panels.push('engine_admin');
}
```

---

## Summary: Our Enterprise Commitment

1. **Replit IS production-ready** - 99.95% uptime, GCP infrastructure, SOC 2 certified
2. **Zero hardcoded logic** - All configuration database-driven
3. **Comprehensive validation** - All inputs validated, all errors handled
4. **Security first** - SQL injection prevention, XSS protection, CSRF tokens
5. **Testing before delivery** - Manual testing, edge cases, performance verification
6. **Learn from mistakes** - Document failures, prevent recurrence

**This platform will serve millions of users. Every implementation MUST meet these standards.**

:::tip Remember
Quality is not optional. It's our commitment to users who trust WytNet with their data and business operations.
:::
