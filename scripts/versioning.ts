/**
 * Convert semantic version to Android version code
 * Example: 1.2.3 -> 1002003
 * This allows up to version 999.999.999
 */
export function semverToVersionCode(version: string): number {
  const parts = version.replace(/[^0-9.]/g, '').split('.');
  const major = parseInt(parts[0] || '0');
  const minor = parseInt(parts[1] || '0');
  const patch = parseInt(parts[2] || '0');
  
  return major * 1000000 + minor * 1000 + patch;
}

/**
 * Generate build timestamp
 */
export function getBuildTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get version from package.json
 */
export function getPackageVersion(): string {
  try {
    const pkg = require('../package.json');
    return pkg.version || '1.0.0';
  } catch (error) {
    console.error('Error reading package.json:', error);
    return '1.0.0';
  }
}

// CLI usage
if (require.main === module) {
  const version = process.argv[2] || getPackageVersion();
  const versionCode = semverToVersionCode(version);
  
  console.log(`Version: ${version}`);
  console.log(`Version Code: ${versionCode}`);
  console.log(`Build Time: ${getBuildTimestamp()}`);
}