import { ObjectStorageService } from '../objectStorage';
import { File } from "@google-cloud/storage";

interface APKMetadata {
  version: string;
  versionCode: number;
  size: number;
  sha256: string;
  buildTime: string;
  downloadUrl: string;
}

class APKStorageService {
  private objectStorageService: ObjectStorageService;

  constructor() {
    this.objectStorageService = new ObjectStorageService();
  }

  /**
   * Get the latest APK metadata from Object Storage
   */
  async getLatestMetadata(): Promise<APKMetadata | null> {
    try {
      const metadataFile = await this.objectStorageService.getMetadataFile();
      
      if (metadataFile) {
        // Download metadata content
        const [buffer] = await metadataFile.download();
        const metadata = JSON.parse(buffer.toString('utf-8'));
        return metadata;
      }

      // Fallback to mock data for development
      const mockMetadata: APKMetadata = {
        version: '1.0.0',
        versionCode: 1,
        size: 5242880, // ~5MB typical TWA size
        sha256: 'pending-ci-build-no-metadata-found',
        buildTime: new Date().toISOString(),
        downloadUrl: '/downloads/wytnet-latest.apk'
      };

      return mockMetadata;
    } catch (error) {
      console.error('Error fetching APK metadata:', error);
      return null;
    }
  }

  /**
   * Get APK file from Object Storage
   */
  async getAPKFile(): Promise<File | null> {
    try {
      return await this.objectStorageService.getApkFile();
    } catch (error) {
      console.error('Error getting APK file:', error);
      return null;
    }
  }

  /**
   * Check if APK exists in storage
   */
  async apkExists(): Promise<boolean> {
    try {
      const apkFile = await this.objectStorageService.getApkFile();
      return apkFile !== null;
    } catch (error) {
      console.error('Error checking APK existence:', error);
      return false;
    }
  }

  /**
   * Get storage configuration for debugging
   */
  getConfig() {
    return {
      bucketId: this.bucketId,
      publicPath: this.publicPath,
      privatePath: this.privatePath,
      hasConfig: !!(this.bucketId && this.publicPath)
    };
  }
}

export const apkStorage = new APKStorageService();
export type { APKMetadata };