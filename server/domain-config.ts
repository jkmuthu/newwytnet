// Domain configuration for wytnet.com
export const DOMAIN_CONFIG = {
  production: {
    domain: 'wytnet.com',
    allowedOrigins: [
      'https://wytnet.com',
      'https://www.wytnet.com'
    ],
    cookieDomain: undefined,
    secure: true
  },
  development: {
    domain: 'localhost',
    allowedOrigins: [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:3000'
    ],
    cookieDomain: undefined,
    secure: false
  }
};

export function getDomainConfig() {
  return process.env.NODE_ENV === 'production' 
    ? DOMAIN_CONFIG.production 
    : DOMAIN_CONFIG.development;
}