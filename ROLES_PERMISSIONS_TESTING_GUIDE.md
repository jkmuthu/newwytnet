# Roles & Permissions System - Testing Guide

This guide provides step-by-step instructions for testing the complete Roles & Permissions management system in WytNet Engine Admin Panel.

## Prerequisites

1. Access to Engine Admin Panel (`/engine`)
2. Super Admin credentials (default seeded admin)
3. Database with seeded roles and permissions

## Test Flow Overview

```
1. Create Role → 2. Assign Permissions → 3. Assign to User → 4. Verify Access Control
```

---

## Part 1: Verify Default Roles & Permissions

### Step 1.1: View Default Roles

1. Navigate to **Engine Admin Panel** → **Roles & Permissions**
2. Click on the **Roles** tab
3. **Expected Result**: You should see 5 default roles:
   - Super Admin (RL0000001)
   - Platform Manager (RL0000002)
   - Content Manager (RL0000003)
   - Support Admin (RL0000004)
   - Hub Admin (RL0000005)

### Step 1.2: View Permissions

1. Click on the **Permissions** tab
2. **Expected Result**: You should see permissions grouped by resource:
   - **tenants**: view, create, edit, delete
   - **users**: view, create, edit, delete
   - **roles**: view, create, edit, delete
   - **modules**: view, create, edit, delete
   - **hubs**: view, create, edit, delete, configure
   - **content**: view, create, edit, delete, publish
   - **settings**: view, edit

**Total**: 37 permissions across 7 resource types

---

## Part 2: Create New Custom Role

### Step 2.1: Create Role

1. Click **Create Role** button
2. Fill in the Details tab:
   - **Role Name**: `Content Editor`
   - **Description**: `Can view and edit content, but not delete`
   - **Scope**: `engine`
3. Click **Next: Permissions**

### Step 2.2: Assign Permissions

1. In the Permissions tab, select:
   - ✓ content → view
   - ✓ content → create
   - ✓ content → edit
   - ✓ users → view
2. **Expected**: Counter shows `(4 selected)`
3. Click **Create Role with 4 Permissions**

### Step 2.3: Verify Creation

1. **Expected Result**: 
   - Success toast: "Role created successfully"
   - New role appears in the roles list
   - Display ID format: `RL0000006` (or next in sequence)
   - Shows "4 assigned" in Permissions column

---

## Part 3: Edit Role & Manage Permissions

### Step 3.1: Edit Role Details

1. Find the `Content Editor` role
2. Click the **Edit** button (pencil icon)
3. Switch to **Details** tab
4. Update description: `Content editors can create and modify content`
5. Click **Update Role**
6. **Expected**: Success toast and updated description visible

### Step 3.2: Modify Permissions

1. Click **Edit** on `Content Editor` role again
2. Switch to **Permissions** tab
3. Add permission: ✓ media → view
4. Remove permission: ✗ content → create
5. Click **Save Permissions**
6. **Expected**: 
   - Success toast: "Permissions assigned successfully"
   - Role now has 4 permissions (added 1, removed 1)

---

## Part 4: Platform Hubs Management

### Step 4.1: View Platform Hubs

1. Navigate to **Engine Admin** → **Platform Hubs**
2. **Expected**: List of all platform hubs with:
   - Display ID (PH0000001, etc.)
   - Hub name and domain
   - Status badge
   - Admin count

### Step 4.2: Assign Hub Admin

1. Click **Manage Admins** on any hub
2. View current administrators (if any)
3. Click on **Assign New Administrator** section
4. Select a user from the dropdown
5. Click **Assign as Hub Admin**
6. **Expected**:
   - Success toast: "Hub admin assigned successfully"
   - User immediately appears in "Current Administrators" list
   - Admin count in table increments by 1

### Step 4.3: Remove Hub Admin

1. In the same dialog, find an assigned administrator
2. Click **Remove** button
3. Confirm removal
4. **Expected**:
   - Success toast: "Hub admin removed successfully"
   - User removed from list immediately
   - Admin count decrements

---

## Part 5: Verify Access Control

### Step 5.1: Test Permission Middleware

**API Endpoint Tests** (use browser DevTools or Postman):

1. **Test Roles View Permission**:
   ```
   GET /api/admin/roles
   Required: roles:view permission
   Expected: 200 if has permission, 403 if not
   ```

2. **Test Role Creation Permission**:
   ```
   POST /api/admin/roles
   Body: { "name": "Test Role", ... }
   Required: roles:create permission
   Expected: 201 if has permission, 403 if not
   ```

3. **Test Role Edit Permission**:
   ```
   PUT /api/admin/roles/:id
   Required: roles:edit permission
   Expected: 200 if has permission, 403 if not
   ```

4. **Test Role Delete Permission**:
   ```
   DELETE /api/admin/roles/:id
   Required: roles:delete permission
   Expected: 200 if has permission, 403 if not (also blocks system roles)
   ```

### Step 5.2: Super Admin Bypass

1. Log in as Super Admin
2. Access any protected route
3. **Expected**: Always succeeds (super admins bypass all permission checks)

---

## Part 6: UI/UX Verification

### Step 6.1: Search Functionality

1. In **Roles & Permissions** page, use search box
2. Type partial role name (e.g., "Content")
3. **Expected**: Filtered list shows only matching roles

### Step 6.2: Two-Tab Interface

1. Click **Create Role**
2. **Expected**: 
   - Details tab active by default
   - Can switch to Permissions tab
   - Permission counter updates as selections change
   - Can navigate back to Details tab

### Step 6.3: System Role Protection

1. Try to delete a system role (e.g., "Super Admin")
2. **Expected**: Delete button not visible or disabled for system roles

---

## Verification Checklist

- [ ] All 5 default roles visible with correct Display IDs
- [ ] All 37 permissions visible, grouped by 7 resources
- [ ] Can create new role with custom permissions
- [ ] Role creation includes two-tab interface (Details + Permissions)
- [ ] Can edit role details and update permissions
- [ ] Can view role details including assigned permissions
- [ ] System roles cannot be deleted
- [ ] Can search/filter roles
- [ ] Platform Hubs list displays correctly
- [ ] Can assign/remove hub admins with real-time updates
- [ ] Permission middleware blocks unauthorized access (403)
- [ ] Super admins bypass all permission checks
- [ ] API endpoints return proper error messages
- [ ] Cache invalidation works (changes visible immediately)
- [ ] Toast notifications show for all actions

---

## Database Verification

Run these SQL queries to verify data integrity:

```sql
-- Check roles
SELECT display_id, name, scope, is_system, is_active 
FROM roles 
ORDER BY created_at;

-- Check permissions by resource
SELECT resource, COUNT(*) as count 
FROM permissions 
GROUP BY resource 
ORDER BY resource;

-- Check role-permission assignments
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.created_at;

-- Check hub admins
SELECT ph.name, COUNT(pha.user_id) as admin_count
FROM platform_hubs ph
LEFT JOIN platform_hub_admins pha ON ph.id = pha.hub_id
GROUP BY ph.id, ph.name;
```

---

## Troubleshooting

### Issue: "Authentication required" error

**Solution**: Ensure you're logged in as Engine Admin. Check session cookie `admin.sid`.

### Issue: "Insufficient permissions" error

**Solution**: 
1. Verify user has required role assigned
2. Check role has necessary permissions
3. Confirm permission resource and action match the route

### Issue: Dialog not refreshing after mutation

**Solution**: Check that cache invalidation is working. Should auto-refresh after mutations.

### Issue: Permission middleware not applied

**Solution**: Ensure route uses both `adminAuthMiddleware` and `requirePermission()` in correct order:
```typescript
router.get("/admin/resource", 
  adminAuthMiddleware,  // First: authenticate
  requirePermission('resource', 'view'),  // Second: authorize
  handler
);
```

---

## API Reference

### Roles Management

- `GET /api/admin/roles` - List all roles
- `GET /api/admin/roles/:id` - Get role details
- `POST /api/admin/roles` - Create new role
- `PUT /api/admin/roles/:id` - Update role
- `DELETE /api/admin/roles/:id` - Delete role (not system roles)

### Permissions Management

- `GET /api/admin/permissions` - List all permissions (grouped)
- `POST /api/admin/roles/:roleId/permissions` - Assign permissions to role
- `DELETE /api/admin/roles/:roleId/permissions/:permissionId` - Remove permission from role

### Platform Hubs Management

- `GET /api/admin/platform-hubs` - List all hubs with admins
- `POST /api/admin/platform-hubs/:hubId/admins` - Assign hub admin
- `DELETE /api/admin/platform-hubs/:hubId/admins/:userId` - Remove hub admin

---

## Success Criteria

✅ All default roles and permissions seeded correctly  
✅ Can create custom roles with selected permissions  
✅ Permission assignment works during role creation  
✅ Can edit roles and modify permissions  
✅ System roles are protected from deletion  
✅ Hub admin management works with real-time updates  
✅ Permission middleware blocks unauthorized access  
✅ Super admins bypass all permission checks  
✅ UI provides proper feedback (toasts, loading states)  
✅ Search and filter functionality works  

---

## Next Steps

After successful testing:

1. **Assign roles to actual users** via User Management interface
2. **Apply permission middleware** to more API routes (users, tenants, modules, etc.)
3. **Create role templates** for common use cases
4. **Document permission requirements** for each API endpoint
5. **Set up automated tests** for permission middleware
6. **Monitor access logs** for unauthorized access attempts
