(function (window) {
  const STORAGE_KEY = "focusstudy:v1:data";
  const CURRENT_VERSION = 3;
  const APP_VERSION = "1.2.0";

  const THEMES = ["system", "light", "dark"];
  const ASSIGNMENT_TYPES = ["assignment", "exam", "project", "quiz", "reading"];
  const PRIORITIES = ["low", "medium", "high"];
  const ASSIGNMENT_STATUSES = ["notStarted", "inProgress", "complete", "submitted"];
  const LINKED_TYPES = ["assignment", "course", "brainDumpItem", "none"];
  const FOCUS_STATUSES = ["idle", "running", "paused", "completed"];
  const FOCUS_MODES = ["focus", "break"];
  const ENERGY_LEVELS = ["low", "okay", "good"];
  const ENERGY_REQUIREMENTS = ["low", "medium", "high"];
  const REWARD_TYPES = ["assignment_completed", "subtask_completed", "focus_session_completed", "one_thing_completed", "top_three_completed", "daily_focus_goal"];
  const SCHEDULE_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const SCHEDULE_TYPES = ["class", "exam", "deadline"];

  function nowIso() {
    return new Date().toISOString();
  }

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}_${window.crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function withStorage(operation) {
    try {
      const storage = window.localStorage;
      if (!storage) {
        return { ok: false, error: "LocalStorage is unavailable." };
      }

      return { ok: true, value: operation(storage) };
    } catch (error) {
      return { ok: false, error: error.message || "LocalStorage operation failed." };
    }
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function stringValue(value, fallback) {
    return typeof value === "string" ? value.trim() : fallback;
  }

  function nullableString(value) {
    const text = stringValue(value, "");
    return text || null;
  }

  function looksLikeColor(value) {
    return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(stringValue(value, ""));
  }

  function courseCodeValue(value) {
    const text = stringValue(value, "");
    return looksLikeColor(text) ? "" : text;
  }

  function boolValue(value) {
    return value === true;
  }

  function numberValue(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function nonNegativeNumberValue(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
  }

  function oneOf(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
  }

  function dateOnly(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
  }

  function timeOnly(value) {
    return typeof value === "string" && /^\d{2}:\d{2}$/.test(value) ? value : "";
  }

  function timestampValue(value, fallback) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : fallback;
  }

  function getDefaultAppData() {
    const timestamp = nowIso();

    return {
      version: CURRENT_VERSION,
      appVersion: APP_VERSION,
      createdAt: timestamp,
      updatedAt: timestamp,
      user: {
        name: ""
      },
      courses: [],
      assignments: [],
      brainDump: [],
      priorities: [],
      dailyPlan: {
        date: "",
        topThree: [],
        energy: null,
        oneThingAssignmentId: null,
        updatedAt: timestamp
      },
      activeFocusSession: null,
      focusSessions: [],
      exams: [],
      recentWins: [],
      notes: [],
      habits: [],
      gamification: {
        enabled: true,
        showStreaks: true,
        weeklyGoalMode: "recommended",
        customWeeklyGoal: 90,
        weeklyGoals: [],
        rewardEvents: []
      },
      settings: {
        theme: "system",
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        dailyFocusGoalMinutes: 60,
        completionSound: false,
        preferredStartSection: "today",
        dateDisplay: "weekdayMonthDay"
      }
    };
  }

  function sanitizeSettings(settings) {
    const defaults = getDefaultAppData().settings;
    const source = isPlainObject(settings) ? settings : {};
    const focusDuration = source.focusDuration || source.defaultFocusMinutes;
    const breakDuration = source.breakDuration || source.defaultBreakMinutes;

    return {
      theme: oneOf(source.theme, THEMES, defaults.theme),
      focusDuration: numberValue(focusDuration, defaults.focusDuration),
      breakDuration: numberValue(breakDuration, defaults.breakDuration),
      longBreakDuration: numberValue(source.longBreakDuration, defaults.longBreakDuration),
      sessionsBeforeLongBreak: numberValue(source.sessionsBeforeLongBreak, defaults.sessionsBeforeLongBreak),
      dailyFocusGoalMinutes: numberValue(source.dailyFocusGoalMinutes, defaults.dailyFocusGoalMinutes),
      completionSound: boolValue(source.completionSound),
      preferredStartSection: stringValue(source.preferredStartSection, defaults.preferredStartSection),
      dateDisplay: stringValue(source.dateDisplay, defaults.dateDisplay)
    };
  }

  function sanitizeScheduleBlock(block) {
    if (!isPlainObject(block)) return null;
    const timestamp = nowIso();
    const dayAliases = {
      mon: "monday",
      tue: "tuesday",
      wed: "wednesday",
      thu: "thursday",
      fri: "friday",
      sat: "saturday",
      sun: "sunday"
    };
    const days = Array.isArray(block.days)
      ? block.days.map((day) => {
        const value = stringValue(day, "").toLowerCase();
        return dayAliases[value] || value;
      }).filter((day, index, values) => SCHEDULE_DAYS.includes(day) && values.indexOf(day) === index)
      : [];
    if (!days.length) return null;

    return {
      id: stringValue(block.id, createId("schedule")),
      type: oneOf(block.type, SCHEDULE_TYPES, "class"),
      title: stringValue(block.title, ""),
      days,
      startTime: timeOnly(block.startTime),
      endTime: timeOnly(block.endTime),
      location: stringValue(block.location, ""),
      createdAt: timestampValue(block.createdAt, timestamp),
      updatedAt: timestampValue(block.updatedAt, timestamp)
    };
  }

  function sanitizeAssessment(assessment) {
    if (!isPlainObject(assessment)) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(assessment.id, createId("assessment")),
      name: stringValue(assessment.name || assessment.title, "Untitled assessment"),
      score: stringValue(assessment.score, ""),
      weight: stringValue(assessment.weight, ""),
      dueDate: dateOnly(assessment.dueDate),
      notes: stringValue(assessment.notes, ""),
      createdAt: timestampValue(assessment.createdAt, timestamp),
      updatedAt: timestampValue(assessment.updatedAt, timestamp)
    };
  }

  function sanitizeCourse(course) {
    if (!isPlainObject(course)) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(course.id, createId("course")),
      name: stringValue(course.name, "Untitled course"),
      code: courseCodeValue(course.code || course.courseCode),
      instructor: stringValue(course.instructor, ""),
      notes: stringValue(course.notes, ""),
      schedule: Array.isArray(course.schedule) ? course.schedule.map(sanitizeScheduleBlock).filter(Boolean) : [],
      currentGrade: stringValue(course.currentGrade, ""),
      assessments: Array.isArray(course.assessments) ? course.assessments.map(sanitizeAssessment).filter(Boolean) : [],
      color: nullableString(course.color) || (looksLikeColor(course.code) ? stringValue(course.code, "") : null),
      archived: boolValue(course.archived),
      createdAt: timestampValue(course.createdAt, timestamp),
      updatedAt: timestampValue(course.updatedAt, timestamp)
    };
  }

  function sanitizeSubtask(subtask, position) {
    if (!isPlainObject(subtask)) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(subtask.id, createId("subtask")),
      title: stringValue(subtask.title, "Untitled step"),
      notes: stringValue(subtask.notes, ""),
      completed: boolValue(subtask.completed),
      position: Number.isInteger(subtask.position) ? subtask.position : position,
      createdAt: timestampValue(subtask.createdAt, timestamp),
      completedAt: subtask.completedAt ? timestampValue(subtask.completedAt, null) : null
    };
  }

  function sanitizeAssignment(assignment) {
    if (!isPlainObject(assignment)) return null;
    const timestamp = nowIso();
    const statusAliases = {
      active: "inProgress",
      completed: "complete"
    };
    const normalizedStatus = statusAliases[assignment.status] || assignment.status;
    const completed = boolValue(assignment.completed) || normalizedStatus === "complete" || normalizedStatus === "submitted";
    const subtasks = Array.isArray(assignment.subtasks)
      ? assignment.subtasks
      : Array.isArray(assignment.steps)
        ? assignment.steps
        : [];

    return {
      id: stringValue(assignment.id, createId("assignment")),
      title: stringValue(assignment.title, "Untitled assignment"),
      courseId: nullableString(assignment.courseId),
      type: oneOf(assignment.type, ASSIGNMENT_TYPES, "assignment"),
      dueDate: dateOnly(assignment.dueDate),
      dueTime: timeOnly(assignment.dueTime),
      estimatedMinutes: assignment.estimatedMinutes ? numberValue(assignment.estimatedMinutes, null) : null,
      energyRequired: assignment.energyRequired ? oneOf(assignment.energyRequired, ENERGY_REQUIREMENTS, null) : null,
      priority: oneOf(assignment.priority, PRIORITIES, "medium"),
      status: oneOf(normalizedStatus, ASSIGNMENT_STATUSES, completed ? "complete" : "notStarted"),
      notes: stringValue(assignment.notes, ""),
      completed,
      subtasks: subtasks.map(sanitizeSubtask).filter(Boolean),
      createdAt: timestampValue(assignment.createdAt, timestamp),
      updatedAt: timestampValue(assignment.updatedAt, timestamp),
      completedAt: assignment.completedAt ? timestampValue(assignment.completedAt, null) : null
    };
  }

  function sanitizeBrainDumpItem(item) {
    if (!isPlainObject(item)) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(item.id, createId("brain")),
      text: stringValue(item.text, ""),
      completed: boolValue(item.completed),
      createdAt: timestampValue(item.createdAt, timestamp),
      updatedAt: timestampValue(item.updatedAt, timestamp),
      convertedTo: item.convertedTo || null
    };
  }

  function sanitizePriority(priority, position) {
    if (!isPlainObject(priority)) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(priority.id, createId("priority")),
      date: dateOnly(priority.date),
      title: stringValue(priority.title, "Untitled priority"),
      linkedType: oneOf(priority.linkedType, LINKED_TYPES, "none"),
      linkedId: nullableString(priority.linkedId),
      completed: boolValue(priority.completed),
      position: Number.isInteger(priority.position) ? priority.position : position,
      createdAt: timestampValue(priority.createdAt, timestamp),
      completedAt: priority.completedAt ? timestampValue(priority.completedAt, null) : null
    };
  }

  function sanitizeDailyPlan(dailyPlan) {
    const source = isPlainObject(dailyPlan) ? dailyPlan : {};
    const topThree = Array.isArray(source.topThree) ? source.topThree : [];
    const uniqueIds = [];
    const timestamp = nowIso();

    topThree.forEach((id) => {
      const value = nullableString(id);
      if (value && !uniqueIds.includes(value) && uniqueIds.length < 3) {
        uniqueIds.push(value);
      }
    });

    return {
      date: dateOnly(source.date),
      topThree: uniqueIds,
      energy: source.energy ? oneOf(source.energy, ENERGY_LEVELS, null) : null,
      oneThingAssignmentId: nullableString(source.oneThingAssignmentId || source.assignmentId),
      updatedAt: source.updatedAt ? timestampValue(source.updatedAt, timestamp) : timestamp
    };
  }

  function sanitizeDistraction(distraction) {
    if (!isPlainObject(distraction)) return null;
    const text = stringValue(distraction.text, "");
    if (!text) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(distraction.id, createId("distraction")),
      text,
      createdAt: timestampValue(distraction.createdAt, timestamp),
      movedToBrainDumpId: nullableString(distraction.movedToBrainDumpId)
    };
  }

  function sanitizeFocusSession(session) {
    if (!isPlainObject(session)) return null;
    const timestamp = nowIso();
    const plannedDurationMinutes = numberValue(session.plannedDurationMinutes || session.durationMinutes || session.plannedFocusMinutes, 25);
    const actualDurationSeconds = nonNegativeNumberValue(session.actualDurationSeconds || (session.actualFocusMinutes ? Number(session.actualFocusMinutes) * 60 : 0), plannedDurationMinutes * 60);
    const startedAt = session.startedAt ? timestampValue(session.startedAt, timestamp) : timestamp;
    const completedAt = session.completedAt ? timestampValue(session.completedAt, timestamp) : timestamp;

    return {
      id: stringValue(session.id, createId("focus")),
      assignmentId: nullableString(session.assignmentId),
      subtaskId: nullableString(session.subtaskId),
      plannedDurationMinutes,
      actualDurationSeconds,
      durationMinutes: plannedDurationMinutes,
      startedAt,
      completedAt,
      sessionGoal: stringValue(session.sessionGoal, ""),
      distractions: Array.isArray(session.distractions) ? session.distractions.map(sanitizeDistraction).filter(Boolean) : [],
      status: oneOf(session.status, ["completed"], "completed")
    };
  }

  function sanitizeActiveFocusSession(session) {
    if (!isPlainObject(session)) return null;
    const status = oneOf(session.status, FOCUS_STATUSES, "idle");
    if (status === "idle") return null;
    const timestamp = nowIso();
    const plannedDurationMinutes = numberValue(session.plannedDurationMinutes || session.durationMinutes, 25);
    const breakDurationMinutes = numberValue(session.breakDurationMinutes, 5);
    const fallbackRemaining = plannedDurationMinutes * 60;

    return {
      id: stringValue(session.id, createId("focus")),
      mode: oneOf(session.mode, FOCUS_MODES, "focus"),
      status,
      assignmentId: nullableString(session.assignmentId),
      subtaskId: nullableString(session.subtaskId),
      plannedDurationMinutes,
      breakDurationMinutes,
      startedAt: session.startedAt ? timestampValue(session.startedAt, timestamp) : timestamp,
      endTime: session.endTime ? timestampValue(session.endTime, null) : null,
      remainingSeconds: nonNegativeNumberValue(session.remainingSeconds, fallbackRemaining),
      actualDurationSeconds: nonNegativeNumberValue(session.actualDurationSeconds, 0),
      completedAt: session.completedAt ? timestampValue(session.completedAt, null) : null,
      sessionGoal: stringValue(session.sessionGoal, ""),
      distractions: Array.isArray(session.distractions) ? session.distractions.map(sanitizeDistraction).filter(Boolean) : []
    };
  }

  function sanitizeExam(exam) {
    if (!isPlainObject(exam)) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(exam.id, createId("exam")),
      courseId: nullableString(exam.courseId),
      title: stringValue(exam.title, "Untitled exam"),
      date: dateOnly(exam.date),
      time: timeOnly(exam.time),
      location: stringValue(exam.location, ""),
      notes: stringValue(exam.notes, ""),
      archived: boolValue(exam.archived),
      createdAt: timestampValue(exam.createdAt, timestamp),
      updatedAt: timestampValue(exam.updatedAt, timestamp)
    };
  }

  function sanitizeRecentWin(win) {
    if (!isPlainObject(win)) return null;
    const text = stringValue(win.text, "");
    if (!text) return null;
    const timestamp = nowIso();

    return {
      id: stringValue(win.id, createId("win")),
      text,
      createdAt: timestampValue(win.createdAt, timestamp)
    };
  }

  function sanitizeRewardEvent(event) {
    if (!isPlainObject(event)) return null;
    const timestamp = nowIso();
    const rewardKey = stringValue(event.rewardKey || event.key, "");
    const points = nonNegativeNumberValue(event.points, 0);
    const createdAt = timestampValue(event.createdAt, timestamp);
    if (!rewardKey || points <= 0) return null;

    return {
      id: stringValue(event.id, createId("reward")),
      type: oneOf(event.type, REWARD_TYPES, "assignment_completed"),
      sourceId: stringValue(event.sourceId, ""),
      rewardKey,
      points: Math.round(points),
      createdAt,
      dateKey: dateOnly(event.dateKey) || dateOnly(createdAt.slice(0, 10))
    };
  }

  function sanitizeWeeklyGoal(goal) {
    if (!isPlainObject(goal)) return null;
    const weekStartKey = dateOnly(goal.weekStartKey);
    if (!weekStartKey) return null;
    const timestamp = nowIso();
    return {
      weekStartKey,
      target: Math.max(1, Math.round(nonNegativeNumberValue(goal.target, 90))),
      recommended: Math.max(1, Math.round(nonNegativeNumberValue(goal.recommended, 90))),
      mode: goal.mode === "custom" ? "custom" : "recommended",
      createdAt: timestampValue(goal.createdAt, timestamp)
    };
  }

  function sanitizeGamification(gamification) {
    const defaults = getDefaultAppData().gamification;
    const source = isPlainObject(gamification) ? gamification : {};
    const mode = source.weeklyGoalMode === "custom" ? "custom" : "recommended";
    const customWeeklyGoal = Math.round(nonNegativeNumberValue(source.customWeeklyGoal, defaults.customWeeklyGoal));
    const rewardEvents = Array.isArray(source.rewardEvents) ? source.rewardEvents.map(sanitizeRewardEvent).filter(Boolean) : [];
    const uniqueRewardEvents = [];
    const seenKeys = new Set();

    rewardEvents.forEach((event) => {
      if (seenKeys.has(event.rewardKey)) return;
      seenKeys.add(event.rewardKey);
      uniqueRewardEvents.push(event);
    });

    return {
      enabled: source.enabled !== false,
      showStreaks: source.showStreaks !== false,
      weeklyGoalMode: mode,
      customWeeklyGoal: customWeeklyGoal > 0 ? customWeeklyGoal : defaults.customWeeklyGoal,
      weeklyGoals: Array.isArray(source.weeklyGoals) ? source.weeklyGoals.map(sanitizeWeeklyGoal).filter(Boolean) : [],
      rewardEvents: uniqueRewardEvents
    };
  }

  function sanitizeLooseCollection(items) {
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => isPlainObject(item))
      .map((item) => cloneData(item));
  }

  function migrateAppData(data) {
    if (!isPlainObject(data)) return data;
    const migrated = Object.assign({}, data);

    migrated.version = CURRENT_VERSION;
    migrated.brainDump = Array.isArray(data.brainDump) ? data.brainDump : data.brainDumpItems;
    migrated.settings = sanitizeSettings(data.settings);
    migrated.gamification = sanitizeGamification(data.gamification);

    return migrated;
  }

  function validateAppData(data) {
    if (!isPlainObject(data)) {
      return {
        valid: false,
        repaired: false,
        data: getDefaultAppData(),
        error: "Stored data is not an object."
      };
    }

    const migrated = migrateAppData(data);
    const defaults = getDefaultAppData();
    const timestamp = nowIso();
    const createdAt = timestampValue(migrated.createdAt, defaults.createdAt);
    const requiredRootKeys = ["version", "user", "courses", "assignments", "brainDump", "priorities", "dailyPlan", "activeFocusSession", "focusSessions", "exams", "settings", "recentWins", "notes", "habits", "gamification"];
    const missingRootData = requiredRootKeys.some((key) => !Object.prototype.hasOwnProperty.call(data, key));
    const legacySettings = isPlainObject(data.settings) && (
      Object.prototype.hasOwnProperty.call(data.settings, "defaultFocusMinutes") ||
      Object.prototype.hasOwnProperty.call(data.settings, "defaultBreakMinutes")
    );
    const repaired = data.version !== CURRENT_VERSION || missingRootData || legacySettings;

    const normalized = {
      version: CURRENT_VERSION,
      appVersion: stringValue(migrated.appVersion, APP_VERSION),
      createdAt,
      updatedAt: timestampValue(migrated.updatedAt, timestamp),
      user: {
        name: stringValue(migrated.user && migrated.user.name, "")
      },
      courses: Array.isArray(migrated.courses) ? migrated.courses.map(sanitizeCourse).filter(Boolean) : [],
      assignments: Array.isArray(migrated.assignments) ? migrated.assignments.map(sanitizeAssignment).filter(Boolean) : [],
      brainDump: Array.isArray(migrated.brainDump) ? migrated.brainDump.map(sanitizeBrainDumpItem).filter(Boolean) : [],
      priorities: Array.isArray(migrated.priorities) ? migrated.priorities.map(sanitizePriority).filter(Boolean) : [],
      dailyPlan: sanitizeDailyPlan(migrated.dailyPlan),
      activeFocusSession: sanitizeActiveFocusSession(migrated.activeFocusSession),
      focusSessions: Array.isArray(migrated.focusSessions) ? migrated.focusSessions.map(sanitizeFocusSession).filter(Boolean) : [],
      exams: Array.isArray(migrated.exams) ? migrated.exams.map(sanitizeExam).filter(Boolean) : [],
      recentWins: Array.isArray(migrated.recentWins) ? migrated.recentWins.map(sanitizeRecentWin).filter(Boolean) : [],
      notes: sanitizeLooseCollection(migrated.notes),
      habits: sanitizeLooseCollection(migrated.habits),
      gamification: sanitizeGamification(migrated.gamification),
      settings: sanitizeSettings(migrated.settings)
    };

    return {
      valid: true,
      repaired,
      data: normalized,
      error: ""
    };
  }

  function preserveCorruptedData(raw) {
    withStorage((storage) => {
      storage.setItem(`${STORAGE_KEY}:corrupt:${Date.now()}`, raw);
    });
  }

  function saveAppData(data) {
    const source = isPlainObject(data) ? data : getDefaultAppData();
    const result = validateAppData(Object.assign({}, source, { updatedAt: nowIso() }));
    const serialized = JSON.stringify(result.data);
    const saved = withStorage((storage) => storage.setItem(STORAGE_KEY, serialized));

    return {
      ok: saved.ok,
      data: result.data,
      status: saved.ok ? "saved" : "unavailable",
      error: saved.error || result.error || ""
    };
  }

  function loadAppData() {
    const loaded = withStorage((storage) => storage.getItem(STORAGE_KEY));

    if (!loaded.ok) {
      return {
        data: getDefaultAppData(),
        status: "unavailable",
        error: loaded.error
      };
    }

    if (!loaded.value) {
      const defaults = getDefaultAppData();
      const saved = saveAppData(defaults);
      return {
        data: saved.data,
        status: saved.ok ? "initialized" : "unavailable",
        error: saved.error
      };
    }

    try {
      const parsed = JSON.parse(loaded.value);
      const result = validateAppData(parsed);
      if (!result.valid) {
        return {
          data: result.data,
          status: "invalid",
          error: result.error
        };
      }

      if (result.repaired) {
        saveAppData(result.data);
      }

      return {
        data: result.data,
        status: result.repaired ? "repaired" : "loaded",
        error: ""
      };
    } catch (error) {
      preserveCorruptedData(loaded.value);
      return {
        data: getDefaultAppData(),
        status: "corrupted",
        error: error.message || "Stored data could not be parsed."
      };
    }
  }

  function updateAppData(updater) {
    const loaded = loadAppData();
    const draft = cloneData(loaded.data);
    const nextData = typeof updater === "function" ? updater(draft) || draft : draft;

    return saveAppData(nextData);
  }

  function resetAppData() {
    return saveAppData(getDefaultAppData());
  }

  window.FocusStudyStorage = {
    STORAGE_KEY,
    CURRENT_VERSION,
    createId,
    cloneData,
    getDefaultAppData,
    loadAppData,
    saveAppData,
    updateAppData,
    resetAppData,
    validateAppData,
    migrateAppData
  };
})(window);
