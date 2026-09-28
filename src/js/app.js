(function () {
  const root = document.documentElement;
  const stateApi = window.FocusStudyState;
  const renderer = window.FocusStudyRender;
  const backupApi = window.FocusStudyBackup;
  const momentum = window.FocusStudyMomentum;
  const screens = Array.from(document.querySelectorAll(".screen"));
  const links = Array.from(document.querySelectorAll("[data-section-link]"));
  const appShell = document.querySelector(".app-shell");
  const workspace = document.querySelector(".workspace");
  const mainContent = document.querySelector("#main-content");
  const title = document.querySelector("#section-title");
  const kicker = document.querySelector("#section-kicker");
  const drawer = document.querySelector("#mobile-drawer");
  const openMenus = Array.from(document.querySelectorAll("[data-menu-open]"));
  const closeMenu = document.querySelector("[data-menu-close]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const quickAddModal = document.querySelector("#quick-add-modal");
  const modalClosers = Array.from(document.querySelectorAll("[data-close-modal]"));
  const assignmentForm = document.querySelector("[data-assignment-form]");
  const assignmentModal = document.querySelector("#assignment-modal");
  const deleteAssignmentModal = document.querySelector("#assignment-delete-modal");
  const courseForm = document.querySelector("[data-course-form]");
  const courseModal = document.querySelector("#course-modal");
  const deleteCourseModal = document.querySelector("#course-delete-modal");
  const priorityForm = document.querySelector("[data-priority-form]");
  const brainForm = document.querySelector("[data-brain-form]");
  const quickCaptureForm = document.querySelector("[data-quick-capture-form]");
  const recentWinForm = document.querySelector("[data-recent-win-form]");
  const bulkCaptureForm = document.querySelector("[data-bulk-capture-form]");
  const assignmentSearch = document.querySelector("#assignment-search");
  const assignmentSearchForm = document.querySelector(".search-form");
  const courseFilter = document.querySelector("#course-filter");
  const assignmentSort = document.querySelector("#assignment-sort");
  const scheduleCourseFilter = document.querySelector("[data-schedule-course-filter]");
  const scheduleTypeFilter = document.querySelector("[data-schedule-type-filter]");
  const subtaskForm = document.querySelector("[data-subtask-form]");
  const appStatus = document.querySelector("[data-app-status]");
  const backupFileInput = document.querySelector("[data-backup-file]");
  const backupStatus = document.querySelector("[data-backup-status]");
  const restoreModal = document.querySelector("#restore-modal");
  const restoreSummary = document.querySelector("[data-restore-summary]");
  const clearDataModal = document.querySelector("#delete-modal");
  const clearActiveWarning = document.querySelector("[data-clear-active-warning]");
  const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
  const assignmentTypes = ["assignment", "exam", "project", "quiz", "reading"];
  const assignmentPriorities = ["low", "medium", "high"];
  const energyLevels = ["low", "okay", "good"];
  const energyRequirements = ["low", "medium", "high"];
  const courseColors = ["teal", "lilac", "blue", "amber", "neutral"];
  let lastModalTrigger = null;
  let lastDrawerTrigger = null;
  let searchIsComposing = false;
  let isReconcilingDailyPlan = false;
  let focusTickId = null;
  let pendingRestore = null;
  let isEnsuringMomentumGoal = false;

  const labels = {
    today: "Today",
    schedule: "Weekly planning",
    assignments: "Plan the work",
    "assignment-detail": "Break it down",
    courses: "Semester map",
    "course-detail": "Course details",
    "brain-dump": "Clear your head",
    focus: "Distraction-free",
    progress: "Steady progress",
    settings: "Preferences"
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function activeId() {
    const id = window.location.hash.replace("#", "");
    return screens.some((screen) => screen.id === id) ? id : "today";
  }

  function renderCurrentState() {
    renderer.renderAll(stateApi.getAppState(), stateApi.getStorageStatus());
    bindModalOpeners(document);
  }

  function announce(message) {
    if (!appStatus) return;
    appStatus.textContent = "";
    window.setTimeout(() => {
      appStatus.textContent = message;
    }, 10);
  }

  function announceMomentum(message, rewardEvents) {
    const earned = (rewardEvents || []).reduce((sum, event) => sum + (Number(event && event.points) || 0), 0);
    announce(earned ? `${message} +${earned} Momentum.` : message);
  }

  function rewardEvent(state, details) {
    if (!momentum) return null;
    return momentum.addRewardEvent(state, Object.assign({ createdAt: nowIso() }, details));
  }

  function awardAssignmentMomentum(state, assignment, dateKey) {
    if (!assignment || !momentum) return [];
    const rewards = [];
    const assignmentReward = rewardEvent(state, {
      type: "assignment_completed",
      sourceId: assignment.id,
      rewardKey: `assignment:${assignment.id}`,
      points: momentum.getAssignmentPointValue(assignment),
      dateKey
    });
    if (assignmentReward) rewards.push(assignmentReward);

    const dailyPlan = state.dailyPlan && state.dailyPlan.date === dateKey ? state.dailyPlan : null;
    if (dailyPlan && dailyPlan.oneThingAssignmentId === assignment.id) {
      const oneThingReward = rewardEvent(state, {
        type: "one_thing_completed",
        sourceId: assignment.id,
        rewardKey: `one-thing:${dateKey}:${assignment.id}`,
        points: 5,
        dateKey
      });
      if (oneThingReward) rewards.push(oneThingReward);
    }

    const topThree = dailyPlan && Array.isArray(dailyPlan.topThree) ? dailyPlan.topThree.slice(0, 3) : [];
    if (topThree.length === 3) {
      const allComplete = topThree.every((id) => {
        const item = state.assignments.find((candidate) => candidate.id === id);
        return item && assignmentIsComplete(item);
      });
      if (allComplete) {
        const topThreeReward = rewardEvent(state, {
          type: "top_three_completed",
          sourceId: dateKey,
          rewardKey: `top-three:${dateKey}`,
          points: 10,
          dateKey
        });
        if (topThreeReward) rewards.push(topThreeReward);
      }
    }

    return rewards;
  }

  function awardDailyFocusGoalMomentum(state, dateKey) {
    if (!momentum) return null;
    const goalMinutes = Number(state.settings && state.settings.dailyFocusGoalMinutes) || 60;
    const focusedSeconds = momentum.completedFocusSecondsForDate(state.focusSessions, dateKey);
    if (focusedSeconds < goalMinutes * 60) return null;
    return rewardEvent(state, {
      type: "daily_focus_goal",
      sourceId: dateKey,
      rewardKey: `focus-goal:${dateKey}`,
      points: 5,
      dateKey
    });
  }

  function ensureMomentumWeeklyGoalSnapshot() {
    if (!momentum || isEnsuringMomentumGoal) return;
    const state = stateApi.getAppState();
    const gamification = momentum.normalizeGamification(state.gamification);
    const weekStartKey = momentum.getWeekDays(new Date())[0].key;
    if (gamification.weeklyGoals.some((goal) => goal.weekStartKey === weekStartKey)) return;

    isEnsuringMomentumGoal = true;
    stateApi.updateAppState((draft) => {
      momentum.ensureWeeklyGoalSnapshot(draft, new Date());
      return draft;
    });
    isEnsuringMomentumGoal = false;
  }

  function setInert(elements, isInert) {
    elements.forEach((element) => {
      if (!element) return;
      if (isInert) {
        element.setAttribute("aria-hidden", "true");
        element.inert = true;
        return;
      }
      element.removeAttribute("aria-hidden");
      element.inert = false;
    });
  }

  function getFocusable(container) {
    return Array.from(container.querySelectorAll(focusableSelector)).filter((element) => {
      return !element.closest("[hidden]") && element.offsetParent !== null;
    });
  }

  function trapFocus(container, event) {
    const focusable = getFocusable(container);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function restoreFocus(target) {
    if (target && target.offsetParent !== null && !target.closest("[hidden]")) {
      target.focus();
      return;
    }
    mainContent?.focus({ preventScroll: true });
  }

  function openDrawer(trigger) {
    if (!drawer) return;
    lastDrawerTrigger = trigger;
    drawer.hidden = false;
    setInert([workspace], true);
    document.body.classList.add("is-layer-open");
    closeMenu?.focus();
  }

  function closeDrawer(shouldRestoreFocus) {
    if (!drawer) return;
    drawer.hidden = true;
    setInert([workspace], false);
    document.body.classList.remove("is-layer-open");
    if (shouldRestoreFocus) {
      restoreFocus(lastDrawerTrigger || openMenus[0]);
    }
  }

  function showSection(shouldFocusMain) {
    const id = activeId();
    const activeScreen = document.getElementById(id);
    screens.forEach((screen) => screen.classList.toggle("is-active", screen.id === id));
    links.forEach((link) => link.classList.toggle("is-active", link.dataset.sectionLink === id));
    const pageTitle = activeScreen.dataset.title || "Today";
    title.textContent = pageTitle;
    kicker.textContent = labels[id] || "FocusStudy";
    document.title = `${pageTitle} - FocusStudy`;
    root.dataset.activeSection = id;
    links.forEach((link) => {
      if (link.dataset.sectionLink === id) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    if (drawer && !drawer.hidden) {
      closeDrawer(false);
    }
    if (shouldFocusMain) {
      if (id === "brain-dump") {
        document.querySelector("#brain-note")?.focus({ preventScroll: true });
      } else {
        mainContent?.focus({ preventScroll: true });
      }
    }
  }

  function openModal(id, trigger) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastModalTrigger = trigger;
    modal.hidden = false;
    setInert([appShell], true);
    document.body.classList.add("is-layer-open");
    const focusTarget = modal.querySelector("[data-initial-focus], input, select, textarea, button, a");
    focusTarget?.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    if (modal === restoreModal) {
      pendingRestore = null;
    }
    if (!document.querySelector(".modal-layer:not([hidden])")) {
      setInert([appShell], false);
      document.body.classList.remove("is-layer-open");
    }
    restoreFocus(lastModalTrigger);
  }

  function bindModalOpeners(scope) {
    Array.from(scope.querySelectorAll("[data-open-modal]")).forEach((button) => {
      if (button.dataset.modalBound === "true") return;
      button.dataset.modalBound = "true";
      button.addEventListener("click", () => {
        if (button.dataset.openModal === "assignment-modal") {
          openAssignmentForm(button.dataset.assignmentId || "", button);
          return;
        }
        if (button.dataset.openModal === "course-modal") {
          openCourseForm(button.dataset.courseId || "", button);
          return;
        }
        if (button.dataset.openModal === "priority-modal") {
          openPriorityForm(button);
          return;
        }
        openModal(button.dataset.openModal, button);
      });
    });
  }

  function clearErrorFor(input) {
    if (!input) return;
    input.removeAttribute("aria-invalid");
    const describedBy = input.getAttribute("aria-describedby") || "";
    describedBy.split(/\s+/).filter(Boolean).forEach((id) => {
      const error = document.getElementById(id);
      if (error && error.classList.contains("field-error")) {
        error.textContent = "";
        error.hidden = true;
      }
    });
  }

  function setErrorFor(input, message) {
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby") || "";
    const errorId = describedBy.split(/\s+/).filter(Boolean).find((id) => {
      const element = document.getElementById(id);
      return element && element.classList.contains("field-error");
    });
    const error = errorId ? document.getElementById(errorId) : null;
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  }

  function setFormAlert(form, message) {
    const alert = form.querySelector(".form-alert");
    if (!alert) return;
    alert.textContent = message;
    alert.hidden = !message;
  }

  function resetAssignmentErrors() {
    if (!assignmentForm) return;
    setFormAlert(assignmentForm, "");
    assignmentForm.querySelectorAll("[aria-invalid='true']").forEach(clearErrorFor);
    assignmentForm.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
  }

  function resetCourseErrors() {
    if (!courseForm) return;
    setFormAlert(courseForm, "");
    courseForm.querySelectorAll("[aria-invalid='true']").forEach(clearErrorFor);
    courseForm.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
  }

  function resetPriorityErrors() {
    if (!priorityForm) return;
    setFormAlert(priorityForm, "");
    priorityForm.querySelectorAll("[aria-invalid='true']").forEach(clearErrorFor);
    priorityForm.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
  }

  function resetBrainErrors() {
    if (!brainForm) return;
    brainForm.querySelectorAll("[aria-invalid='true']").forEach(clearErrorFor);
    brainForm.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
  }

  function validDateKey(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function findAssignment(state, assignmentId) {
    return state.assignments.find((assignment) => assignment.id === assignmentId) || null;
  }

  function findCourse(state, courseId) {
    return state.courses.find((course) => course.id === courseId) || null;
  }

  function findBrainDumpItem(state, itemId) {
    return state.brainDump.find((item) => item.id === itemId) || null;
  }

  function findSubtask(assignment, subtaskId) {
    return assignment && (assignment.subtasks || []).find((subtask) => subtask.id === subtaskId) || null;
  }

  function assignmentIsComplete(assignment) {
    return Boolean(assignment.completed) || assignment.status === "complete" || assignment.status === "submitted" || assignment.status === "completed";
  }

  function activeAssignments(state) {
    return state.assignments.filter((assignment) => !assignmentIsComplete(assignment));
  }

  function topThreeIds(state) {
    const plan = state.dailyPlan || {};
    if (plan.date !== renderer.currentTodayKey() || !Array.isArray(plan.topThree)) return [];
    const existingIds = new Set(state.assignments.map((assignment) => assignment.id));
    const uniqueIds = [];
    plan.topThree.forEach((id) => {
      if (existingIds.has(id) && !uniqueIds.includes(id) && uniqueIds.length < 3) {
        uniqueIds.push(id);
      }
    });
    return uniqueIds;
  }

  function todayPlan(state) {
    const today = renderer.currentTodayKey();
    const plan = state.dailyPlan && state.dailyPlan.date === today ? state.dailyPlan : {};
    return {
      date: today,
      topThree: Array.isArray(plan.topThree) ? plan.topThree : [],
      energy: energyLevels.includes(plan.energy) ? plan.energy : null,
      oneThingAssignmentId: plan.oneThingAssignmentId || null,
      updatedAt: plan.updatedAt || nowIso()
    };
  }

  function updateTodayPlan(draft, updater) {
    const plan = todayPlan(draft);
    updater(plan);
    plan.topThree = plan.topThree.filter((id, index, ids) => id && ids.indexOf(id) === index).slice(0, 3);
    plan.updatedAt = nowIso();
    draft.dailyPlan = plan;
  }

  function reconcileDailyPlan() {
    if (isReconcilingDailyPlan) return;
    const state = stateApi.getAppState();
    const today = renderer.currentTodayKey();
    const plan = state.dailyPlan || {};
    const cleanIds = topThreeIds(state);
    const needsReset = plan.date !== today;
    const needsCleanup = !plan || !Array.isArray(plan.topThree) || cleanIds.length !== (plan.topThree || []).length || cleanIds.some((id, index) => id !== plan.topThree[index]);

    if (!needsReset && !needsCleanup) return;

    isReconcilingDailyPlan = true;
    try {
      stateApi.updateAppState((draft) => {
        updateTodayPlan(draft, (plan) => {
          plan.topThree = needsReset ? [] : cleanIds;
          if (needsReset) {
            plan.energy = null;
            plan.oneThingAssignmentId = null;
          }
        });
        return draft;
      });
    } finally {
      isReconcilingDailyPlan = false;
    }
  }

  function openPriorityForm(trigger) {
    resetPriorityErrors();
    openModal("priority-modal", trigger);
    const select = priorityForm?.querySelector("#priority-assignment");
    select?.focus();
  }

  function validatePriorityForm() {
    const state = stateApi.getAppState();
    const select = priorityForm.querySelector("#priority-assignment");
    const assignmentId = select.value;
    const ids = topThreeIds(state);
    const assignment = findAssignment(state, assignmentId);
    const errors = [];

    clearErrorFor(select);
    setFormAlert(priorityForm, "");

    if (ids.length >= 3) {
      errors.push([select, "Remove a priority before adding another."]);
    } else if (!assignmentId) {
      errors.push([select, "Choose an active assignment."]);
    } else if (!assignment || assignmentIsComplete(assignment)) {
      errors.push([select, "Choose an active assignment."]);
    } else if (ids.includes(assignmentId)) {
      errors.push([select, "That assignment is already in today's Top 3."]);
    }

    if (errors.length) {
      errors.forEach(([field, message]) => setErrorFor(field, message));
      setFormAlert(priorityForm, errors[0][1]);
      errors[0][0]?.focus();
      return {
        valid: false,
        assignmentId
      };
    }

    return {
      valid: true,
      assignmentId
    };
  }

  function savePriority(event) {
    event.preventDefault();
    if (!priorityForm) return;
    const result = validatePriorityForm();
    if (!result.valid) return;
    const today = renderer.currentTodayKey();

    stateApi.updateAppState((state) => {
      const ids = state.dailyPlan && state.dailyPlan.date === today && Array.isArray(state.dailyPlan.topThree)
        ? state.dailyPlan.topThree.slice()
        : [];
      if (!ids.includes(result.assignmentId) && ids.length < 3) {
        ids.push(result.assignmentId);
      }
      updateTodayPlan(state, (plan) => {
        plan.topThree = ids.slice(0, 3);
      });
      return state;
    });

    closeModal(document.querySelector("#priority-modal"));
    announce("Priority added.");
  }

  function removePriority(assignmentId) {
    const today = renderer.currentTodayKey();
    stateApi.updateAppState((state) => {
      const ids = state.dailyPlan && state.dailyPlan.date === today && Array.isArray(state.dailyPlan.topThree)
        ? state.dailyPlan.topThree
        : [];
      updateTodayPlan(state, (plan) => {
        plan.topThree = ids.filter((id) => id !== assignmentId);
      });
      return state;
    });
    announce("Priority removed.");
  }

  function setEnergy(value) {
    const nextValue = energyLevels.includes(value) ? value : null;
    stateApi.updateAppState((state) => {
      updateTodayPlan(state, (plan) => {
        plan.energy = plan.energy === nextValue ? null : nextValue;
      });
      return state;
    });
    announce(nextValue ? `Energy set to ${nextValue}.` : "Energy cleared.");
  }

  function tomorrowDateKey() {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return localDateKey(date);
  }

  function moveAssignmentsToTomorrow(assignmentIds) {
    const ids = new Set(assignmentIds.filter(Boolean));
    if (!ids.size) return;
    const tomorrow = tomorrowDateKey();
    stateApi.updateAppState((state) => {
      state.assignments.forEach((assignment) => {
        if (ids.has(assignment.id) && !assignmentIsComplete(assignment)) {
          assignment.dueDate = tomorrow;
          assignment.updatedAt = nowIso();
        }
      });
      return state;
    });
    announce(ids.size === 1 ? "Moved to tomorrow." : `Moved ${ids.size} items to tomorrow.`);
  }
  function setOneThing(assignmentId) {
    stateApi.updateAppState((state) => {
      const assignment = assignmentId ? findAssignment(state, assignmentId) : null;
      updateTodayPlan(state, (plan) => {
        plan.oneThingAssignmentId = assignment && !assignmentIsComplete(assignment) ? assignment.id : null;
      });
      return state;
    });
    announce(assignmentId ? "Today's One Thing updated." : "Today's One Thing cleared.");
  }

  function addBrainDumpItem(event) {
    event.preventDefault();
    if (!brainForm) return;
    const input = brainForm.querySelector("#brain-note");
    const text = input.value.trim();
    resetBrainErrors();

    if (!text) {
      setErrorFor(input, "Capture a thought before adding it.");
      input.focus();
      return;
    }

    const timestamp = nowIso();
    stateApi.updateAppState((state) => {
      state.brainDump.push({
        id: stateApi.createId("brain"),
        text,
        completed: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        convertedTo: null
      });
      return state;
    });

    input.value = "";
    input.focus();
    announce("Brain Dump item added.");
  }

  function addBrainDumpText(text) {
    const value = String(text || "").trim();
    if (!value) return false;
    const timestamp = nowIso();
    stateApi.updateAppState((state) => {
      state.brainDump.push({
        id: stateApi.createId("brain"),
        text: value,
        completed: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        convertedTo: null
      });
      return state;
    });
    return true;
  }

  function saveQuickCapture(event) {
    event.preventDefault();
    if (!quickCaptureForm) return;
    const input = quickCaptureForm.querySelector("[data-quick-capture-input]");
    const status = quickCaptureForm.parentElement?.querySelector("[data-quick-capture-status]");
    const text = input.value.trim();
    clearErrorFor(input);

    if (!text) {
      setErrorFor(input, "Capture a thought before adding it.");
      input.focus();
      return;
    }

    addBrainDumpText(text);
    input.value = "";
    if (status) status.textContent = "Saved to Brain Dump.";
    input.focus();
    announce("Saved to Brain Dump.");
  }

  function saveRecentWin(event) {
    event.preventDefault();
    if (!recentWinForm) return;
    const input = recentWinForm.querySelector("[data-recent-win-input]");
    const text = input.value.trim();
    clearErrorFor(input);

    if (!text) {
      setErrorFor(input, "Write a small win before logging it.");
      input.focus();
      return;
    }

    stateApi.updateAppState((state) => {
      state.recentWins = Array.isArray(state.recentWins) ? state.recentWins : [];
      state.recentWins.push({
        id: stateApi.createId("win"),
        text,
        createdAt: nowIso()
      });
      return state;
    });
    input.value = "";
    input.focus();
    announce("Recent win logged.");
  }

  function updateEstimateCustomVisibility() {
    const estimateInput = assignmentForm?.querySelector("#modal-estimated-time");
    const customWrap = assignmentForm?.querySelector("[data-custom-estimate-wrap]");
    if (customWrap && estimateInput) {
      customWrap.hidden = estimateInput.value !== "custom";
    }
  }

  function startBrainDumpEdit(itemId, trigger) {
    renderer.setEditingBrainDumpId(itemId);
    renderCurrentState();
    const input = document.querySelector("[data-edit-brain-input]");
    input?.focus();
    input?.select();
    lastModalTrigger = trigger || lastModalTrigger;
  }

  function cancelBrainDumpEdit() {
    renderer.setEditingBrainDumpId("");
    renderCurrentState();
  }

  function saveBrainDumpEdit(event) {
    const form = event.target.closest("[data-edit-brain-form]");
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector("[data-edit-brain-input]");
    const text = input.value.trim();
    clearErrorFor(input);

    if (!text) {
      setErrorFor(input, "Brain Dump text cannot be empty.");
      input.focus();
      return;
    }

    const itemId = form.dataset.editBrainForm;
    const timestamp = nowIso();
    renderer.setEditingBrainDumpId("");
    stateApi.updateAppState((state) => {
      const item = findBrainDumpItem(state, itemId);
      if (item) {
        item.text = text;
        item.updatedAt = timestamp;
      }
      return state;
    });
    announce("Brain Dump item updated.");
  }

  function openDeleteBrainDumpItem(itemId, trigger) {
    if (!deleteAssignmentModal) return;
    const item = findBrainDumpItem(stateApi.getAppState(), itemId);
    if (!item) return;
    deleteAssignmentModal.dataset.deleteKind = "brainDump";
    deleteAssignmentModal.dataset.assignmentId = "";
    deleteAssignmentModal.dataset.subtaskId = "";
    deleteAssignmentModal.dataset.brainDumpId = itemId;
    deleteAssignmentModal.querySelector("#assignment-delete-title").textContent = "Delete Brain Dump item?";
    deleteAssignmentModal.querySelector("#assignment-delete-description").textContent = `Delete "${item.text}" from Brain Dump. This cannot be undone.`;
    deleteAssignmentModal.querySelector("[data-confirm-assignment-delete]").textContent = "Delete Item";
    openModal("assignment-delete-modal", trigger);
  }

  function openAssignmentForm(assignmentId, trigger) {
    if (!assignmentModal || !assignmentForm) return;
    const state = stateApi.getAppState();
    const assignment = assignmentId ? findAssignment(state, assignmentId) : null;
    const modalTitle = assignmentModal.querySelector("#assignment-modal-title");
    const kickerText = assignmentModal.querySelector(".modal-header .eyebrow");
    const saveButton = assignmentForm.querySelector("[data-save-assignment]");
    const titleInput = assignmentForm.querySelector("#modal-title");
    const courseInput = assignmentForm.querySelector("#modal-course");
    const typeInput = assignmentForm.querySelector("#modal-type");
    const dateInput = assignmentForm.querySelector("#modal-date");
    const priorityInput = assignmentForm.querySelector("#modal-priority");
    const energyInput = assignmentForm.querySelector("#modal-energy-required");
    const estimateInput = assignmentForm.querySelector("#modal-estimated-time");
    const customEstimateInput = assignmentForm.querySelector("#modal-custom-estimated-time");
    const customEstimateWrap = assignmentForm.querySelector("[data-custom-estimate-wrap]");
    const notesInput = assignmentForm.querySelector("#modal-notes");

    resetAssignmentErrors();
    assignmentForm.dataset.assignmentId = assignment ? assignment.id : "";
    assignmentForm.dataset.convertBrainId = "";
    if (kickerText) kickerText.textContent = assignment ? "Edit" : "Add";
    if (modalTitle) modalTitle.textContent = assignment ? "Edit Assignment" : "Add Assignment";
    if (saveButton) saveButton.textContent = assignment ? "Save Changes" : "Save Assignment";
    if (titleInput) titleInput.value = assignment ? assignment.title : "";
    if (courseInput) courseInput.value = assignment && state.courses.some((course) => course.id === assignment.courseId) ? assignment.courseId : "";
    if (typeInput) typeInput.value = assignmentTypes.includes(assignment?.type) ? assignment.type : "assignment";
    if (dateInput) dateInput.value = assignment ? assignment.dueDate || "" : "";
    if (priorityInput) priorityInput.value = assignmentPriorities.includes(assignment?.priority) ? assignment.priority : "medium";
    if (energyInput) energyInput.value = energyRequirements.includes(assignment?.energyRequired) ? assignment.energyRequired : "";
    if (estimateInput && customEstimateInput && customEstimateWrap) {
      const estimated = Number(assignment?.estimatedMinutes) || 0;
      const preset = ["15", "30", "45", "60", "90"].includes(String(estimated));
      estimateInput.value = estimated ? preset ? String(estimated) : "custom" : "";
      customEstimateInput.value = estimated && !preset ? String(estimated) : "";
      customEstimateWrap.hidden = estimateInput.value !== "custom";
    }
    if (notesInput) notesInput.value = assignment ? assignment.notes || "" : "";

    openModal("assignment-modal", trigger);
    titleInput?.focus();
  }

  function openAssignmentFormFromBrainDump(itemId, trigger) {
    const item = findBrainDumpItem(stateApi.getAppState(), itemId);
    if (!item) return;
    openAssignmentForm("", trigger);
    const titleInput = assignmentForm?.querySelector("#modal-title");
    if (assignmentForm) assignmentForm.dataset.convertBrainId = item.id;
    if (titleInput) {
      titleInput.value = item.text || "";
      titleInput.focus();
      titleInput.select();
    }
  }

  function validateAssignmentForm() {
    const state = stateApi.getAppState();
    const titleInput = assignmentForm.querySelector("#modal-title");
    const courseInput = assignmentForm.querySelector("#modal-course");
    const typeInput = assignmentForm.querySelector("#modal-type");
    const dateInput = assignmentForm.querySelector("#modal-date");
    const priorityInput = assignmentForm.querySelector("#modal-priority");
    const energyInput = assignmentForm.querySelector("#modal-energy-required");
    const estimateInput = assignmentForm.querySelector("#modal-estimated-time");
    const customEstimateInput = assignmentForm.querySelector("#modal-custom-estimated-time");
    const estimateChoice = estimateInput ? estimateInput.value : "";
    const customEstimate = customEstimateInput ? customEstimateInput.value : "";
    const estimatedMinutes = estimateChoice === "custom"
      ? Math.round(Number(customEstimate))
      : estimateChoice
        ? Math.round(Number(estimateChoice))
        : null;
    const fields = [titleInput, courseInput, typeInput, dateInput, priorityInput, energyInput, estimateInput, customEstimateInput].filter(Boolean);
    const values = {
      title: titleInput.value.trim(),
      courseId: courseInput.value || null,
      type: typeInput.value,
      dueDate: dateInput.value,
      priority: priorityInput.value,
      energyRequired: energyInput ? energyInput.value || null : null,
      estimatedMinutes,
      notes: assignmentForm.querySelector("#modal-notes").value.trim()
    };
    const errors = [];

    fields.forEach(clearErrorFor);
    setFormAlert(assignmentForm, "");

    if (!values.title) {
      errors.push([titleInput, "Add a short assignment title."]);
    }

    if (values.courseId && !state.courses.some((course) => course.id === values.courseId)) {
      errors.push([courseInput, "Choose a course from the list or use No course."]);
    }

    if (!assignmentTypes.includes(values.type)) {
      errors.push([typeInput, "Choose a valid assignment type."]);
    }

    if (!values.dueDate || !validDateKey(values.dueDate)) {
      errors.push([dateInput, "Choose a valid due date."]);
    }

    if (!assignmentPriorities.includes(values.priority)) {
      errors.push([priorityInput, "Choose a priority."]);
    }

    if (values.energyRequired && !energyRequirements.includes(values.energyRequired)) {
      errors.push([energyInput, "Choose a valid energy level."]);
    }

    if (estimateChoice && estimateChoice !== "custom" && !["15", "30", "45", "60", "90"].includes(estimateChoice)) {
      errors.push([estimateInput, "Choose a valid estimate."]);
    }

    if (estimateChoice === "custom" && (!Number.isFinite(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 600)) {
      errors.push([customEstimateInput, "Enter custom minutes from 1 to 600."]);
    }

    if (errors.length) {
      errors.forEach(([field, message]) => setErrorFor(field, message));
      setFormAlert(assignmentForm, "Check the highlighted fields before saving.");
      errors[0][0]?.focus();
      return {
        valid: false,
        values
      };
    }

    return {
      valid: true,
      values
    };
  }

  function saveAssignment(event) {
    event.preventDefault();
    if (!assignmentForm) return;
    const result = validateAssignmentForm();
    if (!result.valid) return;

    const assignmentId = assignmentForm.dataset.assignmentId || "";
    const convertBrainId = assignmentForm.dataset.convertBrainId || "";
    const timestamp = nowIso();
    const savedAssignmentId = assignmentId || stateApi.createId("assignment");
    renderer.setSelectedAssignmentId(savedAssignmentId);

    stateApi.updateAppState((state) => {
      const existing = assignmentId ? findAssignment(state, assignmentId) : null;
      if (existing) {
        existing.title = result.values.title;
        existing.courseId = result.values.courseId;
        existing.type = result.values.type;
        existing.dueDate = result.values.dueDate;
        existing.estimatedMinutes = result.values.estimatedMinutes;
        existing.priority = result.values.priority;
        existing.energyRequired = result.values.energyRequired;
        existing.notes = result.values.notes;
        existing.updatedAt = timestamp;
        return state;
      }

      const created = {
        id: savedAssignmentId,
        title: result.values.title,
        courseId: result.values.courseId,
        type: result.values.type,
        dueDate: result.values.dueDate,
        dueTime: "",
        estimatedMinutes: result.values.estimatedMinutes,
        energyRequired: result.values.energyRequired,
        priority: result.values.priority,
        status: "notStarted",
        notes: result.values.notes,
        completed: false,
        completedAt: null,
        subtasks: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      state.assignments.push(created);
      if (convertBrainId) {
        state.brainDump = state.brainDump.filter((item) => item.id !== convertBrainId);
      }
      return state;
    });

    assignmentForm.dataset.convertBrainId = "";
    closeModal(assignmentModal);
    announce(convertBrainId ? "Brain Dump item converted to assignment." : assignmentId ? "Assignment updated." : "Assignment added.");
  }

  function openCourseForm(courseId, trigger) {
    if (!courseModal || !courseForm) return;
    const state = stateApi.getAppState();
    const course = courseId ? findCourse(state, courseId) : null;
    const modalTitle = courseModal.querySelector("#course-modal-title");
    const kickerText = courseModal.querySelector(".modal-header .eyebrow");
    const saveButton = courseForm.querySelector("[data-save-course]");
    const nameInput = courseForm.querySelector("#course-name");
    const codeInput = courseForm.querySelector("#course-code");
    const instructorInput = courseForm.querySelector("#course-instructor");
    const colorInput = courseForm.querySelector("#course-color");

    resetCourseErrors();
    courseForm.dataset.courseId = course ? course.id : "";
    if (kickerText) kickerText.textContent = course ? "Edit" : "Add";
    if (modalTitle) modalTitle.textContent = course ? "Edit Course" : "Add Course";
    if (saveButton) saveButton.textContent = course ? "Save Changes" : "Save Course";
    if (nameInput) nameInput.value = course ? course.name : "";
    if (codeInput) codeInput.value = course ? course.code || "" : "";
    if (instructorInput) instructorInput.value = course ? course.instructor || "" : "";
    if (colorInput) colorInput.value = course && courseColors.includes(course.color) ? course.color : "";

    openModal("course-modal", trigger);
    nameInput?.focus();
  }

  function validateCourseForm() {
    const nameInput = courseForm.querySelector("#course-name");
    const codeInput = courseForm.querySelector("#course-code");
    const instructorInput = courseForm.querySelector("#course-instructor");
    const colorInput = courseForm.querySelector("#course-color");
    const values = {
      name: nameInput.value.trim(),
      code: codeInput.value.trim(),
      instructor: instructorInput.value.trim(),
      color: colorInput.value || null
    };
    const errors = [];

    [nameInput, codeInput, instructorInput, colorInput].forEach(clearErrorFor);
    setFormAlert(courseForm, "");

    if (!values.name) {
      errors.push([nameInput, "Add a course name."]);
    }

    if (values.color && !courseColors.includes(values.color)) {
      errors.push([colorInput, "Choose a valid course color."]);
    }

    if (errors.length) {
      errors.forEach(([field, message]) => setErrorFor(field, message));
      setFormAlert(courseForm, "Check the highlighted fields before saving.");
      errors[0][0]?.focus();
      return {
        valid: false,
        values
      };
    }

    return {
      valid: true,
      values
    };
  }

  function saveCourse(event) {
    event.preventDefault();
    if (!courseForm) return;
    const result = validateCourseForm();
    if (!result.valid) return;

    const courseId = courseForm.dataset.courseId || "";
    const timestamp = nowIso();
    const savedCourseId = courseId || stateApi.createId("course");
    renderer.setSelectedCourseId(savedCourseId);

    stateApi.updateAppState((state) => {
      const existing = courseId ? findCourse(state, courseId) : null;
      if (existing) {
        existing.name = result.values.name;
        existing.code = result.values.code;
        existing.instructor = result.values.instructor;
        existing.color = result.values.color;
        existing.updatedAt = timestamp;
        return state;
      }

      state.courses.push({
        id: savedCourseId,
        name: result.values.name,
        code: result.values.code,
        instructor: result.values.instructor,
        notes: "",
        color: result.values.color,
        archived: false,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return state;
    });

    closeModal(courseModal);
    announce(courseId ? "Course updated." : "Course added.");
  }

  function openDeleteCourse(courseId, trigger) {
    if (!deleteCourseModal) return;
    const state = stateApi.getAppState();
    const course = findCourse(state, courseId);
    if (!course) return;
    const linkedCount = state.assignments.filter((assignment) => assignment.courseId === courseId).length;
    const title = deleteCourseModal.querySelector("#course-delete-title");
    const description = deleteCourseModal.querySelector("#course-delete-description");

    deleteCourseModal.dataset.courseId = courseId;
    if (title) title.textContent = `Delete ${course.name}?`;
    if (description) {
      description.textContent = linkedCount
        ? `This course has ${linkedCount} ${linkedCount === 1 ? "assignment" : "assignments"}. Assignments will remain in FocusStudy but will no longer be assigned to a course.`
        : "No assignments are linked to this course. The course will be removed from this browser.";
    }
    openModal("course-delete-modal", trigger);
  }

  function confirmCourseDelete() {
    if (!deleteCourseModal) return;
    const courseId = deleteCourseModal.dataset.courseId;
    if (!courseId) return;
    const timestamp = nowIso();

    renderer.setSelectedCourseId("");
    stateApi.updateAppState((state) => {
      state.courses = state.courses.filter((course) => course.id !== courseId);
      state.assignments.forEach((assignment) => {
        if (assignment.courseId === courseId) {
          assignment.courseId = null;
          assignment.updatedAt = timestamp;
        }
      });
      return state;
    });

    closeModal(deleteCourseModal);
    announce("Course deleted. Linked assignments now show No course.");
    if (activeId() === "course-detail") {
      window.location.hash = "#courses";
      showSection(true);
    }
  }

  function updateAssignment(assignmentId, updater) {
    const timestamp = nowIso();
    stateApi.updateAppState((state) => {
      const assignment = findAssignment(state, assignmentId);
      if (!assignment) return state;
      updater(assignment, state);
      assignment.updatedAt = timestamp;
      return state;
    });
  }

  function toggleAssignmentComplete(assignmentId) {
    let completed = false;
    let rewards = [];
    renderer.setSelectedAssignmentId(assignmentId);
    updateAssignment(assignmentId, (assignment, state) => {
      completed = !assignmentIsComplete(assignment);
      assignment.completed = completed;
      assignment.status = completed ? "complete" : "inProgress";
      assignment.completedAt = completed ? nowIso() : null;
      if (completed) {
        rewards = awardAssignmentMomentum(state, assignment, localDateKey(new Date(assignment.completedAt)));
      }
    });
    announceMomentum(completed ? "Assignment completed." : "Assignment reopened.", rewards);
  }

  function openDeleteAssignment(assignmentId, trigger) {
    if (!deleteAssignmentModal) return;
    const assignment = findAssignment(stateApi.getAppState(), assignmentId);
    if (!assignment) return;
    deleteAssignmentModal.dataset.deleteKind = "assignment";
    deleteAssignmentModal.dataset.assignmentId = assignmentId;
    deleteAssignmentModal.dataset.subtaskId = "";
    deleteAssignmentModal.dataset.brainDumpId = "";
    deleteAssignmentModal.querySelector("#assignment-delete-title").textContent = "Delete assignment?";
    deleteAssignmentModal.querySelector("#assignment-delete-description").textContent = `Delete "${assignment.title}" and its subtasks from this browser. This cannot be undone.`;
    deleteAssignmentModal.querySelector("[data-confirm-assignment-delete]").textContent = "Delete Assignment";
    openModal("assignment-delete-modal", trigger);
  }

  function openDeleteSubtask(assignmentId, subtaskId, trigger) {
    if (!deleteAssignmentModal) return;
    const assignment = findAssignment(stateApi.getAppState(), assignmentId);
    const subtask = assignment && (assignment.subtasks || []).find((item) => item.id === subtaskId);
    if (!assignment || !subtask) return;
    deleteAssignmentModal.dataset.deleteKind = "subtask";
    deleteAssignmentModal.dataset.assignmentId = assignmentId;
    deleteAssignmentModal.dataset.subtaskId = subtaskId;
    deleteAssignmentModal.dataset.brainDumpId = "";
    deleteAssignmentModal.querySelector("#assignment-delete-title").textContent = "Delete subtask?";
    deleteAssignmentModal.querySelector("#assignment-delete-description").textContent = `Delete "${subtask.title}" from "${assignment.title}". This cannot be undone.`;
    deleteAssignmentModal.querySelector("[data-confirm-assignment-delete]").textContent = "Delete Subtask";
    openModal("assignment-delete-modal", trigger);
  }

  function confirmAssignmentDelete() {
    if (!deleteAssignmentModal) return;
    const kind = deleteAssignmentModal.dataset.deleteKind;
    const assignmentId = deleteAssignmentModal.dataset.assignmentId;
    const subtaskId = deleteAssignmentModal.dataset.subtaskId;
    const brainDumpId = deleteAssignmentModal.dataset.brainDumpId;

    if (kind === "assignment") {
      renderer.setSelectedAssignmentId("");
      if (renderer.getSelectedFocusAssignmentId() === assignmentId) {
        renderer.setSelectedFocusAssignmentId("");
      }
      renderer.setEditingSubtaskId("");
      stateApi.updateAppState((state) => {
        state.assignments = state.assignments.filter((assignment) => assignment.id !== assignmentId);
        return state;
      });
      closeModal(deleteAssignmentModal);
      announce("Assignment deleted.");
      if (activeId() === "assignment-detail") {
        window.location.hash = "#assignments";
        showSection(true);
      }
      return;
    }

    if (kind === "subtask") {
      renderer.setEditingSubtaskId("");
      updateAssignment(assignmentId, (assignment) => {
        assignment.subtasks = (assignment.subtasks || [])
          .filter((subtask) => subtask.id !== subtaskId)
          .map((subtask, index) => Object.assign({}, subtask, { position: index }));
      });
      closeModal(deleteAssignmentModal);
      announce("Subtask deleted.");
      return;
    }

    if (kind === "brainDump") {
      renderer.setEditingBrainDumpId("");
      stateApi.updateAppState((state) => {
        state.brainDump = state.brainDump.filter((item) => item.id !== brainDumpId);
        return state;
      });
      closeModal(deleteAssignmentModal);
      announce("Brain Dump item deleted.");
      return;
    }

    if (kind === "focusExit") {
      confirmFocusExit();
    }
  }

  function addSubtask(event) {
    event.preventDefault();
    if (!subtaskForm) return;
    const input = subtaskForm.querySelector("#new-subtask");
    const assignmentId = subtaskForm.dataset.assignmentId;
    const titleValue = input.value.trim();
    clearErrorFor(input);

    if (!assignmentId) return;
    if (!titleValue) {
      setErrorFor(input, "Add a short subtask title.");
      input.focus();
      return;
    }

    updateAssignment(assignmentId, (assignment) => {
      const subtasks = Array.isArray(assignment.subtasks) ? assignment.subtasks : [];
      subtasks.push({
        id: stateApi.createId("subtask"),
        title: titleValue,
        notes: "",
        completed: false,
        position: subtasks.length,
        createdAt: nowIso(),
        completedAt: null
      });
      assignment.subtasks = subtasks;
      if (!assignmentIsComplete(assignment) && assignment.status === "notStarted") {
        assignment.status = "inProgress";
      }
    });
    input.value = "";
    announce("Subtask added.");
  }

  function toggleSubtask(assignmentId, subtaskId, checked) {
    let rewards = [];
    updateAssignment(assignmentId, (assignment, state) => {
      const subtask = (assignment.subtasks || []).find((item) => item.id === subtaskId);
      if (!subtask) return;
      subtask.completed = checked;
      subtask.completedAt = checked ? nowIso() : null;
      if (checked) {
        const reward = rewardEvent(state, {
          type: "subtask_completed",
          sourceId: subtask.id,
          rewardKey: `subtask:${assignment.id}:${subtask.id}`,
          points: 2,
          dateKey: localDateKey(new Date(subtask.completedAt))
        });
        if (reward) rewards.push(reward);
      }
      if (!assignmentIsComplete(assignment) && assignment.status === "notStarted") {
        assignment.status = "inProgress";
      }
    });
    announceMomentum(checked ? "Subtask completed." : "Subtask reopened.", rewards);
  }

  function focusRemainingSeconds(session) {
    return renderer.activeFocusRemainingSeconds(session);
  }

  function startFocusSession(assignmentId, trigger) {
    const state = stateApi.getAppState();
    const selectedAssignmentId = assignmentId || renderer.getSelectedFocusAssignmentId();
    if (state.activeFocusSession) {
      window.location.hash = "#focus";
      announce("You already have a focus session running.");
      return;
    }

    const assignment = findAssignment(state, selectedAssignmentId);
    if (!assignment || assignmentIsComplete(assignment)) {
      announce("Choose an active assignment before starting Focus Mode.");
      window.location.hash = "#focus";
      return;
    }

    const subtaskSelect = document.querySelector(`[data-focus-subtask-for="${CSS.escape(selectedAssignmentId)}"]`);
    const goalInput = document.querySelector(`[data-session-goal-for="${CSS.escape(selectedAssignmentId)}"]`);
    const firstIncomplete = (assignment.subtasks || []).find((subtask) => !subtask.completed);
    const subtaskId = subtaskSelect ? subtaskSelect.value || null : firstIncomplete ? firstIncomplete.id : null;
    const sessionGoal = goalInput ? goalInput.value.trim().slice(0, 120) : "";
    const plannedDurationMinutes = Number(state.settings.focusDuration) || 25;
    const breakDurationMinutes = Number(state.settings.breakDuration) || 5;
    const startedAt = nowIso();
    const endTime = new Date(Date.now() + plannedDurationMinutes * 60000).toISOString();

    stateApi.updateAppState((draft) => {
      updateTodayPlan(draft, (plan) => { plan.oneThingAssignmentId = selectedAssignmentId; });
      draft.activeFocusSession = {
        id: stateApi.createId("focus"),
        mode: "focus",
        status: "running",
        assignmentId: selectedAssignmentId,
        subtaskId,
        plannedDurationMinutes,
        breakDurationMinutes,
        startedAt,
        endTime,
        remainingSeconds: plannedDurationMinutes * 60,
        actualDurationSeconds: 0,
        sessionGoal,
        distractions: [],
        completedAt: null
      };
      return draft;
    });

    renderer.setSelectedFocusAssignmentId("");
    lastModalTrigger = trigger || lastModalTrigger;
    window.location.hash = "#focus";
    announce("Focus session started.");
  }

  function pauseFocusSession() {
    stateApi.updateAppState((state) => {
      const session = state.activeFocusSession;
      if (!session || session.status !== "running") return state;
      session.remainingSeconds = focusRemainingSeconds(session);
      session.status = "paused";
      session.endTime = null;
      return state;
    });
    announce("Focus session paused.");
  }

  function resumeFocusSession() {
    stateApi.updateAppState((state) => {
      const session = state.activeFocusSession;
      if (!session || session.status !== "paused") return state;
      const remaining = Math.max(0, Number(session.remainingSeconds) || 0);
      session.status = remaining <= 0 ? "completed" : "running";
      session.endTime = remaining <= 0 ? null : new Date(Date.now() + remaining * 1000).toISOString();
      session.completedAt = remaining <= 0 ? nowIso() : null;
      return state;
    });
    announce("Focus session resumed.");
  }

  function completeFocusSession() {
    stateApi.updateAppState((state) => {
      const session = state.activeFocusSession;
      if (!session) return state;
      session.actualDurationSeconds = actualFocusSeconds(session);
      session.remainingSeconds = 0;
      session.status = "completed";
      session.endTime = null;
      session.completedAt = nowIso();
      return state;
    });
    playCompletionSound();
    announce("Focus session complete.");
  }

  function actualFocusSeconds(session) {
    const plannedSeconds = (Number(session.plannedDurationMinutes) || 25) * 60;
    return Math.max(0, plannedSeconds - focusRemainingSeconds(session));
  }

  function finishFocusSession() {
    const state = stateApi.getAppState();
    const session = state.activeFocusSession;
    if (!session) return;
    const shouldSave = session.mode !== "break";
    const completedAt = session.completedAt || nowIso();
    const storedActualSeconds = Number(session.actualDurationSeconds);
    const actualDurationSeconds = Number.isFinite(storedActualSeconds) && storedActualSeconds >= 0 ? storedActualSeconds : (session.status === "completed"
      ? ((Number(session.plannedDurationMinutes) || 25) * 60)
      : actualFocusSeconds(session));

    let rewards = [];
    stateApi.updateAppState((draft) => {
      if (shouldSave) {
        const completedSession = {
          id: session.id,
          assignmentId: session.assignmentId,
          subtaskId: session.subtaskId || null,
          plannedDurationMinutes: Number(session.plannedDurationMinutes) || 25,
          actualDurationSeconds,
          startedAt: session.startedAt,
          completedAt,
          sessionGoal: session.sessionGoal || "",
          distractions: Array.isArray(session.distractions) ? session.distractions : [],
          status: "completed"
        };
        draft.focusSessions.push(completedSession);
        const dateKey = localDateKey(new Date(completedAt));
        const focusReward = rewardEvent(draft, {
          type: "focus_session_completed",
          sourceId: session.id,
          rewardKey: `focus:${session.id}`,
          points: momentum ? momentum.getFocusPointValue(actualDurationSeconds) : 0,
          dateKey
        });
        if (focusReward) rewards.push(focusReward);
        const goalReward = awardDailyFocusGoalMomentum(draft, dateKey);
        if (goalReward) rewards.push(goalReward);
      }
      draft.activeFocusSession = null;
      return draft;
    });
    if (shouldSave) playCompletionSound();
    announceMomentum(shouldSave ? "Focus session saved." : "Break finished.", rewards);
  }

  function startBreakSession() {
    const state = stateApi.getAppState();
    const current = state.activeFocusSession;
    if (!current) return;
    const todaySessions = state.focusSessions.filter((session) => {
      return session.status === "completed" && session.completedAt && localDateKey(new Date(session.completedAt)) === renderer.currentTodayKey();
    }).length + 1;
    const longBreakEvery = Number(state.settings.sessionsBeforeLongBreak) || 4;
    const useLongBreak = longBreakEvery > 0 && todaySessions % longBreakEvery === 0;
    const breakDurationMinutes = useLongBreak
      ? Number(state.settings.longBreakDuration) || 15
      : Number(state.settings.breakDuration) || Number(current.breakDurationMinutes) || 5;
    const startedAt = nowIso();
    stateApi.updateAppState((draft) => {
      updateTodayPlan(draft, (plan) => { plan.oneThingAssignmentId = selectedAssignmentId; });
      draft.activeFocusSession = {
        id: stateApi.createId("focus"),
        mode: "break",
        status: "running",
        assignmentId: current.assignmentId || null,
        subtaskId: null,
        plannedDurationMinutes: breakDurationMinutes,
        breakDurationMinutes,
        startedAt,
        endTime: new Date(Date.now() + breakDurationMinutes * 60000).toISOString(),
        remainingSeconds: breakDurationMinutes * 60,
        actualDurationSeconds: 0,
        sessionGoal: "",
        distractions: [],
        completedAt: null
      };
      return draft;
    });
    announce("Break started.");
  }

  function completeFocusSubtask() {
    const state = stateApi.getAppState();
    const session = state.activeFocusSession;
    if (!session || !session.subtaskId) return;
    let rewards = [];
    updateAssignment(session.assignmentId, (assignment, draft) => {
      const subtask = findSubtask(assignment, session.subtaskId);
      if (!subtask) return;
      subtask.completed = true;
      subtask.completedAt = nowIso();
      const reward = rewardEvent(draft, {
        type: "subtask_completed",
        sourceId: subtask.id,
        rewardKey: `subtask:${assignment.id}:${subtask.id}`,
        points: 2,
        dateKey: localDateKey(new Date(subtask.completedAt))
      });
      if (reward) rewards.push(reward);
      if (!assignmentIsComplete(assignment) && assignment.status === "notStarted") {
        assignment.status = "inProgress";
      }
    });
    announceMomentum("Current step completed.", rewards);
  }

  function openExitFocusConfirmation(trigger) {
    const state = stateApi.getAppState();
    const session = state.activeFocusSession;
    if (!deleteAssignmentModal || !session) return;
    if (session.status === "completed") {
      finishFocusSession();
      return;
    }

    deleteAssignmentModal.dataset.deleteKind = "focusExit";
    deleteAssignmentModal.dataset.assignmentId = "";
    deleteAssignmentModal.dataset.subtaskId = "";
    deleteAssignmentModal.dataset.brainDumpId = "";
    deleteAssignmentModal.querySelector("#assignment-delete-title").textContent = "End this focus session?";
    deleteAssignmentModal.querySelector("#assignment-delete-description").textContent = "Your unfinished session will not be added to your progress.";
    deleteAssignmentModal.querySelector("[data-confirm-assignment-delete]").textContent = "End Session";
    openModal("assignment-delete-modal", trigger);
  }

  function confirmFocusExit() {
    stateApi.updateAppState((state) => {
      state.activeFocusSession = null;
      return state;
    });
    closeModal(deleteAssignmentModal);
    announce("Focus session ended.");
  }

  function reconcileFocusSessionTime() {
    const state = stateApi.getAppState();
    const session = state.activeFocusSession;
    if (!session || session.status !== "running") return;
    const remaining = focusRemainingSeconds(session);
    if (remaining > 0) return;
    stateApi.updateAppState((draft) => {
      if (draft.activeFocusSession && draft.activeFocusSession.id === session.id) {
        draft.activeFocusSession.status = "completed";
        draft.activeFocusSession.remainingSeconds = 0;
        draft.activeFocusSession.endTime = null;
        draft.activeFocusSession.actualDurationSeconds = (Number(draft.activeFocusSession.plannedDurationMinutes) || 25) * 60;
        draft.activeFocusSession.completedAt = nowIso();
        draft.activeFocusSession.distractions = Array.isArray(draft.activeFocusSession.distractions) ? draft.activeFocusSession.distractions : [];
      }
      return draft;
    });
  }

  function updateSessionGoal(value) {
    stateApi.updateAppState((state) => {
      if (!state.activeFocusSession) return state;
      state.activeFocusSession.sessionGoal = String(value || "").trim().slice(0, 120);
      return state;
    });
    announce("Session goal saved.");
  }

  function parkDistraction(form) {
    const input = form && form.querySelector("[data-distraction-input]");
    const text = input ? input.value.trim() : "";
    if (!text) {
      input?.focus();
      announce("Type a thought before parking it.");
      return;
    }

    const timestamp = nowIso();
    stateApi.updateAppState((state) => {
      const session = state.activeFocusSession;
      if (!session) return state;
      session.distractions = Array.isArray(session.distractions) ? session.distractions : [];
      session.distractions.push({
        id: stateApi.createId("distraction"),
        text,
        createdAt: timestamp,
        movedToBrainDumpId: null
      });
      return state;
    });
    if (input) {
      input.value = "";
      input.focus();
    }
    announce("Distraction parked.");
  }

  function moveFocusDistractionsToBrainDump() {
    const state = stateApi.getAppState();
    const session = state.activeFocusSession;
    const distractions = session && Array.isArray(session.distractions) ? session.distractions.filter((item) => item.text && !item.movedToBrainDumpId) : [];
    if (!distractions.length) return;

    stateApi.updateAppState((draft) => {
      const activeSession = draft.activeFocusSession;
      if (!activeSession) return draft;
      activeSession.distractions = Array.isArray(activeSession.distractions) ? activeSession.distractions : [];
      distractions.forEach((distraction) => {
        const brainId = stateApi.createId("brain");
        draft.brainDump.push({
          id: brainId,
          text: distraction.text,
          completed: false,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          convertedTo: null
        });
        const stored = activeSession.distractions.find((item) => item.id === distraction.id);
        if (stored) {
          stored.movedToBrainDumpId = brainId;
        }
      });
      return draft;
    });
    announce("Distractions moved to Brain Dump.");
  }

  function startFocusTicker() {
    if (focusTickId) window.clearInterval(focusTickId);
    focusTickId = window.setInterval(() => {
      reconcileFocusSessionTime();
      if (activeId() === "focus" || stateApi.getAppState().activeFocusSession) {
        renderCurrentState();
      }
    }, 1000);
  }

  function startSubtaskEdit(assignmentId, subtaskId, trigger) {
    renderer.setSelectedAssignmentId(assignmentId);
    renderer.setEditingSubtaskId(subtaskId);
    renderCurrentState();
    const editInput = document.querySelector("[data-edit-subtask-input]");
    editInput?.focus();
    editInput?.select();
    lastModalTrigger = trigger || lastModalTrigger;
  }

  function cancelSubtaskEdit() {
    renderer.setEditingSubtaskId("");
    renderCurrentState();
  }

  function saveSubtaskEdit(event) {
    const form = event.target.closest("[data-edit-subtask-form]");
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector("[data-edit-subtask-input]");
    const titleValue = input.value.trim();
    clearErrorFor(input);

    if (!titleValue) {
      setErrorFor(input, "Subtask title cannot be empty.");
      input.focus();
      return;
    }

    const assignmentId = form.dataset.editSubtaskForm;
    const subtaskId = form.dataset.subtaskId;
    renderer.setEditingSubtaskId("");
    updateAssignment(assignmentId, (assignment) => {
      const subtask = (assignment.subtasks || []).find((item) => item.id === subtaskId);
      if (subtask) {
        subtask.title = titleValue;
      }
    });
    announce("Subtask updated.");
  }

  function updateAssignmentFilter(name, value) {
    renderer.setAssignmentFilter(name, value);
    renderCurrentState();
  }

  function focusBrainDumpField() {
    const brainInput = document.querySelector("#brain-note");
    brainInput?.focus({ preventScroll: true });
  }

  function handleQuickAdd(action, trigger) {
    const quickAddTrigger = document.querySelector(".quick-fab") || trigger;
    if (quickAddModal && !quickAddModal.hidden) {
      closeModal(quickAddModal);
    }

    if (action === "assignment") {
      openAssignmentForm("", quickAddTrigger);
      return;
    }

    if (action === "course") {
      openCourseForm("", quickAddTrigger);
      return;
    }

    if (action === "brain") {
      if (activeId() === "brain-dump") {
        focusBrainDumpField();
      } else {
        window.location.hash = "#brain-dump";
        window.setTimeout(focusBrainDumpField, 0);
      }
      announce("Brain Dump ready.");
      return;
    }

    if (action === "focus") {
      window.location.hash = "#focus";
      announce("Choose what to focus on.");
    }
  }

  function updateThemePreference(theme) {
    stateApi.updateAppState((state) => {
      state.settings.theme = theme;
      return state;
    });
  }

  function toggleTheme() {
    const state = stateApi.getAppState();
    const resolved = renderer.resolveTheme(state.settings.theme);
    updateThemePreference(resolved === "dark" ? "light" : "dark");
  }

  function clampTimerMinutes(value, fallback, max) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number) || number < 1) return fallback;
    return Math.min(number, max);
  }

  function saveTimerSettings(focusMinutes, breakMinutes) {
    stateApi.updateAppState((state) => {
      state.settings.focusDuration = clampTimerMinutes(focusMinutes, 25, 180);
      state.settings.breakDuration = clampTimerMinutes(breakMinutes, 5, 60);
      return state;
    });
  }

  function saveCustomTimerSettings() {
    const focusInput = document.querySelector("[data-custom-focus-minutes]");
    const breakInput = document.querySelector("[data-custom-break-minutes]");
    saveTimerSettings(focusInput?.value, breakInput?.value);
  }

  function saveExtendedFocusSettings() {
    const longBreak = document.querySelector("[data-long-break-minutes]");
    const sessionsBeforeLongBreak = document.querySelector("[data-sessions-before-long-break]");
    const dailyGoal = document.querySelector("[data-daily-focus-goal]");
    const completionSound = document.querySelector("[data-completion-sound]");
    const gentleMode = document.querySelector("[data-gentle-mode]");
    stateApi.updateAppState((state) => {
      state.settings.longBreakDuration = clampTimerMinutes(longBreak?.value, 15, 120);
      state.settings.sessionsBeforeLongBreak = clampTimerMinutes(sessionsBeforeLongBreak?.value, 4, 12);
      state.settings.dailyFocusGoalMinutes = clampTimerMinutes(dailyGoal?.value, 60, 600);
      state.settings.completionSound = Boolean(completionSound?.checked);
      state.settings.gentleMode = Boolean(gentleMode?.checked);
      return state;
    });
  }

  function saveMomentumSettings() {
    if (!momentum) return;
    const enabled = document.querySelector("[data-momentum-enabled]");
    const streaks = document.querySelector("[data-momentum-streaks]");
    const goalMode = document.querySelector("[data-momentum-goal-mode]");
    const customGoal = document.querySelector("[data-momentum-custom-goal]");
    stateApi.updateAppState((state) => {
      const gamification = momentum.normalizeGamification(state.gamification);
      gamification.enabled = enabled ? Boolean(enabled.checked) : true;
      gamification.showStreaks = streaks ? Boolean(streaks.checked) : true;
      gamification.weeklyGoalMode = goalMode && goalMode.value === "custom" ? "custom" : "recommended";
      const customValue = Math.round(Number(customGoal && customGoal.value));
      gamification.customWeeklyGoal = Number.isFinite(customValue) && customValue > 0 ? customValue : gamification.customWeeklyGoal;
      state.gamification = gamification;
      momentum.ensureWeeklyGoalSnapshot(state, new Date());
      const weekStartKey = momentum.getWeekDays(new Date())[0].key;
      const currentGoal = state.gamification.weeklyGoals.find((goal) => goal.weekStartKey === weekStartKey);
      if (currentGoal) {
        currentGoal.mode = gamification.weeklyGoalMode;
        currentGoal.target = gamification.weeklyGoalMode === "custom" ? gamification.customWeeklyGoal : currentGoal.recommended;
      }
      return state;
    });
    announce("Momentum settings saved.");
  }

  function playCompletionSound() {
    const state = stateApi.getAppState();
    if (!state.settings.completionSound || !window.AudioContext && !window.webkitAudioContext) return;
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextCtor();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.28);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.3);
      window.setTimeout(() => context.close(), 450);
    } catch (error) {
      console.warn("FocusStudy completion sound could not play.", error);
    }
  }

  function parseBulkLines(text, state) {
    const lines = String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const coursesByCode = new Map(state.courses.map((course) => [(course.code || "").trim().toLowerCase(), course]));
    const errors = [];
    const assignments = [];

    lines.forEach((line, index) => {
      const parts = line.split("|").map((part) => part.trim());
      const title = parts[0] || "";
      const dueDate = parts[1] || "";
      const courseCode = parts[2] || "";
      if (!title) {
        errors.push(`Line ${index + 1}: add a title.`);
        return;
      }
      if (dueDate && !validDateKey(dueDate)) {
        errors.push(`Line ${index + 1}: use YYYY-MM-DD for the date.`);
        return;
      }
      const course = courseCode ? coursesByCode.get(courseCode.toLowerCase()) : null;
      if (courseCode && !course) {
        errors.push(`Line ${index + 1}: course code "${courseCode}" was not found.`);
        return;
      }
      assignments.push({ title, dueDate, courseId: course ? course.id : null });
    });

    return { assignments, errors };
  }

  function saveBulkCapture(event) {
    event.preventDefault();
    if (!bulkCaptureForm) return;
    const input = bulkCaptureForm.querySelector("[data-bulk-capture-input]");
    const status = bulkCaptureForm.querySelector("[data-bulk-capture-status]");
    const state = stateApi.getAppState();
    const result = parseBulkLines(input.value, state);

    if (!result.assignments.length || result.errors.length) {
      if (status) status.textContent = result.errors[0] || "Add at least one assignment line.";
      return;
    }

    const timestamp = nowIso();
    stateApi.updateAppState((draft) => {
      result.assignments.forEach((assignment) => {
        draft.assignments.push({
          id: stateApi.createId("assignment"),
          title: assignment.title,
          courseId: assignment.courseId,
          type: "assignment",
          dueDate: assignment.dueDate,
          dueTime: "",
          estimatedMinutes: null,
          energyRequired: null,
          priority: "medium",
          status: "notStarted",
          notes: "",
          completed: false,
          completedAt: null,
          subtasks: [],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      });
      return draft;
    });
    input.value = "";
    if (status) status.textContent = `${result.assignments.length} ${result.assignments.length === 1 ? "assignment" : "assignments"} added.`;
    announce(status ? status.textContent : "Assignments added.");
  }

  function setBackupStatus(message) {
    if (backupStatus) {
      backupStatus.textContent = message || "";
    }
    if (message) {
      announce(message);
    }
  }

  function resetBackupFileInput() {
    if (backupFileInput) {
      backupFileInput.value = "";
    }
  }

  function resetTemporaryUiState() {
    renderer.setSelectedAssignmentId("");
    renderer.setSelectedFocusAssignmentId("");
    renderer.setSelectedCourseId("");
    renderer.setEditingSubtaskId("");
    renderer.setEditingBrainDumpId("");
    renderer.resetAssignmentFilters();
  }

  function exportCurrentBackup() {
    if (!backupApi) return;
    try {
      backupApi.exportBackup(stateApi.getAppState());
      setBackupStatus("Backup exported.");
    } catch (error) {
      console.error("FocusStudy backup export failed.", error);
      setBackupStatus("Backup could not be exported.");
    }
  }

  function requestBackupImport(trigger) {
    if (!backupFileInput) return;
    if (stateApi.getAppState().activeFocusSession) {
      setBackupStatus("End the current Focus Session before importing a backup.");
      return;
    }
    lastModalTrigger = trigger || lastModalTrigger;
    backupFileInput.click();
  }

  function openRestoreConfirmation(result, trigger) {
    pendingRestore = result;
    if (restoreSummary) {
      const repairedNote = result.repaired ? " Some older data will be updated safely during restore." : "";
      restoreSummary.textContent = `Backup created: ${result.metadata.exportedLabel}.${repairedNote}`;
    }
    openModal("restore-modal", trigger || lastModalTrigger);
  }

  function handleBackupFileSelected() {
    const file = backupFileInput && backupFileInput.files && backupFileInput.files[0];
    if (!backupApi) return;
    if (stateApi.getAppState().activeFocusSession) {
      setBackupStatus("End the current Focus Session before importing a backup.");
      resetBackupFileInput();
      return;
    }

    backupApi.readBackupFile(file).then((result) => {
      resetBackupFileInput();
      if (!result.valid) {
        setBackupStatus(result.error || "This backup could not be restored. Your current data has not been changed.");
        return;
      }
      setBackupStatus("Backup validated. Confirm restore to replace current data.");
      openRestoreConfirmation(result, lastModalTrigger);
    }).catch((error) => {
      console.error("FocusStudy backup import failed.", error);
      resetBackupFileInput();
      setBackupStatus("This backup file could not be read. Your current FocusStudy data has not been changed.");
    });
  }

  function confirmRestoreBackup() {
    if (!pendingRestore || !pendingRestore.data || !restoreModal) return;
    if (stateApi.getAppState().activeFocusSession) {
      closeModal(restoreModal);
      pendingRestore = null;
      setBackupStatus("End the current Focus Session before restoring a backup.");
      return;
    }

    const previousState = stateApi.getAppState();
    try {
      resetTemporaryUiState();
      stateApi.setAppState(pendingRestore.data);
      const status = stateApi.getStorageStatus();
      if (status.status === "unavailable") {
        stateApi.setAppState(previousState);
        throw new Error(status.error || "Local storage is unavailable.");
      }
      closeModal(restoreModal);
      pendingRestore = null;
      window.location.hash = "#today";
      renderCurrentState();
      showSection(false);
      setBackupStatus("Backup restored successfully.");
    } catch (error) {
      console.error("FocusStudy backup restore failed.", error);
      try {
        stateApi.setAppState(previousState);
      } catch (rollbackError) {
        console.error("FocusStudy restore rollback failed.", rollbackError);
      }
      closeModal(restoreModal);
      pendingRestore = null;
      renderCurrentState();
      setBackupStatus("Backup could not be restored. Your existing data was not changed.");
    }
  }

  function openClearDataConfirmation(trigger) {
    if (clearActiveWarning) {
      clearActiveWarning.hidden = !stateApi.getAppState().activeFocusSession;
    }
    openModal("delete-modal", trigger);
  }

  function confirmClearAllData() {
    if (!clearDataModal) return;
    resetTemporaryUiState();
    stateApi.resetAppState();
    closeModal(clearDataModal);
    window.location.hash = "#today";
    renderCurrentState();
    showSection(false);
    setBackupStatus("All FocusStudy data cleared. FocusStudy is ready for a fresh start.");
  }

  function bindSettings() {
    document.querySelectorAll('input[name="appearance"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          updateThemePreference(input.value);
        }
      });
    });

    document.querySelectorAll('input[name="timer"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) return;
        if (input.dataset.customTimer !== undefined) {
          saveCustomTimerSettings();
          return;
        }
        if (!input.dataset.focusDuration || !input.dataset.breakDuration) return;
        saveTimerSettings(input.dataset.focusDuration, input.dataset.breakDuration);
      });
    });

    document.querySelectorAll("[data-custom-focus-minutes], [data-custom-break-minutes]").forEach((input) => {
      input.addEventListener("change", () => {
        const customTimer = document.querySelector("[data-custom-timer]");
        if (customTimer) {
          customTimer.checked = true;
        }
        saveCustomTimerSettings();
      });
    });

    document.querySelectorAll("[data-long-break-minutes], [data-sessions-before-long-break], [data-daily-focus-goal], [data-completion-sound], [data-gentle-mode]").forEach((input) => {
      input.addEventListener("change", saveExtendedFocusSettings);
    });

    document.querySelectorAll("[data-momentum-enabled], [data-momentum-streaks], [data-momentum-goal-mode], [data-momentum-custom-goal]").forEach((input) => {
      input.addEventListener("change", saveMomentumSettings);
    });

    document.querySelector("[data-export-backup]")?.addEventListener("click", exportCurrentBackup);
    document.querySelector("[data-import-backup]")?.addEventListener("click", (event) => requestBackupImport(event.currentTarget));
    document.querySelector("[data-clear-data]")?.addEventListener("click", (event) => openClearDataConfirmation(event.currentTarget));
    backupFileInput?.addEventListener("change", handleBackupFileSelected);
    document.querySelector("[data-confirm-restore]")?.addEventListener("click", confirmRestoreBackup);
    document.querySelector("[data-confirm-clear-data]")?.addEventListener("click", confirmClearAllData);
  }

  window.addEventListener("hashchange", () => showSection(true));

  openMenus.forEach((button) => {
    button.addEventListener("click", () => {
      openDrawer(button);
    });
  });

  closeMenu?.addEventListener("click", () => {
    closeDrawer(true);
  });

  drawer?.addEventListener("click", (event) => {
    if (event.target === drawer) {
      closeDrawer(true);
    }
  });

  themeToggle?.addEventListener("click", toggleTheme);
  assignmentForm?.addEventListener("submit", saveAssignment);
  courseForm?.addEventListener("submit", saveCourse);
  priorityForm?.addEventListener("submit", savePriority);
  brainForm?.addEventListener("submit", addBrainDumpItem);
  quickCaptureForm?.addEventListener("submit", saveQuickCapture);
  recentWinForm?.addEventListener("submit", saveRecentWin);
  bulkCaptureForm?.addEventListener("submit", saveBulkCapture);
  subtaskForm?.addEventListener("submit", addSubtask);

  assignmentForm?.addEventListener("input", (event) => {
    if (event.target.matches("input, select, textarea")) {
      clearErrorFor(event.target);
      setFormAlert(assignmentForm, "");
      if (event.target.matches("[data-estimated-time]")) {
        updateEstimateCustomVisibility();
      }
    }
  });

  assignmentForm?.addEventListener("change", (event) => {
    if (event.target.matches("[data-estimated-time]")) {
      updateEstimateCustomVisibility();
    }
  });

  quickCaptureForm?.addEventListener("input", (event) => {
    if (event.target.matches("input")) clearErrorFor(event.target);
  });

  recentWinForm?.addEventListener("input", (event) => {
    if (event.target.matches("input")) clearErrorFor(event.target);
  });

  courseForm?.addEventListener("input", (event) => {
    if (event.target.matches("input, select")) {
      clearErrorFor(event.target);
      setFormAlert(courseForm, "");
    }
  });

  priorityForm?.addEventListener("change", (event) => {
    if (event.target.matches("select")) {
      clearErrorFor(event.target);
      setFormAlert(priorityForm, "");
    }
  });

  brainForm?.addEventListener("input", (event) => {
    if (event.target.matches("textarea")) {
      clearErrorFor(event.target);
    }
  });

  brainForm?.addEventListener("keydown", (event) => {
    if (event.target.matches("textarea") && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      addBrainDumpItem(event);
    }
  });

  subtaskForm?.addEventListener("input", (event) => {
    if (event.target.matches("input")) {
      clearErrorFor(event.target);
    }
  });

  assignmentSearch?.addEventListener("compositionstart", () => {
    searchIsComposing = true;
  });

  assignmentSearch?.addEventListener("compositionend", () => {
    searchIsComposing = false;
    updateAssignmentFilter("search", assignmentSearch.value);
  });

  assignmentSearch?.addEventListener("input", (event) => {
    if (searchIsComposing || event.isComposing) return;
    updateAssignmentFilter("search", assignmentSearch.value);
  });

  assignmentSearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!searchIsComposing) {
      updateAssignmentFilter("search", assignmentSearch.value);
    }
  });

  courseFilter?.addEventListener("change", () => {
    updateAssignmentFilter("course", courseFilter.value);
  });

  assignmentSort?.addEventListener("change", () => {
    updateAssignmentFilter("sort", assignmentSort.value);
  });

  scheduleCourseFilter?.addEventListener("change", () => {
    renderer.setScheduleFilter("course", scheduleCourseFilter.value);
    renderCurrentState();
  });

  scheduleTypeFilter?.addEventListener("change", () => {
    renderer.setScheduleFilter("type", scheduleTypeFilter.value);
    renderCurrentState();
  });

  modalClosers.forEach((button) => {
    button.addEventListener("click", () => closeModal(button.closest(".modal-layer")));
  });

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-layer")) {
      closeModal(event.target);
      return;
    }

    const detailLink = event.target.closest("[data-open-assignment-detail]");
    if (detailLink) {
      renderer.setSelectedAssignmentId(detailLink.dataset.openAssignmentDetail);
      renderer.setEditingSubtaskId("");
      renderCurrentState();
      return;
    }

    const courseDetailLink = event.target.closest("[data-open-course-detail]");
    if (courseDetailLink) {
      renderer.setSelectedCourseId(courseDetailLink.dataset.openCourseDetail);
      renderCurrentState();
      return;
    }

    const editCourse = event.target.closest("[data-edit-course]");
    if (editCourse) {
      event.preventDefault();
      openCourseForm(editCourse.dataset.editCourse, editCourse);
      return;
    }

    const deleteCourse = event.target.closest("[data-delete-course]");
    if (deleteCourse) {
      openDeleteCourse(deleteCourse.dataset.deleteCourse, deleteCourse);
      return;
    }

    const editAssignment = event.target.closest("[data-edit-assignment]");
    if (editAssignment) {
      event.preventDefault();
      openAssignmentForm(editAssignment.dataset.editAssignment, editAssignment);
      return;
    }

    const startFocus = event.target.closest("[data-start-focus]");
    if (startFocus) {
      event.preventDefault();
      startFocusSession(startFocus.dataset.startFocus, startFocus);
      return;
    }

    const focusEnergy = event.target.closest("[data-focus-energy]");
    if (focusEnergy) {
      const moveToEnergyPanel = () => {
        const energyPanel = document.querySelector("#today-energy");
        if (!energyPanel) return;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        energyPanel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
        energyPanel.focus({ preventScroll: true });
      };

      if (activeId() !== "today") {
        window.location.hash = "#today";
        window.setTimeout(moveToEnergyPanel, 0);
      } else {
        moveToEnergyPanel();
      }
      return;
    }

    const moveTomorrow = event.target.closest("[data-move-tomorrow]");
    if (moveTomorrow) {
      moveAssignmentsToTomorrow([moveTomorrow.dataset.moveTomorrow]);
      return;
    }

    const moveAllTomorrow = event.target.closest("[data-move-all-tomorrow]");
    if (moveAllTomorrow) {
      const today = localDateKey(new Date());
      const overdueIds = stateApi.getAppState().assignments.filter((assignment) => !assignmentIsComplete(assignment) && assignment.dueDate && assignment.dueDate < today).map((assignment) => assignment.id);
      if (overdueIds.length && window.confirm("Move all overdue items to tomorrow?")) moveAssignmentsToTomorrow(overdueIds);
      return;
    }
    const energyButton = event.target.closest("[data-set-energy]");
    if (energyButton) {
      setEnergy(energyButton.dataset.setEnergy);
      return;
    }

    const changeOneThing = event.target.closest("[data-change-one-thing]");
    if (changeOneThing) {
      const select = document.querySelector("[data-one-thing-select]");
      select?.focus();
      return;
    }

    const clearOneThing = event.target.closest("[data-clear-one-thing]");
    if (clearOneThing) {
      setOneThing("");
      return;
    }

    const moveDistractions = event.target.closest("[data-move-distractions]");
    if (moveDistractions) {
      moveFocusDistractionsToBrainDump();
      return;
    }

    const pauseFocus = event.target.closest("[data-pause-focus]");
    if (pauseFocus) {
      pauseFocusSession();
      return;
    }

    const resumeFocus = event.target.closest("[data-resume-focus]");
    if (resumeFocus) {
      resumeFocusSession();
      return;
    }

    const completeFocus = event.target.closest("[data-complete-focus]");
    if (completeFocus) {
      completeFocusSession();
      return;
    }

    const finishFocus = event.target.closest("[data-finish-focus]");
    if (finishFocus) {
      finishFocusSession();
      return;
    }

    const startBreak = event.target.closest("[data-start-break]");
    if (startBreak) {
      startBreakSession();
      return;
    }

    const completeFocusSubtaskButton = event.target.closest("[data-complete-focus-subtask]");
    if (completeFocusSubtaskButton) {
      completeFocusSubtask();
      return;
    }

    const exitFocus = event.target.closest("[data-exit-focus]");
    if (exitFocus) {
      openExitFocusConfirmation(exitFocus);
      return;
    }

    const toggleComplete = event.target.closest("[data-toggle-assignment-complete]");
    if (toggleComplete) {
      toggleAssignmentComplete(toggleComplete.dataset.toggleAssignmentComplete);
      return;
    }

    const removePriorityButton = event.target.closest("[data-remove-priority]");
    if (removePriorityButton) {
      removePriority(removePriorityButton.dataset.removePriority);
      return;
    }

    const deleteAssignment = event.target.closest("[data-delete-assignment]");
    if (deleteAssignment) {
      openDeleteAssignment(deleteAssignment.dataset.deleteAssignment, deleteAssignment);
      return;
    }

    const convertBrainDump = event.target.closest("[data-convert-brain]");
    if (convertBrainDump) {
      openAssignmentFormFromBrainDump(convertBrainDump.dataset.convertBrain, convertBrainDump);
      return;
    }

    const editBrainDump = event.target.closest("[data-edit-brain]");
    if (editBrainDump) {
      startBrainDumpEdit(editBrainDump.dataset.editBrain, editBrainDump);
      return;
    }

    const cancelBrainDump = event.target.closest("[data-cancel-brain-edit]");
    if (cancelBrainDump) {
      cancelBrainDumpEdit();
      return;
    }

    const deleteBrainDump = event.target.closest("[data-delete-brain]");
    if (deleteBrainDump) {
      openDeleteBrainDumpItem(deleteBrainDump.dataset.deleteBrain, deleteBrainDump);
      return;
    }

    const editSubtask = event.target.closest("[data-edit-subtask]");
    if (editSubtask) {
      startSubtaskEdit(editSubtask.dataset.editSubtask, editSubtask.dataset.subtaskId, editSubtask);
      return;
    }

    const cancelSubtask = event.target.closest("[data-cancel-subtask-edit]");
    if (cancelSubtask) {
      cancelSubtaskEdit();
      return;
    }

    const deleteSubtask = event.target.closest("[data-delete-subtask]");
    if (deleteSubtask) {
      openDeleteSubtask(deleteSubtask.dataset.deleteSubtask, deleteSubtask.dataset.subtaskId, deleteSubtask);
      return;
    }

    const clearSearch = event.target.closest("[data-clear-assignment-search]");
    if (clearSearch) {
      updateAssignmentFilter("search", "");
      assignmentSearch?.focus();
      return;
    }

    const statusFilterButton = event.target.closest("[data-status-filter]");
    if (statusFilterButton) {
      updateAssignmentFilter("status", statusFilterButton.dataset.statusFilter);
      return;
    }

    const scheduleViewButton = event.target.closest("[data-schedule-view]");
    if (scheduleViewButton) {
      renderer.setScheduleView(scheduleViewButton.dataset.scheduleView);
      renderCurrentState();
      return;
    }

    const progressRange = event.target.closest("[data-progress-range]");
    if (progressRange) {
      renderer.setProgressRange(progressRange.dataset.progressRange);
      renderCurrentState();
      return;
    }

    const confirmDelete = event.target.closest("[data-confirm-assignment-delete]");
    if (confirmDelete) {
      confirmAssignmentDelete();
      return;
    }

    const quickAction = event.target.closest("[data-quick-add]");
    if (quickAction) {
      handleQuickAdd(quickAction.dataset.quickAdd, quickAction);
      return;
    }

    const confirmCourseDeleteButton = event.target.closest("[data-confirm-course-delete]");
    if (confirmCourseDeleteButton) {
      confirmCourseDelete();
    }
  });

  document.addEventListener("change", (event) => {
    const subtaskToggle = event.target.closest("[data-toggle-subtask]");
    if (subtaskToggle) {
      toggleSubtask(subtaskToggle.dataset.toggleSubtask, subtaskToggle.dataset.subtaskId, subtaskToggle.checked);
    }

    const focusAssignmentOption = event.target.closest("[data-focus-assignment-option]");
    if (focusAssignmentOption) {
      renderer.updateFocusSetupSelection(focusAssignmentOption.value);
      return;
    }

    const oneThingSelect = event.target.closest("[data-one-thing-select]");
    if (oneThingSelect) {
      setOneThing(oneThingSelect.value);
      return;
    }

    const sessionGoal = event.target.closest("[data-session-goal-active]");
    if (sessionGoal) {
      updateSessionGoal(sessionGoal.value);
    }
  });

  document.addEventListener("submit", saveSubtaskEdit);
  document.addEventListener("submit", saveBrainDumpEdit);

  document.addEventListener("submit", (event) => {
    const distractionForm = event.target.closest("[data-distraction-form]");
    if (!distractionForm) return;
    event.preventDefault();
    parkDistraction(distractionForm);
  });

  document.addEventListener("keydown", (event) => {
    const openModalLayer = document.querySelector(".modal-layer:not([hidden])");
    if (event.key === "Tab") {
      if (openModalLayer) {
        trapFocus(openModalLayer, event);
        return;
      }
      if (drawer && !drawer.hidden) {
        trapFocus(drawer, event);
      }
      return;
    }
    if (event.key !== "Escape") return;
    if (openModalLayer) {
      closeModal(openModalLayer);
      return;
    }
    if (drawer && !drawer.hidden) {
      closeDrawer(true);
    }
  });

  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const state = stateApi.getAppState();
      if (state.settings.theme === "system") {
        renderer.renderAll(state, stateApi.getStorageStatus());
      }
    };

    if (typeof colorSchemeQuery.addEventListener === "function") {
      colorSchemeQuery.addEventListener("change", handleSystemThemeChange);
    } else if (typeof colorSchemeQuery.addListener === "function") {
      colorSchemeQuery.addListener(handleSystemThemeChange);
    }
  }

  stateApi.subscribe((state, storageStatus) => {
    reconcileDailyPlan();
    ensureMomentumWeeklyGoalSnapshot();
    renderer.renderAll(stateApi.getAppState(), stateApi.getStorageStatus() || storageStatus);
    bindModalOpeners(document);
  });

  bindSettings();
  reconcileDailyPlan();
  ensureMomentumWeeklyGoalSnapshot();
  reconcileFocusSessionTime();
  startFocusTicker();
  renderer.renderAll(stateApi.getAppState(), stateApi.getStorageStatus());
  bindModalOpeners(document);
  showSection(false);
})();
