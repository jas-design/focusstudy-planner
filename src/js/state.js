(function (window) {
  const storage = window.FocusStudyStorage;
  const listeners = [];
  let loadResult = storage.loadAppData();
  let appState = loadResult.data;
  let storageStatus = {
    status: loadResult.status,
    error: loadResult.error || ""
  };

  function notify() {
    const snapshot = getAppState();
    listeners.forEach((listener) => listener(snapshot, getStorageStatus()));
  }

  function getAppState() {
    return storage.cloneData(appState);
  }

  function getStorageStatus() {
    return Object.assign({}, storageStatus);
  }

  function setStorageStatus(result) {
    storageStatus = {
      status: result.status,
      error: result.error || ""
    };
  }

  function setAppState(nextState) {
    const result = storage.saveAppData(nextState);
    appState = result.data;
    setStorageStatus(result);
    notify();
    return getAppState();
  }

  function updateAppState(updater) {
    const draft = storage.cloneData(appState);
    const nextState = typeof updater === "function" ? updater(draft) || draft : draft;
    return setAppState(nextState);
  }

  function resetAppState() {
    const result = storage.resetAppData();
    appState = result.data;
    setStorageStatus(result);
    notify();
    return getAppState();
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return function noop() {};
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }

  window.FocusStudyState = {
    getAppState,
    getStorageStatus,
    setAppState,
    updateAppState,
    resetAppState,
    subscribe,
    createId: storage.createId
  };
})(window);
