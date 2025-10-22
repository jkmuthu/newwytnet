export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

/**
 * Save the current URL to restore after login
 */
export function saveReturnUrl(url?: string): void {
  const returnUrl = url || window.location.pathname + window.location.search;
  // Only save if it's not already a login page
  if (!returnUrl.includes('/login') && !returnUrl.includes('/devdoc-login')) {
    sessionStorage.setItem('wytnet_return_url', returnUrl);
  }
}

/**
 * Get and clear the saved return URL
 */
export function getAndClearReturnUrl(): string | null {
  const returnUrl = sessionStorage.getItem('wytnet_return_url');
  if (returnUrl) {
    sessionStorage.removeItem('wytnet_return_url');
    // Validate the URL to prevent open redirect attacks
    if (isValidReturnUrl(returnUrl)) {
      return returnUrl;
    }
  }
  return null;
}

/**
 * Validate return URL to prevent open redirect attacks
 */
export function isValidReturnUrl(url: string): boolean {
  // Must be a relative path or same origin
  if (url.startsWith('/')) {
    // Disallow authentication pages
    const disallowedPaths = ['/login', '/devdoc-login', '/admin/login', '/engine/login'];
    return !disallowedPaths.some(path => url.startsWith(path));
  }
  return false;
}