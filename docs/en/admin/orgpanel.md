# OrgPanel - Organization Management Dashboard

**OrgPanel** is the organization-level admin workspace within the WytNet platform. It provides comprehensive tools for managing teams, projects, resources, and organization-wide operations.

## Overview

OrgPanel serves as the command center for organizations to:
- Manage team members, roles, and permissions
- Access business productivity and management apps
- Oversee organization-wide projects and workflows
- Analyze business metrics and performance
- Configure organization settings and integrations

**Access URL**: `https://your-hub-domain.com/orgpanel`

**Authentication**: Requires WytPass login with Organization Admin or Member role

**Tenant Isolation**: Complete data separation between organizations via Row Level Security (RLS)

---

## OrgPanel vs MyPanel

| Feature | OrgPanel | MyPanel |
|---------|----------|---------|
| **Purpose** | Organization management | Personal productivity |
| **Apps Available** | 33 apps | 24 apps |
| **Access Level** | Organization members | Individual user |
| **Data Scope** | Organization-wide data | Personal data only |
| **Pricing** | Organization subscriptions | Individual subscriptions |
| **Admin Rights** | Organization Admin controls | Self-management |
| **User Management** | Invite/remove members | Not applicable |
| **Roles & Permissions** | Customizable RBAC | Personal only |

---

## Available WytApps in OrgPanel

OrgPanel provides access to **33 WytApps** designed for business operations and team collaboration.

### Productivity & Project Management (OrgPanel)

1. **WytTask** - Team task management with assignments and tracking
2. **WytProject** - Project planning with Gantt charts and milestones
3. **WytBoard** - Kanban boards for agile workflow management
4. **WytTime** - Team time tracking and timesheets
5. **WytCalendar** - Shared team calendars and meeting scheduler

### HR & Payroll (OrgPanel)

6. **WytHR** - Employee management and onboarding
7. **WytPayroll** - Payroll processing and salary management
8. **WytAttendance** - Attendance tracking with biometric integration
9. **WytLeave** - Leave management system
10. **WytPerform** - Performance reviews and appraisals

### Finance & Accounting (OrgPanel)

11. **WytAccounts** - Accounting and bookkeeping
12. **WytExpense** - Expense tracking and reimbursements
13. **WytInvoice** - Invoicing and billing management
14. **WytPayments** - Payment collection and processing

### CRM & Sales (OrgPanel)

15. **WytCRM** - Customer relationship management
16. **WytLead** - Lead tracking and nurturing
17. **WytSales** - Sales pipeline management
18. **WytQuote** - Quote generation and management
19. **WytSupport** - Customer support ticketing system

### E-commerce & Inventory (OrgPanel)

20. **WytShop** - E-commerce store builder
21. **WytInventory** - Inventory management and stock tracking
22. **WytOrders** - Order management system

### Marketing & Communications (OrgPanel)

23. **WytMail** - Email marketing campaigns
24. **WytSocial** - Social media management
25. **WytSMS** - Bulk SMS campaigns
26. **WytForms** - Custom form builder

### Documents & Collaboration (OrgPanel)

27. **WytDocs** - Document management and collaboration
28. **WytSign** - Digital signature and e-sign
29. **WytDrive** - Organization cloud storage

### Analytics & Reporting (OrgPanel)

30. **WytAnalytics** - Business intelligence and dashboards
31. **WytReport** - Custom report builder

### AI-Powered (OrgPanel)

32. **WytAI Assistant** - Organization AI chatbot with team knowledge
33. **WytAI Insights** - AI-powered business insights and predictions

---

## Key Features

### 1. Organization Dashboard

The OrgPanel dashboard provides:
- **Organization Overview**: Key metrics (revenue, users, projects, tickets)
- **Team Activity**: Real-time activity feed from all team members
- **Performance Metrics**: Charts showing productivity, sales, support stats
- **Quick Actions**: Add employee, create project, send invoice
- **Alerts & Notifications**: Critical business alerts and reminders

### 2. Team Management

**Member Directory**:
- View all organization members
- Search and filter by role, department, location
- Member profiles with contact info and role details

**Invite & Onboarding**:
- Send email invitations to join organization
- Custom onboarding workflows
- Role assignment during invitation
- Bulk invite via CSV upload

**Role-Based Access Control (RBAC)**:
- Create custom roles (e.g., Manager, Developer, Sales Rep)
- Assign granular permissions per role
- Restrict app access by role
- Department-based access control

**User Management**:
- Activate/deactivate members
- Change member roles
- Reset passwords
- View user activity logs

### 3. App Management

**App Activation**:
- Browse WytApps catalog
- Activate apps for organization
- Assign app access to specific roles/members

**App Configuration**:
- Configure app settings organization-wide
- Set default values and templates
- Integrate with external services

**Subscription Management**:
- View active app subscriptions
- Manage billing and payments
- Upgrade/downgrade plans
- Monitor app usage and limits

### 4. Organization Settings

**Company Information**:
- Organization name, logo, and branding
- Business address and contact details
- Tax ID and legal information
- Industry and company size

**Branding Customization**:
- Upload company logo
- Set primary and secondary brand colors
- Custom email templates
- Branded invoices and documents

**Integrations**:
- Razorpay payment gateway
- Google Workspace sync
- Microsoft 365 integration
- Slack notifications
- Zapier automation

**Security Settings**:
- Enforce two-factor authentication
- IP whitelist/blacklist
- Session timeout policies
- Password complexity rules

### 5. Billing & Payments

**Subscription Overview**:
- Active subscriptions and renewal dates
- Total monthly/annual costs
- Payment method on file
- Billing history

**Invoice Management**:
- Download invoices (PDF)
- View payment receipts
- Update billing address
- Change payment method

**Cost Allocation**:
- Department-wise cost breakdown
- Per-app cost analysis
- User-wise license costs
- Budget tracking

### 6. Analytics & Reports

**Business Dashboards**:
- Revenue trends and forecasts
- Sales funnel analysis
- Customer acquisition metrics
- Team productivity stats

**Custom Reports**:
- Build custom reports with drag-and-drop
- Schedule automated report delivery
- Export reports (PDF, Excel, CSV)
- Share reports with stakeholders

**Audit Logs**:
- Track all admin actions
- User activity monitoring
- Data access logs
- Compliance reporting

### 7. Data & Storage

**Organization Data**:
- Centralized data repository
- Data backup and recovery
- Data retention policies
- GDPR compliance tools

**Storage Management**:
- Organization storage quota
- Per-user storage limits
- File type restrictions
- Large file storage optimization

**Data Export**:
- Export all organization data
- Bulk download files
- Database export (CSV, JSON)
- API access for data migration

---

## Organization Workflows

### Organization Setup (First-Time)

1. **Create Organization** via MyPanel → "Create Organization"
2. **Complete Organization Profile**: Name, logo, address, tax details
3. **Invite Team Members**: Add employees with roles
4. **Subscribe to Apps**: Activate needed WytApps for organization
5. **Configure Settings**: Set up integrations, branding, security policies
6. **Assign Permissions**: Configure RBAC for different roles
7. **Launch Operations**: Team members can now access OrgPanel apps

### Daily Operations (Organization Admin)

1. **Review Dashboard**: Check key metrics and alerts
2. **Manage Team**: Handle employee requests, role changes
3. **Monitor Projects**: Oversee active projects and deadlines
4. **Review Support Tickets**: Address customer support issues
5. **Approve Expenses**: Review and approve employee expense claims
6. **Analyze Reports**: Review business performance dashboards
7. **Adjust Settings**: Update configurations as needed

### Employee Onboarding Workflow

1. **Admin Sends Invitation**: Invite via email with role assignment
2. **Employee Receives Email**: Click invitation link
3. **Employee Signs Up**: Create WytPass account (if new user)
4. **Employee Accepts Invitation**: Join organization
5. **System Assigns Role**: Automatic role and permissions setup
6. **Employee Accesses OrgPanel**: Access granted to assigned apps
7. **Admin Monitors Onboarding**: Track completion status

### Project Creation Workflow (Team Collaboration)

1. **Admin Creates Project**: Via WytProject app
2. **Assign Team Members**: Add members to project
3. **Set Milestones**: Define project phases and deadlines
4. **Create Tasks**: Break down project into tasks (WytTask)
5. **Track Progress**: Monitor task completion via WytBoard
6. **Log Time**: Team logs hours via WytTime
7. **Generate Reports**: Review project analytics and timelines

---

## Pricing Models

### OrgPanel Access
- **Free**: Basic organization creation with limited features
- No subscription required to create organization profile

### Organization App Pricing

**Free Apps** (7 apps):
- WytChat (team messaging)
- WytForms (basic forms)
- WytDrive (10GB free storage)
- WytBoard (limited boards)
- WytTask (limited tasks)
- WytCalendar (basic shared calendar)
- WytSupport (limited tickets)

**Premium Apps** (26 apps):
- ₹399/month - ₹2,999/month per app
- Pricing varies by app complexity and features
- Example: WytCRM (₹1,999/month), WytHR (₹1,499/month)

### App Bundles (Cost Savings)

**WytStax Bundle** (Complete Business Suite):
- **11 apps included**: WytProject, WytHR, WytPayroll, WytAccounts, WytCRM, WytInvoice, WytExpense, WytTime, WytAttendance, WytDocs, WytAnalytics
- **Price**: ₹2,999/month
- **Savings**: ₹2,690/month (vs individual app subscriptions)

**WytCRM Bundle** (Sales & Marketing Suite):
- **6 apps included**: WytCRM, WytLead, WytSales, WytMail, WytSocial, WytAnalytics
- **Price**: ₹1,799/month
- **Savings**: ₹1,795/month (vs individual subscriptions)

### Per-User Licensing

Some apps charge per active user:
- **WytHR**: ₹99/user/month
- **WytPayroll**: ₹149/user/month
- **WytAttendance**: ₹49/user/month

**Volume Discounts**:
- 11-50 users: 10% discount
- 51-100 users: 15% discount
- 100+ users: Custom enterprise pricing

---

## Multi-Organization Support

Users can belong to multiple organizations:

**Switching Organizations**:
- Click organization name in top-right
- Select different organization from dropdown
- Context switches to selected organization

**Personal + Organization Access**:
- Users have both MyPanel and OrgPanel access
- MyPanel for personal apps
- OrgPanel for each organization they're part of

**Role Differences Across Organizations**:
- User can be Admin in one organization
- Same user can be Member in another organization
- Permissions scoped per organization

---

## Security & Compliance

### Data Security

**Row Level Security (RLS)**:
- Complete data isolation between organizations
- No cross-organization data access
- Enforced at database level

**Encryption**:
- Data encrypted at rest (AES-256)
- Data encrypted in transit (TLS 1.3)
- Encrypted backups

**Access Control**:
- Role-based permissions
- IP whitelisting option
- Session management
- Audit trail for all actions

### Compliance

**GDPR Compliance**:
- Data processing agreements
- Right to access and export data
- Right to erasure
- Data portability

**SOC 2 Type II** (Coming Soon):
- Security audits
- Compliance certifications
- Annual penetration testing

**Industry-Specific Compliance**:
- HIPAA for healthcare organizations
- PCI DSS for payment processing
- ISO 27001 for information security

---

## Mobile Experience

OrgPanel is optimized for mobile management via PWA:

**Mobile Features**:
- ✅ Approve expenses on-the-go
- ✅ Review support tickets from mobile
- ✅ Monitor team activity in real-time
- ✅ Push notifications for critical alerts
- ✅ Offline access to key dashboards
- ✅ Quick actions (add employee, create task)

---

## API Access

Organizations can access their data via REST API:

**API Capabilities**:
- Retrieve organization data
- Create/update/delete resources
- Webhook integrations
- Real-time data sync

**Authentication**:
- API key-based authentication
- OAuth 2.0 support
- Rate limiting per organization

**Use Cases**:
- Custom integrations
- Data migration
- Third-party app connections
- Automated workflows

---

## Support & Training

**Dedicated Support**:
- Priority email support
- Live chat for premium organizations
- Dedicated account manager (enterprise)
- SLA-backed response times

**Training Resources**:
- Video tutorials for each app
- Admin training webinars
- Documentation and guides
- Community forum access

**Onboarding Assistance**:
- Free 1-hour onboarding call
- Data migration support
- Custom workflow setup
- Best practices consultation

---

## Future Enhancements

**Roadmap** (Coming Soon):
- Advanced workflow automation builder
- AI-powered business insights and predictions
- Custom app builder for organization-specific needs
- Advanced analytics with predictive models
- Multi-language support for global teams
- White-label option for resellers

---

## Related Documentation

- [MyPanel - Personal Dashboard](/en/admin/mypanel)
- [Engine Admin Panel](/en/admin/engine-admin)
- [WytApps Catalog](/en/wytapps/apps-catalog)
- [WytStax Bundle](/en/wytsuites/wytstax)
- [WytCRM Bundle](/en/wytsuites/wytcrm)
- [RBAC System](/en/architecture/rbac)
- [Multi-Tenancy Architecture](/en/architecture/multi-tenancy)
