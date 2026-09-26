(function (window) {
  const storage = window.FocusStudyStorage;
  const PRODUCT_NAME = "FocusStudy";
  const BACKUP_VERSION = 2;
  const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

  function nowIso() {
    return new Date().toISOString();
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function createBackup(data) {
    return {
      product: PRODUCT_NAME,
      backupVersion: BACKUP_VERSION,
      exportedAt: nowIso(),
      data: storage.cloneData(data)
    };
  }

  function backupFileName(date) {
    return `focusstudy-backup-${localDateKey(date || new Date())}.json`;
  }

  function exportBackup(data) {
    const backup = createBackup(data);
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = backupFileName(new Date());
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);

    return backup;
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function dateLabel(value) {
    const date = value && !Number.isNaN(Date.parse(value)) ? new Date(value) : null;
    return date ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date unavailable";
  }

  function validateKnownSections(data) {
    const arrayKeys = ["courses", "assignments", "priorities", "focusSessions", "exams", "recentWins", "notes", "habits"];
    const optionalArrayKeys = ["brainDump", "brainDumpItems"];
    const invalidArrayKey = arrayKeys.find((key) => Object.prototype.hasOwnProperty.call(data, key) && !Array.isArray(data[key]));
    const invalidBrainDump = optionalArrayKeys.some((key) => Object.prototype.hasOwnProperty.call(data, key) && !Array.isArray(data[key]));

    if (invalidArrayKey || invalidBrainDump) {
      return {
        valid: false,
        error: "This backup has damaged planner sections and cannot be restored safely."
      };
    }

    if (Object.prototype.hasOwnProperty.call(data, "settings") && !isPlainObject(data.settings)) {
      return {
        valid: false,
        error: "This backup has damaged settings and cannot be restored safely."
      };
    }

    if (Object.prototype.hasOwnProperty.call(data, "gamification") && !isPlainObject(data.gamification)) {
      return {
        valid: false,
        error: "This backup has damaged Momentum data and cannot be restored safely."
      };
    }

    const knownKeys = ["version", "appVersion", "createdAt", "updatedAt", "user", "settings", "courses", "assignments", "brainDump", "brainDumpItems", "priorities", "dailyPlan", "activeFocusSession", "focusSessions", "exams", "recentWins", "notes", "habits", "gamification"];
    const hasKnownData = knownKeys.some((key) => Object.prototype.hasOwnProperty.call(data, key));
    if (!hasKnownData) {
      return {
        valid: false,
        error: "This backup does not contain recognizable FocusStudy data."
      };
    }

    return {
      valid: true,
      error: ""
    };
  }

  function validateBackupObject(value) {
    if (!isPlainObject(value)) {
      return {
        valid: false,
        error: "This backup file could not be read.",
        data: null,
        metadata: null
      };
    }

    if (value.product !== PRODUCT_NAME) {
      return {
        valid: false,
        error: "This is not a FocusStudy backup file.",
        data: null,
        metadata: null
      };
    }

    const version = Number(value.backupVersion);
    if (!Number.isInteger(version) || version < 1) {
      return {
        valid: false,
        error: "This backup file is missing a valid backup version.",
        data: null,
        metadata: null
      };
    }

    if (version > BACKUP_VERSION) {
      return {
        valid: false,
        error: "This backup was created by a newer version of FocusStudy and cannot be restored safely with this version.",
        data: null,
        metadata: null
      };
    }

    if (!isPlainObject(value.data)) {
      return {
        valid: false,
        error: "This backup does not contain restorable FocusStudy data.",
        data: null,
        metadata: null
      };
    }

    const sectionCheck = validateKnownSections(value.data);
    if (!sectionCheck.valid) {
      return {
        valid: false,
        error: sectionCheck.error,
        data: null,
        metadata: null
      };
    }

    const normalized = storage.validateAppData(value.data);
    if (!normalized.valid) {
      return {
        valid: false,
        error: "This backup data could not be restored safely.",
        data: null,
        metadata: null
      };
    }

    return {
      valid: true,
      error: "",
      data: normalized.data,
      repaired: normalized.repaired,
      metadata: {
        product: value.product,
        backupVersion: version,
        exportedAt: value.exportedAt || "",
        exportedLabel: dateLabel(value.exportedAt)
      }
    };
  }

  function parseBackupText(text) {
    try {
      return validateBackupObject(JSON.parse(text));
    } catch (error) {
      return {
        valid: false,
        error: "This backup file could not be read. Your current FocusStudy data has not been changed.",
        data: null,
        metadata: null
      };
    }
  }

  function readBackupFile(file) {
    if (!file) {
      return Promise.resolve({
        valid: false,
        error: "Choose a backup file before restoring.",
        data: null,
        metadata: null
      });
    }

    if (file.size > MAX_BACKUP_BYTES) {
      return Promise.resolve({
        valid: false,
        error: "This backup file is too large to restore safely.",
        data: null,
        metadata: null
      });
    }

    return file.text().then(parseBackupText).catch(() => ({
      valid: false,
      error: "This backup file could not be read. Your current FocusStudy data has not been changed.",
      data: null,
      metadata: null
    }));
  }

  window.FocusStudyBackup = {
    PRODUCT_NAME,
    BACKUP_VERSION,
    MAX_BACKUP_BYTES,
    createBackup,
    exportBackup,
    backupFileName,
    validateBackupObject,
    parseBackupText,
    readBackupFile
  };
})(window);
