
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const execAsync = promisify(exec);

async function checkProjectSize() {
  console.log('🔍 Analyzing WytNet Project Size...\n');

  try {
    // 1. Check database size
    console.log('📊 Database Size:');
    const dbSize = await db.execute(sql`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as total_size,
        pg_database_size(current_database()) as size_bytes
    `);
    
    console.log(`   Total Database: ${dbSize.rows[0].total_size}`);
    
    // Get individual table sizes
    const tableSizes = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `);
    
    console.log('\n   Top 10 Tables by Size:');
    tableSizes.rows.forEach((row: any) => {
      console.log(`   - ${row.tablename}: ${row.size}`);
    });

    // 2. Check project directory size
    console.log('\n📁 Project Directory Sizes:');
    
    const directories = [
      'client',
      'server', 
      'docs',
      'node_modules',
      'attached_assets',
      '.backup-temp',
      'migrations'
    ];

    for (const dir of directories) {
      try {
        const { stdout } = await execAsync(`du -sh ${dir} 2>/dev/null || echo "N/A"`);
        console.log(`   ${dir}: ${stdout.trim()}`);
      } catch (error) {
        console.log(`   ${dir}: N/A (not found)`);
      }
    }

    // 3. Total project size
    console.log('\n📦 Total Project Size:');
    try {
      const { stdout: totalSize } = await execAsync('du -sh . 2>/dev/null');
      console.log(`   ${totalSize.trim()}`);
    } catch (error) {
      console.log('   Unable to calculate total size');
    }

    // 4. Check specific large file directories
    console.log('\n📎 Attached Assets:');
    try {
      const { stdout: assetCount } = await execAsync('find attached_assets -type f 2>/dev/null | wc -l');
      const { stdout: assetSize } = await execAsync('du -sh attached_assets 2>/dev/null');
      console.log(`   Files: ${assetCount.trim()}`);
      console.log(`   Size: ${assetSize.trim()}`);
    } catch (error) {
      console.log('   N/A');
    }

    // 5. Backup files
    console.log('\n💾 Backup Files:');
    try {
      const { stdout: backupSize } = await execAsync('du -sh .backup-temp 2>/dev/null || echo "0B"');
      console.log(`   Size: ${backupSize.trim()}`);
    } catch (error) {
      console.log('   N/A');
    }

    // 6. Database backup file
    console.log('\n🗄️  Database Backup File:');
    try {
      const { stdout: sqlBackupSize } = await execAsync('ls -lh wytnet-database-backup.sql 2>/dev/null | awk \'{print $5}\'');
      console.log(`   wytnet-database-backup.sql: ${sqlBackupSize.trim()}`);
    } catch (error) {
      console.log('   Not found');
    }

    // 7. Breakdown summary
    console.log('\n📊 Summary Breakdown:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const breakdown: any = {};
    
    // Calculate percentages
    try {
      const { stdout: totalBytes } = await execAsync('du -sb . 2>/dev/null | cut -f1');
      const total = parseInt(totalBytes.trim());
      
      for (const dir of directories) {
        try {
          const { stdout: dirBytes } = await execAsync(`du -sb ${dir} 2>/dev/null | cut -f1`);
          const size = parseInt(dirBytes.trim());
          const percentage = ((size / total) * 100).toFixed(2);
          breakdown[dir] = { size, percentage };
        } catch (error) {
          // Skip if directory doesn't exist
        }
      }
      
      // Add database to breakdown
      const dbSizeBytes = parseInt(dbSize.rows[0].size_bytes);
      const dbPercentage = ((dbSizeBytes / total) * 100).toFixed(2);
      breakdown['database'] = { size: dbSizeBytes, percentage: dbPercentage };
      
      Object.entries(breakdown)
        .sort((a: any, b: any) => b[1].size - a[1].size)
        .forEach(([name, data]: any) => {
          const sizeMB = (data.size / (1024 * 1024)).toFixed(2);
          console.log(`   ${name.padEnd(20)}: ${sizeMB} MB (${data.percentage}%)`);
        });
        
    } catch (error) {
      console.log('   Unable to calculate breakdown');
    }

    console.log('\n✅ Size analysis complete!\n');

  } catch (error) {
    console.error('❌ Error analyzing project size:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

checkProjectSize();
