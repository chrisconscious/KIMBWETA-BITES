/**
 * KIMBWETA BITES — Database Backup Script
 *
 * Usage:
 *   node scripts/backup.js              (daily)
 *   node scripts/backup.js weekly        (weekly)
 *   node scripts/backup.js monthly       (monthly)
 *
 * Requires:
 *   - pg_dump installed and in PATH
 *   - DATABASE_URL configured in .env
 *   - 7-Zip or gzip for compression
 *
 * Retention:
 *   Daily:   7 files
 *   Weekly:  4 files (4 weeks)
 *   Monthly: 6 files (6 months)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { execSync } = require('child_process');
const { existsSync, mkdirSync, readdirSync, unlinkSync, createWriteStream } = require('fs');
const { join } = require('path');
const { createGzip } = require('zlib');
const { createHash } = require('crypto');

const BACKUP_DIR = join(__dirname, '..', 'backup');
const RETENTION = { daily: 7, weekly: 4, monthly: 6 };

function getInterval() {
  const arg = (process.argv[2] || 'daily').toLowerCase();
  if (['daily', 'weekly', 'monthly'].includes(arg)) return arg;
  console.error(`Invalid interval "${arg}". Use daily, weekly, or monthly.`);
  process.exit(1);
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set. Check your .env file.');
    process.exit(1);
  }
  return url;
}

function parseDbUrl(url) {
  const pattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = url.match(pattern);
  if (!match) {
    // Try without password
    const simple = /^postgresql:\/\/([^:]+)@([^:]+):(\d+)\/(.+)$/;
    const m2 = url.match(simple);
    if (!m2) {
      console.error('Cannot parse DATABASE_URL:', url);
      process.exit(1);
    }
    return { user: m2[1], password: '', host: m2[2], port: m2[3], db: m2[4] };
  }
  return { user: match[1], password: match[2], host: match[3], port: match[4], db: match[5] };
}

async function runBackup() {
  const interval = getInterval();
  const dbUrl = getDatabaseUrl();
  const db = parseDbUrl(dbUrl);
  const targetDir = join(BACKUP_DIR, interval);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const filename = `kimbweta_${interval}_${timestamp}.sql.gz`;
  const filepath = join(targetDir, filename);

  if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

  console.log(`[backup] Starting ${interval} backup of database "${db.db}"...`);
  console.log(`[backup] Target: ${filepath}`);

  try {
    // Set PGPASSWORD to avoid password prompt
    const env = {
      ...process.env,
      PGPASSWORD: db.password,
      PGSSLMODE: process.env.PGSSLMODE || 'prefer',
    };

    // Dump via pg_dump and compress with gzip
    const cmd = `"${findPgDump()}" -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.db} --no-owner --no-acl --clean --if-exists`;
    
    console.log(`[backup] Running: pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.db} [options]`);

    const dumpBuffer = execSync(cmd, { env, maxBuffer: 500 * 1024 * 1024, timeout: 300000 }); // 5 min, 500MB
    
    // Compress with gzip
    const { gzipSync } = require('zlib');
    const compressed = gzipSync(dumpBuffer, { level: 6 });
    
    const fs = require('fs');
    fs.writeFileSync(filepath, compressed);
    
    // Generate checksum
    const hash = createHash('sha256').update(compressed).digest('hex');
    fs.writeFileSync(filepath + '.sha256', hash);
    
    const sizeMb = (compressed.length / (1024 * 1024)).toFixed(2);
    console.log(`[backup] ✅ Backup complete: ${filename} (${sizeMb} MB, SHA256: ${hash.slice(0, 16)}...)`);

    // Rotate old backups
    rotateOldBackups(targetDir, RETENTION[interval]);

    console.log(`[backup] ${interval.charAt(0).toUpperCase() + interval.slice(1)} backup completed successfully.`);
  } catch (err) {
    console.error(`[backup] ❌ Backup failed: ${err.message}`);
    if (err.stderr) console.error(err.stderr.toString().slice(0, 500));
    process.exit(1);
  }
}

function findPgDump() {
  // Common pg_dump locations
  const candidates = [
    'pg_dump',
    '"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe"',
    '"C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe"',
    '"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe"',
    '/usr/bin/pg_dump',
    '/usr/local/bin/pg_dump',
  ];
  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 5000 });
      return cmd;
    } catch { /* try next */ }
  }
  return 'pg_dump'; // fallback to PATH
}

function rotateOldBackups(dir, keepCount) {
  const fs = require('fs');
  let files;
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.sql.gz')); }
  catch { return; }

  // Sort by name (which includes timestamp) — oldest first
  files.sort();

  if (files.length <= keepCount) return;

  const toDelete = files.slice(0, files.length - keepCount);
  for (const file of toDelete) {
    try {
      fs.unlinkSync(join(dir, file));
      fs.unlinkSync(join(dir, file + '.sha256'));
      console.log(`[backup] Removed old backup: ${file}`);
    } catch { /* ignore */ }
  }
}

runBackup().catch((err) => {
  console.error('Backup script error:', err.message);
  process.exit(1);
});
