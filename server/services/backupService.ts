import { db } from "../db";
import { backups } from "@shared/schema";
import { sql } from "drizzle-orm";
import { objectStorageClient } from "../objectStorage";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const execAsync = promisify(exec);

const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR || "";

// Parse object path to get bucket and object name
// Same logic as in objectStorage.ts
function parseObjectPath(objectPath: string): { bucketName: string; objectName: string } {
  let path = objectPath;
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

interface BackupMetadata {
  databaseName: string;
  databaseSize?: string;
  filesCount: number;
  tablesCount?: number;
  credentialsIncluded: boolean;
  backupDate: string;
}

// Generate display ID for backup (BK prefix)
async function generateBackupDisplayId(): Promise<string> {
  const result = await db.execute<{ nextval: number }>(
    sql`SELECT nextval('backup_display_id_seq') as nextval`
  );
  const id = result.rows[0]?.nextval || 1;
  return `BK${id.toString().padStart(7, '0')}`;
}

// Create sequence if it doesn't exist
export async function ensureBackupSequence() {
  try {
    await db.execute(sql`
      CREATE SEQUENCE IF NOT EXISTS backup_display_id_seq START WITH 1;
    `);
  } catch (error) {
    console.error('Error creating backup sequence:', error);
  }
}

// Generate credentials file content
function generateCredentialsFile(): string {
  const credentials = `
===========================================
WYTNET PLATFORM BACKUP - CREDENTIALS FILE
===========================================
Generated: ${new Date().toISOString()}

==================
DATABASE CREDENTIALS
==================
Database URL: ${process.env.DATABASE_URL || 'Not configured'}
Database Host: ${process.env.PGHOST || 'Not configured'}
Database Port: ${process.env.PGPORT || 'Not configured'}
Database Name: ${process.env.PGDATABASE || 'Not configured'}
Database User: ${process.env.PGUSER || 'Not configured'}
Database Password: ${process.env.PGPASSWORD || 'Not configured'}

==================
AUTHENTICATION SERVICES
==================
Google Client ID: ${process.env.GOOGLE_CLIENT_ID || 'Not configured'}
Google Client Secret: ${process.env.GOOGLE_CLIENT_SECRET || 'Not configured'}
LinkedIn Client ID: ${process.env.LINKEDIN_CLIENT_ID || 'Not configured'}
LinkedIn Client Secret: ${process.env.LINKEDIN_CLIENT_SECRET || 'Not configured'}
Facebook App ID: ${process.env.FACEBOOK_APP_ID || 'Not configured'}
Facebook App Secret: ${process.env.FACEBOOK_APP_SECRET || 'Not configured'}

==================
SMS & EMAIL SERVICES
==================
MSG91 Auth Key: ${process.env.MSG91_AUTH_KEY || 'Not configured'}
MSG91 Email Template ID: ${process.env.MSG91_EMAIL_TEMPLATE_ID || 'Not configured'}

==================
PAYMENT SERVICES
==================
Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID || 'Not configured'}
Razorpay Key Secret: ${process.env.RAZORPAY_KEY_SECRET || 'Not configured'}

==================
OTHER API KEYS
==================
MappLS API Key: ${process.env.MAPPLS_API_KEY || 'Not configured'}
Digio API Key: ${process.env.DIGIO_API_KEY || 'Not configured'}
Session Secret: ${process.env.SESSION_SECRET || 'Not configured'}

==================
OBJECT STORAGE
==================
Private Object Dir: ${process.env.PRIVATE_OBJECT_DIR || 'Not configured'}
Public Object Search Paths: ${process.env.PUBLIC_OBJECT_SEARCH_PATHS || 'Not configured'}

==================
ENVIRONMENT
==================
Node Environment: ${process.env.NODE_ENV || 'development'}
Replit Environment: ${process.env.REPLIT_DEPLOYMENT ? 'Production' : 'Development'}

===========================================
END OF CREDENTIALS FILE
===========================================

SECURITY NOTICE:
This file contains sensitive credentials. Store it securely and never commit to version control.
`;

  return credentials;
}

// Export database to SQL file
async function exportDatabase(outputPath: string): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not configured');
  }

  // Use pg_dump to export the database
  const command = `pg_dump "${dbUrl}" > "${outputPath}"`;
  
  try {
    await execAsync(command);
  } catch (error: any) {
    console.error('Database export error:', error);
    throw new Error(`Failed to export database: ${error.message}`);
  }
}

// Create archive of application files
async function archiveApplicationFiles(outputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    let filesCount = 0;

    output.on('close', () => {
      resolve(filesCount);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.on('entry', () => {
      filesCount++;
    });

    archive.pipe(output);

    // Add important directories
    const dirsToBackup = [
      'server',
      'client/src',
      'shared',
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'drizzle.config.ts',
    ];

    dirsToBackup.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          archive.directory(fullPath, dir);
        } else {
          archive.file(fullPath, { name: dir });
        }
      }
    });

    archive.finalize();
  });
}

// Upload file to object storage
async function uploadToObjectStorage(localPath: string, fullRemotePath: string): Promise<void> {
  try {
    const { bucketName, objectName } = parseObjectPath(fullRemotePath);
    const bucket = objectStorageClient.bucket(bucketName);
    await bucket.upload(localPath, {
      destination: objectName,
      metadata: {
        cacheControl: 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Upload to object storage error:', error);
    throw new Error(`Failed to upload to object storage: ${error.message}`);
  }
}

// Main backup creation function
export async function createFullBackup(createdBy: string): Promise<string> {
  const timestamp = Date.now();
  const tempDir = path.join(process.cwd(), '.backup-temp', timestamp.toString());
  
  // Create temp directory
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Generate display ID
    const displayId = await generateBackupDisplayId();
    const backupFilename = `wytnet-backup-${displayId}-${timestamp}.zip`;

    // 1. Export database
    const dbExportPath = path.join(tempDir, 'database.sql');
    await exportDatabase(dbExportPath);
    console.log('✓ Database exported');

    // 2. Generate credentials file
    const credentialsPath = path.join(tempDir, 'CREDENTIALS.txt');
    const credentialsContent = generateCredentialsFile();
    fs.writeFileSync(credentialsPath, credentialsContent, 'utf-8');
    console.log('✓ Credentials file generated');

    // 3. Archive application files
    const appArchivePath = path.join(tempDir, 'application-files.zip');
    const filesCount = await archiveApplicationFiles(appArchivePath);
    console.log(`✓ Application files archived (${filesCount} files)`);

    // 4. Create final backup archive
    const finalBackupPath = path.join(tempDir, backupFilename);
    const finalArchive = archiver('zip', { zlib: { level: 9 } });
    const finalOutput = fs.createWriteStream(finalBackupPath);

    await new Promise<void>((resolve, reject) => {
      finalOutput.on('close', () => resolve());
      finalArchive.on('error', (err) => reject(err));
      finalArchive.pipe(finalOutput);

      // Add all files to final archive
      finalArchive.file(dbExportPath, { name: 'database.sql' });
      finalArchive.file(credentialsPath, { name: 'CREDENTIALS.txt' });
      finalArchive.file(appArchivePath, { name: 'application-files.zip' });

      finalArchive.finalize();
    });
    console.log('✓ Final backup archive created');

    // 5. Upload to object storage
    const remotePath = `${PRIVATE_OBJECT_DIR}/backups/${backupFilename}`;
    await uploadToObjectStorage(finalBackupPath, remotePath);
    console.log('✓ Backup uploaded to object storage');

    // 6. Get file size
    const stats = fs.statSync(finalBackupPath);
    const fileSize = stats.size;

    // 7. Create backup record in database
    const metadata: BackupMetadata = {
      databaseName: process.env.PGDATABASE || 'unknown',
      filesCount,
      credentialsIncluded: true,
      backupDate: new Date().toISOString(),
    };

    const [backupRecord] = await db.insert(backups).values({
      displayId,
      filename: backupFilename,
      filePath: remotePath,
      fileSize,
      backupType: 'full',
      status: 'completed',
      metadata,
      createdBy,
      completedAt: new Date(),
    }).returning();

    // 8. Cleanup temp files
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('✓ Temporary files cleaned up');

    return backupRecord.id;
  } catch (error: any) {
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    console.error('Backup creation error:', error);
    throw error;
  }
}

// Download backup file from object storage
export async function downloadBackup(fullFilePath: string, localPath: string): Promise<void> {
  try {
    const { bucketName, objectName } = parseObjectPath(fullFilePath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    await file.download({ destination: localPath });
  } catch (error: any) {
    console.error('Download from object storage error:', error);
    throw new Error(`Failed to download backup: ${error.message}`);
  }
}

// Delete backup file from object storage
export async function deleteBackupFile(fullFilePath: string): Promise<void> {
  try {
    const { bucketName, objectName } = parseObjectPath(fullFilePath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    await file.delete();
  } catch (error: any) {
    console.error('Delete from object storage error:', error);
    throw new Error(`Failed to delete backup: ${error.message}`);
  }
}

// Restore database from backup
export async function restoreBackup(backupId: string): Promise<void> {
  const timestamp = Date.now();
  const tempDir = path.join(process.cwd(), '.restore-temp', timestamp.toString());
  
  // Create temp directory
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // 1. Get backup record from database
    const backup = await db.query.backups.findFirst({
      where: (backups, { eq }) => eq(backups.id, backupId),
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    if (backup.status !== 'completed') {
      throw new Error('Cannot restore incomplete backup');
    }

    if (!backup.filePath) {
      throw new Error('Backup file path not found');
    }

    // 2. Download backup file from object storage
    const downloadPath = path.join(tempDir, backup.filename);
    await downloadBackup(backup.filePath, downloadPath);
    console.log('✓ Backup downloaded');

    // 3. Extract backup archive
    const extractDir = path.join(tempDir, 'extracted');
    fs.mkdirSync(extractDir, { recursive: true });
    
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(downloadPath);
    zip.extractAllTo(extractDir, true);
    console.log('✓ Backup extracted');

    // 4. Restore database from SQL file
    const sqlPath = path.join(extractDir, 'database.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error('Database SQL file not found in backup');
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Drop all tables and restore from backup
    const restoreCommand = `psql "${dbUrl}" < "${sqlPath}"`;
    await execAsync(restoreCommand);
    console.log('✓ Database restored');

    // 5. Cleanup temp files
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('✓ Temporary files cleaned up');

  } catch (error: any) {
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    console.error('Backup restore error:', error);
    throw new Error(`Failed to restore backup: ${error.message}`);
  }
}
