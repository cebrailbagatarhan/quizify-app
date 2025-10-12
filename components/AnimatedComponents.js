import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const FadeInView = ({ children, duration = 1000, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

export const SlideInView = ({ children, direction = 'up', duration = 800, delay = 0 }) => {
  const slideAnim = useRef(new Animated.Value(direction === 'up' ? 50 : -50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, duration, delay]);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

export const ScaleInView = ({ children, duration = 800, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, duration, delay]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {children}
    </Animated.View>
  );
};

export const PulseView = ({ children, duration = 1000 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim, duration]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      {children}
    </Animated.View>
  );
};

