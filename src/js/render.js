(function (window) {
  const root = document.documentElement;
  const momentum = window.FocusStudyMomentum;
  const coursePalette = ["teal", "lilac", "blue", "amber"];
  const courseTones = ["teal", "lilac", "blue", "amber", "neutral"];
  const assignmentTypes = ["assignment", "exam", "project", "quiz", "reading"];
  const assignmentFilters = {
    search: "",
    course: "all",
    status: "all",
    type: "all",
    sort: "due"
  };
  const scheduleFilters = {
    course: "all",
    type: "all"
  };
  const progressRanges = ["week", "month", "all"];
  const scheduleViews = ["grid", "list"];
  let selectedAssignmentId = "";
  let selectedFocusAssignmentId = "";
  let selectedCourseId = "";
  let editingSubtaskId = "";
  let editingBrainDumpId = "";
  let progressRange = "week";
  let scheduleView = "grid";

  function createElement(tag, attributes, children) {
    const element = document.createElement(tag);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "className") {
        element.className = value;
      } else if (key === "text") {
        element.textContent = value;
      } else if (key === "checked") {
        element.checked = Boolean(value);
      } else if (key === "disabled") {
        element.disabled = Boolean(value);
      } else if (key === "selected") {
        element.selected = Boolean(value);
      } else if (key === "value") {
        element.value = value;
        element.setAttribute("value", String(value));
      } else if (key === "style") {
        Object.entries(value || {}).forEach(([property, propertyValue]) => {
          if (property.startsWith("--")) {
            element.style.setProperty(property, String(propertyValue));
          } else {
            element.style[property] = propertyValue;
          }
        });
      } else {
        element.setAttribute(key, String(value));
      }
    });

    (children || []).forEach((child) => {
      element.append(child);
    });

    return element;
  }

  function createSvgIcon(name, className) {
    const paths = {
      check: ["M5 12.5 9.5 17 19 7"],
      play: ["M8 5v14l11-7-11-7Z"],
      timer: ["M12 8v5l3 2", "M9 2h6", "M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"],
      spark: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z", "M18 16v4M16 18h4"],
      focus: ["M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
      list: ["M8 6h11M8 12h11M8 18h11", "m4 6 .7.7L6 5.4M4 12l.7.7L6 11.4M4 18l.7.7L6 17.4"],
      flame: ["M13 2s1 4-2 6c-2 1.4-4 3.3-4 6a5 5 0 0 0 10 0c0-2.5-1.4-4.4-4-6 .7 2-1 3-1 3"],
      target: ["M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z", "M12 2v3M12 19v3M2 12h3M19 12h3"],
      trend: ["M4 17 9 12l4 4 7-9", "M14 7h6v6"],
      chart: ["M5 19V9M12 19V5M19 19v-7"],
      book: ["M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z", "M5 18.5A2.5 2.5 0 0 1 7.5 16H19"],
      calendar: ["M7 3v3M17 3v3M4 8h16", "M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"],
      course: ["M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z", "M7 10v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5"],
      settings: ["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3-.2-.1a1.7 1.7 0 0 0-2 .1 8 8 0 0 1-1.8.8 1.7 1.7 0 0 0-1.2 1.5V22H9.4v-.3a1.7 1.7 0 0 0-1.2-1.5 8 8 0 0 1-1.8-.8 1.7 1.7 0 0 0-2-.1l-.2.1-2-3 .1-.1A1.7 1.7 0 0 0 2.6 15a8 8 0 0 1 0-2 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3 .2.1a1.7 1.7 0 0 0 2-.1 8 8 0 0 1 1.8-.8 1.7 1.7 0 0 0 1.2-1.5V5h3.2v.3a1.7 1.7 0 0 0 1.2 1.5 8 8 0 0 1 1.8.8 1.7 1.7 0 0 0 2 .1l.2-.1 2 3-.1.1a1.7 1.7 0 0 0-.3 1.9 8 8 0 0 1 0 2.4Z"]
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", className || "ui-icon");
    (paths[name] || paths.focus).forEach((pathData) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      svg.append(path);
    });
    return svg;
  }

  function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }

  function toggleElement(element, shouldShow) {
    if (!element) return;
    element.classList.toggle("is-hidden", !shouldShow);
  }

  function todayKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function currentTodayKey() {
    return todayKey(new Date());
  }

  function parseDateKey(value) {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatShortDate(value) {
    const date = parseDateKey(value);
    if (!date) return "No date";
    return date.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  }

  function formatBrainDate(value) {
    const date = value && !Number.isNaN(Date.parse(value)) ? new Date(value) : null;
    if (!date) return "";
    const now = new Date();
    const today = todayKey(now);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const itemDay = todayKey(date);

    if (itemDay === today) {
      return `Today, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    }
    if (itemDay === todayKey(yesterday)) {
      return "Yesterday";
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function daysUntil(value) {
    const date = parseDateKey(value);
    if (!date) return null;
    const start = parseDateKey(currentTodayKey());
    return Math.ceil((date.getTime() - start.getTime()) / 86400000);
  }

  function isToday(value) {
    return value === currentTodayKey();
  }

  function isPast(value) {
    const days = daysUntil(value);
    return days !== null && days < 0;
  }

  function friendlyDateLabel(value) {
    const days = daysUntil(value);
    if (days === null) return "No date";
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `In ${days} days`;
    return formatShortDate(value);
  }

  function countdownLabel(value) {
    const days = daysUntil(value);
    if (days === null) return "--";
    if (days <= 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  }

  function formatTimer(totalSeconds) {
    const safeSeconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
        key: localDateKey(day),
        label: day.toLocaleDateString(undefined, { weekday: "long" }),
        shortLabel: day.toLocaleDateString(undefined, { weekday: "short" })
      };
    });
  }

  function getScheduleWeekDays(date) {
    return getWeekDays(date);
  }

  function timestampDate(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  }

  function timestampDateKey(value) {
    const date = timestampDate(value);
    return date ? localDateKey(date) : "";
  }

  function activeFocusRemainingSeconds(session) {
    if (!session) return 0;
    if (session.status === "paused") return Math.max(0, Number(session.remainingSeconds) || 0);
    if (session.status === "completed") return 0;
    if (!session.endTime) return Math.max(0, Number(session.remainingSeconds) || 0);
    return Math.max(0, Math.ceil((Date.parse(session.endTime) - Date.now()) / 1000));
  }

  function findCourse(state, courseId) {
    return state.courses.find((course) => course.id === courseId) || null;
  }

  function sortedCourses(state) {
    return state.courses.slice().sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) return nameCompare;
      return a.code.localeCompare(b.code);
    });
  }

  function normalizedCourseTone(course, index) {
    if (course && courseTones.includes(course.color)) return course.color;
    return coursePalette[index >= 0 ? index % coursePalette.length : 0];
  }

  function courseTone(state, courseId) {
    const courses = sortedCourses(state);
    const index = courses.findIndex((course) => course.id === courseId);
    if (index < 0) return "neutral";
    return normalizedCourseTone(courses[index], index);
  }

  function courseChip(state, assignment) {
    const course = findCourse(state, assignment.courseId);
    const label = course ? course.name : "No course";
    const tone = courseTone(state, assignment.courseId);
    return createElement("span", { className: `course-chip course-chip--${tone}`, text: label });
  }

  function emptyState(title, body, compact) {
    return createElement("div", { className: `empty-state${compact ? " empty-state--compact" : ""}` }, [
      createElement("strong", { text: title }),
      createElement("p", { text: body })
    ]);
  }

  function emptyListItem(title, body) {
    return createElement("li", { className: "empty-list-item" }, [
      createElement("strong", { text: title }),
      createElement("small", { text: body })
    ]);
  }

  function titleCase(value) {
    const words = String(value || "").replace(/([a-z])([A-Z])/g, "$1 $2").split(/[\s_-]+/);
    return words.filter(Boolean).map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
  }

  function typeLabel(type) {
    return assignmentTypes.includes(type) ? titleCase(type) : "Assignment";
  }

  function priorityLabel(priority) {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High"
    };
    return labels[priority] || "Medium";
  }

  function assignmentIsComplete(assignment) {
    return Boolean(assignment.completed) || assignment.status === "complete" || assignment.status === "submitted" || assignment.status === "completed";
  }

  function assignmentStatus(assignment) {
    if (assignment.status === "submitted") return "submitted";
    if (assignmentIsComplete(assignment)) return "complete";
    return assignment.status === "inProgress" || assignment.status === "active" ? "inProgress" : "notStarted";
  }

  function statusLabel(assignment) {
    const labels = {
      notStarted: "Not started",
      inProgress: "In progress",
      complete: "Completed",
      submitted: "Submitted"
    };
    return labels[assignmentStatus(assignment)] || "Not started";
  }

  function renderStatus(assignment) {
    const status = assignmentStatus(assignment);
    const className = status === "inProgress"
      ? "status status--progress"
      : status === "complete" || status === "submitted"
        ? "status status--complete"
        : "status";
    return createElement("span", { className, text: statusLabel(assignment) });
  }

  function renderPriority(priority) {
    const className = priority === "high"
      ? "status status--warning"
      : priority === "medium"
        ? "status status--progress"
        : "status";
    return createElement("span", { className, text: `${priorityLabel(priority)} priority` });
  }

  function dueInfo(assignment) {
    const days = daysUntil(assignment.dueDate);
    if (days === null) {
      return {
        label: "No due date",
        className: "due-badge"
      };
    }

    if (!assignmentIsComplete(assignment) && days < 0) {
      return {
        label: "Overdue",
        className: "due-badge due-badge--urgent"
      };
    }

    if (days === 0) {
      return {
        label: "Today",
        className: "due-badge due-badge--soon"
      };
    }

    if (days === 1) {
      return {
        label: "Tomorrow",
        className: "due-badge due-badge--soon"
      };
    }

    return {
      label: formatShortDate(assignment.dueDate),
      className: days <= 7 && !assignmentIsComplete(assignment) ? "due-badge due-badge--soon" : "due-badge"
    };
  }

  function renderDueBadge(assignment) {
    const due = dueInfo(assignment);
    return createElement("span", { className: due.className, text: due.label });
  }

  function progressPercent(assignment) {
    const subtasks = assignment.subtasks || [];
    if (!subtasks.length) {
      return assignmentIsComplete(assignment) ? 100 : 0;
    }

    const complete = subtasks.filter((subtask) => subtask.completed).length;
    return Math.round((complete / subtasks.length) * 100);
  }

  function activeAssignments(state) {
    return state.assignments.filter((assignment) => !assignmentIsComplete(assignment));
  }

  function upcomingAssignments(state) {
    return activeAssignments(state)
      .filter((assignment) => assignment.dueDate)
      .sort(sortAssignments);
  }

  function overdueAssignments(state) {
    return activeAssignments(state)
      .filter((assignment) => assignment.dueDate && isPast(assignment.dueDate))
      .sort(sortAssignments);
  }

  function todaysAssignments(state) {
    return activeAssignments(state)
      .filter((assignment) => isToday(assignment.dueDate))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDifference = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
        if (priorityDifference !== 0) return priorityDifference;
        return sortAssignments(a, b);
      });
  }

  function nextSevenAssignments(state) {
    return activeAssignments(state)
      .filter((assignment) => {
        const days = daysUntil(assignment.dueDate);
        return days !== null && days > 0 && days <= 7;
      })
      .sort(sortAssignments);
  }

  function upcomingExamAssignments(state) {
    return activeAssignments(state)
      .filter((assignment) => assignment.type === "exam")
      .filter((assignment) => {
        const days = daysUntil(assignment.dueDate);
        return days !== null && days >= 0;
      })
      .sort(sortAssignments);
  }

  function todaysTopThreeIds(state) {
    const plan = state.dailyPlan || {};
    if (plan.date !== currentTodayKey() || !Array.isArray(plan.topThree)) return [];
    const existingIds = new Set(state.assignments.map((assignment) => assignment.id));
    const uniqueIds = [];
    plan.topThree.forEach((id) => {
      if (existingIds.has(id) && !uniqueIds.includes(id) && uniqueIds.length < 3) {
        uniqueIds.push(id);
      }
    });
    return uniqueIds;
  }

  function dueSortValue(assignment) {
    const date = parseDateKey(assignment.dueDate);
    return date ? date.getTime() : Number.POSITIVE_INFINITY;
  }

  function sortAssignments(a, b) {
    const aComplete = assignmentIsComplete(a);
    const bComplete = assignmentIsComplete(b);
    if (aComplete !== bComplete) return aComplete ? 1 : -1;
    const dateDifference = dueSortValue(a) - dueSortValue(b);
    if (dateDifference !== 0) return dateDifference;
    return a.title.localeCompare(b.title);
  }

  function sortAssignmentsByFilter(state, assignments) {
    const sort = assignmentFilters.sort;
    return assignments.slice().sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sort === "course") {
        const courseCompare = courseName(state, a.courseId).localeCompare(courseName(state, b.courseId));
        return courseCompare || sortAssignments(a, b);
      }
      if (sort === "created") {
        return (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0);
      }
      return sortAssignments(a, b);
    });
  }

  function getSelectedAssignment(state) {
    if (selectedAssignmentId) {
      const selected = state.assignments.find((assignment) => assignment.id === selectedAssignmentId);
      if (selected) return selected;
      selectedAssignmentId = "";
    }

    return state.assignments.slice().sort(sortAssignments)[0] || null;
  }

  function getSelectedFocusAssignment(state) {
    if (!selectedFocusAssignmentId) return null;
    const selected = state.assignments.find((assignment) => assignment.id === selectedFocusAssignmentId);
    if (selected && !assignmentIsComplete(selected)) return selected;
    selectedFocusAssignmentId = "";
    return null;
  }

  function getSelectedCourse(state) {
    const courses = sortedCourses(state);
    if (selectedCourseId) {
      const selected = courses.find((course) => course.id === selectedCourseId);
      if (selected) return selected;
      selectedCourseId = "";
    }

    return courses[0] || null;
  }

  function courseAssignments(state, courseId) {
    return state.assignments
      .filter((assignment) => assignment.courseId === courseId)
      .sort(sortAssignments);
  }

  function assignmentSearchText(state, assignment) {
    const course = findCourse(state, assignment.courseId);
    return [
      assignment.title,
      assignment.notes,
      assignment.type,
      assignment.priority,
      course && course.name,
      course && course.code
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function filteredAssignments(state) {
    const query = assignmentFilters.search.trim().toLowerCase();
    const filtered = state.assignments
      .filter((assignment) => {
        if (query && !assignmentSearchText(state, assignment).includes(query)) return false;
        if (assignmentFilters.course !== "all" && assignment.courseId !== assignmentFilters.course) return false;
        if (assignmentFilters.status === "upcoming") {
          const days = daysUntil(assignment.dueDate);
          if (assignmentIsComplete(assignment) || days === null || days < 0) return false;
        }
        if (assignmentFilters.status === "today" && (!isToday(assignment.dueDate) || assignmentIsComplete(assignment))) return false;
        if (assignmentFilters.status === "overdue" && (!isPast(assignment.dueDate) || assignmentIsComplete(assignment))) return false;
        if (assignmentFilters.status === "completed" && !assignmentIsComplete(assignment)) return false;
        if (assignmentFilters.type !== "all" && assignment.type !== assignmentFilters.type) return false;
        return true;
      });
    return sortAssignmentsByFilter(state, filtered);
  }

  function renderToday(state) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const name = state.user.name ? `, ${state.user.name}` : "";
    const active = activeAssignments(state);
    const overdue = overdueAssignments(state);
    const dueToday = todaysAssignments(state);
    const upcoming = nextSevenAssignments(state);
    const todayPlan = getDailyPlan(state);
    const topThreeIds = todaysTopThreeIds(state);
    const topThreeAssignments = topThreeIds
      .map((id) => state.assignments.find((assignment) => assignment.id === id))
      .filter(Boolean);
    const todayTaskIds = new Set([
      ...dueToday.map((assignment) => assignment.id),
      ...topThreeIds,
      todayPlan.oneThingAssignmentId
    ].filter(Boolean));
    const todayTaskSet = Array.from(todayTaskIds)
      .map((id) => state.assignments.find((assignment) => assignment.id === id))
      .filter(Boolean);
    const completedTodayTasks = todayTaskSet.filter(assignmentIsComplete).length;
    const totalTasksToday = todayTaskSet.length || active.length;
    const focusSessionsToday = getFocusSessionsForDate(state.focusSessions, currentTodayKey());
    const focusTodaySeconds = focusSessionsToday.reduce((sum, session) => sum + (Number(session.actualDurationSeconds) || 0), 0);
    const currentStreak = getCurrentStreak(state.assignments, state.focusSessions);
    const weekDays = getWeekDays(new Date());
    const gamification = momentum ? momentum.normalizeGamification(state.gamification) : { enabled: false, showStreaks: true };
    const studentName = state.user.name || "Student";
    document.querySelector(".today-page")?.classList.toggle("is-gentle", Boolean(state.settings.gentleMode));
    const initial = studentName.trim().charAt(0).toUpperCase() || "F";

    setText(".hero-panel__text h2", `${greeting}${name}.`);
    setText("[data-today-date]", new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
    setText("[data-today-summary]", todaySummary(overdue, dueToday, topThreeAssignments));
    setText("[data-sidebar-student-name]", studentName);
    setText("[data-sidebar-streak]", currentStreak ? `${currentStreak} day streak` : "Start your streak");
    document.querySelectorAll(".sidebar-profile__avatar, .utility-avatar").forEach((avatar) => {
      avatar.textContent = initial;
    });
    const heroMeter = document.querySelector(".hero-panel__meter");
    if (heroMeter) {
      const energyLabels = { low: "Low", okay: "Okay", good: "Good" };
      heroMeter.replaceChildren(
        summaryMetric(`${completedTodayTasks} / ${Math.max(totalTasksToday, completedTodayTasks)}`, "Tasks done", "check", "Planned for today"),
        summaryMetric(formatFocusDuration(focusTodaySeconds), "Focus today", "timer", `${focusSessionsToday.length} ${focusSessionsToday.length === 1 ? "session" : "sessions"}`),
        summaryMetric(todayPlan.energy ? energyLabels[todayPlan.energy] : "Check in", "Current energy", "spark", "Optional check-in"),
        summaryMetric(gamification.showStreaks ? (currentStreak ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "No streak yet") : "Hidden", "Current streak", "flame", currentStreak ? "Activity rhythm" : "Start today")
      );
    }

    renderEnergy(todayPlan, state);
    renderOneThing(state, todayPlan);
    renderEnergyFit(state, todayPlan);

    const priorityList = document.querySelector(".priority-list");
    const todayItems = [
      ...topThreeAssignments,
      ...dueToday.filter((assignment) => !topThreeIds.includes(assignment.id))
    ];
    if (priorityList) {
      if (!todayItems.length) {
        priorityList.replaceChildren(emptyListItem("Nothing planned for today.", "Add a priority or choose an assignment to get started."));
      } else {
        const visibleItems = todayItems.slice(0, 3);
        const priorityRows = visibleItems.map((assignment, index) => {
          const id = `today-${assignment.id}`;
          const completed = assignmentIsComplete(assignment);
          const input = createElement("input", {
            id,
            type: "checkbox",
            checked: completed,
            "data-toggle-assignment-complete": assignment.id,
            "aria-label": `${completed ? "Reopen" : "Complete"} ${assignment.title}`
          });
          const label = createElement("label", { for: id }, [
            createElement("strong", { text: assignment.title }),
            createElement("small", { text: `${courseName(state, assignment.courseId)} - ${friendlyDateLabel(assignment.dueDate)} - ${priorityLabel(assignment.priority)} priority` })
          ]);
          const signalClass = index === 0 ? "priority-signal" : index === 1 ? "priority-signal priority-signal--medium" : "priority-signal priority-signal--low";
          return createElement("li", { className: `task-row task-row--priority${completed ? " is-done" : ""}` }, [
            input,
            label,
            createElement("div", { className: "priority-actions" }, [
              createElement("span", { className: signalClass, "aria-label": `Priority ${index + 1}` })
            ])
          ]);
        });
        const moreCount = Math.max(0, todayItems.length - visibleItems.length);
        if (moreCount) {
          priorityRows.push(createElement("li", { className: "priority-add-row" }, [
            createElement("a", { className: "text-link", href: "#assignments", text: `+${moreCount} more in Assignments` })
          ]));
        }
        priorityList.replaceChildren(...priorityRows);
      }
    }

    const priorityButton = document.querySelector("[data-open-modal='priority-modal']");
    if (priorityButton) {
      const available = active.filter((assignment) => !topThreeIds.includes(assignment.id));
      priorityButton.disabled = topThreeAssignments.length >= 3 || available.length === 0;
      priorityButton.textContent = topThreeAssignments.length >= 3 ? "Top 3 Full" : "Add Priority";
    }

    renderPriorityPicker(state, topThreeIds);
    const overduePanel = document.querySelector(".overdue-panel");
    const overdueList = document.querySelector("[data-overdue-list]");
    if (overduePanel && overdueList) {
      overduePanel.hidden = overdue.length === 0;
      setText("#overdue-heading", `${overdue.length} ${overdue.length === 1 ? "item" : "items"} slipped. No stress, pick a new day.`);
      if (overdue.length) {
        overdueList.replaceChildren(...overdue.map((assignment) => todayAssignmentRecord(state, assignment)));
      }
    }

    const focusMinutes = state.settings.focusDuration;
    const activeSessionAssignment = state.activeFocusSession && state.activeFocusSession.assignmentId
      ? state.assignments.find((assignment) => assignment.id === state.activeFocusSession.assignmentId)
      : null;
    const oneThingAssignment = todayPlan.oneThingAssignmentId
      ? state.assignments.find((assignment) => assignment.id === todayPlan.oneThingAssignmentId && !assignmentIsComplete(assignment))
      : null;
    const focusCardAssignment = activeSessionAssignment || oneThingAssignment || null;
    const heroFocusCta = document.querySelector("[data-today-focus-cta]");
    if (heroFocusCta) {
      heroFocusCta.toggleAttribute("data-start-focus", Boolean(focusCardAssignment && !state.activeFocusSession));
      if (focusCardAssignment && !state.activeFocusSession) {
        heroFocusCta.setAttribute("data-start-focus", focusCardAssignment.id);
      } else {
        heroFocusCta.removeAttribute("data-start-focus");
      }
      heroFocusCta.querySelector("span").textContent = state.activeFocusSession ? "Return to Focus" : "Start Focus";
    }

    const upcomingPanel = document.querySelector('[aria-labelledby="upcoming-heading"]');
    const upcomingList = upcomingPanel?.querySelector(".record-list");
    if (upcomingPanel && upcomingList) {
      upcomingPanel.hidden = !upcoming.length;
      if (upcoming.length) {
        const visibleUpcoming = upcoming.slice(0, 5).map((assignment) => assignmentRecord(state, assignment, "upcoming"));
        if (upcoming.length > 5) {
          visibleUpcoming.push(createElement("a", { className: "text-link today-more-link", href: "#assignments", text: "View all assignments" }));
        }
        upcomingList.replaceChildren(...visibleUpcoming);
      }
    }

    const examPanel = document.querySelector('[aria-labelledby="exam-preview-heading"]');
    const countdownList = examPanel?.querySelector(".countdown-list");
    if (examPanel && countdownList) {
      const exams = upcomingExamAssignments(state).filter((assignment) => {
        const days = daysUntil(assignment.dueDate);
        return days !== null && days <= 7;
      }).slice(0, 3);
      examPanel.hidden = !exams.length;

      if (exams.length) {
        countdownList.replaceChildren(...exams.map((assignment) => {
          const label = countdownLabel(assignment.dueDate);
          const labelParts = label.split(" ");
          return createElement("article", { className: "countdown-strip" }, [
            createElement("div", {}, [
              createElement("strong", { text: labelParts[0] || "--" }),
              createElement("span", { text: labelParts.slice(1).join(" ") })
            ]),
            createElement("p", {}, [
              createElement("b", { text: assignment.title }),
              document.createElement("br"),
              document.createTextNode(`${courseName(state, assignment.courseId)} - ${friendlyDateLabel(assignment.dueDate)}`)
            ])
          ]);
        }));
      }
    }

    renderTodayWeeklyFocus(state, weekDays);
  }

  function getDailyPlan(state) {
    const plan = state.dailyPlan && state.dailyPlan.date === currentTodayKey() ? state.dailyPlan : {};
    return {
      date: currentTodayKey(),
      topThree: Array.isArray(plan.topThree) ? plan.topThree : [],
      energy: ["low", "okay", "good"].includes(plan.energy) ? plan.energy : null,
      oneThingAssignmentId: plan.oneThingAssignmentId || null
    };
  }

  function summaryMetric(value, label, iconName, context) {
    return createElement("span", { className: `daily-summary__metric daily-summary__metric--${iconName}` }, [
      createElement("span", { className: "daily-summary__icon-tile" }, [
        iconName ? createSvgIcon(iconName, "daily-summary__icon") : document.createTextNode("")
      ]),
      createElement("span", { className: "daily-summary__copy" }, [
        createElement("strong", { text: value }),
        createElement("small", { text: label }),
        context ? createElement("em", { text: context }) : document.createTextNode("")
      ])
    ]);
  }

  function renderEnergy(plan, state) {
    document.querySelectorAll("[data-set-energy]").forEach((button) => {
      const active = button.dataset.setEnergy === plan.energy;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const helper = document.querySelector("[data-energy-helper]");
    if (helper) {
      const labels = { low: "Low energy days still count. Pick something small.", okay: "Okay is enough. Choose one steady task.", good: "Good energy. A deeper focus block may fit today." };
      helper.textContent = plan.energy ? labels[plan.energy] : "Optional. Use this to choose work that fits today.";
    }
  }

  function suggestOneThingAssignment(assignments, energy) {
    return assignments.slice().sort((a, b) => {
      if (energy === "low") {
        const effort = (Number(a.estimatedMinutes) || Number.POSITIVE_INFINITY) - (Number(b.estimatedMinutes) || Number.POSITIVE_INFINITY);
        if (effort !== 0) return effort;
      }
      const overdueDifference = Number(isPast(a.dueDate)) - Number(isPast(b.dueDate));
      if (overdueDifference !== 0) return -overdueDifference;
      const todayDifference = Number(isToday(a.dueDate)) - Number(isToday(b.dueDate));
      if (todayDifference !== 0) return -todayDifference;
      const dueDifference = dueSortValue(a) - dueSortValue(b);
      if (dueDifference !== 0) return dueDifference;
      return (Number(a.estimatedMinutes) || Number.POSITIVE_INFINITY) - (Number(b.estimatedMinutes) || Number.POSITIVE_INFINITY);
    })[0] || null;
  }
  function renderOneThing(state, plan) {
    const container = document.querySelector("[data-one-thing]");
    if (!container) return;
    const session = state.activeFocusSession;

    if (session) {
      const assignment = state.assignments.find((item) => item.id === session.assignmentId) || null;
      const remainingSeconds = Math.max(0, activeFocusRemainingSeconds(session));
      const title = assignment ? assignment.title : "Focus session running";
      const details = assignment
        ? `${courseName(state, assignment.courseId)} - ${formatTimer(remainingSeconds)} remaining`
        : `${formatTimer(remainingSeconds)} remaining`;

      container.replaceChildren(
        createElement("div", { className: "one-thing-card focus-now-card one-thing-card--active" }, [
          createElement("div", { className: "one-thing-card__body focus-now-card__body" }, [
            createElement("div", { className: "focus-now-card__lead" }, [
              createElement("span", { className: "today-icon-tile today-icon-tile--sage" }, [
                createSvgIcon("target", "ui-icon")
              ]),
              createElement("div", {}, [
                createElement("p", { className: "eyebrow", text: "Focus in progress" }),
                createElement("strong", { className: "focus-now-card__title", text: title }),
                createElement("small", { text: details })
              ])
            ]),
            createElement("p", { className: "helper-text", text: "Stay with the current block, then come back here for the next small step." })
          ]),
          createElement("div", { className: "focus-now-card__controls" }, [
            createElement("div", { className: "focus-mini-card", "aria-label": `${formatTimer(remainingSeconds)} remaining in the active focus block` }, [
              createElement("span", { className: "focus-mini-ring", "aria-hidden": "true" }, [
                createElement("strong", { text: formatTimer(remainingSeconds) })
              ]),
              createElement("div", { className: "focus-mini-card__copy" }, [
                createElement("strong", { text: "Current block" }),
                createElement("small", { text: session.isPaused ? "Paused" : "In progress" })
              ])
            ]),
            createElement("div", { className: "button-row" }, [
              createElement("a", { className: "button button--primary", href: "#focus", text: "Return to Focus" })
            ])
          ])
        ])
      );
      return;
    }

    const active = activeAssignments(state).sort(sortAssignments);
    const selected = active.find((assignment) => assignment.id === plan.oneThingAssignmentId) || suggestOneThingAssignment(active, plan.energy);

    if (!active.length) {
      container.replaceChildren(
        createElement("div", { className: "one-thing-card focus-now-card one-thing-card--empty" }, [
          createElement("div", { className: "focus-now-card__lead" }, [
            createElement("span", { className: "today-icon-tile today-icon-tile--sage" }, [
              createSvgIcon("target", "ui-icon")
            ]),
            createElement("div", {}, [
              createElement("p", { className: "eyebrow", text: "Focus now" }),
              createElement("strong", { className: "focus-now-card__title", text: "Choose one thing to make today lighter." }),
              createElement("small", { text: "Add an assignment first. No need to do everything today." })
            ])
          ])
        ])
      );
      return;
    }

    const microsteps = selected
      ? (selected.subtasks || []).slice(0, 3)
      : [];
    const completedSteps = selected ? (selected.subtasks || []).filter((subtask) => subtask.completed).length : 0;
    const totalSteps = selected ? (selected.subtasks || []).length : 0;
    const focusMinutes = Number(state.settings.focusDuration) || 25;
    const stepText = totalSteps
      ? `${completedSteps} of ${totalSteps} steps done`
      : "No steps added yet";

    container.replaceChildren(
      createElement("div", { className: `one-thing-card focus-now-card${selected ? "" : " one-thing-card--empty"}` }, [
        createElement("div", { className: "one-thing-card__body focus-now-card__body" }, [
          createElement("div", { className: "focus-now-card__lead" }, [
            createElement("span", { className: "today-icon-tile today-icon-tile--sage" }, [
              createSvgIcon("target", "ui-icon")
            ]),
            createElement("div", {}, [
              createElement("p", { className: "eyebrow", text: "Focus now" }),
              selected
                ? createElement("strong", { className: "focus-now-card__title", text: selected.title })
                : createElement("strong", { className: "focus-now-card__title", text: "Choose one thing to make today lighter." }),
              selected
                ? createElement("small", { text: `${courseName(state, selected.courseId)} - ${friendlyDateLabel(selected.dueDate)} - ${priorityLabel(selected.priority)} priority` })
                : createElement("small", { text: "No need to do everything today." })
            ])
          ]),
          selected ? createElement("div", { className: "focus-now-card__steps", "aria-label": stepText }, [
            createElement("span", { className: "status status--progress", text: stepText }),
            microsteps.length
              ? createElement("ul", { className: "focus-now-steps" }, microsteps.map((subtask) => createElement("li", { className: subtask.completed ? "is-done" : "" }, [
                createElement("span", { className: "focus-now-step__check", "aria-hidden": "true", text: subtask.completed ? "done" : "" }),
                createElement("span", { text: subtask.title || "Untitled step" })
              ])))
              : createElement("p", { className: "helper-text", text: "Break this assignment into steps when you want a smaller next move." })
          ]) : document.createTextNode("")
        ]),
        createElement("div", { className: "focus-now-card__controls" }, [
          selected ? createElement("div", { className: "focus-mini-card", "aria-label": `${focusMinutes} minute focus block` }, [
            createElement("span", { className: "focus-mini-ring", "aria-hidden": "true" }, [
              createElement("strong", { text: `${focusMinutes}:00` })
            ]),
            createElement("div", { className: "focus-mini-card__copy" }, [
              createElement("strong", { text: "Focus block" }),
              createElement("small", { text: `${focusMinutes} min to make starting lighter` })
            ])
          ]) : document.createTextNode(""),
          createElement("label", { for: "one-thing-select" }, [
            document.createTextNode("Choose assignment"),
            createElement("select", { id: "one-thing-select", "data-one-thing-select": "" }, [
              createElement("option", { value: "", text: "Choose assignment", selected: !selected }),
              ...active.map((assignment) => createElement("option", { value: assignment.id, text: assignment.title, selected: selected && assignment.id === selected.id }))
            ])
          ]),
          createElement("div", { className: "button-row" }, [
            selected ? createElement("button", { className: "button button--primary", type: "button", "data-start-focus": selected.id, text: "Start focus" }) : document.createTextNode(""),
            selected ? createElement("button", { className: "button button--ghost", type: "button", "data-change-one-thing": "", text: "Change task" }) : document.createTextNode(""),
            selected ? createElement("a", { className: "button button--ghost", href: "#assignment-detail", "data-open-assignment-detail": selected.id, text: "Break into steps" }) : document.createTextNode("")
          ])
        ])
      ])
    );
  }

  function renderEnergyFit(state, plan) {
    const panel = document.querySelector(".energy-fit-panel");
    if (!panel) return;
    const energyMap = { low: "low", okay: "medium", good: "high" };
    const required = energyMap[plan.energy || ""];
    const matches = required ? activeAssignments(state).filter((assignment) => assignment.energyRequired === required).slice(0, 3) : [];
    panel.hidden = matches.length === 0;
    const list = panel.querySelector(".record-list");
    if (list && matches.length) {
      list.replaceChildren(...matches.map((assignment) => todayAssignmentRecord(state, assignment)));
    }
  }

  function renderTodayWeeklyFocus(state, weekDays) {
    const weekStrip = document.querySelector("[data-today-weekly-focus]");
    const summary = document.querySelector("[data-today-weekly-focus-summary]");
    if (!weekStrip && !summary) return;

    const activity = getWeeklyFocusActivity(state.focusSessions, weekDays);
    const totalSeconds = activity.reduce((sum, day) => sum + day.seconds, 0);
    const maxMinutes = Math.max(...activity.map((day) => day.minutes), 0);

    if (weekStrip) {
      weekStrip.replaceChildren(...activity.map((day) => {
        const height = maxMinutes ? Math.max(14, Math.round((day.minutes / maxMinutes) * 100)) : 0;
        const valueText = `${day.label} - ${formatFocusDuration(day.seconds)} focused`;
        return createElement("span", { className: day.minutes ? "week-strip__day" : "week-strip__day week-strip__day--empty", style: { "--activity-height": `${height}%` }, "aria-label": valueText }, [
          createElement("em", { className: "sr-only", text: valueText }),
          createElement("i", { "aria-hidden": "true" }),
          createElement("b", { text: day.shortLabel }),
          createElement("small", { text: day.minutes ? `${day.minutes}m` : "0" })
        ]);
      }));
    }

    const weeklyPanel = document.querySelector(".weekly-focus-panel");
    if (weeklyPanel) weeklyPanel.hidden = totalSeconds === 0;
    if (summary) {
      summary.textContent = totalSeconds ? `${formatFocusDuration(totalSeconds)} focused this week.` : "";
    }
  }

  function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
  }

  function todaySummary(overdue, dueToday, topThreeAssignments) {
    if (overdue.length) {
      return `You have ${overdue.length} overdue ${overdue.length === 1 ? "assignment" : "assignments"} that ${pluralize(overdue.length, "needs", "need")} attention.`;
    }
    if (dueToday.length) {
      return `You have ${dueToday.length} ${dueToday.length === 1 ? "thing" : "things"} due today.`;
    }
    if (topThreeAssignments.length) {
      return `You have ${topThreeAssignments.length} ${topThreeAssignments.length === 1 ? "thing" : "things"} to focus on today.`;
    }
    return "You're all caught up for today.";
  }

  function courseName(state, courseId) {
    const course = findCourse(state, courseId);
    return course ? course.name : "No course";
  }

  function formatFocusDuration(seconds) {
    const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
    const totalMinutes = Math.round(safeSeconds / 60);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  function formatEstimate(minutes) {
    const value = Math.round(Number(minutes) || 0);
    if (value <= 0) return "";
    if (value < 60) return `~${value}m`;
    const hours = Math.floor(value / 60);
    const remainder = value % 60;
    return remainder ? `~${hours}h ${remainder}m` : `~${hours}h`;
  }

  function formatProgressDate(value, prefix) {
    const date = timestampDate(value);
    if (!date) return prefix ? `${prefix} date unavailable` : "Date unavailable";
    const key = localDateKey(date);
    const today = localDateKey(new Date());
    const yesterday = localDateKey(addLocalDays(new Date(), -1));
    const label = key === today
      ? "Today"
      : key === yesterday
        ? "Yesterday"
        : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return prefix ? `${prefix} ${label}` : label;
  }

  function isDateKeyInRange(key, startKey, endKey) {
    return Boolean(key) && key >= startKey && key <= endKey;
  }

  function rangeStartKey(range) {
    const today = new Date();
    if (range === "month") {
      return localDateKey(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    if (range === "week") {
      return getWeekDays(today)[0].key;
    }
    return "";
  }

  function isCompletedFocusSession(session) {
    return session && session.status === "completed" && Number(session.actualDurationSeconds) > 0;
  }

  function getCompletedAssignmentsThisWeek(assignments, weekDays) {
    const startKey = weekDays[0].key;
    const endKey = weekDays[weekDays.length - 1].key;
    return (assignments || []).filter((assignment) => {
      return assignment.completed === true && isDateKeyInRange(timestampDateKey(assignment.completedAt), startKey, endKey);
    });
  }

  function getFocusSessionsThisWeek(focusSessions, weekDays) {
    const startKey = weekDays[0].key;
    const endKey = weekDays[weekDays.length - 1].key;
    return (focusSessions || []).filter((session) => {
      return isCompletedFocusSession(session) && isDateKeyInRange(timestampDateKey(session.completedAt), startKey, endKey);
    });
  }

  function getTotalFocusSecondsThisWeek(focusSessions, weekDays) {
    return getFocusSessionsThisWeek(focusSessions, weekDays)
      .reduce((total, session) => total + Math.max(0, Number(session.actualDurationSeconds) || 0), 0);
  }

  function getFocusSessionsForDate(focusSessions, key) {
    return (focusSessions || []).filter((session) => {
      return isCompletedFocusSession(session) && timestampDateKey(session.completedAt) === key;
    });
  }

  function getCurrentStreak(assignments, focusSessions) {
    const activeDates = new Set();

    (assignments || []).forEach((assignment) => {
      if (assignment.completed === true) {
        const key = timestampDateKey(assignment.completedAt);
        if (key) activeDates.add(key);
      }
    });

    (focusSessions || []).forEach((session) => {
      if (isCompletedFocusSession(session)) {
        const key = timestampDateKey(session.completedAt);
        if (key) activeDates.add(key);
      }
    });

    if (!activeDates.size) return 0;

    const today = new Date();
    let cursor = localDateKey(today);
    if (!activeDates.has(cursor)) {
      cursor = localDateKey(addLocalDays(today, -1));
      if (!activeDates.has(cursor)) return 0;
    }

    let streak = 0;
    let date = parseDateKey(cursor);
    while (date && activeDates.has(localDateKey(date))) {
      streak += 1;
      date = addLocalDays(date, -1);
    }
    return streak;
  }

  function getWeeklyFocusActivity(focusSessions, weekDays) {
    return weekDays.map((day) => {
      const seconds = (focusSessions || []).reduce((total, session) => {
        if (!isCompletedFocusSession(session) || timestampDateKey(session.completedAt) !== day.key) return total;
        return total + Math.max(0, Number(session.actualDurationSeconds) || 0);
      }, 0);
      return {
        date: day.key,
        label: day.label,
        shortLabel: day.shortLabel,
        seconds,
        minutes: Math.round(seconds / 60)
      };
    });
  }

  function getRecentCompletedAssignments(assignments) {
    return (assignments || [])
      .filter((assignment) => assignment.completed === true && timestampDate(assignment.completedAt))
      .sort((a, b) => timestampDate(b.completedAt).getTime() - timestampDate(a.completedAt).getTime())
      .slice(0, 5);
  }

  function getRecentFocusSessions(focusSessions) {
    return (focusSessions || [])
      .filter((session) => isCompletedFocusSession(session) && timestampDate(session.completedAt))
      .sort((a, b) => timestampDate(b.completedAt).getTime() - timestampDate(a.completedAt).getTime())
      .slice(0, 5);
  }

  function getMomentumSummary(state, weekDays) {
    if (!momentum) {
      return {
        enabled: false,
        showStreaks: true,
        total: 0,
        weekly: 0,
        target: 0,
        recommended: 0,
        level: { name: "Starting", min: 0 },
        currentStreak: 0,
        bestStreak: 0
      };
    }
    const gamification = momentum.normalizeGamification(state.gamification);
    const weeklyGoal = momentum.getWeeklyGoal(state, weekDays);
    const weekly = momentum.momentumForDateRange(state, weekDays[0].key, weekDays[weekDays.length - 1].key);
    const total = momentum.totalMomentum(state);
    return {
      enabled: gamification.enabled,
      showStreaks: gamification.showStreaks,
      total,
      weekly,
      target: weeklyGoal.target,
      recommended: weeklyGoal.recommended,
      level: momentum.getMomentumLevel(total),
      currentStreak: getCurrentStreak(state.assignments, state.focusSessions),
      bestStreak: momentum.bestStreak(state.assignments, state.focusSessions)
    };
  }

  function renderMomentumProgress(state, weekDays) {
    const section = document.querySelector("[data-momentum-section]");
    const container = document.querySelector("[data-momentum-progress]");
    if (!section || !container) return;
    const summary = getMomentumSummary(state, weekDays);
    section.hidden = false;

    if (!summary.enabled) {
      container.replaceChildren(emptyState("Momentum is off.", "Turn it on in Settings if you want gentle progress feedback.", true));
      return;
    }

    const percent = summary.target ? Math.min(100, Math.round((summary.weekly / summary.target) * 100)) : 0;
    container.replaceChildren(
      createElement("div", { className: "momentum-summary" }, [
        createElement("div", { className: "momentum-summary__main" }, [
          createElement("span", { className: "metric-card__label" }, [
            createSvgIcon("target", "ui-icon metric-card__icon"),
            document.createTextNode("This week")
          ]),
          createElement("strong", { text: `${summary.weekly} / ${summary.target}` }),
          createElement("p", { text: `Recommended target: ${summary.recommended} Momentum.` })
        ]),
        createElement("div", { className: "step-preview momentum-progress", "aria-label": `Weekly Momentum: ${summary.weekly} of ${summary.target}` }, [
          createElement("span", { style: { width: `${percent}%` } })
        ])
      ]),
      createElement("div", { className: "momentum-stats" }, [
        momentumStat("Level", summary.level.name, "trend"),
        momentumStat("Total Momentum", String(summary.total), "spark"),
        momentumStat("Current Streak", summary.showStreaks ? (summary.currentStreak ? `${summary.currentStreak} day${summary.currentStreak === 1 ? "" : "s"}` : "Start today") : "Hidden", "flame"),
        momentumStat("Best Streak", summary.showStreaks ? (summary.bestStreak ? `${summary.bestStreak} day${summary.bestStreak === 1 ? "" : "s"}` : "No streak yet") : "Hidden", "target")
      ])
    );
  }

  function momentumStat(label, value, icon) {
    return createElement("article", { className: "momentum-stat" }, [
      createElement("span", { className: "metric-card__label" }, [
        createSvgIcon(icon, "ui-icon metric-card__icon"),
        document.createTextNode(label)
      ]),
      createElement("strong", { text: value })
    ]);
  }

  function getTimePerCourse(state, range) {
    const startKey = rangeStartKey(range);
    const courseMap = new Map();
    sortedCourses(state).forEach((course, index) => {
      courseMap.set(course.id, {
        id: course.id,
        label: course.code || course.name,
        name: course.name,
        tone: normalizedCourseTone(course, index),
        seconds: 0
      });
    });
    courseMap.set("none", { id: "none", label: "No course", name: "No course", tone: "neutral", seconds: 0 });

    (state.focusSessions || []).forEach((session) => {
      if (!isCompletedFocusSession(session)) return;
      const key = timestampDateKey(session.completedAt);
      if (startKey && (!key || key < startKey)) return;
      const assignment = state.assignments.find((item) => item.id === session.assignmentId);
      const courseId = assignment && assignment.courseId && courseMap.has(assignment.courseId) ? assignment.courseId : "none";
      courseMap.get(courseId).seconds += Math.max(0, Number(session.actualDurationSeconds) || 0);
    });

    return Array.from(courseMap.values())
      .filter((item) => item.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds);
  }

  function getCompletionCounts(assignments) {
    return (assignments || []).reduce((counts, assignment) => {
      const status = assignmentStatus(assignment);
      if (status === "complete" || status === "submitted") counts.completed += 1;
      else if (status === "inProgress") counts.inProgress += 1;
      else counts.notStarted += 1;
      return counts;
    }, { completed: 0, inProgress: 0, notStarted: 0 });
  }

  function renderPriorityPicker(state, topThreeIds) {
    const select = document.querySelector("#priority-assignment");
    const saveButton = document.querySelector("[data-save-priority]");
    const formAlert = document.querySelector("#priority-form-error");
    if (!select) return;
    const options = activeAssignments(state).filter((assignment) => !topThreeIds.includes(assignment.id));
    const isFull = topThreeIds.length >= 3;

    select.replaceChildren(
      createElement("option", { value: "", text: isFull ? "Top 3 is full" : options.length ? "Choose an assignment" : "No active assignments available" }),
      ...options.map((assignment) => createElement("option", { value: assignment.id, text: `${assignment.title} - ${friendlyDateLabel(assignment.dueDate)}` }))
    );
    select.disabled = isFull || options.length === 0;
    if (saveButton) saveButton.disabled = isFull || options.length === 0;
    if (formAlert) {
      formAlert.textContent = isFull ? "Remove a priority before adding another." : "";
      formAlert.hidden = !isFull;
    }
  }

  function todayAssignmentRecord(state, assignment) {
    const completed = assignmentIsComplete(assignment);
    const actions = [
      createElement("button", { className: "button button--secondary button--compact", type: "button", "data-start-focus": assignment.id, text: "Focus" }),
      createElement("button", { className: completed ? "button button--ghost button--compact" : "button button--secondary button--compact", type: "button", "data-toggle-assignment-complete": assignment.id, text: completed ? "Reopen" : "Complete" })
    ];
    if (!completed && isPast(assignment.dueDate)) {
      actions.unshift(createElement("button", { className: "button button--ghost button--compact", type: "button", "data-move-tomorrow": assignment.id, text: "Move to tomorrow" }));
    }
    return createTaskRow(state, assignment, {
      className: `today-record${completed ? " today-record--complete" : ""}`,
      checkboxId: `today-task-${assignment.id}`,
      actions
    });
  }

  function assignmentRecord(state, assignment, context) {
    const prefix = context || "related";
    return createTaskRow(state, assignment, {
      className: "task-row--compact",
      compact: true,
      checkboxId: `${prefix}-task-${assignment.id}`
    });
  }

  function assignmentCard(state, assignment) {
    const percent = progressPercent(assignment);
    const subtasks = (assignment.subtasks || []).slice().sort((a, b) => a.position - b.position);
    const visibleSubtasks = subtasks.slice(0, 5);
    const completeSteps = subtasks.filter((subtask) => subtask.completed).length;
    const completed = assignmentIsComplete(assignment);
    const course = findCourse(state, assignment.courseId);
    const tone = courseTone(state, assignment.courseId);
    const due = dueInfo(assignment);
    const timeEstimate = formatEstimate(assignment.estimatedMinutes);
    const stepCount = subtasks.length;

    return createElement("article", { className: `assignment-card assignment-card--${tone}${completed ? " is-done" : ""}`, "data-assignment-id": assignment.id }, [
      createElement("div", { className: "assignment-card__topline" }, [
        createElement("span", { className: `course-chip course-chip--${tone}`, text: course ? (course.code || course.name) : "No course" }),
        createElement("span", { className: due.className, text: friendlyDateLabel(assignment.dueDate) })
      ]),
      createElement("div", { className: "assignment-card__body" }, [
        createElement("a", { className: "assignment-card__title", href: "#assignment-detail", "data-open-assignment-detail": assignment.id, text: assignment.title || "Untitled assignment" }),
        createElement("div", { className: "assignment-card__meta" }, [
          createElement("span", { text: typeLabel(assignment.type) }),
          timeEstimate ? createElement("span", { text: timeEstimate }) : document.createTextNode(""),
          assignment.dueDate ? createElement("span", { text: formatShortDate(assignment.dueDate) }) : document.createTextNode("")
        ])
      ]),
      stepCount
        ? createElement("div", { className: "assignment-card__steps" }, [
          createElement("div", { className: "assignment-card__step-header" }, [
            createElement("span", { text: "Checklist steps" }),
            createElement("strong", { text: `${completeSteps}/${stepCount}` })
          ]),
          createElement("ul", {}, [
            ...visibleSubtasks.map((subtask) => createElement("li", { className: subtask.completed ? "is-done" : "" }, [
              createElement("span", { className: "assignment-card__step-state", text: subtask.completed ? "Done" : "Next" }),
              createElement("span", { text: subtask.title })
            ])),
            stepCount > visibleSubtasks.length ? createElement("li", { className: "assignment-card__more", text: `${stepCount - visibleSubtasks.length} more steps` }) : document.createTextNode("")
          ]),
          createElement("div", { className: "step-preview", "aria-label": `${percent} percent complete` }, [
            createElement("span", { style: { width: `${percent}%` } })
          ])
        ])
        : createElement("p", { className: "assignment-card__empty-steps", text: "No checklist steps yet." }),
      createElement("div", { className: "assignment-card__footer" }, [
        renderStatus(assignment),
        createElement("div", { className: "assignment-card__actions" }, [
          createElement("button", { className: "button button--ghost button--compact", type: "button", "data-toggle-assignment-complete": assignment.id, text: completed ? "Reopen" : "Complete" }),
          createElement("a", { className: "button button--secondary button--compact", href: "#assignment-detail", "data-open-assignment-detail": assignment.id, text: "Open" }),
          createElement("button", { className: "button button--ghost button--compact", type: "button", "data-start-focus": assignment.id, disabled: completed, text: "Focus" }),
          createElement("button", { className: "button button--ghost button--compact", type: "button", "data-edit-assignment": assignment.id, text: "Edit" })
        ])
      ])
    ]);
  }

  function createTaskRow(state, assignment, options) {
    const completed = assignmentIsComplete(assignment);
    const due = dueInfo(assignment);
    const rowClasses = [
      "task-row",
      options.className || "",
      completed ? "is-done" : "",
      due.className.includes("urgent") ? "task-row--overdue" : ""
    ].filter(Boolean).join(" ");
    const checkboxId = options.checkboxId || `task-${assignment.id}`;
    const meta = [
      courseChip(state, assignment),
      document.createTextNode(` ${typeLabel(assignment.type)} - ${priorityLabel(assignment.priority)} priority`),
      assignment.estimatedMinutes ? createElement("span", { className: "estimate-chip", text: formatEstimate(assignment.estimatedMinutes) }) : document.createTextNode("")
    ];
    const progress = typeof options.progressPercent === "number"
      ? createElement("div", { className: "task-row__progress" }, [
        createElement("div", { className: "step-preview", "aria-label": `${options.progressPercent} percent complete` }, [
          createElement("span", { style: { width: `${options.progressPercent}%` } })
        ]),
        createElement("small", { text: options.stepText || "" })
      ])
      : document.createTextNode("");

    return createElement("article", { className: rowClasses, "data-assignment-id": assignment.id }, [
      createElement("input", {
        id: checkboxId,
        type: "checkbox",
        checked: completed,
        "data-toggle-assignment-complete": assignment.id,
        "aria-label": `${completed ? "Reopen" : "Complete"} ${assignment.title}`
      }),
      createElement("div", { className: "task-row__body" }, [
        createElement("a", { className: "task-row__title", href: "#assignment-detail", "data-open-assignment-detail": assignment.id, text: assignment.title }),
        createElement("span", { className: "task-row__meta" }, meta),
        progress
      ]),
      createElement("div", { className: "task-row__side" }, [
        createElement("span", { className: due.className, text: options.compact ? due.label : friendlyDateLabel(assignment.dueDate) }),
        renderStatus(assignment)
      ]),
      createElement("div", { className: "task-row__actions" }, options.actions || [])
    ]);
  }

  function formatTimeRange(startTime, endTime) {
    if (startTime && endTime) return `${startTime}-${endTime}`;
    if (startTime) return startTime;
    return "Any time";
  }

  function scheduleDayName(day) {
    return String(day || "").toLowerCase();
  }

  function scheduleEvents(state, weekDays) {
    const events = [];
    const weekKeys = new Set(weekDays.map((day) => day.key));

    sortedCourses(state).forEach((course, courseIndex) => {
      const tone = normalizedCourseTone(course, courseIndex);
      (Array.isArray(course.schedule) ? course.schedule : []).forEach((block) => {
        const days = Array.isArray(block.days) ? block.days.map(scheduleDayName) : [];
        weekDays.forEach((day) => {
          if (!days.includes(day.label.toLowerCase())) return;
          events.push({
            id: `class-${course.id}-${block.id || `${day.key}-${block.startTime || "time"}`}`,
            type: "class",
            date: day.key,
            time: formatTimeRange(block.startTime, block.endTime),
            sortTime: block.startTime || "99:99",
            title: course.name,
            detail: course.code || "Class",
            location: block.location || "",
            courseId: course.id,
            tone
          });
        });
      });
    });

    (state.assignments || []).forEach((assignment) => {
      if (!assignment.dueDate || !weekKeys.has(assignment.dueDate)) return;
      const course = findCourse(state, assignment.courseId);
      events.push({
        id: `assignment-${assignment.id}`,
        type: assignment.type === "exam" ? "exam" : "deadline",
        date: assignment.dueDate,
        time: "Due",
        sortTime: "99:98",
        title: assignment.title || "Untitled assignment",
        detail: assignment.type === "exam" ? "Exam" : "Deadline",
        location: course ? (course.code || course.name) : "No course",
        courseId: assignment.courseId || "",
        tone: courseTone(state, assignment.courseId)
      });
    });

    return events
      .filter((event) => {
        if (scheduleFilters.course !== "all" && event.courseId !== scheduleFilters.course) return false;
        if (scheduleFilters.type !== "all" && event.type !== scheduleFilters.type) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.sortTime.localeCompare(b.sortTime) || a.title.localeCompare(b.title));
  }

  function scheduleEventCard(event) {
    const typeLabel = event.type === "class" ? "Class" : event.type === "exam" ? "Exam" : "Deadline";
    return createElement("article", { className: `schedule-event schedule-event--${event.tone}` }, [
      createElement("span", { className: "schedule-event__type", text: typeLabel }),
      createElement("strong", { text: event.title }),
      createElement("span", { text: event.time }),
      event.detail ? createElement("small", { text: event.detail }) : document.createTextNode(""),
      event.location ? createElement("small", { text: event.location }) : document.createTextNode("")
    ]);
  }

  function renderSchedule(state) {
    const weekDays = getScheduleWeekDays(new Date());
    const events = scheduleEvents(state, weekDays);
    const grid = document.querySelector("[data-schedule-grid]");
    const list = document.querySelector("[data-schedule-list]");
    const gridWrap = document.querySelector("[data-schedule-grid-wrap]");
    const listWrap = document.querySelector("[data-schedule-list-wrap]");
    const range = document.querySelector("[data-schedule-range]");
    const courseFilter = document.querySelector("[data-schedule-course-filter]");
    const typeFilter = document.querySelector("[data-schedule-type-filter]");
    const courses = sortedCourses(state);
    const prefersListView = window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
    const effectiveScheduleView = prefersListView ? "list" : scheduleView;

    if (range) {
      range.textContent = `${formatShortDate(weekDays[0].key)} - ${formatShortDate(weekDays[weekDays.length - 1].key)}`;
    }

    if (courseFilter) {
      const selectedCourseExists = state.courses.some((course) => course.id === scheduleFilters.course);
      if (scheduleFilters.course !== "all" && !selectedCourseExists) {
        scheduleFilters.course = "all";
      }
      courseFilter.replaceChildren(
        createElement("option", { value: "all", text: "All courses" }),
        ...courses.map((course) => createElement("option", { value: course.id, text: course.name }))
      );
      courseFilter.value = scheduleFilters.course;
    }

    if (typeFilter) {
      typeFilter.value = scheduleFilters.type;
    }

    document.querySelectorAll("[data-schedule-view]").forEach((button) => {
      const active = button.dataset.scheduleView === effectiveScheduleView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (gridWrap) gridWrap.hidden = effectiveScheduleView !== "grid";
    if (listWrap) listWrap.hidden = effectiveScheduleView !== "list";

    if (grid) {
      grid.replaceChildren(...weekDays.map((day) => {
        const dayEvents = events.filter((event) => event.date === day.key);
        return createElement("section", { className: "schedule-day", "aria-label": day.label }, [
          createElement("div", { className: "schedule-day__header" }, [
            createElement("strong", { text: day.shortLabel }),
            createElement("span", { text: formatShortDate(day.key) })
          ]),
          createElement("div", { className: "schedule-day__events" }, dayEvents.length
            ? dayEvents.map(scheduleEventCard)
            : [emptyState("Open day.", "No classes or deadlines.", true)])
        ]);
      }));
    }

    if (list) {
      const populatedDays = weekDays.map((day) => ({
        day,
        events: events.filter((event) => event.date === day.key)
      }));
      list.replaceChildren(...populatedDays.map(({ day, events: dayEvents }) => createElement("section", { className: "schedule-list-day" }, [
        createElement("h3", { text: day.label }),
        ...(dayEvents.length
          ? dayEvents.map((event) => createElement("div", { className: "schedule-list-row" }, [
            createElement("span", { text: event.time }),
            createElement("div", {}, [
              createElement("strong", { text: event.title }),
              createElement("small", { text: [event.detail, event.location].filter(Boolean).join(" - ") || "No details" })
            ])
          ]))
          : [emptyState("Nothing scheduled.", "No classes or deadlines for this day.", true)])
      ])));
    }
  }

  function renderAssignments(state) {
    const assignmentList = document.querySelector(".assignment-list");
    const empty = document.querySelector("#assignments .empty-state--compact");
    const search = document.querySelector("#assignment-search");
    const clearSearch = document.querySelector("[data-clear-assignment-search]");
    const courseFilter = document.querySelector("#course-filter");
    const sortFilter = document.querySelector("#assignment-sort");
    const modalCourse = document.querySelector("#modal-course");
    const courses = sortedCourses(state);

    if (search && search.value !== assignmentFilters.search) {
      search.value = assignmentFilters.search;
    }

    if (clearSearch) {
      clearSearch.hidden = assignmentFilters.search.length === 0;
    }

    if (courseFilter) {
      const selectedCourseExists = state.courses.some((course) => course.id === assignmentFilters.course);
      if (assignmentFilters.course !== "all" && !selectedCourseExists) {
        assignmentFilters.course = "all";
      }

      courseFilter.replaceChildren(
        createElement("option", { value: "all", text: "All Courses" }),
        ...courses.map((course) => createElement("option", { value: course.id, text: course.name }))
      );
      courseFilter.value = assignmentFilters.course;
    }

    if (sortFilter) {
      sortFilter.value = assignmentFilters.sort;
    }

    document.querySelectorAll("[data-status-filter]").forEach((button) => {
      const active = button.dataset.statusFilter === assignmentFilters.status;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (modalCourse) {
      modalCourse.replaceChildren(
        createElement("option", { value: "", text: "No course" }),
        ...courses.map((course) => createElement("option", { value: course.id, text: course.name }))
      );
    }

    if (!assignmentList) return;
    const assignments = filteredAssignments(state);
    assignmentList.replaceChildren(...assignments.map((assignment) => assignmentCard(state, assignment)));

    if (!empty) return;
    if (!state.assignments.length) {
      empty.querySelector("strong").textContent = "No assignments yet.";
      empty.querySelector("p").textContent = "Add your first assignment when you are ready to plan real coursework.";
      toggleElement(empty, true);
      return;
    }

    if (!assignments.length) {
      const hasCompleted = state.assignments.some(assignmentIsComplete);
      empty.querySelector("strong").textContent = assignmentFilters.status === "completed" && !hasCompleted
        ? "No completed assignments yet."
        : "No assignments match these filters.";
      empty.querySelector("p").textContent = "Clear search or filters to see more coursework.";
      toggleElement(empty, true);
      return;
    }

    toggleElement(empty, false);
  }

  function renderAssignmentDetail(state) {
    const assignment = getSelectedAssignment(state);
    const titleRow = document.querySelector(".assignment-detail-panel .detail-title-row");
    const meta = document.querySelector(".detail-meta");
    const note = document.querySelector(".detail-note");
    const percentText = document.querySelector(".progress-summary strong");
    const progressLabel = document.querySelector(".progress-summary span");
    const progressBar = document.querySelector(".progress-summary .step-preview span");
    const stepList = document.querySelector(".step-list");
    const next = document.querySelector('[aria-labelledby="subtasks-heading"] .status');
    const subtaskForm = document.querySelector("[data-subtask-form]");
    const subtaskInput = document.querySelector("#new-subtask");
    const subtaskButton = subtaskForm ? subtaskForm.querySelector("button") : null;

    if (!assignment) {
      if (titleRow) {
        titleRow.replaceChildren(createElement("div", {}, [
          createElement("p", { className: "eyebrow", text: "Assignment detail" }),
          createElement("h2", { text: "No assignment selected" })
        ]));
      }
      if (meta) meta.replaceChildren(createElement("span", { className: "status", text: "Empty" }));
      if (note) note.textContent = "Assignments you add later will show notes, progress, and smaller steps here.";
      if (percentText) percentText.textContent = "0%";
      if (progressLabel) progressLabel.textContent = "complete";
      if (progressBar) progressBar.style.width = "0%";
      if (stepList) stepList.replaceChildren(emptyListItem("No subtasks yet.", "Add an assignment before breaking work into steps."));
      if (next) next.textContent = "Next: Add an assignment";
      if (subtaskForm) subtaskForm.dataset.assignmentId = "";
      if (subtaskInput) subtaskInput.disabled = true;
      if (subtaskButton) subtaskButton.disabled = true;
      return;
    }

    const percent = progressPercent(assignment);
    const completeSteps = (assignment.subtasks || []).filter((subtask) => subtask.completed).length;
    const completed = assignmentIsComplete(assignment);
    selectedAssignmentId = assignment.id;

    if (titleRow) {
      titleRow.replaceChildren(
        createElement("div", {}, [
          createElement("p", { className: "eyebrow", text: "Assignment detail" }),
          createElement("h2", { text: assignment.title })
        ]),
        createElement("div", { className: "detail-actions" }, [
          createElement("a", { className: "button button--primary", href: "#focus", "data-start-focus": assignment.id, text: "Start Focus Session" }),
          createElement("button", { className: "button button--secondary", type: "button", "data-edit-assignment": assignment.id, text: "Edit" }),
          createElement("button", { className: "button button--ghost", type: "button", "data-toggle-assignment-complete": assignment.id, text: completed ? "Reopen" : "Complete" }),
          createElement("button", { className: "button button--ghost", type: "button", "data-delete-assignment": assignment.id, text: "Delete" })
        ])
      );
    }

    if (meta) {
      meta.replaceChildren(
        courseChip(state, assignment),
        renderDueBadge(assignment),
        assignment.estimatedMinutes ? createElement("span", { className: "estimate-chip", text: formatEstimate(assignment.estimatedMinutes) }) : document.createTextNode(""),
        renderPriority(assignment.priority),
        createElement("span", { className: "status", text: typeLabel(assignment.type) }),
        renderStatus(assignment)
      );
    }
    if (note) note.textContent = assignment.notes || "No notes yet.";
    if (percentText) percentText.textContent = `${percent}%`;
    if (progressLabel) {
      progressLabel.textContent = (assignment.subtasks || []).length
        ? `${completeSteps} of ${assignment.subtasks.length} steps`
        : completed ? "assignment complete" : "no steps yet";
    }
    if (progressBar) progressBar.style.width = `${percent}%`;

    if (stepList) {
      const subtasks = (assignment.subtasks || []).slice().sort((a, b) => a.position - b.position);
      if (!subtasks.length) {
        stepList.replaceChildren(emptyListItem("No subtasks yet.", "Break this into one small next step."));
      } else {
        stepList.replaceChildren(...subtasks.map((subtask) => subtaskRow(assignment, subtask)));
      }
    }

    if (next) {
      const nextStep = (assignment.subtasks || []).find((subtask) => !subtask.completed);
      next.textContent = nextStep ? `Next: ${nextStep.title}` : (assignment.subtasks || []).length ? "All steps complete" : "Next: Add a step";
    }

    if (subtaskForm) subtaskForm.dataset.assignmentId = assignment.id;
    if (subtaskInput) subtaskInput.disabled = false;
    if (subtaskButton) subtaskButton.disabled = false;
  }

  function subtaskRow(assignment, subtask) {
    if (editingSubtaskId === subtask.id) {
      const editInputId = `edit-subtask-${subtask.id}`;
      const errorId = `${editInputId}-error`;
      return createElement("li", { className: subtask.completed ? "is-done" : "" }, [
        createElement("form", { className: "subtask-edit-form", novalidate: "", "data-edit-subtask-form": assignment.id, "data-subtask-id": subtask.id }, [
          createElement("label", { className: "sr-only", for: editInputId, text: "Edit subtask" }),
          createElement("input", { id: editInputId, type: "text", value: subtask.title, "aria-describedby": errorId, "data-edit-subtask-input": "" }),
          createElement("button", { className: "button button--secondary button--compact", type: "submit", text: "Save" }),
          createElement("button", { className: "button button--ghost button--compact", type: "button", "data-cancel-subtask-edit": "", text: "Cancel" }),
          createElement("p", { id: errorId, className: "field-error", hidden: true })
        ])
      ]);
    }

    const inputId = `subtask-${subtask.id}`;
    return createElement("li", { className: subtask.completed ? "is-done" : "" }, [
      createElement("input", { id: inputId, type: "checkbox", checked: subtask.completed, "data-toggle-subtask": assignment.id, "data-subtask-id": subtask.id }),
      createElement("label", { className: "step-title", for: inputId, text: subtask.title }),
      createElement("div", { className: "step-row-actions" }, [
        createElement("button", { className: "button button--ghost button--compact", type: "button", "data-edit-subtask": assignment.id, "data-subtask-id": subtask.id, text: "Edit" }),
        createElement("button", { className: "button button--ghost button--compact", type: "button", "data-delete-subtask": assignment.id, "data-subtask-id": subtask.id, text: "Delete" })
      ])
    ]);
  }

  function renderCourses(state) {
    const grid = document.querySelector(".course-grid");
    if (!grid) return;
    const courses = sortedCourses(state);

    if (!courses.length) {
      grid.replaceChildren(courseEmptyState());
      return;
    }

    grid.replaceChildren(...courses.map((course, index) => {
      const tone = normalizedCourseTone(course, index);
      const assignments = courseAssignments(state, course.id);
      const active = assignments.filter((assignment) => !assignmentIsComplete(assignment));
      const nextAssignment = active.filter((assignment) => assignment.dueDate).sort(sortAssignments)[0];
      return createElement("article", { className: `course-card course-card--${tone}` }, [
        createElement("div", { className: "course-card__header" }, [
          createElement("span", { className: `course-dot course-dot--${tone}`, "aria-hidden": "true" }),
          createElement("span", { className: `course-chip course-chip--${tone}`, text: course.code || course.name })
        ]),
        createElement("h3", { text: course.name }),
        createElement("p", { text: course.instructor ? `Instructor: ${course.instructor}` : course.code ? `Code: ${course.code}` : "No instructor added" }),
        createElement("dl", {}, [
          statPair("Active assignments", String(active.length)),
          statPair("Next deadline", nextAssignment ? dueInfo(nextAssignment).label : "None"),
          statPair("Course code", course.code || "None")
        ]),
        createElement("div", { className: "card-actions" }, [
          createElement("a", { className: "button button--secondary", href: "#course-detail", "data-open-course-detail": course.id, text: "Open detail" }),
          createElement("button", { className: "button button--ghost", type: "button", "data-edit-course": course.id, text: "Edit" }),
          createElement("button", { className: "button button--danger", type: "button", "data-delete-course": course.id, text: "Delete" })
        ])
      ]);
    }));
  }

  function courseEmptyState() {
    return createElement("div", { className: "empty-state" }, [
      createElement("strong", { text: "No courses yet." }),
      createElement("p", { text: "Add your classes to keep assignments organized." }),
      createElement("button", { className: "button button--primary", type: "button", "data-open-modal": "course-modal", text: "Add Course" })
    ]);
  }

  function statPair(label, value) {
    return createElement("div", {}, [
      createElement("dt", { text: label }),
      createElement("dd", { text: value })
    ]);
  }

  function renderCourseDetail(state) {
    const course = getSelectedCourse(state);
    const titleRow = document.querySelector("[data-course-detail-title]");
    const meta = document.querySelector("[data-course-detail-meta]");
    const summary = document.querySelector("[data-course-summary]");
    const list = document.querySelector("[data-course-assignments]");

    if (!course) {
      if (titleRow) {
        titleRow.replaceChildren(createElement("div", {}, [
          createElement("p", { className: "eyebrow", text: "Course detail" }),
          createElement("h2", { text: "No course selected" })
        ]));
      }
      if (meta) meta.replaceChildren(createElement("span", { className: "status", text: "Empty" }));
      if (summary) {
        summary.replaceChildren(
          statPair("Total assignments", "0"),
          statPair("Completed", "0"),
          statPair("Next deadline", "None")
        );
      }
      if (list) {
        list.replaceChildren(emptyState("No assignments for this course.", "Add a course before linking assignments.", true));
      }
      return;
    }

    selectedCourseId = course.id;
    const courses = sortedCourses(state);
    const courseIndex = courses.findIndex((item) => item.id === course.id);
    const tone = normalizedCourseTone(course, courseIndex);
    const assignments = courseAssignments(state, course.id);
    const active = assignments.filter((assignment) => !assignmentIsComplete(assignment));
    const completed = assignments.filter(assignmentIsComplete);
    const nextAssignment = active.filter((assignment) => assignment.dueDate).sort(sortAssignments)[0];
    const nextLabel = nextAssignment ? `${nextAssignment.title} - ${dueInfo(nextAssignment).label}` : "None";

    if (titleRow) {
      titleRow.replaceChildren(
        createElement("div", {}, [
          createElement("p", { className: "eyebrow", text: "Course detail" }),
          createElement("h2", { text: course.name })
        ]),
        createElement("div", { className: "detail-actions" }, [
          createElement("button", { className: "button button--secondary", type: "button", "data-edit-course": course.id, text: "Edit" }),
          createElement("button", { className: "button button--danger", type: "button", "data-delete-course": course.id, text: "Delete" })
        ])
      );
    }

    if (meta) {
      meta.replaceChildren(
        createElement("span", { className: `course-chip course-chip--${tone}`, text: course.code || course.name }),
        createElement("span", { className: "status", text: active.length ? "Active" : "Clear" }),
        course.instructor ? createElement("span", { className: "status", text: course.instructor }) : document.createTextNode("")
      );
    }

    if (summary) {
      summary.replaceChildren(
        statPair("Total assignments", String(assignments.length)),
        statPair("Completed", String(completed.length)),
        statPair("Next deadline", nextLabel),
        statPair("Instructor", course.instructor || "None"),
        statPair("Course code", course.code || "None")
      );
    }

    if (!list) return;
    if (!assignments.length) {
      list.replaceChildren(emptyState("No assignments for this course.", "Choose this course when adding or editing an assignment.", true));
      return;
    }

    list.replaceChildren(...assignments.map((assignment) => assignmentRecord(state, assignment, "course")));
  }

  function renderBrainDump(state) {
    const textarea = document.querySelector("#brain-note");
    const list = document.querySelector(".brain-entry-list");
    const empty = document.querySelector("#brain-dump aside .empty-state");
    const items = state.brainDump.slice().sort((a, b) => {
      const bTime = Date.parse(b.createdAt || b.updatedAt || "");
      const aTime = Date.parse(a.createdAt || a.updatedAt || "");
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });

    if (!list) return;
    if (!items.length) {
      list.replaceChildren();
      toggleElement(empty, true);
      return;
    }

    list.replaceChildren(...items.map((item) => {
      if (editingBrainDumpId === item.id) {
        const inputId = `brain-edit-${item.id}`;
        const errorId = `${inputId}-error`;
        return createElement("article", { className: "brain-entry brain-entry--editing" }, [
          createElement("form", { className: "brain-edit-form", novalidate: "", "data-edit-brain-form": item.id }, [
            createElement("label", { className: "sr-only", for: inputId, text: "Edit Brain Dump item" }),
            createElement("textarea", { id: inputId, rows: "3", value: item.text || "", "aria-describedby": errorId, "data-edit-brain-input": "" }),
            createElement("p", { id: errorId, className: "field-error", hidden: true }),
            createElement("div", { className: "brain-entry__actions" }, [
              createElement("button", { className: "button button--secondary button--compact", type: "submit", text: "Save" }),
              createElement("button", { className: "button button--ghost button--compact", type: "button", "data-cancel-brain-edit": "", text: "Cancel" })
            ])
          ])
        ]);
      }

      const created = formatBrainDate(item.createdAt);
      return createElement("article", { className: "brain-entry" }, [
        createElement("div", { className: "brain-entry__content" }, [
          createElement("strong", { text: item.text || "Untitled thought" }),
          created ? createElement("small", { text: created }) : document.createTextNode("")
        ]),
        createElement("div", { className: "brain-entry__actions" }, [
          createElement("button", { className: "button button--ghost button--compact", type: "button", "data-convert-brain": item.id, text: "Convert" }),
          createElement("button", { className: "button button--ghost button--compact", type: "button", "data-edit-brain": item.id, text: "Edit" }),
          createElement("button", { className: "button button--ghost button--compact", type: "button", "data-delete-brain": item.id, text: "Delete" })
        ])
      ]);
    }));
    toggleElement(empty, false);
  }

  function renderFocus(state) {
    const focusMode = document.querySelector(".focus-mode");
    if (!focusMode) return;
    focusMode.className = "focus-mode focus-mode--idle";

    const session = state.activeFocusSession;
    if (session) {
      renderActiveFocus(state, session, focusMode);
      return;
    }

    const selectedFocusAssignment = getSelectedFocusAssignment(state);
    const recommendations = focusRecommendations(state);
    if (selectedFocusAssignment && !recommendations.some((assignment) => assignment.id === selectedFocusAssignment.id)) {
      recommendations.unshift(selectedFocusAssignment);
      recommendations.length = Math.min(recommendations.length, 6);
    }
    const recentRows = recentFocusRows(state);
    const selectedFocusId = selectedFocusAssignment ? selectedFocusAssignment.id : "";
    focusMode.replaceChildren(
      createElement("div", { className: "focus-heading" }, [
        createElement("p", { className: "eyebrow", text: "Focus" }),
        createElement("h2", { text: "Ready to focus?" }),
        createElement("p", { className: "focus-next", text: "Choose one assignment and one small step." })
      ]),
      recommendations.length
        ? createElement("div", { className: "focus-setup-workspace" }, [
          createElement("section", { className: "focus-picker", "aria-labelledby": "focus-picker-heading" }, [
            createElement("div", { className: "section-heading" }, [
              createElement("div", {}, [
                createElement("p", { className: "eyebrow", text: "Choose what to work on" }),
                createElement("h3", { id: "focus-picker-heading", text: "Assignments" })
              ])
            ]),
            createElement("div", { className: "focus-assignment-list", role: "radiogroup", "aria-label": "Assignments for Focus Mode" },
              recommendations.map((assignment) => focusAssignmentOption(state, assignment, selectedFocusId)))
          ]),
          focusSetupPanel(state, recommendations)
        ])
        : focusEmptySetup()
      ,
      createElement("section", { className: "focus-history focus-history--idle", "aria-labelledby": "focus-today-heading" }, [
        createElement("div", { className: "section-heading" }, [
          createElement("div", {}, [
            createElement("p", { className: "eyebrow", text: "Today" }),
            createElement("h3", { id: "focus-today-heading", text: "Study blocks" })
          ]),
          createElement("span", { className: "status", text: `${getFocusSessionsForDate(state.focusSessions, currentTodayKey()).length} today` })
        ]),
        ...recentRows
      ])
    );
    updateFocusSetupSelection(selectedFocusId);
  }

  function focusRecommendations(state) {
    const topIds = todaysTopThreeIds(state);
    const byId = new Map();
    const add = (assignment) => {
      if (assignment && !assignmentIsComplete(assignment) && !byId.has(assignment.id)) {
        byId.set(assignment.id, assignment);
      }
    };

    topIds.forEach((id) => add(state.assignments.find((assignment) => assignment.id === id)));
    todaysAssignments(state).forEach(add);
    nextSevenAssignments(state).forEach(add);
    activeAssignments(state).sort(sortAssignments).forEach(add);

    return Array.from(byId.values()).slice(0, 6);
  }

  function focusAssignmentOption(state, assignment, selectedFocusId) {
    const incompleteSubtasks = (assignment.subtasks || []).filter((subtask) => !subtask.completed);
    const nextStep = incompleteSubtasks[0];
    const priority = priorityLabel(assignment.priority);
    const selected = selectedFocusId === assignment.id;
    return createElement("label", { className: `focus-assignment-option${selected ? " is-selected" : ""}` }, [
      createElement("input", { type: "radio", name: "focus-assignment", value: assignment.id, checked: selected, "data-focus-assignment-option": "" }),
      createElement("span", { className: "focus-assignment-option__body" }, [
        createElement("strong", { text: assignment.title || "Untitled assignment" }),
        createElement("small", { text: `${courseName(state, assignment.courseId)} - ${friendlyDateLabel(assignment.dueDate)} - ${priority} priority${assignment.estimatedMinutes ? ` - ${formatEstimate(assignment.estimatedMinutes)}` : ""}` }),
        nextStep ? createElement("em", { text: `Next: ${nextStep.title}` }) : createElement("em", { text: "Focus on the assignment" })
      ])
    ]);
  }

  function focusSetupPanel(state, assignments) {
    const focusMinutes = Number(state.settings.focusDuration) || 25;
    const breakMinutes = Number(state.settings.breakDuration) || 5;
    return createElement("section", { className: "focus-setup-panel", "aria-labelledby": "focus-setup-heading" }, [
      createElement("div", {}, [
        createElement("p", { className: "eyebrow", text: "Focus setup" }),
        createElement("h3", { id: "focus-setup-heading", text: "Session" })
      ]),
      createElement("div", { className: "timer-readout timer-readout--setup", text: `${String(focusMinutes).padStart(2, "0")}:00` }),
      createElement("p", { className: "helper-text", text: `${focusMinutes} minute focus / ${breakMinutes} minute break` }),
      createElement("div", { className: "focus-setup-placeholder", "data-focus-setup-placeholder": "" }, [
        createElement("strong", { text: "Choose an assignment" }),
        createElement("p", { text: "Your session details will appear here before you start." })
      ]),
      ...assignments.map((assignment) => focusSetupDetails(state, assignment)),
      createElement("button", { className: "button button--primary", type: "button", "data-focus-start-button": "", "data-start-focus": "", disabled: true, text: "Start Focus" })
    ]);
  }

  function focusSetupDetails(state, assignment) {
    const incompleteSubtasks = (assignment.subtasks || []).filter((subtask) => !subtask.completed);
    const selectId = `focus-subtask-${assignment.id}`;
    const goalId = `focus-goal-${assignment.id}`;
    return createElement("div", { className: "focus-setup-details", "data-focus-setup-details": assignment.id, hidden: true }, [
      createElement("div", { className: "focus-selected-summary" }, [
        createElement("span", { text: "Working on" }),
        createElement("strong", { text: assignment.title || "Untitled assignment" }),
        createElement("small", { text: `${courseName(state, assignment.courseId)} - ${friendlyDateLabel(assignment.dueDate)}${assignment.estimatedMinutes ? ` - ${formatEstimate(assignment.estimatedMinutes)}` : ""}` })
      ]),
      createElement("label", { for: selectId }, [
        document.createTextNode("Current step"),
        createElement("select", { id: selectId, "data-focus-subtask-for": assignment.id }, [
          createElement("option", { value: "", text: "Focus on assignment" }),
          ...incompleteSubtasks.map((subtask, index) => createElement("option", { value: subtask.id, text: subtask.title, selected: index === 0 }))
        ])
      ]),
      createElement("label", { for: goalId }, [
        document.createTextNode("Session goal"),
        createElement("input", { id: goalId, type: "text", maxlength: "120", placeholder: "Finish one small part", "data-session-goal-for": assignment.id })
      ])
    ]);
  }

  function focusEmptySetup() {
    return createElement("section", { className: "focus-empty-setup" }, [
      createElement("div", { className: "empty-state" }, [
        createElement("strong", { text: "You need an active assignment before starting a Focus Session." }),
        createElement("p", { text: "Add an assignment, then come back here to choose when to begin." }),
        createElement("div", { className: "button-row" }, [
          createElement("button", { className: "button button--primary", type: "button", "data-open-modal": "assignment-modal", text: "Add Assignment" }),
          createElement("a", { className: "button button--secondary", href: "#today", text: "Back to Today" })
        ])
      ])
    ]);
  }

  function updateFocusSetupSelection(assignmentId) {
    const selectedId = assignmentId || "";
    selectedFocusAssignmentId = selectedId;
    const startButton = document.querySelector("[data-focus-start-button]");
    const placeholder = document.querySelector("[data-focus-setup-placeholder]");

    document.querySelectorAll("[data-focus-assignment-option]").forEach((input) => {
      const selected = input.value === selectedId;
      input.checked = selected;
      input.closest(".focus-assignment-option")?.classList.toggle("is-selected", selected);
    });

    document.querySelectorAll("[data-focus-setup-details]").forEach((details) => {
      details.hidden = details.dataset.focusSetupDetails !== selectedId;
    });

    if (placeholder) placeholder.hidden = Boolean(selectedId);

    if (startButton) {
      startButton.disabled = !selectedId;
      if (selectedId) {
        startButton.dataset.startFocus = selectedId;
      } else {
        startButton.dataset.startFocus = "";
      }
    }
  }

  function renderActiveFocus(state, session, focusMode) {
    const assignment = state.assignments.find((item) => item.id === session.assignmentId) || null;
    const subtask = assignment && (assignment.subtasks || []).find((item) => item.id === session.subtaskId) || null;
    const nextStep = assignment && (assignment.subtasks || []).find((item) => !item.completed && item.id !== session.subtaskId) || null;
    const isBreak = session.mode === "break";
    const remaining = activeFocusRemainingSeconds(session);
    const isPaused = session.status === "paused";
    const isCompleted = session.status === "completed" || (session.status === "running" && remaining <= 0);
    const title = isBreak ? "Break time" : assignment ? assignment.title : "Deleted assignment";
    const course = assignment ? courseName(state, assignment.courseId) : "Assignment unavailable";
    const currentStep = isBreak ? "Rest before the next block" : subtask ? subtask.title : assignment ? "Focus on the assignment" : "Historical focus target";
    const actualSeconds = Number(session.actualDurationSeconds) || Math.max(0, (Number(session.plannedDurationMinutes) || 25) * 60 - remaining);
    const actualMinutes = Math.max(1, Math.round(actualSeconds / 60));
    const distractions = Array.isArray(session.distractions) ? session.distractions : [];
    const unmovedDistractions = distractions.filter((item) => item.text && !item.movedToBrainDumpId);
    const todaySessions = getFocusSessionsForDate(state.focusSessions, currentTodayKey());
    const todayFocusSeconds = todaySessions.reduce((sum, item) => sum + (Number(item.actualDurationSeconds) || 0), 0);
    const weekDays = getWeekDays(new Date());
    const weekFocusSeconds = getTotalFocusSecondsThisWeek(state.focusSessions, weekDays);
    const currentStreak = getCurrentStreak(state.assignments, state.focusSessions);
    const sessionGoal = session.sessionGoal || "";
    const controls = [];
    focusMode.className = [
      "focus-mode",
      isCompleted ? "focus-mode--complete" : isPaused ? "focus-mode--paused" : "focus-mode--active",
      isBreak ? "focus-mode--break" : ""
    ].filter(Boolean).join(" ");

    if (isCompleted) {
      if (!isBreak && subtask && !subtask.completed) {
        controls.push(createElement("button", { className: "button button--secondary", type: "button", "data-complete-focus-subtask": "", text: "Mark Step Complete" }));
      }
      if (!isBreak) {
        controls.push(createElement("button", { className: "button button--secondary", type: "button", "data-start-break": "", text: "Start Break" }));
      }
      controls.push(createElement("button", { className: "button button--primary", type: "button", "data-finish-focus": "", text: isBreak ? "Finish Break" : "Finish" }));
    } else {
      controls.push(createElement("button", { className: "button button--primary", type: "button", "data-pause-focus": "", hidden: isPaused, text: "Pause" }));
      controls.push(createElement("button", { className: "button button--primary", type: "button", "data-resume-focus": "", hidden: !isPaused, text: "Resume" }));
      controls.push(createElement("button", { className: "button button--secondary", type: "button", "data-complete-focus": "", text: isBreak ? "Complete Break" : "Complete" }));
      controls.push(createElement("button", { className: "button button--ghost", type: "button", "data-exit-focus": "", text: "Exit Focus" }));
    }

    focusMode.replaceChildren(
      createElement("header", { className: "focus-workspace__header" }, [
        createElement("div", { className: "focus-brand" }, [
          createElement("span", { className: "brand__mark", text: "F" }),
          createElement("strong", { text: "FocusStudy" })
        ]),
        createElement("div", { className: "focus-heading" }, [
          createElement("p", { className: "eyebrow", text: isCompleted ? "Session complete" : isPaused ? "Paused" : isBreak ? "Break" : "Focus Mode" }),
          createElement("h2", { text: isCompleted ? (isBreak ? "Break complete." : "Session complete") : "Focus Mode" }),
          createElement("p", { className: "focus-course", text: isCompleted && !isBreak ? `${formatFocusDuration(actualSeconds)} focused - ${title}` : "Keep the next step visible and the extra thoughts parked." })
        ])
      ]),
      createElement("div", { className: "focus-stats", "aria-label": "Focus statistics" }, [
        focusStat(String(todaySessions.length), "Sessions today"),
        focusStat(formatFocusDuration(todayFocusSeconds), "Focus today"),
        focusStat(currentStreak ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "Start", "Current streak"),
        focusStat(formatFocusDuration(weekFocusSeconds), "This week")
      ]),
      createElement("div", { className: "focus-workspace__main" }, [
        createElement("section", { className: "focus-timer-panel", "aria-label": "Focus timer" }, [
          createElement("p", { className: "eyebrow", text: isBreak ? "Break timer" : "Focus timer" }),
          createElement("div", { className: "timer-readout timer-readout--large", "aria-live": isCompleted ? "polite" : "off", text: formatTimer(remaining) }),
          createElement("div", { className: "button-row button-row--center" }, controls)
        ]),
        createElement("section", { className: "focus-context-panel", "aria-label": "Current focus context" }, [
          createElement("div", { className: "focus-step" }, [
            createElement("span", { text: isBreak ? "Current mode" : "Working on" }),
            createElement("strong", { text: title }),
            createElement("small", { text: course })
          ]),
          createElement("div", { className: "focus-step" }, [
            createElement("span", { text: isBreak ? "Break note" : "Current step" }),
            createElement("strong", { text: currentStep })
          ]),
          createElement("label", { className: "focus-goal-field", for: "active-session-goal" }, [
            document.createTextNode("Session goal"),
            createElement("input", { id: "active-session-goal", type: "text", maxlength: "120", value: sessionGoal, placeholder: "Finish the introduction draft", "data-session-goal-active": "", disabled: isBreak || isCompleted })
          ]),
          isCompleted
            ? focusCompletionSummary(actualSeconds, sessionGoal, distractions.length, title, unmovedDistractions.length, isBreak)
            : distractionCatcher(distractions)
        ])
      ]),
      createElement("section", { className: "focus-history", "aria-label": "Recent focus sessions" }, [
        createElement("div", { className: "section-heading" }, [
          createElement("div", {}, [
            createElement("p", { className: "eyebrow", text: "Recent sessions" }),
            createElement("h3", { text: "Study blocks" })
          ])
        ]),
        ...recentFocusRows(state)
      ])
    );
  }

  function focusStat(value, label) {
    return createElement("article", { className: "focus-stat" }, [
      createElement("strong", { text: value }),
      createElement("span", { text: label })
    ]);
  }

  function distractionCatcher(distractions) {
    return createElement("div", { className: "distraction-catcher" }, [
      createElement("form", { className: "inline-form", novalidate: "", "data-distraction-form": "" }, [
        createElement("label", { for: "distraction-input" }, [
          document.createTextNode("Something popped into your head?"),
          createElement("input", { id: "distraction-input", type: "text", placeholder: "Random thought...", "data-distraction-input": "" })
        ]),
        createElement("button", { className: "button button--secondary", type: "submit", text: "Park it" })
      ]),
      distractions.length
        ? createElement("p", { className: "helper-text", text: `${distractions.length} ${distractions.length === 1 ? "thought" : "thoughts"} parked this session.` })
        : createElement("p", { className: "helper-text", text: "Parking a thought keeps it out of the timer without losing it." })
    ]);
  }

  function focusCompletionSummary(actualSeconds, goal, distractionCount, assignmentTitle, movableCount, isBreak) {
    return createElement("div", { className: "focus-complete-summary" }, [
      createElement("p", { className: "eyebrow", text: isBreak ? "Break complete" : "Session summary" }),
      createElement("dl", {}, [
        createElement("div", {}, [
          createElement("dt", { text: "Focused time" }),
          createElement("dd", { text: formatFocusDuration(actualSeconds) })
        ]),
        createElement("div", {}, [
          createElement("dt", { text: "Session goal" }),
          createElement("dd", { text: goal || "No goal set" })
        ]),
        createElement("div", {}, [
          createElement("dt", { text: "Distractions parked" }),
          createElement("dd", { text: String(distractionCount) })
        ]),
        createElement("div", {}, [
          createElement("dt", { text: "Assignment" }),
          createElement("dd", { text: assignmentTitle })
        ])
      ]),
      movableCount ? createElement("button", { className: "button button--secondary", type: "button", "data-move-distractions": "", text: "Move distractions to Brain Dump" }) : document.createTextNode("")
    ]);
  }

  function recentFocusRows(state) {
    const recent = getRecentFocusSessions(state.focusSessions).slice(0, 3);
    if (!recent.length) {
      return [emptyState("No recent sessions yet.", "Completed focus sessions will show up here.", true)];
    }
    return recent.map((session) => {
      const assignment = state.assignments.find((item) => item.id === session.assignmentId);
      return createElement("article", { className: "record progress-record" }, [
        createElement("div", { className: "progress-record__body" }, [
          createElement("strong", { text: assignment ? assignment.title : "Deleted assignment" }),
          createElement("span", { text: `${formatFocusDuration(session.actualDurationSeconds)} - ${formatProgressDate(session.completedAt)}` })
        ])
      ]);
    });
  }

  function renderProgress(state) {
    const weekDays = getWeekDays(new Date());
    const weeklyAssignments = getCompletedAssignmentsThisWeek(state.assignments, weekDays);
    const weeklyFocusSessions = getFocusSessionsThisWeek(state.focusSessions, weekDays);
    const totalFocusSeconds = getTotalFocusSecondsThisWeek(state.focusSessions, weekDays);
    const currentStreak = getCurrentStreak(state.assignments, state.focusSessions);
    const weeklyActivity = getWeeklyFocusActivity(state.focusSessions, weekDays);
    const momentumSummary = getMomentumSummary(state, weekDays);
    const recentAssignments = getRecentCompletedAssignments(state.assignments);
    const recentSessions = getRecentFocusSessions(state.focusSessions);
    const hasProgress = weeklyAssignments.length > 0 || weeklyFocusSessions.length > 0 || recentAssignments.length > 0 || recentSessions.length > 0 || momentumSummary.total > 0;
    const empty = document.querySelector("[data-progress-empty]");
    const metricGrid = document.querySelector("[data-progress-metrics]");
    const weekStrip = document.querySelector("[data-weekly-activity]");
    const activitySummary = document.querySelector("[data-weekly-activity-summary]");
    const recentCompletedList = document.querySelector("[data-recent-completed]");
    const recentFocusList = document.querySelector("[data-recent-focus]");
    const timePerCourse = document.querySelector("[data-time-per-course]");
    const completionRate = document.querySelector("[data-completion-rate]");
    const recentWinsList = document.querySelector("[data-recent-wins]");

    if (empty) empty.hidden = hasProgress;

    if (metricGrid) {
      metricGrid.hidden = !hasProgress;
      const metrics = [
        ["Focus Time", formatFocusDuration(totalFocusSeconds), "Completed focus time this week.", "timer"],
        ["Completed Work", String(weeklyAssignments.length), `${weeklyAssignments.length === 1 ? "Assignment" : "Assignments"} completed this week.`, "check"],
        ["Focus Sessions", String(weeklyFocusSessions.length), "Completed study blocks this week.", "focus"],
        ["Current Streak", currentStreak ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "Start your streak today", currentStreak ? "Active through today or yesterday." : "Complete one assignment or focus session.", "spark"]
      ];
      metricGrid.replaceChildren(...metrics.map(([label, value, body, icon], index) => createElement("article", { className: `metric-card${index === 0 ? " metric-card--primary" : ""}` }, [
        createElement("span", { className: "metric-card__label" }, [
          createSvgIcon(icon, "ui-icon metric-card__icon"),
          document.createTextNode(label)
        ]),
        createElement("strong", { text: value }),
        createElement("p", { text: body })
      ])));
    }

    renderMomentumProgress(state, weekDays);

    if (weekStrip) {
      const maxMinutes = Math.max(...weeklyActivity.map((day) => day.minutes), 0);
      weekStrip.replaceChildren(...weeklyActivity.map((day) => {
        const height = maxMinutes ? Math.max(14, Math.round((day.minutes / maxMinutes) * 100)) : 0;
        const valueText = `${day.label} - ${formatFocusDuration(day.seconds)} focused`;
        return createElement("span", { className: day.minutes ? "week-strip__day" : "week-strip__day week-strip__day--empty", style: { "--activity-height": `${height}%` }, "aria-label": valueText }, [
          createElement("em", { className: "sr-only", text: valueText }),
          createElement("i", { "aria-hidden": "true" }),
          createElement("b", { text: day.shortLabel }),
          createElement("small", { text: formatFocusDuration(day.seconds) })
        ]);
      }));
    }

    if (activitySummary) {
      activitySummary.textContent = totalFocusSeconds
        ? `${formatFocusDuration(totalFocusSeconds)} focused across ${weeklyFocusSessions.length} ${weeklyFocusSessions.length === 1 ? "session" : "sessions"} this week.`
        : "Finish a focus session to start filling in this week.";
    }

    document.querySelectorAll("[data-progress-range]").forEach((button) => {
      const active = button.dataset.progressRange === progressRange;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (timePerCourse) {
      const rows = getTimePerCourse(state, progressRange);
      const maxSeconds = rows.reduce((max, item) => Math.max(max, item.seconds), 0);
      timePerCourse.replaceChildren(...(rows.length ? rows.map((item) => createElement("article", { className: "course-time-row" }, [
        createElement("div", { className: "course-time-row__label" }, [
          createElement("strong", { text: item.label }),
          createElement("span", { text: item.name })
        ]),
        createElement("div", { className: "course-time-row__bar", "aria-label": `${item.name}: ${formatFocusDuration(item.seconds)} focused` }, [
          createElement("span", { className: `course-time-row__fill course-time-row__fill--${item.tone}`, style: { width: `${maxSeconds ? Math.max(8, Math.round((item.seconds / maxSeconds) * 100)) : 0}%` } })
        ]),
        createElement("strong", { className: "course-time-row__time", text: formatFocusDuration(item.seconds) })
      ])) : [emptyState("No course focus time yet.", "Complete focus sessions linked to assignments to see time per course.", true)]));
    }

    if (completionRate) {
      const counts = getCompletionCounts(state.assignments);
      const total = counts.completed + counts.inProgress + counts.notStarted;
      completionRate.replaceChildren(...(total ? [
        statusCount("Completed", counts.completed, total, "complete"),
        statusCount("In Progress", counts.inProgress, total, "progress"),
        statusCount("Not Started", counts.notStarted, total, "neutral")
      ] : [emptyState("No assignments yet.", "Add assignments to see completion status.", true)]));
    }

    if (recentWinsList) {
      const wins = (state.recentWins || [])
        .slice()
        .sort((a, b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0))
        .slice(0, 5);
      recentWinsList.replaceChildren(...(wins.length ? wins.map((win) => createElement("article", { className: "record progress-record" }, [
        createElement("div", { className: "progress-record__body" }, [
          createElement("strong", { text: win.text }),
          createElement("span", { text: formatProgressDate(win.createdAt) })
        ])
      ])) : [emptyState("No wins logged yet.", "Write down one small thing that went right.", true)]));
    }

    if (recentCompletedList) {
      recentCompletedList.replaceChildren(...(recentAssignments.length
        ? recentAssignments.map((assignment) => createElement("article", { className: "record progress-record" }, [
          createElement("div", { className: "progress-record__body" }, [
            createElement("strong", { text: assignment.title || "Untitled assignment" }),
            createElement("span", { text: `${courseName(state, assignment.courseId)} - ${formatProgressDate(assignment.completedAt, "Completed")}` })
          ])
        ]))
        : [emptyState("No completed assignments yet.", "Assignments you complete will appear here.", true)]));
    }

    if (recentFocusList) {
      recentFocusList.replaceChildren(...(recentSessions.length
        ? recentSessions.map((session) => {
          const assignment = state.assignments.find((item) => item.id === session.assignmentId);
          return createElement("article", { className: "record progress-record" }, [
            createElement("div", { className: "progress-record__body" }, [
              createElement("strong", { text: assignment ? assignment.title : "Deleted assignment" }),
              createElement("span", { text: `${formatFocusDuration(session.actualDurationSeconds)} - ${formatProgressDate(session.completedAt)}` })
            ])
          ]);
        })
        : [emptyState("No focus sessions yet.", "Completed focus sessions will appear here.", true)]));
    }
  }

  function statusCount(label, value, total, tone) {
    const percent = total ? Math.round((value / total) * 100) : 0;
    return createElement("article", { className: "status-count" }, [
      createElement("div", {}, [
        createElement("strong", { text: String(value) }),
        createElement("span", { text: `${label} - ${percent}%` })
      ]),
      createElement("div", { className: "step-preview", "aria-label": `${label}: ${value} of ${total}` }, [
        createElement("span", { className: `status-count__fill status-count__fill--${tone}`, style: { width: `${percent}%` } })
      ])
    ]);
  }

  function resolveTheme(theme) {
    if (theme === "system") {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
  }

  function applyTheme(state) {
    const selected = state.settings.theme || "system";
    const resolved = resolveTheme(selected);
    const toggle = document.querySelector("[data-theme-toggle]");
    root.dataset.theme = resolved;
    root.dataset.themePreference = selected;
    if (toggle) {
      toggle.textContent = resolved === "dark" ? "Light mode" : "Dark mode";
    }
  }

  function renderSettings(state, storageStatus) {
    const presetTimers = Array.from(document.querySelectorAll('input[name="timer"][data-focus-duration][data-break-duration]'));
    const customFocus = document.querySelector("[data-custom-focus-minutes]");
    const customBreak = document.querySelector("[data-custom-break-minutes]");
    const longBreak = document.querySelector("[data-long-break-minutes]");
    const sessionsBeforeLongBreak = document.querySelector("[data-sessions-before-long-break]");
    const dailyGoal = document.querySelector("[data-daily-focus-goal]");
    const completionSound = document.querySelector("[data-completion-sound]");
    const gentleMode = document.querySelector("[data-gentle-mode]");
    const customTimer = document.querySelector("[data-custom-timer]");
    const gamification = momentum ? momentum.normalizeGamification(state.gamification) : { enabled: true, showStreaks: true, weeklyGoalMode: "recommended", customWeeklyGoal: 90 };
    const momentumEnabled = document.querySelector("[data-momentum-enabled]");
    const momentumStreaks = document.querySelector("[data-momentum-streaks]");
    const momentumGoalMode = document.querySelector("[data-momentum-goal-mode]");
    const momentumCustomGoal = document.querySelector("[data-momentum-custom-goal]");
    const momentumRecommended = document.querySelector("[data-momentum-recommended]");

    document.querySelectorAll('input[name="appearance"]').forEach((input) => {
      input.checked = input.value === state.settings.theme;
    });

    const matchingPreset = presetTimers.find((input) => {
      const focus = Number(input.dataset.focusDuration);
      const rest = Number(input.dataset.breakDuration);
      return focus === state.settings.focusDuration && rest === state.settings.breakDuration;
    });

    presetTimers.forEach((input) => {
      input.checked = input === matchingPreset;
    });
    if (customTimer) {
      customTimer.checked = !matchingPreset;
    }
    if (customFocus) {
      customFocus.value = String(state.settings.focusDuration || 25);
    }
    if (customBreak) {
      customBreak.value = String(state.settings.breakDuration || 5);
    }
    if (longBreak) longBreak.value = String(state.settings.longBreakDuration || 15);
    if (sessionsBeforeLongBreak) sessionsBeforeLongBreak.value = String(state.settings.sessionsBeforeLongBreak || 4);
    if (dailyGoal) dailyGoal.value = String(state.settings.dailyFocusGoalMinutes || 60);
    if (completionSound) completionSound.checked = Boolean(state.settings.completionSound);
    if (gentleMode) gentleMode.checked = Boolean(state.settings.gentleMode);
    if (momentumEnabled) momentumEnabled.checked = gamification.enabled;
    if (momentumStreaks) momentumStreaks.checked = gamification.showStreaks;
    if (momentumGoalMode) momentumGoalMode.value = gamification.weeklyGoalMode;
    if (momentumCustomGoal) {
      momentumCustomGoal.value = String(gamification.customWeeklyGoal || 90);
      momentumCustomGoal.disabled = gamification.weeklyGoalMode !== "custom";
    }
    if (momentumRecommended && momentum) {
      const weekDays = getWeekDays(new Date());
      const goal = momentum.getWeeklyGoal(state, weekDays);
      momentumRecommended.textContent = `Current week target: ${goal.target} Momentum. Recommended for this week: ${goal.recommended}.`;
    }

    const status = document.querySelector("[data-storage-status]");
    if (!status) return;

    const messages = {
      initialized: "Storage ready. FocusStudy started with a clean planner.",
      loaded: "Storage ready. Changes stay in this browser.",
      saved: "Changes saved in this browser.",
      repaired: "Stored data was repaired with safe defaults.",
      corrupted: "Stored data could not be read, so FocusStudy opened with a clean planner.",
      invalid: "Stored data was invalid, so FocusStudy opened with a clean planner.",
      unavailable: "Local storage is unavailable. Changes may not persist."
    };

    status.textContent = messages[storageStatus.status] || "Storage ready. Changes stay in this browser.";
  }

  function setSelectedAssignmentId(id) {
    selectedAssignmentId = id || "";
  }

  function getSelectedAssignmentId() {
    return selectedAssignmentId;
  }

  function setSelectedFocusAssignmentId(id) {
    selectedFocusAssignmentId = id || "";
  }

  function getSelectedFocusAssignmentId() {
    return selectedFocusAssignmentId;
  }

  function setSelectedCourseId(id) {
    selectedCourseId = id || "";
  }

  function getSelectedCourseId() {
    return selectedCourseId;
  }

  function setEditingSubtaskId(id) {
    editingSubtaskId = id || "";
  }

  function getEditingSubtaskId() {
    return editingSubtaskId;
  }

  function setEditingBrainDumpId(id) {
    editingBrainDumpId = id || "";
  }

  function getEditingBrainDumpId() {
    return editingBrainDumpId;
  }

  function setAssignmentFilter(name, value) {
    if (!Object.prototype.hasOwnProperty.call(assignmentFilters, name)) return;
    assignmentFilters[name] = value || (name === "search" ? "" : "all");
  }

  function resetAssignmentFilters() {
    assignmentFilters.search = "";
    assignmentFilters.course = "all";
    assignmentFilters.status = "all";
    assignmentFilters.type = "all";
    assignmentFilters.sort = "due";
  }

  function getAssignmentFilters() {
    return Object.assign({}, assignmentFilters);
  }

  function setProgressRange(value) {
    progressRange = progressRanges.includes(value) ? value : "week";
  }

  function setScheduleView(value) {
    scheduleView = scheduleViews.includes(value) ? value : "grid";
  }

  function setScheduleFilter(name, value) {
    if (!Object.prototype.hasOwnProperty.call(scheduleFilters, name)) return;
    scheduleFilters[name] = value || "all";
  }

  function renderAll(state, storageStatus) {
    root.dataset.focusState = state.activeFocusSession ? "active" : "idle";
    applyTheme(state);
    renderToday(state);
    renderSchedule(state);
    renderAssignments(state);
    renderAssignmentDetail(state);
    renderCourses(state);
    renderCourseDetail(state);
    renderBrainDump(state);
    renderFocus(state);
    renderProgress(state);
    renderSettings(state, storageStatus || { status: "loaded", error: "" });
  }

  window.FocusStudyRender = {
    renderAll,
    applyTheme,
    resolveTheme,
    setSelectedAssignmentId,
    getSelectedAssignmentId,
    setSelectedFocusAssignmentId,
    getSelectedFocusAssignmentId,
    setSelectedCourseId,
    getSelectedCourseId,
    setEditingSubtaskId,
    getEditingSubtaskId,
    setEditingBrainDumpId,
    getEditingBrainDumpId,
    setAssignmentFilter,
    resetAssignmentFilters,
    getAssignmentFilters,
    getSelectedAssignment,
    getSelectedCourse,
    progressPercent,
    progressAnalytics: {
      formatFocusDuration,
      getCompletedAssignmentsThisWeek,
      getFocusSessionsThisWeek,
      getTotalFocusSecondsThisWeek,
      getCurrentStreak,
      getWeeklyFocusActivity,
      getRecentCompletedAssignments,
      getRecentFocusSessions,
      getWeekDays
    },
    formatTimer,
    activeFocusRemainingSeconds,
    todayKey,
    currentTodayKey,
    setProgressRange,
    setScheduleView,
    setScheduleFilter,
    updateFocusSetupSelection
  };
})(window);
