/**
 * Airtable Backup & Export Routine
 * 
 * This function creates nightly backups of key Airtable tables
 * and exports them to Google Cloud Storage with encryption and retention.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { Storage } from '@google-cloud/storage';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

// Initialize Google Cloud Storage
const storage = new Storage();

// Configuration
const BUCKET_NAME = process.env.BACKUP_BUCKET_NAME || 'tuto-backups';
const RETENTION_DAYS = 30;
const BACKUP_PREFIX = 'airtable-backups';

// Tables to backup (excluding sensitive/transient data)
const TABLES_TO_BACKUP = [
  'Teachers',
  'Users', 
  'Bookings',
  'Reviews',
  'Posts',
  'Comments',
  'Reports'
];

// PII fields to redact in backups
const PII_FIELDS = [
  'email',
  'phone',
  'address',
  'personalNotes',
  'emergencyContact'
];

interface BackupRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface BackupData {
  table: string;
  timestamp: string;
  recordCount: number;
  records: BackupRecord[];
}

/**
 * Redact PII from record fields
 */
function redactPII(record: BackupRecord): BackupRecord {
  const redactedFields = { ...record.fields };
  
  PII_FIELDS.forEach(field => {
    if (redactedFields[field]) {
      redactedFields[field] = '[REDACTED]';
    }
  });
  
  return {
    ...record,
    fields: redactedFields
  };
}

/**
 * Fetch all records from an Airtable table
 */
async function fetchTableData(tableName: string): Promise<BackupRecord[]> {
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  
  if (!airtableApiKey || !airtableBaseId) {
    throw new Error('Missing Airtable credentials');
  }
  
  const records: BackupRecord[] = [];
  let offset: string | undefined;
  
  do {
    const url = new URL(`https://api.airtable.com/v0/${airtableBaseId}/${tableName}`);
    if (offset) {
      url.searchParams.set('offset', offset);
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
    }
    
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset;
    
  } while (offset);
  
  return records;
}

/**
 * Create encrypted backup file
 */
async function createBackupFile(data: BackupData): Promise<Buffer> {
  // Convert to JSON
  const jsonData = JSON.stringify(data, null, 2);
  
  // Compress with gzip
  const compressed = await gzip(Buffer.from(jsonData));
  
  // Encrypt with AES-256-GCM
  const key = crypto.scryptSync(process.env.BACKUP_ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', key);
  cipher.setAAD(Buffer.from('tuto-backup'));
  
  const encrypted = Buffer.concat([
    cipher.update(compressed),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag, and encrypted data
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Upload backup to Google Cloud Storage
 */
async function uploadBackup(tableName: string, backupData: Buffer): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${BACKUP_PREFIX}/${timestamp}/${tableName}-${Date.now()}.backup`;
  
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(fileName);
  
  await file.save(backupData, {
    metadata: {
      contentType: 'application/octet-stream',
      metadata: {
        table: tableName,
        timestamp: new Date().toISOString(),
        encrypted: 'true',
        compressed: 'true'
      }
    }
  });
  
  logger.info(`Uploaded backup: ${fileName}`);
  return fileName;
}

/**
 * Clean up old backups (retention policy)
 */
async function cleanupOldBackups(): Promise<void> {
  const bucket = storage.bucket(BUCKET_NAME);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
  
  const [files] = await bucket.getFiles({
    prefix: BACKUP_PREFIX,
    maxResults: 1000
  });
  
  const filesToDelete = files.filter(file => {
    const fileDate = new Date(file.metadata.timeCreated);
    return fileDate < cutoffDate;
  });
  
  if (filesToDelete.length > 0) {
    await Promise.all(filesToDelete.map(file => file.delete()));
    logger.info(`Deleted ${filesToDelete.length} old backup files`);
  }
}

/**
 * Create CSV export for easier analysis
 */
async function createCSVExport(tableName: string, records: BackupRecord[]): Promise<string> {
  if (records.length === 0) {
    return '';
  }
  
  // Get all unique field names
  const allFields = new Set<string>();
  records.forEach(record => {
    Object.keys(record.fields).forEach(field => allFields.add(field));
  });
  
  const fields = Array.from(allFields);
  
  // Create CSV header
  const header = ['id', 'createdTime', ...fields].join(',');
  
  // Create CSV rows
  const rows = records.map(record => {
    const values = [
      record.id,
      record.createdTime,
      ...fields.map(field => {
        const value = record.fields[field];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          return JSON.stringify(value).replace(/"/g, '""');
        }
        return String(value).replace(/"/g, '""');
      })
    ];
    return values.map(v => `"${v}"`).join(',');
  });
  
  return [header, ...rows].join('\n');
}

/**
 * Main backup function - runs nightly
 */
export const nightlyBackup = onSchedule({
  schedule: '0 2 * * *', // 2 AM daily
  timeZone: 'UTC',
  memory: '1GiB',
  timeoutSeconds: 540 // 9 minutes
}, async (event) => {
  logger.info('Starting nightly backup process');
  
  try {
    const results = [];
    
    for (const tableName of TABLES_TO_BACKUP) {
      logger.info(`Backing up table: ${tableName}`);
      
      try {
        // Fetch table data
        const records = await fetchTableData(tableName);
        logger.info(`Fetched ${records.length} records from ${tableName}`);
        
        // Redact PII
        const redactedRecords = records.map(redactPII);
        
        // Create backup data
        const backupData: BackupData = {
          table: tableName,
          timestamp: new Date().toISOString(),
          recordCount: redactedRecords.length,
          records: redactedRecords
        };
        
        // Create encrypted backup file
        const encryptedBackup = await createBackupFile(backupData);
        
        // Upload to GCS
        const backupPath = await uploadBackup(tableName, encryptedBackup);
        
        // Create CSV export
        const csvData = await createCSVExport(tableName, redactedRecords);
        if (csvData) {
          const csvFileName = `${BACKUP_PREFIX}/${new Date().toISOString().split('T')[0]}/${tableName}-${Date.now()}.csv`;
          const bucket = storage.bucket(BUCKET_NAME);
          const csvFile = bucket.file(csvFileName);
          await csvFile.save(csvData, {
            metadata: {
              contentType: 'text/csv',
              metadata: {
                table: tableName,
                timestamp: new Date().toISOString(),
                format: 'csv'
              }
            }
          });
          logger.info(`Uploaded CSV export: ${csvFileName}`);
        }
        
        results.push({
          table: tableName,
          recordCount: redactedRecords.length,
          backupPath,
          success: true
        });
        
      } catch (error) {
        logger.error(`Failed to backup table ${tableName}:`, error);
        results.push({
          table: tableName,
          recordCount: 0,
          backupPath: null,
          success: false,
          error: error.message
        });
      }
    }
    
    // Clean up old backups
    await cleanupOldBackups();
    
    // Log summary
    const successful = results.filter(r => r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + r.recordCount, 0);
    
    logger.info(`Backup completed: ${successful}/${TABLES_TO_BACKUP.length} tables, ${totalRecords} total records`);
    
    return {
      success: true,
      results,
      summary: {
        tablesBackedUp: successful,
        totalTables: TABLES_TO_BACKUP.length,
        totalRecords,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('Backup process failed:', error);
    throw error;
  }
});

/**
 * Manual backup trigger (for testing)
 */
export const manualBackup = onSchedule({
  schedule: '0 0 1 1 *', // Never runs automatically (Jan 1st only)
  timeZone: 'UTC',
  memory: '1GiB',
  timeoutSeconds: 540
}, async (event) => {
  logger.info('Manual backup triggered');
  return await nightlyBackup.run(event);
});











