import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
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

  useEffect(() => {
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
      }, 2000); // 2 second splash delay
    };

    checkAuthAndRoute();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Text style={styles.logo}>Zowy</Text>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
          style={styles.loader}
        />
      </View>
      
      {/* Brand Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Your journey starts here</Text>
      </View>
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
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2E6B47',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  },
});

export default SplashScreen;