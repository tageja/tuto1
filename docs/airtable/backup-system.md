# Backup & Export System

This document describes the automated backup system for Tuto app data stored in Airtable.

## 🔄 Overview

The backup system provides:
- **Nightly automated backups** of all key tables
- **Encrypted storage** in Google Cloud Storage
- **30-day retention policy** with automatic cleanup
- **PII redaction** for privacy compliance
- **Multiple export formats** (JSON + CSV)

## 📋 Tables Backed Up

The following tables are included in nightly backups:
- `Teachers` - Teacher profiles and qualifications
- `Users` - Parent and user accounts
- `Bookings` - Tutoring session bookings
- `Reviews` - Teacher reviews and ratings
- `Posts` - Community feed posts
- `Comments` - Post comments
- `Reports` - Content moderation reports

## 🔒 Security & Privacy

### PII Redaction
The following fields are automatically redacted in backups:
- `email` - User email addresses
- `phone` - Phone numbers
- `address` - Physical addresses
- `personalNotes` - Personal notes
- `emergencyContact` - Emergency contact info

### Encryption
- **AES-256-GCM** encryption for all backup files
- **Gzip compression** before encryption
- **Unique IV** for each backup file
- **Authentication tags** to prevent tampering

## 📁 Storage Structure

Backups are stored in Google Cloud Storage with the following structure:
```
tuto-backups/
├── airtable-backups/
│   ├── 2024-01-15/
│   │   ├── Teachers-1705123200000.backup
│   │   ├── Teachers-1705123200000.csv
│   │   ├── Users-1705123200000.backup
│   │   └── Users-1705123200000.csv
│   └── 2024-01-16/
│       └── ...
```

## ⚙️ Configuration

### Environment Variables
```bash
# Required
AIRTABLE_API_KEY=your_airtable_pat
AIRTABLE_BASE_ID=your_base_id
BACKUP_BUCKET_NAME=tuto-backups
BACKUP_ENCRYPTION_KEY=your_32_char_key

# Optional
NODE_ENV=production
```

### Firebase Functions Configuration
```bash
# Set Airtable credentials
firebase functions:config:set airtable.pat="your_pat" airtable.base="your_base_id"

# Set backup configuration
firebase functions:config:set backup.bucket="tuto-backups" backup.key="your_key"
```

## 🕐 Schedule

- **Nightly backups**: 2:00 AM UTC daily
- **Retention**: 30 days (automatic cleanup)
- **Manual trigger**: Available for testing/emergency backups

## 📊 Backup Process

1. **Fetch Data**: Retrieve all records from each table
2. **Redact PII**: Remove sensitive information
3. **Compress**: Gzip compression for efficiency
4. **Encrypt**: AES-256-GCM encryption
5. **Upload**: Store in Google Cloud Storage
6. **Export CSV**: Create human-readable CSV files
7. **Cleanup**: Remove backups older than 30 days

## 🔧 Functions

### `nightlyBackup`
- **Schedule**: `0 2 * * *` (2 AM daily)
- **Memory**: 1GB
- **Timeout**: 9 minutes
- **Purpose**: Automated nightly backups

### `manualBackup`
- **Schedule**: Never (manual trigger only)
- **Memory**: 1GB
- **Timeout**: 9 minutes
- **Purpose**: Testing and emergency backups

## 📈 Monitoring

### Logs
All backup operations are logged with:
- Table names and record counts
- Success/failure status
- Error messages for failed operations
- Upload paths and file sizes

### Metrics
- Backup success rate
- Record counts per table
- Storage usage
- Cleanup operations

## 🚨 Error Handling

- **Individual table failures** don't stop the entire process
- **Retry logic** for transient failures
- **Detailed error logging** for debugging
- **Graceful degradation** when services are unavailable

## 🔄 Restore Process

### From Encrypted Backups
1. Download backup file from GCS
2. Decrypt using backup encryption key
3. Decompress gzip data
4. Parse JSON and restore to Airtable

### From CSV Exports
1. Download CSV file from GCS
2. Parse and validate data
3. Import to Airtable using API

## 🧪 Testing

### Manual Backup Trigger
```bash
# Deploy functions
firebase deploy --only functions

# Trigger manual backup (for testing)
firebase functions:shell
> nightlyBackup()
```

### Local Testing
```bash
# Set up environment
export AIRTABLE_API_KEY="your_key"
export AIRTABLE_BASE_ID="your_base"
export BACKUP_BUCKET_NAME="test-bucket"

# Run backup function locally
firebase functions:shell
> nightlyBackup()
```

## 📝 Maintenance

### Regular Tasks
- **Monitor backup success rates** (daily)
- **Check storage usage** (weekly)
- **Verify encryption keys** (monthly)
- **Test restore procedures** (quarterly)

### Key Rotation
- **Backup encryption keys** should be rotated annually
- **Airtable PATs** should be rotated quarterly
- **Update retention policies** as needed

## 🚀 Deployment

### Prerequisites
1. Google Cloud Storage bucket created
2. Firebase Functions deployed
3. Environment variables configured
4. Airtable API access verified

### Deployment Steps
```bash
# Deploy backup functions
firebase deploy --only functions:nightlyBackup,functions:manualBackup

# Verify deployment
firebase functions:log --only nightlyBackup

# Test manual backup
firebase functions:shell
> manualBackup()
```

## 📞 Support

For backup-related issues:
1. Check Firebase Functions logs
2. Verify environment configuration
3. Test Airtable API connectivity
4. Review Google Cloud Storage permissions






