// Multi-Authentication Framework for WytNet
// ========================================

export interface AuthMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  primary: boolean;
  config?: Record<string, any>;
}

export interface AuthMethodConfig {
  whatsappOtp: {
    enabled: boolean;
    primary: boolean;
    countries: string[];
  };
  magicEmail: {
    enabled: boolean;
    primary: boolean;
    emailProvider: 'smtp' | 'sendgrid' | 'ses';
    config: Record<string, any>;
  };
  smsOtp: {
    enabled: boolean;
    primary: boolean;
    provider: 'twilio' | 'textlocal' | 'aws-sns';
    config: Record<string, any>;
  };
  googleOauth: {
    enabled: boolean;
    primary: boolean;
    clientId: string;
    clientSecret: string;
  };
  facebookOauth: {
    enabled: boolean;
    primary: boolean;
    appId: string;
    appSecret: string;
  };
}

export const DEFAULT_AUTH_METHODS: AuthMethod[] = [
  {
    id: 'whatsapp-otp',
    name: 'WhatsApp OTP',
    description: 'Self-share OTP through WhatsApp (No SMS costs)',
    icon: '💬',
    enabled: true,
    primary: true,
  },
  {
    id: 'magic-email',
    name: 'Magic Email Link',
    description: 'Secure login link sent to your email',
    icon: '✉️',
    enabled: false,
    primary: false,
  },
  {
    id: 'sms-otp',
    name: 'SMS OTP',
    description: 'OTP sent via text message',
    icon: '📱',
    enabled: false,
    primary: false,
  },
  {
    id: 'google-oauth',
    name: 'Google Login',
    description: 'Sign in with your Google account',
    icon: '🔍',
    enabled: false,
    primary: false,
  },
  {
    id: 'facebook-oauth',
    name: 'Facebook Login',
    description: 'Sign in with your Facebook account',
    icon: '📘',
    enabled: false,
    primary: false,
  },
];

export const AUTH_METHOD_CATEGORIES = {
  passwordless: ['whatsapp-otp', 'magic-email', 'sms-otp'],
  social: ['google-oauth', 'facebook-oauth'],
  enterprise: [], // Can add SAML, LDAP, etc. later
};

export interface AuthSession {
  id: string;
  userId: string;
  method: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenSize: {
    width: number;
    height: number;
  };
}

export const detectDeviceType = (userAgent: string, screenWidth?: number): DeviceInfo['type'] => {
  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const tablet = /iPad|Android(?=.*Mobile)/i.test(userAgent);
  
  if (screenWidth) {
    if (screenWidth < 768) return 'mobile';
    if (screenWidth < 1024) return 'tablet';
    return 'desktop';
  }
  
  if (tablet) return 'tablet';
  if (mobile) return 'mobile';
  return 'desktop';
};