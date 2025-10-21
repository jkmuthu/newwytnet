# Module Manifest Specification

## Overview

The **Module Manifest** is a standardized `manifest.json` file that defines a module's metadata, dependencies, API endpoints, UI routes, and configuration schema. This manifest enables the WytNet Engine to automatically discover, validate, and register modules without manual configuration.

## Purpose

- **Auto-Discovery**: Engine scans directories for `manifest.json` files and automatically registers modules
- **Validation**: Ensures all required fields are present before registration
- **Version Control**: Tracks module versions and compatibility
- **Dependency Management**: Declares required modules and conflicts
- **API Documentation**: Self-documents exposed endpoints and routes

## Manifest Location

Each module's manifest must be placed at:
```
/packages/{module-name}/manifest.json
```

or

```
/modules/{module-name}/manifest.json
```

## Manifest Structure

### Full Example

```json
{
  "id": "razorpay-payment",
  "name": "Razorpay Payment Gateway",
  "description": "Integrate Razorpay for payment processing with UPI, cards, and wallets",
  "version": "1.2.3",
  "category": "platform",
  "type": "payment",
  "author": "WytNet",
  "license": "MIT",
  
  "contexts": ["platform", "hub", "app"],
  "dependencies": ["payment-core", "user-auth"],
  "conflicts": ["stripe-payment"],
  
  "api": {
    "endpoints": [
      {
        "method": "POST",
        "path": "/api/razorpay/create-order",
        "auth": true,
        "description": "Create a new Razorpay order"
      },
      {
        "method": "POST",
        "path": "/api/razorpay/verify-payment",
        "auth": true,
        "description": "Verify payment signature"
      },
      {
        "method": "GET",
        "path": "/api/razorpay/payment/:id",
        "auth": true,
        "description": "Get payment details"
      }
    ],
    "webhooks": [
      {
        "path": "/api/razorpay/webhook",
        "events": ["payment.captured", "payment.failed"]
      }
    ]
  },
  
  "ui": {
    "route": "/engine/razorpay",
    "icon": "CreditCard",
    "color": "blue",
    "adminPanel": true
  },
  
  "settings": {
    "required": {
      "apiKey": {
        "type": "string",
        "secret": true,
        "description": "Razorpay API Key"
      },
      "apiSecret": {
        "type": "string",
        "secret": true,
        "description": "Razorpay API Secret"
      }
    },
    "optional": {
      "webhookSecret": {
        "type": "string",
        "secret": true,
        "description": "Webhook signature secret"
      },
      "currency": {
        "type": "string",
        "default": "INR",
        "enum": ["INR", "USD", "EUR"],
        "description": "Default currency"
      }
    }
  },
  
  "permissions": {
    "required": ["payments.create", "payments.read"],
    "optional": ["payments.refund"]
  },
  
  "compatibility": {
    "minPlatformVersion": "1.0.0",
    "maxPlatformVersion": "2.0.0",
    "nodeVersion": ">=18.0.0"
  },
  
  "pricing": {
    "model": "free",
    "price": 0,
    "currency": "INR"
  },
  
  "hooks": {
    "onInstall": "scripts/install.js",
    "onUninstall": "scripts/uninstall.js",
    "onActivate": "scripts/activate.js",
    "onDeactivate": "scripts/deactivate.js"
  },
  
  "features": [
    "UPI Payments",
    "Card Payments",
    "Wallet Payments",
    "Subscription Management",
    "Refund Processing"
  ],
  
  "metadata": {
    "repository": "https://github.com/wytnet/razorpay-module",
    "documentation": "https://docs.wytnet.com/modules/razorpay",
    "support": "support@wytnet.com",
    "tags": ["payment", "razorpay", "upi", "gateway"]
  }
}
```

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique module identifier (kebab-case) |
| `name` | string | Human-readable module name |
| `version` | string | Semantic version (e.g., "1.2.3") |
| `category` | string | Module category: `platform`, `wythubs`, `wytapps`, `wytgames` |
| `type` | string | Module type: `auth`, `payment`, `social`, `utility`, etc. |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Module description |
| `author` | string | Module author/creator |
| `license` | string | License type (MIT, GPL, etc.) |
| `contexts` | string[] | Supported contexts: `platform`, `hub`, `app`, `game` |
| `dependencies` | string[] | Required module IDs |
| `conflicts` | string[] | Conflicting module IDs |
| `api` | object | API endpoints and webhooks |
| `ui` | object | UI configuration (route, icon, color) |
| `settings` | object | Required and optional settings schema |
| `permissions` | object | Required and optional permissions |
| `compatibility` | object | Version compatibility matrix |
| `pricing` | object | Pricing model and cost |
| `hooks` | object | Lifecycle hook scripts |
| `features` | string[] | List of features |
| `metadata` | object | Additional metadata (repo, docs, tags) |

## API Specification

### Endpoints

```json
"api": {
  "endpoints": [
    {
      "method": "GET | POST | PUT | PATCH | DELETE",
      "path": "/api/module-name/resource",
      "auth": true | false,
      "permissions": ["permission.required"],
      "description": "Endpoint description"
    }
  ],
  "webhooks": [
    {
      "path": "/api/module-name/webhook",
      "events": ["event.name"]
    }
  ]
}
```

## Settings Schema

### Required vs Optional Settings

```json
"settings": {
  "required": {
    "apiKey": {
      "type": "string",
      "secret": true,
      "description": "API Key",
      "validation": "^[A-Za-z0-9]{32}$"
    }
  },
  "optional": {
    "timeout": {
      "type": "number",
      "default": 5000,
      "min": 1000,
      "max": 30000,
      "description": "Request timeout in ms"
    }
  }
}
```

### Supported Types

- `string`: Text value
- `number`: Numeric value
- `boolean`: True/false value
- `array`: Array of values
- `object`: Nested object
- `enum`: One of predefined values

## Version Control

### Semantic Versioning

Modules must follow [Semantic Versioning 2.0.0](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (1.X.0): New features, backward compatible
- **Patch** (1.0.X): Bug fixes, backward compatible

### Version History

Track changes in the `versionHistory` array:

```json
"versionHistory": [
  {
    "version": "1.2.0",
    "date": "2025-10-15",
    "changes": "Added webhook support for payment events"
  },
  {
    "version": "1.1.0",
    "date": "2025-09-01",
    "changes": "Added support for UPI AutoPay"
  }
]
```

## Lifecycle Hooks

Modules can define scripts that run during lifecycle events:

| Hook | When Executed | Purpose |
|------|---------------|---------|
| `onInstall` | After module installation | Setup database tables, initial config |
| `onUninstall` | Before module removal | Cleanup data, remove tables |
| `onActivate` | When module is activated in a context | Initialize services, register routes |
| `onDeactivate` | When module is deactivated | Stop services, cleanup |

Example hook script:
```javascript
// scripts/install.js
export async function onInstall(context) {
  await context.db.createTable('module_data');
  await context.settings.set('initialized', true);
  console.log('Module installed successfully');
}
```

## Auto-Discovery Process

### Step 1: Scan Directories

Engine scans these directories for `manifest.json` files:
```
/packages/*/manifest.json
/modules/*/manifest.json
```

### Step 2: Validate Manifest

Engine validates:
- All required fields are present
- Version format is valid (semver)
- Dependencies exist
- No conflicts with active modules
- Settings schema is valid

### Step 3: Register Module

If validation passes:
1. Insert/update module in `platform_modules` table
2. Map manifest fields to database columns
3. Execute `onInstall` hook if new module
4. Set status to `enabled` if all checks pass

### Step 4: Activate Module

For each supported context:
1. Check context compatibility
2. Verify dependencies are active
3. Execute `onActivate` hook
4. Register API endpoints
5. Create activation record in `platform_module_activations`

## Validation Rules

### Required Field Validation

- `id`: Must be kebab-case, unique, 3-50 characters
- `name`: 3-255 characters
- `version`: Valid semver (e.g., "1.2.3")
- `category`: One of: `platform`, `wythubs`, `wytapps`, `wytgames`
- `type`: Valid module type string

### Dependency Validation

- All dependencies must be installed modules
- No circular dependencies allowed
- Dependencies must be compatible versions

### Conflict Detection

- Module cannot be activated if conflicting module is active
- Conflicts are bidirectional (if A conflicts with B, B conflicts with A)

## Error Handling

### Common Validation Errors

```json
{
  "error": "INVALID_MANIFEST",
  "details": {
    "field": "version",
    "message": "Invalid semantic version format",
    "expected": "X.Y.Z (e.g., 1.2.3)"
  }
}
```

### Dependency Errors

```json
{
  "error": "MISSING_DEPENDENCY",
  "details": {
    "module": "razorpay-payment",
    "dependency": "payment-core",
    "message": "Required module 'payment-core' is not installed"
  }
}
```

## Best Practices

1. **Version Incrementing**: Always increment version when updating manifest
2. **Dependency Pinning**: Specify exact versions for dependencies
3. **Settings Documentation**: Provide clear descriptions for all settings
4. **API Documentation**: Document all endpoints with examples
5. **Testing**: Test module in all supported contexts before publishing
6. **Changelog**: Maintain detailed version history
7. **Icons**: Use Lucide React icons for consistency
8. **Permissions**: Request minimum required permissions

## Migration Guide

### Converting Existing Modules

To convert an existing module to use manifest-based auto-discovery:

1. Create `manifest.json` in module directory
2. Fill required fields from module code
3. Define API endpoints and routes
4. Specify settings schema
5. Add lifecycle hooks if needed
6. Test auto-discovery process
7. Remove manual registration code

### Backward Compatibility

The Engine supports both manifest-based and manually registered modules. Manual registrations take precedence over manifest-based discovery.

## Related Documentation

- [Platform Modules Schema](/en/architecture/database-schema#platform-modules)
- [Module Activation System](/en/features/module-system)
- [RBAC Permissions](/en/architecture/rbac)
- [API Development Guide](/en/api/modules)
