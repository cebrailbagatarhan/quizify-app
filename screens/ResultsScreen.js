import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView as RNSafeAreaView,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatsManager } from '../utils/statsManager';
import { getReviewItems } from '../utils/resultReview';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
  const { category, questions = [], answers, totalTime, totalQuestions } = route.params;
  const [isSaved, setIsSaved] = useState(false);
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  const reviewItems = getReviewItems(answers, showIncorrectOnly);

  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const slideAnimation = useRef(new Animated.Value(50)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
    saveQuizResults();
    if (percentage >= 80) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  const saveQuizResults = async () => {
    try {
      const quizData = {
        category: category.name,
        score: percentage,
        totalQuestions,
        correctAnswers,
        timeSpent: totalTime,
        completedAt: new Date().toISOString(),
        answers: answers,
      };

      await StatsManager.recordQuizResult(quizData);
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      Alert.alert('Hata', 'Quiz sonuçları kaydedilemedi');
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getMotivationText = () => {
    if (percentage >= 90) return "Mükemmel! Sen bir dahisin! 🏆";
    if (percentage >= 80) return "Harika! Çok başarılısın! 🌟";
    if (percentage >= 60) return "İyi! Daha da gelişebilirsin! 💪";
    if (percentage >= 40) return "Fena değil, biraz daha çalış! 📚";
    return "Biraz daha çaba göster, sen yaparsın! 🚀";
  };

  const getPerformanceEmoji = () => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🌟";
    if (percentage >= 60) return "💪";
    if (percentage >= 40) return "📚";
    return "🚀";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Quizify'da ${category.name} kategorisinde %${percentage} başarı elde ettim! ${getPerformanceEmoji()}`,
      });
    } catch (error) {
      console.log('Error sharing:', error.message);
    }
  };
  const QuestionResult = ({ answer, questionIndex }) => {
    const question = questions[questionIndex];
    if (!question) {
      return (
        <View style={styles.questionResult}>
          <Text style={styles.questionTextSmall}>Soru detayları bulunamadı.</Text>
        </View>
      );
    }

    return (
      <View style={styles.questionResult}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Soru {questionIndex + 1}</Text>
          <View style={[
            styles.resultBadge,
            answer.isCorrect ? styles.correctBadge : styles.incorrectBadge
          ]}>
            <Text style={styles.resultBadgeText}>
              {answer.isCorrect ? '✓' : '✗'}
            </Text>
          </View>
        </View>
        <Text style={styles.questionTextSmall}>{question.question}</Text>
        <View style={styles.answerDetails}>
          {answer.selectedAnswer !== null && (
            <Text style={[
              styles.answerText,
              answer.isCorrect ? styles.correctText : styles.incorrectText
            ]}>
              Seçtiğiniz: {question.options[answer.selectedAnswer]}
            </Text>
          )}
          {!answer.isCorrect && (
            <Text style={styles.correctAnswerText}>
              Doğru cevap: {question.options[answer.correctAnswer]}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <RNSafeAreaView style={styles.container}>
      <LinearGradient
        colors={percentage >= 60 ? ['#48bb78', '#38a169'] : ['#ed8936', '#dd6b20']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnimation,
                transform: [{ translateY: slideAnimation }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quiz Tamamlandı!</Text>
          </Animated.View>

          {/* Results Card */}
          <Animated.View
            style={[
              styles.resultsCard,
              {
                opacity: fadeAnimation,
                transform: [{ scale: scaleAnimation }],
              },
            ]}
          >            <View style={styles.scoreContainer}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.scoreText}>{percentage}%</Text>
              <Text style={styles.motivationText}>{getMotivationText()}</Text>
              {isSaved && (
                <View style={styles.savedIndicator}>
                  <Text style={styles.savedText}>✅ Profil güncellendi</Text>
                </View>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{correctAnswers}</Text>
                <Text style={styles.statLabel}>Doğru</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalQuestions - correctAnswers}</Text>
                <Text style={styles.statLabel}>Yanlış</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatTime(totalTime)}</Text>
                <Text style={styles.statLabel}>Süre</Text>
              </View>
            </View>
          </Animated.View>

          {/* Question Details */}
          <Animated.View
            style={[
              styles.detailsSection,
              { opacity: fadeAnimation },
            ]}
          >
            <Text style={styles.detailsTitle}>Soru Detayları</Text>
            <TouchableOpacity
              style={styles.reviewFilterButton}
              onPress={() => setShowIncorrectOnly((value) => !value)}
              accessibilityRole="button"
              accessibilityState={{ selected: showIncorrectOnly }}
              accessibilityLabel="Yalnızca yanlış cevapları göster"
            >
              <Text style={styles.reviewFilterText}>
                {showIncorrectOnly ? '✓ Yalnızca yanlışlar' : 'Yalnızca yanlışları göster'}
              </Text>
            </TouchableOpacity>
            {reviewItems.length === 0 && (
              <Text style={styles.reviewEmptyText}>İncelenecek yanlış cevap yok.</Text>
            )}
            {reviewItems.map(({ answer, index }) => (
              <QuestionResult
                key={index}
                answer={answer}
                questionIndex={index}
              />
            ))}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionsContainer,
              { opacity: fadeAnimation },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Text style={styles.actionButtonText}>📤 Paylaş</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={() => navigation.replace('Quiz', { category, questions })}
            >
              <Text style={styles.actionButtonText}>🔄 Tekrar Çöz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.homeButton]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.actionButtonText}>🏠 Ana Menü</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginRight: 40,
  },
  resultsCard: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  categoryName: {
    fontSize: 18,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },  motivationText: {
    fontSize: 18,
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  savedIndicator: {
    backgroundColor: '#c6f6d5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  savedText: {
    color: '#38a169',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 5,
  },
  detailsSection: {
    margin: 20,
    marginTop: 0,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  reviewFilterButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  reviewFilterText: {
    color: '#2d3748',
    fontWeight: '600',
  },
  reviewEmptyText: {
    color: 'white',
    marginBottom: 12,
  },
  questionResult: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  resultBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctBadge: {
    backgroundColor: '#c6f6d5',
  },
  incorrectBadge: {
    backgroundColor: '#fed7d7',
  },
  resultBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionTextSmall: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
  },
  answerDetails: {
    marginTop: 5,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  correctText: {
    color: '#38a169',
  },
  incorrectText: {
    color: '#e53e3e',
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#38a169',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#4299e1',
  },
  retryButton: {
    backgroundColor: '#ed8936',
  },
  homeButton: {
    backgroundColor: '#48bb78',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
