// Home dashboard values are derived from saved user data, not placeholders.
export function displayUserName(profile) {
  const name = profile?.userName;
  return typeof name === 'string' && name.trim() ? name.trim() : 'Kullanıcı';
}

export function countTodaysQuizzes(history, today = new Date()) {
  if (!Array.isArray(history) || !(today instanceof Date) || Number.isNaN(today.getTime())) {
    return 0;
  }
  const currentDay = today.toDateString();
  return history.filter(entry => {
    if (typeof entry?.completedAt !== 'string') return false;
    const completed = new Date(entry.completedAt);
    return !Number.isNaN(completed.getTime()) && completed.toDateString() === currentDay;
  }).length;
}
