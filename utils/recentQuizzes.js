'use strict';

// Display-only projection of locally stored quiz history; never mutates records.
function getRecentQuizzes(history, limit = 5) {
  if (!Array.isArray(history)) return [];
  const count = Number.isInteger(limit) && limit >= 0 ? Math.min(limit, 50) : 5;
  return history.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const category = typeof entry.category === 'string' ? entry.category.trim() : '';
    const score = entry.score;
    const timestamp = typeof entry.completedAt === 'string'
      ? Date.parse(entry.completedAt) : NaN;
    if (!category || typeof score !== 'number' || !Number.isFinite(score) ||
        score < 0 || score > 100 || !Number.isFinite(timestamp)) return [];
    return [{
      category, score: Math.round(score),
      completedAt: new Date(timestamp).toISOString(), timestamp, index,
    }];
  }).sort((a, b) => b.timestamp - a.timestamp || a.index - b.index)
    .slice(0, count)
    .map(({ category, score, completedAt }) => ({ category, score, completedAt }));
}

module.exports = { getRecentQuizzes };
