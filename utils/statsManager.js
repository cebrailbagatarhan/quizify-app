import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_STATS: 'user_stats',
  USER_PROFILE: 'user_profile',
  QUIZ_HISTORY: 'quiz_history',
};

// Default stats structure
const defaultStats = {
  totalQuizzes: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  totalTime: 0, // in seconds
  bestScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  categoryStats: {},
  lastQuizDate: null,
  weeklyData: [],
};

const defaultProfile = {
  userName: 'Kullanıcı',
  joinDate: new Date().toISOString(),
  level: 'Başlangıç',
  soundEnabled: true,
  darkMode: false,
};

export const StatsManager = {
  // Helper function to safely parse JSON and convert types
  _safeJsonParse(jsonString, defaultValue) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        // Ensure numeric fields are actually numbers
        const sanitized = { ...defaultValue };

        // Sanitize stats
        if (parsed.totalQuizzes !== undefined) sanitized.totalQuizzes = Number(parsed.totalQuizzes) || 0;
        if (parsed.totalQuestions !== undefined) sanitized.totalQuestions = Number(parsed.totalQuestions) || 0;
        if (parsed.correctAnswers !== undefined) sanitized.correctAnswers = Number(parsed.correctAnswers) || 0;
        if (parsed.totalTime !== undefined) sanitized.totalTime = Number(parsed.totalTime) || 0;
        if (parsed.bestScore !== undefined) sanitized.bestScore = Number(parsed.bestScore) || 0;
        if (parsed.currentStreak !== undefined) sanitized.currentStreak = Number(parsed.currentStreak) || 0;
        if (parsed.longestStreak !== undefined) sanitized.longestStreak = Number(parsed.longestStreak) || 0;

        // Copy over other fields that don't need sanitization
        if (parsed.categoryStats) sanitized.categoryStats = parsed.categoryStats;
        if (parsed.lastQuizDate) sanitized.lastQuizDate = parsed.lastQuizDate;
        if (parsed.weeklyData) sanitized.weeklyData = parsed.weeklyData;

        return sanitized;
      }
      return defaultValue;
    } catch (error) {
      console.error('JSON parse error:', error);
      return defaultValue;
    }
  },

  // Get user stats
  async getStats() {
    try {
      const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      return statsJson ? this._safeJsonParse(statsJson, defaultStats) : defaultStats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return defaultStats;
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profileJson ? JSON.parse(profileJson) : defaultProfile;
    } catch (error) {
      console.error('Error getting profile:', error);
      return defaultProfile;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const currentProfile = await this.getProfile();
      const updatedProfile = { ...currentProfile, ...profileData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Record quiz results
  async recordQuizResult(quizData) {
    try {
      const {
        category,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        completedAt = new Date().toISOString()
      } = quizData;

      // Get current stats
      const currentStats = await this.getStats();

      // Update basic stats
      const updatedStats = {
        ...currentStats,
        totalQuizzes: currentStats.totalQuizzes + 1,
        totalQuestions: currentStats.totalQuestions + totalQuestions,
        correctAnswers: currentStats.correctAnswers + correctAnswers,
        totalTime: currentStats.totalTime + timeSpent,
        bestScore: Math.max(currentStats.bestScore, score),
        lastQuizDate: completedAt,
      };

      // Update category stats
      if (!updatedStats.categoryStats[category]) {
        updatedStats.categoryStats[category] = {
          quizzesTaken: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          bestScore: 0,
          totalTime: 0,
        };
      }

      updatedStats.categoryStats[category].quizzesTaken += 1;
      updatedStats.categoryStats[category].totalQuestions += totalQuestions;
      updatedStats.categoryStats[category].correctAnswers += correctAnswers;
      updatedStats.categoryStats[category].bestScore = Math.max(
        updatedStats.categoryStats[category].bestScore,
        score
      );
      updatedStats.categoryStats[category].totalTime += timeSpent;

      // Update streak
      const today = new Date().toDateString();
      const lastQuizDate = currentStats.lastQuizDate ?
        new Date(currentStats.lastQuizDate).toDateString() : null;

      if (lastQuizDate === today) {
        // Same day, don't change streak
      } else if (this.isConsecutiveDay(lastQuizDate, today)) {
        updatedStats.currentStreak = currentStats.currentStreak + 1;
      } else {
        updatedStats.currentStreak = 1;
      }

      updatedStats.longestStreak = Math.max(
        updatedStats.longestStreak,
        updatedStats.currentStreak
      );

      // Update weekly data
      updatedStats.weeklyData = this.updateWeeklyData(currentStats.weeklyData, score);

      // Save updated stats
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));

      // Save quiz to history
      await this.saveQuizToHistory(quizData);

      return updatedStats;
    } catch (error) {
      console.error('Error recording quiz result:', error);
      throw error;
    }
  },

  // Helper function to check consecutive days
  isConsecutiveDay(lastDate, currentDate) {
    if (!lastDate) return true;

    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = current.getTime() - last.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 1;
  },

  // Update weekly data (last 7 days)
  updateWeeklyData(currentWeeklyData, newScore) {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const today = new Date().getDay();
    const todayName = days[today];

    // Initialize weekly data if empty
    if (currentWeeklyData.length === 0) {
      currentWeeklyData = days.map(day => ({ day, score: 0, count: 0 }));
    }

    // Find today's entry and update it
    const todayEntry = currentWeeklyData.find(entry => entry.day === todayName);
    if (todayEntry) {
      // Calculate average score for the day
      const totalScore = (todayEntry.score * todayEntry.count) + newScore;
      todayEntry.count += 1;
      todayEntry.score = Math.round(totalScore / todayEntry.count);
    }

    return currentWeeklyData;
  },

  // Save individual quiz to history
  async saveQuizToHistory(quizData) {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      const history = historyJson ? JSON.parse(historyJson) : [];

      // Add new quiz to history (keep only last 50)
      history.unshift({
        ...quizData,
        id: Date.now(),
        completedAt: quizData.completedAt || new Date().toISOString(),
      });

      // Keep only last 50 quizzes
      if (history.length > 50) {
        history.splice(50);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving quiz to history:', error);
    }
  },

  // Get quiz history
  async getQuizHistory() {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Error getting quiz history:', error);
      return [];
    }
  },

  // Calculate user level based on total quizzes
  calculateLevel(totalQuizzes) {
    if (totalQuizzes < 5) return 'Başlangıç';
    if (totalQuizzes < 15) return 'Acemi';
    if (totalQuizzes < 30) return 'Orta';
    if (totalQuizzes < 50) return 'İleri';
    if (totalQuizzes < 100) return 'Uzman';
    return 'Master';
  },

  // Get best category
  getBestCategory(categoryStats) {
    let bestCategory = 'Henüz yok';
    let bestAccuracy = 0;

    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.totalQuestions > 0) {
        const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
        if (accuracy > bestAccuracy) {
          bestAccuracy = accuracy;
          bestCategory = category;
        }
      }
    });

    return bestCategory;
  },

  // Reset all data (for testing or user request)
  async resetAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_STATS,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.QUIZ_HISTORY,
      ]);
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  },

  // Clear all data and reinitialize (for fixing type errors)
  async clearAndReinitialize() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_STATS,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.QUIZ_HISTORY,
      ]);

      // Reinitialize with default values
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile));

      console.log('All data cleared and reinitialized');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },
};
