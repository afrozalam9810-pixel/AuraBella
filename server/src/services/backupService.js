const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const logger = require("../config/logger");

const BACKUP_DIR = path.join(__dirname, "../../backups");

/**
 * Perform a database backup by serialising all Mongoose models
 * to a compressed JSON archive.
 */
const runDatabaseBackup = async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    const backupData = {
      timestamp: new Date(),
      database: mongoose.connection.name,
      collections: {},
    };

    const models = mongoose.modelNames();
    logger.info(`[Backup] Starting database backup for ${models.length} collections...`);

    for (const modelName of models) {
      const Model = mongoose.model(modelName);
      const documents = await Model.find({}).lean();
      backupData.collections[Model.collection.name] = documents;
    }

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");
    logger.info(`[Backup] Database backup completed successfully: ${path.basename(backupFilePath)}`);

    // Clean up backups older than 7 days
    pruneOldBackups();

    return backupFilePath;
  } catch (err) {
    logger.error(`[Backup] Database backup failed: ${err.message}`);
    throw err;
  }
};

/**
 * Prune backup files older than 7 days.
 */
const pruneOldBackups = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days

    files.forEach((file) => {
      if (!file.startsWith("backup-") || !file.endsWith(".json")) return;
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        logger.info(`[Backup] Pruned old backup file: ${file}`);
      }
    });
  } catch (err) {
    logger.error(`[Backup] Failed to prune old backups: ${err.message}`);
  }
};

/**
 * Schedule automated daily backups.
 */
const scheduleBackups = () => {
  logger.info("[Backup] Initialising automated daily database backups...");

  // Only run the startup verification backup in production.
  // In development, nodemon restarts frequently which would create a backup on every file save.
  if (process.env.NODE_ENV === "production") {
    setTimeout(() => {
      runDatabaseBackup().catch(() => {});
    }, 10_000); // 10 seconds after start
  }

  // Schedule a daily backup at the 24-hour interval
  setInterval(() => {
    runDatabaseBackup().catch(() => {});
  }, 24 * 60 * 60 * 1000);
};

module.exports = {
  runDatabaseBackup,
  scheduleBackups,
};
