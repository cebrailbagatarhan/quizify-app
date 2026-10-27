import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const navigationTimeoutRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    startAnimation();
    return () => {
      if (navigationTimeoutRef.current !== null) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      animationRef.current?.stop();
    };
  }, []);

  const goHome = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    if (navigationTimeoutRef.current !== null) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
    navigation.replace('Home');
  };

  const startAnimation = () => {
    animationRef.current = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);
    animationRef.current.start(({ finished }) => {
      if (!finished || hasNavigatedRef.current) return;
      navigationTimeoutRef.current = setTimeout(goHome, 1500);
    });
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <Text style={styles.logoIcon}>🧠</Text>
          <Text style={styles.logoText}>Quizify</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineContainer, { opacity: textOpacity }]}>
          <Text style={styles.tagline}>Bilgiyle Eğlen!</Text>
        </Animated.View>
      </View>
      <TouchableOpacity
        style={styles.skipButton}
        accessibilityRole="button"
        accessibilityLabel="Tanıtımı geç ve ana menüye git"
        onPress={goHome}
      >
        <Text style={styles.skipText}>Geç</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  skipButton: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
