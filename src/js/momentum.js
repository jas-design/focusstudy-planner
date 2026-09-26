(function (window) {
  const LEVELS = [
    { name: "Starting", min: 0 },
    { name: "Building", min: 100 },
    { name: "In Rhythm", min: 250 },
    { name: "Focused", min: 500 },
    { name: "Deep Focus", min: 1000 }
  ];

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(value) {
    if (!value) return null;
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addLocalDays(date, amount) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
  }

  function startOfLocalWeek(date) {
    const day = date.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    return addLocalDays(date, offset);
  }

  function getWeekDays(date) {
    const start = startOfLocalWeek(date);
    return Array.from({ length: 7 }, (_, index) => {
      const day = addLocalDays(start, index);
      return {
        date: day,
        key: localDateKey(day)
      };
    });
  }

  function timestampDateKey(value) {
    const date = value && !Number.isNaN(Date.parse(value)) ? new Date(value) : null;
    return date ? localDateKey(date) : "";
  }

  function isAssignmentComplete(assignment) {
    return Boolean(assignment && (assignment.completed || assignment.status === "complete" || assignment.status === "submitted"));
  }

  function getAssignmentPointValue(assignment) {
    const minutes = Number(assignment && assignment.estimatedMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return 15;
    if (minutes <= 30) return 10;
    if (minutes <= 60) return 15;
    if (minutes <= 120) return 25;
    return 35;
  }

  function getFocusPointValue(seconds) {
    return Math.floor(Math.max(0, Number(seconds) || 0) / 300);
  }

  function normalizeGamification(gamification) {
    const source = gamification && typeof gamification === "object" && !Array.isArray(gamification) ? gamification : {};
    const weeklyGoalMode = source.weeklyGoalMode === "custom" ? "custom" : "recommended";
    const customWeeklyGoal = Number(source.customWeeklyGoal);
    return {
      enabled: source.enabled !== false,
      showStreaks: source.showStreaks !== false,
      weeklyGoalMode,
      customWeeklyGoal: Number.isFinite(customWeeklyGoal) && customWeeklyGoal > 0 ? Math.round(customWeeklyGoal) : 90,
      weeklyGoals: Array.isArray(source.weeklyGoals) ? source.weeklyGoals : [],
      rewardEvents: Array.isArray(source.rewardEvents) ? source.rewardEvents : []
    };
  }

  function totalMomentum(state) {
    const gamification = normalizeGamification(state && state.gamification);
    return gamification.rewardEvents.reduce((sum, event) => sum + Math.max(0, Number(event.points) || 0), 0);
  }

  function momentumForDateRange(state, startKey, endKey) {
    const gamification = normalizeGamification(state && state.gamification);
    return gamification.rewardEvents.reduce((sum, event) => {
      const key = event.dateKey || timestampDateKey(event.createdAt);
      if (!key || key < startKey || key > endKey) return sum;
      return sum + Math.max(0, Number(event.points) || 0);
    }, 0);
  }

  function getMomentumLevel(points) {
    const total = Math.max(0, Number(points) || 0);
    return LEVELS.reduce((current, level) => total >= level.min ? level : current, LEVELS[0]);
  }

  function rewardExists(gamification, rewardKey) {
    return normalizeGamification(gamification).rewardEvents.some((event) => event.rewardKey === rewardKey);
  }

  function addRewardEvent(state, event) {
    const gamification = normalizeGamification(state.gamification);
    if (!gamification.enabled || !event || !event.rewardKey || rewardExists(gamification, event.rewardKey)) {
      state.gamification = gamification;
      return null;
    }
    const points = Math.max(0, Math.round(Number(event.points) || 0));
    if (!points) {
      state.gamification = gamification;
      return null;
    }

    const createdAt = event.createdAt || new Date().toISOString();
    const rewardEvent = {
      id: event.id || `reward_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      type: event.type,
      sourceId: event.sourceId || "",
      rewardKey: event.rewardKey,
      points,
      createdAt,
      dateKey: event.dateKey || timestampDateKey(createdAt)
    };
    gamification.rewardEvents.push(rewardEvent);
    state.gamification = gamification;
    return rewardEvent;
  }

  function completedFocusSecondsForDate(focusSessions, dateKey) {
    return (focusSessions || []).reduce((sum, session) => {
      if (!session || session.status !== "completed" || timestampDateKey(session.completedAt) !== dateKey) return sum;
      return sum + Math.max(0, Number(session.actualDurationSeconds) || 0);
    }, 0);
  }

  function recommendedWeeklyGoal(state, weekDays) {
    const startKey = weekDays[0].key;
    const endKey = weekDays[weekDays.length - 1].key;
    const assignmentPoints = (state.assignments || []).reduce((sum, assignment) => {
      if (!assignment.dueDate || assignment.dueDate < startKey || assignment.dueDate > endKey) return sum;
      return sum + getAssignmentPointValue(assignment);
    }, 0);
    const dailyGoalMinutes = Number(state.settings && state.settings.dailyFocusGoalMinutes) || 60;
    const focusGoalPoints = Math.round((dailyGoalMinutes * 7) / 5);
    return Math.max(40, Math.ceil((assignmentPoints + focusGoalPoints + 5) / 10) * 10);
  }

  function getWeeklyGoal(state, weekDays) {
    const gamification = normalizeGamification(state && state.gamification);
    const weekStartKey = weekDays[0].key;
    const snapshot = gamification.weeklyGoals.find((goal) => goal.weekStartKey === weekStartKey);
    if (snapshot) return snapshot;
    const recommended = recommendedWeeklyGoal(state, weekDays);
    const target = gamification.weeklyGoalMode === "custom" ? gamification.customWeeklyGoal : recommended;
    return {
      weekStartKey,
      target,
      recommended,
      mode: gamification.weeklyGoalMode,
      createdAt: new Date().toISOString()
    };
  }

  function ensureWeeklyGoalSnapshot(state, date) {
    const gamification = normalizeGamification(state.gamification);
    const weekDays = getWeekDays(date || new Date());
    const weekStartKey = weekDays[0].key;
    if (!gamification.weeklyGoals.some((goal) => goal.weekStartKey === weekStartKey)) {
      const recommended = recommendedWeeklyGoal(state, weekDays);
      gamification.weeklyGoals.push({
        weekStartKey,
        target: gamification.weeklyGoalMode === "custom" ? gamification.customWeeklyGoal : recommended,
        recommended,
        mode: gamification.weeklyGoalMode,
        createdAt: new Date().toISOString()
      });
    }
    state.gamification = gamification;
  }

  function bestStreak(assignments, focusSessions) {
    const activeDates = new Set();
    (assignments || []).forEach((assignment) => {
      if (assignment && assignment.completed) {
        const key = timestampDateKey(assignment.completedAt);
        if (key) activeDates.add(key);
      }
    });
    (focusSessions || []).forEach((session) => {
      if (session && session.status === "completed" && Number(session.actualDurationSeconds) > 0) {
        const key = timestampDateKey(session.completedAt);
        if (key) activeDates.add(key);
      }
    });
    const keys = Array.from(activeDates).sort();
    let best = 0;
    let current = 0;
    let previous = null;
    keys.forEach((key) => {
      const date = parseDateKey(key);
      const expectedPrevious = previous ? localDateKey(addLocalDays(previous, 1)) : "";
      current = previous && expectedPrevious === key ? current + 1 : 1;
      best = Math.max(best, current);
      previous = date;
    });
    return best;
  }

  window.FocusStudyMomentum = {
    LEVELS,
    addRewardEvent,
    bestStreak,
    completedFocusSecondsForDate,
    ensureWeeklyGoalSnapshot,
    getAssignmentPointValue,
    getFocusPointValue,
    getMomentumLevel,
    getWeekDays,
    getWeeklyGoal,
    localDateKey,
    momentumForDateRange,
    normalizeGamification,
    recommendedWeeklyGoal,
    timestampDateKey,
    totalMomentum
  };
})(window);
