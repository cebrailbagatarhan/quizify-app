import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView as RNSafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { categories } from '../data/newQuizData';
import { generativeAIService } from '../services/generativeAIService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [userName] = useState('Kullanıcı');
  const [dailyQuizzes] = useState(2);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const animatedValues = useRef(
    categories.map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    const animations = animatedValues.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  }, []);

  const handleCategoryPress = async (category) => {
    setLoadingText(`"${category.name}" için sorular hazırlanıyor...`);
    setLoading(true);
    try {
      const questions = await generativeAIService.generateQuiz(category.name);
      if (questions && questions.length > 0) {
        navigation.navigate('Quiz', { category, questions });
      } else {
        Alert.alert('Hata', 'Sorular oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Bir Hata Oluştu',
        'Sorular oluşturulurken bir sorun yaşandı. Lütfen API anahtarınızı ve internet bağlantınızı kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const CategoryCard = ({ category, index }) => {
    const animatedValue = animatedValues[index];

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[category.color, `${category.color}80`]}
            style={styles.cardGradient}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <RNSafeAreaView style={styles.container}>
      <Modal
        transparent={true}
        animationType="fade"
        visible={loading}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        </View>
      </Modal>

      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Merhaba, {userName}! 👋</Text>
            <Text style={styles.dailyStats}>
              Bugün {dailyQuizzes} quiz çözdünüz
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <Text style={styles.sectionSubtitle}>
            Hangi konuda kendini test etmek istiyorsun?
          </Text>

          <ScrollView
            contentContainerStyle={styles.categoriesContainer}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  dailyStats: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f7fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 15,
  },
  categoryCard: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#2d3748',
    height: 150,
    width: 250,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});
