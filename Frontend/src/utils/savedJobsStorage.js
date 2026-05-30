const storageKey = (userId) => `arcon_saved_jobs_${userId}`;

export const loadSavedJobsFromStorage = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveSavedJobsToStorage = (userId, jobs) => {
  if (!userId) return;
  localStorage.setItem(storageKey(userId), JSON.stringify(jobs));
};
