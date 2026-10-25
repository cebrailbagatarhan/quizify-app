import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView as RNSafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function QuizScreen({ route, navigation }) {
  const { category, questions } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Resolve the question before its time limit is used for initial state.
  const currentQuestion = questions[currentQuestionIndex];
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimit || 10);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(Date.now());

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const questionAnimation = useRef(new Animated.Value(1)).current;
  const timerAnimation = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null); // Timer referansı için
  // A ref takes effect synchronously, unlike React state updates after rapid taps.
  const committedQuestionIndexRef = useRef(-1);
  // Cancel delayed question/result navigation when the screen is left.
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    startTimer();
    animateProgress();

    // Cleanup timer when component unmounts or question changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex]);
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered]);

  // Component unmount time cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (transitionTimeoutRef.current !== null) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, []);

  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const questionTimeLimit = currentQuestion?.timeLimit || 10;
    setTimeLeft(questionTimeLimit);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const animateProgress = () => {
    Animated.timing(progressAnimation, {
      toValue: (currentQuestionIndex + 1) / questions.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };
  const handleTimeUp = () => {
    if (!isAnswered && committedQuestionIndexRef.current !== currentQuestionIndex) {
      committedQuestionIndexRef.current = currentQuestionIndex;
      setIsAnswered(true);

      // Clear timer when time is up
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const timeSpent = currentQuestion?.timeLimit || 10;
      const newAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: null,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: false,
        timeSpent,
      };
      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      transitionTimeoutRef.current = setTimeout(() => {
        transitionTimeoutRef.current = null;
        nextQuestion(updatedAnswers);
      }, 1500);
    }
  };
  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered || committedQuestionIndexRef.current === currentQuestionIndex) return;
    // A tap can arrive after the countdown renders 0 but before the timeout effect.
    // Record it as expired rather than awarding a correct answer.
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    committedQuestionIndexRef.current = currentQuestionIndex;

    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    // Clear timer when answer is selected
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const timeSpent = (currentQuestion?.timeLimit || 10) - timeLeft;

    if (isCorrect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: optionIndex,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeSpent,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    transitionTimeoutRef.current = setTimeout(() => {
      transitionTimeoutRef.current = null;
      nextQuestion(updatedAnswers);
    }, 1500);
  };

  const nextQuestion = (completedAnswers) => {
    if (currentQuestionIndex < questions.length - 1) {
      Animated.timing(questionAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        // Reset the countdown in the same React batch as unlocking the next question.
        // Otherwise timeLeft=0 can trigger the timeout effect for the new question.
        setTimeLeft(questions[nextIndex]?.timeLimit || 10);
        setSelectedAnswer(null);
        setIsAnswered(false);
        Animated.timing(questionAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      finishQuiz(completedAnswers);
    }
  };

  const finishQuiz = (completedAnswers) => {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    navigation.replace('Results', {
      category,
      answers: completedAnswers,
      totalTime,
      totalQuestions: questions.length,
    });
  };

  const getOptionStyle = (optionIndex) => {
    if (!isAnswered) {
      return styles.option;
    }

    if (optionIndex === currentQuestion.correctAnswer) {
      return [styles.option, styles.correctOption];
    }

    if (optionIndex === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
      return [styles.option, styles.incorrectOption];
    }

    return [styles.option, styles.disabledOption];
  };

  const getTimerColor = () => {
    if (timeLeft > 5) return '#4299e1';
    if (timeLeft > 2) return '#ed8936';
    return '#f56565';
  };

  return (
    <RNSafeAreaView style={styles.container}>
      <LinearGradient
        colors={[category.color, `${category.color}80`]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text style={[styles.timer, { color: getTimerColor() }]}>
              {timeLeft}
            </Text>
          </View>
        </View>

        {/* Question Card */}
        <Animated.View
          style={[
            styles.questionCard,
            {
              opacity: questionAnimation,
              transform: [
                {
                  scale: questionAnimation,
                },
              ],
            },
          ]}
        >
          <View style={styles.questionContainer}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(index)}
                onPress={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  timerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionCard: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
  },
  questionContainer: {
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    lineHeight: 30,
  },
  optionsContainer: {
    padding: 25,
  },
  option: {
    backgroundColor: '#f7fafc',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  correctOption: {
    backgroundColor: '#c6f6d5',
    borderColor: '#38a169',
  },
  incorrectOption: {
    backgroundColor: '#fed7d7',
    borderColor: '#e53e3e',
  },
  disabledOption: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  bottomInfo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  categoryIcon: {
    fontSize: 60,
    opacity: 0.3,
  },
});
