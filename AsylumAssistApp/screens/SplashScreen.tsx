import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../types/navigation';

type SplashScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Splash'
>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Check authentication status and route accordingly
    const checkAuthAndRoute = () => {
      setTimeout(() => {
        // TODO: Replace with actual auth check
        const isAuthenticated = false;
        const hasCompletedOnboarding = false;
        
        if (isAuthenticated) {
          if (hasCompletedOnboarding) {
            // Navigate to main app
            const rootNavigation = navigation.getParent();
            if (rootNavigation) {
              rootNavigation.navigate('MainStack');
            }
          } else {
            // Navigate to onboarding
            navigation.navigate('OnboardingStart');
          }
        } else {
          // Navigate to auth landing
          navigation.navigate('AuthLanding');
        }
      }, 2500); // 2.5 second splash delay
    };

    checkAuthAndRoute();
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.logo}>AsylumAssist</Text>
          <Text style={styles.tagline}>Navigate your journey with confidence</Text>
        </Animated.View>
      </View>
      
      <Animated.View 
        style={[
          styles.footer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.footerText}>Your asylum journey companion</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2E6B47',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
  },
});

export default SplashScreen;