# WytSuites Overview

**WytSuites** are bundled collections of WytApps designed for specific business needs. Bundles provide cost savings compared to purchasing individual apps and are pre-configured to work together seamlessly.

## What are WytSuites?

WytSuites group related WytApps into cohesive packages for:
- **Cost Efficiency**: Bundle pricing is typically lower than individual app subscriptions
- **Integrated Workflows**: Apps in a suite are pre-integrated for seamless data flow
- **Simplified Management**: Single subscription for multiple apps
- **Purpose-Built Solutions**: Tailored for specific business functions

## Available WytSuites

WytNet currently offers 3 specialized suites:

### 1. WytWorks - Productivity Suite
Complete productivity and collaboration solution for teams and organizations.

[Learn more about WytWorks →](wytworks)

### 2. WytStax - Accounting Suite
Comprehensive financial management and accounting tools for businesses.

[Learn more about WytStax →](wytstax)

### 3. WytCRM - Sales & Marketing Suite
Full customer relationship management system for sales teams.

[Learn more about WytCRM →](wytcrm)

## Bundle Pricing Model

### How Bundle Pricing Works

1. **Individual App Pricing**: Each app has its own subscription price
2. **Bundle Price**: Suites have a special bundled price (typically 20-40% discount)
3. **Pricing Plans Integration**: Pricing Plans can reference either:
   - Individual apps
   - Complete bundles (WytSuites)
   - Mix of both

### Example Pricing Structure

```
WytInvoice (Individual): ₹500/month
WytPay (Individual): ₹1000/month
WytQuote (Individual): ₹400/month

WytStax Bundle: ₹1500/month (Save ₹400)
```

### Mixed Plans

Organizations can create custom pricing plans that combine:
- Individual app subscriptions
- Complete WytSuite bundles
- Custom app collections

## Integration with Pricing Plans

The **Pricing Plans** system supports WytSuites through:

### Bundle References
- Plans can reference bundle IDs instead of individual app IDs
- Single subscription activates all apps in the bundle
- Automatic updates when bundle composition changes

### Flexible Combinations
```json
{
  "planName": "Business Pro",
  "includes": {
    "bundles": ["wytworks", "wytstax"],
    "individual_apps": ["wytai", "wytcloud"]
  }
}
```

### Enterprise Plans
- Custom bundle composition
- Mix and match apps from different suites
- Volume pricing for organizations

## Panel Availability

WytSuites are available based on their component apps:

- **MyPanel Focused**: Suites with primarily individual-use apps
- **OrgPanel Focused**: Suites designed for organizations (WytWorks, WytStax, WytCRM)
- **Both Panels**: Suites with apps available in both contexts

Most WytSuites are **OrgPanel-focused** for business and team use.

## Future Suites

Additional specialized suites are planned:

- **WytHealth**: Health & wellness bundle (WytLife + related apps)
- **WytCreate**: Content creation suite (WytSite, WytCode, WytBuilder)
- **WytCommerce**: E-commerce bundle (WytShop, WytStore, WytPay)
- **WytConnect**: Communication suite (WytCall, WytMeet, WytMail, WytCast)

## Related Documentation

- [WytApps - Individual Apps](/en/wytapps/)
- [Pricing Plans System](/en/features/pricing-plans)
- [WytModules - Platform Modules](/en/wytmodules/)

## Suite Comparison

| Suite | Target Users | # of Apps | Primary Focus |
|-------|-------------|-----------|---------------|
| WytWorks | Teams & Organizations | 4+ | Productivity & Collaboration |
| WytStax | Businesses & Accountants | 3+ | Financial Management |
| WytCRM | Sales Teams | 3+ | Customer Relationships |

Browse individual suite pages for detailed app lists, features, and pricing.
