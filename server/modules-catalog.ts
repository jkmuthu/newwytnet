/**
 * WytNet Module Catalog - Comprehensive Plugin Registry
 * 
 * Philosophy: Modules are small, focused plugins that can be activated in different contexts
 * Like WordPress plugins - each does ONE thing well, can be combined for complex functionality
 * 
 * Module Categories:
 * 1. Authentication & Identity
 * 2. Payment Gateways
 * 3. Content & Media
 * 4. Communication
 * 5. Data Management
 * 6. User & Organization
 * 7. Productivity
 * 8. Platform Core
 */

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  category: 'auth' | 'payment' | 'content' | 'communication' | 'data' | 'user-org' | 'productivity' | 'platform-core' | 'location';
  type: string;
  contexts: Array<'platform' | 'hub' | 'app' | 'game'>;
  dependencies: string[]; // Module IDs that must be enabled first
  apiEndpoints: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    auth: boolean;
    description: string;
  }>;
  settings: {
    apiKeyRequired?: boolean;
    webhookUrl?: string;
    configFields?: Array<{ key: string; type: string; required: boolean }>;
  };
  compatibilityMatrix: {
    minVersion?: string;
    conflicts?: string[]; // Module IDs that cannot coexist
  };
  pricing: 'free' | 'premium' | 'usage-based';
  price?: number;
  icon: string;
  color: string;
  
  // Version Control & History
  version: string; // Current version e.g. '1.0.0'
  changelog?: string; // Latest version changelog
  route?: string; // Module route/URL
  
  // Access Restrictions
  restrictedTo?: Array<'engine-only' | 'hub-only' | 'app-only' | 'game-only'>;
  
  upstream?: {
    provider: string;
    baseUrl: string;
    credentialKey: string; // Environment variable name for API key
    type: 'proxy' | 'native' | 'hybrid';
  };
}

export const MODULE_CATALOG: ModuleDefinition[] = [
  // ===== 1. AUTHENTICATION & IDENTITY =====
  {
    id: 'wytpass-auth',
    name: 'WytPass Authentication Core',
    description: 'Universal identity system with multi-method authentication',
    category: 'auth',
    type: 'core-auth',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', auth: false, description: 'User login' },
      { method: 'POST', path: '/api/auth/register', auth: false, description: 'User registration' },
      { method: 'POST', path: '/api/auth/logout', auth: true, description: 'User logout' },
      { method: 'GET', path: '/api/auth/session', auth: true, description: 'Get session info' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'shield',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with core authentication features including login, registration, and session management',
    route: '/auth',
    restrictedTo: ['engine-only']
  },
  {
    id: 'google-oauth',
    name: 'Google OAuth Login',
    description: 'Sign in with Google account',
    category: 'auth',
    type: 'oauth-provider',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'GET', path: '/auth/google', auth: false, description: 'Initiate Google OAuth' },
      { method: 'GET', path: '/auth/google/callback', auth: false, description: 'OAuth callback' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'GOOGLE_CLIENT_ID', type: 'string', required: true },
        { key: 'GOOGLE_CLIENT_SECRET', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'google',
    color: 'red',
    version: '1.0.0',
    changelog: 'Initial release with Google OAuth 2.0 authentication integration',
    route: '/auth/google'
  },
  {
    id: 'email-otp-auth',
    name: 'Email OTP Authentication',
    description: 'Passwordless login via email OTP',
    category: 'auth',
    type: 'passwordless',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth', 'email-service'],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/email-otp/send', auth: false, description: 'Send OTP to email' },
      { method: 'POST', path: '/api/auth/email-otp/verify', auth: false, description: 'Verify OTP' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'MSG91_AUTH_KEY', type: 'string', required: true },
        { key: 'MSG91_EMAIL_TEMPLATE_ID', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'usage-based',
    price: 0.50,
    icon: 'mail',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with passwordless email OTP authentication using MSG91',
    route: '/auth/email-otp'
  },
  {
    id: 'whatsapp-otp-auth',
    name: 'WhatsApp OTP Authentication',
    description: 'Self-share OTP through WhatsApp (No SMS costs)',
    category: 'auth',
    type: 'passwordless',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/whatsapp-otp/send', auth: false, description: 'Generate OTP for WhatsApp' },
      { method: 'POST', path: '/api/auth/whatsapp-otp/verify', auth: false, description: 'Verify OTP' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'message-circle',
    color: 'green',
    version: '1.0.0',
    changelog: 'Initial release with cost-free WhatsApp OTP authentication',
    route: '/auth/whatsapp'
  },
  {
    id: 'linkedin-oauth',
    name: 'LinkedIn OAuth Login',
    description: 'Sign in with LinkedIn professional account',
    category: 'auth',
    type: 'oauth-provider',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'GET', path: '/auth/linkedin', auth: false, description: 'Initiate LinkedIn OAuth' },
      { method: 'GET', path: '/auth/linkedin/callback', auth: false, description: 'OAuth callback' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'LINKEDIN_CLIENT_ID', type: 'string', required: true },
        { key: 'LINKEDIN_CLIENT_SECRET', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'linkedin',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with LinkedIn OAuth authentication for professional networks',
    route: '/auth/linkedin'
  },
  {
    id: 'facebook-oauth',
    name: 'Facebook OAuth Login',
    description: 'Sign in with Facebook account',
    category: 'auth',
    type: 'oauth-provider',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'GET', path: '/auth/facebook', auth: false, description: 'Initiate Facebook OAuth' },
      { method: 'GET', path: '/auth/facebook/callback', auth: false, description: 'OAuth callback' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'FACEBOOK_APP_ID', type: 'string', required: true },
        { key: 'FACEBOOK_APP_SECRET', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'facebook',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with Facebook OAuth authentication integration',
    route: '/auth/facebook'
  },
  {
    id: 'wytkyc-digio',
    name: 'WytKYC - Identity Verification',
    description: 'Aadhaar eSign, PAN verification, eKYC powered by Digio',
    category: 'auth',
    type: 'verification',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'POST', path: '/api/modules/wytkyc/esign/initiate', auth: true, description: 'Initiate Aadhaar eSign' },
      { method: 'GET', path: '/api/modules/wytkyc/esign/status/:requestId', auth: true, description: 'Check eSign status' },
      { method: 'POST', path: '/api/modules/wytkyc/verify/pan', auth: true, description: 'Verify PAN card' },
      { method: 'POST', path: '/api/modules/wytkyc/verify/aadhaar', auth: true, description: 'Verify Aadhaar' },
      { method: 'POST', path: '/api/modules/wytkyc/face-match', auth: true, description: 'Face verification & matching' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'DIGIO_API_KEY', type: 'string', required: true },
        { key: 'DIGIO_CLIENT_ID', type: 'string', required: false }
      ]
    },
    compatibilityMatrix: {
      conflicts: ['signzy-kyc', 'perfios-kyc']
    },
    pricing: 'usage-based',
    price: 5.0,
    icon: 'shield-check',
    color: 'teal',
    upstream: {
      provider: 'Digio',
      baseUrl: 'https://api.digio.in/v2',
      credentialKey: 'DIGIO_API_KEY',
      type: 'proxy'
    },
    version: '1.0.0',
    changelog: 'Initial release with Aadhaar eSign, PAN verification, and eKYC integration via Digio',
    route: '/kyc'
  },

  // ===== 2. PAYMENT GATEWAYS =====
  {
    id: 'payment-core',
    name: 'Payment Core System',
    description: 'Base payment processing infrastructure',
    category: 'payment',
    type: 'core-payment',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/payments/create-order', auth: true, description: 'Create payment order' },
      { method: 'POST', path: '/api/payments/verify', auth: true, description: 'Verify payment' },
      { method: 'GET', path: '/api/payments/history', auth: true, description: 'Payment history' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'credit-card',
    color: 'purple',
    version: '1.0.0',
    changelog: 'Initial release with core payment infrastructure for order creation and verification',
    route: '/payments',
    restrictedTo: ['engine-only']
  },
  {
    id: 'razorpay-payment',
    name: 'Razorpay Payment Gateway',
    description: 'Indian payment gateway for cards, UPI, wallets',
    category: 'payment',
    type: 'payment-gateway',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['payment-core'],
    apiEndpoints: [
      { method: 'POST', path: '/api/razorpay/create-order', auth: true, description: 'Create Razorpay order' },
      { method: 'POST', path: '/api/razorpay/verify-signature', auth: true, description: 'Verify payment signature' },
      { method: 'POST', path: '/api/razorpay/webhook', auth: false, description: 'Razorpay webhook' }
    ],
    settings: {
      apiKeyRequired: true,
      webhookUrl: '/api/razorpay/webhook',
      configFields: [
        { key: 'RAZORPAY_KEY_ID', type: 'string', required: true },
        { key: 'RAZORPAY_KEY_SECRET', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {
      conflicts: ['stripe-payment']
    },
    pricing: 'usage-based',
    price: 2.0,
    icon: 'wallet',
    color: 'indigo',
    version: '1.0.0',
    changelog: 'Initial release with Razorpay integration for Indian payments including UPI, cards, and wallets',
    route: '/payments/razorpay'
  },
  {
    id: 'bank-transfer-payment',
    name: 'Bank Transfer Payment Method',
    description: 'Manual bank transfer/NEFT/RTGS payments',
    category: 'payment',
    type: 'payment-method',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['payment-core'],
    apiEndpoints: [
      { method: 'POST', path: '/api/bank-transfer/initiate', auth: true, description: 'Get bank details' },
      { method: 'POST', path: '/api/bank-transfer/confirm', auth: true, description: 'Confirm transfer' }
    ],
    settings: {
      configFields: [
        { key: 'BANK_ACCOUNT_NUMBER', type: 'string', required: true },
        { key: 'BANK_IFSC_CODE', type: 'string', required: true },
        { key: 'BANK_NAME', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'building',
    color: 'green',
    version: '1.0.0',
    changelog: 'Initial release with manual bank transfer payment support for NEFT/RTGS/IMPS',
    route: '/payments/bank-transfer'
  },
  {
    id: 'stripe-payment',
    name: 'Stripe Payment Gateway',
    description: 'International payment gateway for global payments',
    category: 'payment',
    type: 'payment-gateway',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['payment-core'],
    apiEndpoints: [
      { method: 'POST', path: '/api/stripe/create-payment-intent', auth: true, description: 'Create payment intent' },
      { method: 'POST', path: '/api/stripe/webhook', auth: false, description: 'Stripe webhook' }
    ],
    settings: {
      apiKeyRequired: true,
      webhookUrl: '/api/stripe/webhook',
      configFields: [
        { key: 'STRIPE_SECRET_KEY', type: 'string', required: true },
        { key: 'STRIPE_WEBHOOK_SECRET', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {
      conflicts: ['razorpay-payment']
    },
    pricing: 'usage-based',
    price: 2.9,
    icon: 'credit-card',
    color: 'purple',
    version: '1.0.0',
    changelog: 'Initial release with Stripe integration for international payments',
    route: '/payments/stripe'
  },

  // ===== 3. CONTENT & MEDIA =====
  {
    id: 'logo-dp-uploader',
    name: 'Logo/DP Uploader with Autocrop',
    description: 'Profile picture and logo uploader with auto-crop',
    category: 'content',
    type: 'media-uploader',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['object-storage'],
    apiEndpoints: [
      { method: 'POST', path: '/api/media/upload-avatar', auth: true, description: 'Upload and crop avatar' },
      { method: 'DELETE', path: '/api/media/delete-avatar', auth: true, description: 'Delete avatar' }
    ],
    settings: {
      configFields: [
        { key: 'MAX_FILE_SIZE', type: 'number', required: true },
        { key: 'ALLOWED_FORMATS', type: 'array', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'image',
    color: 'orange',
    version: '1.0.0',
    changelog: 'Initial release with automatic image cropping for profile pictures and logos',
    route: '/media/avatar'
  },
  {
    id: 'multi-image-uploader',
    name: 'Multi Images Uploader',
    description: 'Upload multiple images with preview and gallery',
    category: 'content',
    type: 'media-uploader',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['object-storage'],
    apiEndpoints: [
      { method: 'POST', path: '/api/media/upload-gallery', auth: true, description: 'Upload multiple images' },
      { method: 'DELETE', path: '/api/media/delete-image/:id', auth: true, description: 'Delete single image' }
    ],
    settings: {
      configFields: [
        { key: 'MAX_IMAGES', type: 'number', required: true },
        { key: 'MAX_FILE_SIZE_PER_IMAGE', type: 'number', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'images',
    color: 'teal',
    version: '1.0.0',
    changelog: 'Initial release with multiple image upload, preview, and gallery management',
    route: '/media/gallery'
  },
  {
    id: 'video-player',
    name: 'Video Player Module',
    description: 'Embed and play videos with controls',
    category: 'content',
    type: 'media-player',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/media/video/:id', auth: false, description: 'Get video metadata' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'video',
    color: 'red',
    version: '1.0.0',
    changelog: 'Initial release with video embedding and playback controls',
    route: '/media/video'
  },
  {
    id: 'rich-text-editor',
    name: 'Rich Text Editor',
    description: 'WYSIWYG editor for content creation',
    category: 'content',
    type: 'editor',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'type',
    color: 'gray',
    version: '1.0.0',
    changelog: 'Initial release with WYSIWYG rich text editing capabilities',
    route: '/content/editor'
  },
  {
    id: 'object-storage',
    name: 'Object Storage Service',
    description: 'Cloud storage for files and media',
    category: 'content',
    type: 'storage',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/storage/upload', auth: true, description: 'Upload file' },
      { method: 'GET', path: '/api/storage/download/:id', auth: true, description: 'Download file' },
      { method: 'DELETE', path: '/api/storage/delete/:id', auth: true, description: 'Delete file' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'STORAGE_BUCKET', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'usage-based',
    price: 0.023,
    icon: 'cloud',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with cloud object storage for files and media',
    restrictedTo: ['engine-only']
  },

  // ===== 4. COMMUNICATION =====
  {
    id: 'email-service',
    name: 'Email Service',
    description: 'Send transactional and marketing emails',
    category: 'communication',
    type: 'email',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/email/send', auth: true, description: 'Send email' },
      { method: 'GET', path: '/api/email/templates', auth: true, description: 'List email templates' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'SMTP_HOST', type: 'string', required: true },
        { key: 'SMTP_PORT', type: 'number', required: true },
        { key: 'SMTP_USER', type: 'string', required: true },
        { key: 'SMTP_PASSWORD', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'usage-based',
    price: 0.10,
    icon: 'mail',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with transactional and marketing email sending capabilities',
    restrictedTo: ['engine-only']
  },
  {
    id: 'sms-service',
    name: 'SMS Service',
    description: 'Send SMS notifications and OTPs',
    category: 'communication',
    type: 'sms',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/sms/send', auth: true, description: 'Send SMS' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'SMS_PROVIDER', type: 'string', required: true },
        { key: 'SMS_API_KEY', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'usage-based',
    price: 0.05,
    icon: 'smartphone',
    color: 'green',
    version: '1.0.0',
    changelog: 'Initial release with SMS notifications and OTP delivery',
    restrictedTo: ['engine-only']
  },
  {
    id: 'push-notifications',
    name: 'Push Notifications',
    description: 'Web and mobile push notifications',
    category: 'communication',
    type: 'notifications',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/notifications/send', auth: true, description: 'Send push notification' },
      { method: 'POST', path: '/api/notifications/subscribe', auth: true, description: 'Subscribe to notifications' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'VAPID_PUBLIC_KEY', type: 'string', required: true },
        { key: 'VAPID_PRIVATE_KEY', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'bell',
    color: 'yellow',
    version: '1.0.0',
    changelog: 'Initial release with web and mobile push notifications support',
    route: '/notifications'
  },
  {
    id: 'chat-system',
    name: 'Real-time Chat System',
    description: 'WebSocket-based chat and messaging',
    category: 'communication',
    type: 'chat',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/chat/send', auth: true, description: 'Send message' },
      { method: 'GET', path: '/api/chat/history/:roomId', auth: true, description: 'Get chat history' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 49,
    icon: 'message-square',
    color: 'purple',
    version: '1.0.0',
    changelog: 'Initial release with WebSocket-based real-time chat and messaging',
    route: '/chat'
  },

  // ===== 5. DATA MANAGEMENT =====
  {
    id: 'dataset-creator',
    name: 'Dataset Creator',
    description: 'Create and manage structured datasets',
    category: 'data',
    type: 'data-tool',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/datasets/create', auth: true, description: 'Create dataset' },
      { method: 'GET', path: '/api/datasets/:id', auth: true, description: 'Get dataset' },
      { method: 'PUT', path: '/api/datasets/:id', auth: true, description: 'Update dataset' },
      { method: 'DELETE', path: '/api/datasets/:id', auth: true, description: 'Delete dataset' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'database',
    color: 'indigo',
    version: '1.0.0',
    changelog: 'Initial release with dataset creation and management tools',
    route: '/datasets'
  },
  {
    id: 'csv-import-export',
    name: 'CSV Import/Export',
    description: 'Import and export data via CSV files',
    category: 'data',
    type: 'data-tool',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/data/import-csv', auth: true, description: 'Import CSV data' },
      { method: 'GET', path: '/api/data/export-csv/:entityType', auth: true, description: 'Export CSV data' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'file-text',
    color: 'green',
    version: '1.0.0',
    changelog: 'Initial release with CSV import and export functionality',
    route: '/data/csv'
  },
  {
    id: 'search-engine',
    name: 'Search Engine (Meilisearch)',
    description: 'Full-text search across platform',
    category: 'data',
    type: 'search',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/search', auth: true, description: 'Search across entities' },
      { method: 'POST', path: '/api/search/index', auth: true, description: 'Index content' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'MEILISEARCH_URL', type: 'string', required: true },
        { key: 'MEILISEARCH_API_KEY', type: 'string', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 29,
    icon: 'search',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with Meilisearch-powered full-text search capabilities',
    route: '/search'
  },
  {
    id: 'wytgeo',
    name: 'WytGeo - Location & Geography Data',
    description: 'Comprehensive location datasets: 50 countries, 37 Indian states, 100 cities, 10 timezones',
    category: 'data',
    type: 'native',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/modules/wytgeo/countries', auth: true, description: 'Get all countries with ISO codes, flags, currencies' },
      { method: 'GET', path: '/api/modules/wytgeo/india-states', auth: true, description: 'Get all Indian states with codes and capitals' },
      { method: 'GET', path: '/api/modules/wytgeo/india-cities', auth: true, description: 'Get top 100 Indian cities' },
      { method: 'GET', path: '/api/modules/wytgeo/timezones', auth: true, description: 'Get timezones with UTC offsets and DST info' },
      { method: 'GET', path: '/api/modules/wytgeo/:key/search', auth: true, description: 'Search within geography datasets' },
      { method: 'POST', path: '/api/modules/wytgeo/batch', auth: true, description: 'Fetch multiple geography datasets' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'usage-based',
    price: 0.30,
    icon: 'globe',
    color: 'green',
    upstream: {
      provider: 'WytNet',
      baseUrl: '',
      credentialKey: '',
      type: 'native'
    },
    version: '1.0.0',
    changelog: 'Initial release with comprehensive geography data: 50 countries, 37 Indian states, 100 cities, 10 timezones'
  },
  {
    id: 'wyti18n',
    name: 'WytI18n - Internationalization Data',
    description: 'Global i18n datasets: 20 languages with ISO codes, 20 currencies with symbols',
    category: 'data',
    type: 'native',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/modules/wyti18n/languages', auth: true, description: 'Get languages with ISO 639 codes, native names, RTL/LTR' },
      { method: 'GET', path: '/api/modules/wyti18n/currencies', auth: true, description: 'Get currencies with ISO 4217 codes, symbols' },
      { method: 'GET', path: '/api/modules/wyti18n/:key/locale/:locale', auth: true, description: 'Get localized i18n data' },
      { method: 'GET', path: '/api/modules/wyti18n/:key/search', auth: true, description: 'Search within i18n datasets' },
      { method: 'POST', path: '/api/modules/wyti18n/batch', auth: true, description: 'Fetch multiple i18n datasets' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'usage-based',
    price: 0.20,
    icon: 'languages',
    color: 'blue',
    upstream: {
      provider: 'WytNet',
      baseUrl: '',
      credentialKey: '',
      type: 'native'
    },
    version: '1.0.0',
    changelog: 'Initial release with internationalization data: 20 languages, 20 currencies with symbols'
  },
  {
    id: 'wytbiz',
    name: 'WytBiz - Business Reference Data',
    description: 'Business datasets: 15 industries, 6 company sizes, 15 job roles, 34 GST codes',
    category: 'data',
    type: 'native',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/modules/wytbiz/industries', auth: true, description: 'Get industry classifications' },
      { method: 'GET', path: '/api/modules/wytbiz/company-sizes', auth: true, description: 'Get company size ranges' },
      { method: 'GET', path: '/api/modules/wytbiz/job-roles', auth: true, description: 'Get professional job roles' },
      { method: 'GET', path: '/api/modules/wytbiz/gst-state-codes', auth: true, description: 'Get Indian GST state codes' },
      { method: 'GET', path: '/api/modules/wytbiz/:key/search', auth: true, description: 'Search within business datasets' },
      { method: 'POST', path: '/api/modules/wytbiz/batch', auth: true, description: 'Fetch multiple business datasets' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'usage-based',
    price: 0.20,
    icon: 'briefcase',
    color: 'violet',
    upstream: {
      provider: 'WytNet',
      baseUrl: '',
      credentialKey: '',
      type: 'native'
    },
    version: '1.0.0',
    changelog: 'Initial release with business reference data: 15 industries, 6 company sizes, 15 job roles, 34 GST codes'
  },

  // ===== 6. USER & ORGANIZATION =====
  {
    id: 'organization-manager',
    name: 'Organisation Manager',
    description: 'Multi-level organization and team management',
    category: 'user-org',
    type: 'organization',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'POST', path: '/api/organizations/create', auth: true, description: 'Create organization' },
      { method: 'POST', path: '/api/organizations/:id/add-member', auth: true, description: 'Add member' },
      { method: 'GET', path: '/api/organizations/:id', auth: true, description: 'Get organization' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 99,
    icon: 'users',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with multi-level organization and team management capabilities',
    route: '/organizations'
  },
  {
    id: 'rbac-system',
    name: 'Role-Based Access Control',
    description: 'Granular permissions and role management',
    category: 'user-org',
    type: 'security',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'POST', path: '/api/rbac/roles/create', auth: true, description: 'Create role' },
      { method: 'POST', path: '/api/rbac/assign-role', auth: true, description: 'Assign role to user' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 79,
    icon: 'shield-check',
    color: 'red',
    version: '1.0.0',
    changelog: 'Initial release with granular role-based access control and permissions',
    route: '/rbac'
  },
  {
    id: 'user-profile-manager',
    name: 'User Profile Manager',
    description: 'Complete user profile management system',
    category: 'user-org',
    type: 'user-management',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'GET', path: '/api/profile', auth: true, description: 'Get user profile' },
      { method: 'PUT', path: '/api/profile', auth: true, description: 'Update profile' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'user',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with comprehensive user profile management',
    route: '/profile'
  },

  // ===== 7. PRODUCTIVITY =====
  {
    id: 'calendar',
    name: 'Calendar Module',
    description: 'Event scheduling and calendar management',
    category: 'productivity',
    type: 'scheduling',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/calendar/events', auth: true, description: 'Create event' },
      { method: 'GET', path: '/api/calendar/events', auth: true, description: 'List events' },
      { method: 'PUT', path: '/api/calendar/events/:id', auth: true, description: 'Update event' },
      { method: 'DELETE', path: '/api/calendar/events/:id', auth: true, description: 'Delete event' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'calendar',
    color: 'purple',
    version: '1.0.0',
    changelog: 'Initial release with event scheduling and calendar management',
    route: '/calendar'
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Task assignment and tracking system',
    category: 'productivity',
    type: 'task-management',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/tasks/create', auth: true, description: 'Create task' },
      { method: 'GET', path: '/api/tasks', auth: true, description: 'List tasks' },
      { method: 'PUT', path: '/api/tasks/:id', auth: true, description: 'Update task' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'check-square',
    color: 'green',
    version: '1.0.0',
    changelog: 'Initial release with task assignment and tracking capabilities',
    route: '/tasks'
  },
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    description: 'Visual workflow board for task management',
    category: 'productivity',
    type: 'workflow',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['task-manager'],
    apiEndpoints: [
      { method: 'GET', path: '/api/kanban/boards', auth: true, description: 'Get boards' },
      { method: 'POST', path: '/api/kanban/move-card', auth: true, description: 'Move card' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 39,
    icon: 'trello',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with visual Kanban board for task workflow management',
    route: '/kanban'
  },
  {
    id: 'pricing-plans',
    name: 'Pricing Plans Module',
    description: 'Subscription and pricing plan management',
    category: 'productivity',
    type: 'monetization',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['payment-core'],
    apiEndpoints: [
      { method: 'POST', path: '/api/plans/create', auth: true, description: 'Create plan' },
      { method: 'GET', path: '/api/plans', auth: false, description: 'List plans' },
      { method: 'POST', path: '/api/subscriptions/subscribe', auth: true, description: 'Subscribe to plan' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'dollar-sign',
    color: 'green',
    version: '1.0.0',
    changelog: 'Initial release with subscription and pricing plan management',
    route: '/pricing'
  },

  // ===== 8. PLATFORM CORE =====
  {
    id: 'analytics-engine',
    name: 'Analytics & Metrics Engine',
    description: 'Platform-wide analytics and usage tracking',
    category: 'platform-core',
    type: 'analytics',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/analytics/track', auth: true, description: 'Track event' },
      { method: 'GET', path: '/api/analytics/dashboard', auth: true, description: 'Get analytics dashboard' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 149,
    icon: 'bar-chart',
    color: 'purple',
    version: '1.0.0',
    changelog: 'Initial release with platform-wide analytics and usage tracking',
    route: '/analytics',
    restrictedTo: ['engine-only']
  },
  {
    id: 'audit-logs',
    name: 'Audit Logs System',
    description: 'Track all system actions for compliance',
    category: 'platform-core',
    type: 'security',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/audit-logs', auth: true, description: 'Get audit logs' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 99,
    icon: 'file-text',
    color: 'red',
    version: '1.0.0',
    changelog: 'Initial release with comprehensive audit logging for compliance',
    route: '/audit-logs',
    restrictedTo: ['engine-only']
  },
  {
    id: 'geo-regulatory-control',
    name: 'Geo-Regulatory Control',
    description: 'Multi-country compliance, data sovereignty, and geographic access control layer',
    category: 'platform-core',
    type: 'compliance',
    contexts: ['hub', 'app'], // Hub and App level only, not Engine-wide
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/geo-regulatory/rules', auth: true, description: 'List geo-regulatory rules' },
      { method: 'POST', path: '/api/geo-regulatory/rules', auth: true, description: 'Create regulatory rule' },
      { method: 'PATCH', path: '/api/geo-regulatory/rules/:id', auth: true, description: 'Update regulatory rule' },
      { method: 'DELETE', path: '/api/geo-regulatory/rules/:id', auth: true, description: 'Delete regulatory rule' },
      { method: 'GET', path: '/api/geo-regulatory/compliance-logs', auth: true, description: 'Get compliance audit logs' },
      { method: 'GET', path: '/api/geo-regulatory/templates', auth: true, description: 'Get compliance templates (GDPR, CCPA, PDPA, etc.)' }
    ],
    settings: {
      configFields: [
        { key: 'DEFAULT_COMPLIANCE_LEVEL', type: 'string', required: false },
        { key: 'GOVERNMENT_MONITORING_ENABLED', type: 'boolean', required: false }
      ]
    },
    compatibilityMatrix: {
      minVersion: '1.0.0'
    },
    pricing: 'premium',
    price: 199,
    icon: 'globe',
    color: 'indigo',
    version: '1.0.0',
    changelog: 'Initial release with country/state-level regulatory controls, data sovereignty features, compliance templates (GDPR, CCPA, PDPA), government monitoring dashboard (read-only), and comprehensive audit logging',
    route: '/geo-regulatory'
  },
  {
    id: 'api-key-manager',
    name: 'API Key Manager',
    description: 'Generate and manage API keys for module access',
    category: 'platform-core',
    type: 'security',
    contexts: ['platform'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/keys/generate', auth: true, description: 'Generate API key' },
      { method: 'GET', path: '/api/keys', auth: true, description: 'List API keys' },
      { method: 'DELETE', path: '/api/keys/:id', auth: true, description: 'Revoke API key' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'key',
    color: 'yellow',
    version: '1.0.0',
    changelog: 'Initial release with API key generation and management',
    route: '/api-keys',
    restrictedTo: ['engine-only']
  },
  {
    id: 'rate-limiter',
    name: 'Rate Limiting System',
    description: 'API rate limiting and throttling',
    category: 'platform-core',
    type: 'security',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [],
    settings: {
      configFields: [
        { key: 'REQUESTS_PER_MINUTE', type: 'number', required: true }
      ]
    },
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'activity',
    color: 'orange',
    version: '1.0.0',
    changelog: 'Initial release with API rate limiting and throttling',
    restrictedTo: ['engine-only']
  },
  {
    id: 'webhook-manager',
    name: 'Webhook Manager',
    description: 'Manage outgoing webhooks and events',
    category: 'platform-core',
    type: 'integration',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/webhooks/create', auth: true, description: 'Create webhook' },
      { method: 'GET', path: '/api/webhooks', auth: true, description: 'List webhooks' },
      { method: 'POST', path: '/api/webhooks/test/:id', auth: true, description: 'Test webhook' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'git-branch',
    color: 'gray',
    version: '1.0.0',
    changelog: 'Initial release with outgoing webhook management and event handling',
    route: '/webhooks'
  },
  {
    id: 'multi-tenant-core',
    name: 'Multi-Tenant Core',
    description: 'Core multi-tenancy and RLS system',
    category: 'platform-core',
    type: 'core',
    contexts: ['platform'],
    dependencies: [],
    apiEndpoints: [],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'layers',
    color: 'blue',
    version: '1.0.0',
    changelog: 'Initial release with core multi-tenancy and row-level security',
    restrictedTo: ['engine-only']
  },
  {
    id: 'cms-builder',
    name: 'CMS Builder',
    description: 'Content management system with drag-and-drop',
    category: 'platform-core',
    type: 'builder',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/cms/pages', auth: true, description: 'Create page' },
      { method: 'GET', path: '/api/cms/pages/:slug', auth: false, description: 'Get page' },
      { method: 'PUT', path: '/api/cms/pages/:id', auth: true, description: 'Update page' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'layout',
    color: 'purple',
    version: '1.0.0',
    changelog: 'Initial release with drag-and-drop CMS page builder',
    route: '/cms'
  },
  {
    id: 'hub-aggregator',
    name: 'Hub Aggregation Engine',
    description: 'Cross-tenant data aggregation for hubs',
    category: 'platform-core',
    type: 'engine',
    contexts: ['platform', 'hub'],
    dependencies: ['multi-tenant-core'],
    apiEndpoints: [
      { method: 'POST', path: '/api/hub-aggregator/aggregate', auth: true, description: 'Run aggregation' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'share-2',
    color: 'teal',
    version: '1.0.0',
    changelog: 'Initial release with cross-tenant data aggregation for hub networks',
    restrictedTo: ['hub-only']
  },

  // Additional specialized modules from WytNet
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate customizable QR codes',
    category: 'productivity',
    type: 'tool',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'POST', path: '/api/qr/generate', auth: true, description: 'Generate QR code' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'qr-code',
    color: 'emerald',
    version: '1.0.0',
    changelog: 'Initial release with customizable QR code generation',
    route: '/qr'
  },
  {
    id: 'wytid-validation',
    name: 'WytID Identity Validation',
    description: 'Blockchain-anchored identity verification',
    category: 'auth',
    type: 'identity',
    contexts: ['platform', 'hub', 'app'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'POST', path: '/api/wytid/create-proof', auth: true, description: 'Create identity proof' },
      { method: 'GET', path: '/api/wytid/verify/:proofId', auth: false, description: 'Verify identity' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'premium',
    price: 199,
    icon: 'shield-check',
    color: 'violet',
    version: '1.0.0',
    changelog: 'Initial release with blockchain-anchored identity validation and proof creation',
    route: '/wytid'
  },
  {
    id: 'wytpoints-economy',
    name: 'WytPoints Economy System',
    description: 'Gamification points and rewards system',
    category: 'user-org',
    type: 'gamification',
    contexts: ['platform', 'hub', 'app', 'game'],
    dependencies: ['wytpass-auth'],
    apiEndpoints: [
      { method: 'POST', path: '/api/wytpoints/award', auth: true, description: 'Award points' },
      { method: 'GET', path: '/api/wytpoints/balance', auth: true, description: 'Get balance' },
      { method: 'POST', path: '/api/wytpoints/redeem', auth: true, description: 'Redeem points' }
    ],
    settings: {},
    compatibilityMatrix: {},
    pricing: 'free',
    icon: 'star',
    color: 'yellow',
    version: '1.0.0',
    changelog: 'Initial release with gamification points, rewards, and redemption system',
    route: '/wytpoints'
  },

  // ===== 9. LOCATION SERVICES =====
  {
    id: 'wytmap-mappls',
    name: 'WytMap - Location Services',
    description: 'Maps, geocoding, navigation & POI powered by Mappls (MapMyIndia)',
    category: 'location',
    type: 'location',
    contexts: ['platform', 'hub', 'app'],
    dependencies: [],
    apiEndpoints: [
      { method: 'GET', path: '/api/modules/wytmap/geocode', auth: true, description: 'Geocode address to coordinates' },
      { method: 'GET', path: '/api/modules/wytmap/reverse-geocode', auth: true, description: 'Reverse geocode coordinates' },
      { method: 'GET', path: '/api/modules/wytmap/directions', auth: true, description: 'Get directions between points' },
      { method: 'GET', path: '/api/modules/wytmap/nearby', auth: true, description: 'Find nearby points of interest' },
      { method: 'GET', path: '/api/modules/wytmap/distance', auth: true, description: 'Calculate distance and ETA' }
    ],
    settings: {
      apiKeyRequired: true,
      configFields: [
        { key: 'MAPPLS_API_KEY', type: 'string', required: true },
        { key: 'MAPPLS_CLIENT_ID', type: 'string', required: false }
      ]
    },
    compatibilityMatrix: {
      conflicts: ['google-maps', 'here-maps']
    },
    pricing: 'usage-based',
    price: 2.0,
    icon: 'map',
    color: 'green',
    upstream: {
      provider: 'Mappls',
      baseUrl: 'https://apis.mappls.com/advancedmaps/v1',
      credentialKey: 'MAPPLS_API_KEY',
      type: 'proxy'
    },
    version: '1.0.0',
    changelog: 'Initial release with Mappls (MapMyIndia) integration for maps, geocoding, navigation, and POI',
    route: '/map'
  },
];

export const MODULE_CATEGORIES = {
  'auth': { name: 'Authentication & Identity', icon: 'shield', color: 'blue' },
  'payment': { name: 'Payment Gateways', icon: 'credit-card', color: 'purple' },
  'content': { name: 'Content & Media', icon: 'image', color: 'orange' },
  'communication': { name: 'Communication', icon: 'mail', color: 'green' },
  'data': { name: 'Data Management', icon: 'database', color: 'indigo' },
  'user-org': { name: 'User & Organization', icon: 'users', color: 'blue' },
  'productivity': { name: 'Productivity', icon: 'check-square', color: 'teal' },
  'platform-core': { name: 'Platform Core', icon: 'layers', color: 'gray' },
  'location': { name: 'Location Services', icon: 'map-pin', color: 'green' }
};

// Helper functions
export function getModuleById(moduleId: string): ModuleDefinition | undefined {
  return MODULE_CATALOG.find(m => m.id === moduleId);
}

export function getModulesByCategory(category: string): ModuleDefinition[] {
  return MODULE_CATALOG.filter(m => m.category === category);
}

export function getModulesByContext(context: 'platform' | 'hub' | 'app' | 'game'): ModuleDefinition[] {
  return MODULE_CATALOG.filter(m => m.contexts.includes(context));
}

export function validateModuleDependencies(moduleId: string, enabledModules: string[]): { valid: boolean; missing: string[] } {
  const module = getModuleById(moduleId);
  if (!module) return { valid: false, missing: [] };
  
  const missing = module.dependencies.filter(dep => !enabledModules.includes(dep));
  return {
    valid: missing.length === 0,
    missing
  };
}

export function checkModuleConflicts(moduleId: string, enabledModules: string[]): { hasConflict: boolean; conflicts: string[] } {
  const module = getModuleById(moduleId);
  if (!module || !module.compatibilityMatrix.conflicts) {
    return { hasConflict: false, conflicts: [] };
  }
  
  const conflicts = module.compatibilityMatrix.conflicts.filter(c => enabledModules.includes(c));
  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
}
