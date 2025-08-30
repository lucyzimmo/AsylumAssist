import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Button } from '../components/ui/Button';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../types/navigation';

type WelcomeScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

// Dimensions available if needed for responsive design

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleViewResources = () => {
    // Navigate to MainStack, which will show the Resources screen as a guest
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.navigate('MainStack', { screen: 'Resources' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Large Green Clover from Start.png */}
      <View style={styles.cloverBackground}>
        {/* Main clover shape */}
        <View style={styles.mainClover} />
        {/* Center circle */}
        <View style={styles.cloverCenter} />
        {/* Bottom decorative circle */}
        <View style={styles.bottomCircle} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Zowy for Asylum</Text>
            <Text style={styles.description}>
              Track your progress, manage documents and find resources to help with your asylum application
            </Text>
          </View>

          {/* Login Link */}
          <TouchableOpacity 
            onPress={handleLogin} 
            style={styles.loginSection}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Log in to existing account"
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLinkText}>Log in</Text>
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <Button
              title="View resources"
              onPress={handleViewResources}
              variant="outline"
              fullWidth
              style={styles.viewResourcesButton}
            />
            
            <Button
              title="Sign up"
              onPress={handleSignUp}
              variant="primary"
              fullWidth
              style={styles.signUpButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light gray background to match other screens
  },

  // Clover Background matching Start.png exactly
  cloverBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainClover: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 300,
    height: 400,
    backgroundColor: Colors.primary,
    borderRadius: 150,
    transform: [
      { scaleX: 1.3 },
      { scaleY: 1.2 },
      { rotate: '-12deg' }
    ],
  },
  cloverCenter: {
    position: 'absolute',
    top: 120,
    left: 40,
    width: 100,
    height: 100,
    backgroundColor: Colors.primaryLight,
    borderRadius: 50,
    opacity: 0.9,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 120,
    height: 120,
    backgroundColor: Colors.primary,
    borderRadius: 60,
    opacity: 0.8,
  },

  // Content Layout
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },

  // Title Section
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'left',
  },
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    textAlign: 'left',
  },

  // Login Section
  loginSection: {
    marginBottom: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'left',
  },
  loginLinkText: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Button Section
  buttonSection: {
    gap: 16,
  },
  viewResourcesButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.textPrimary,
    borderWidth: 2,
    borderRadius: 25,
  },
  signUpButton: {
    backgroundColor: Colors.primaryDark, // Dark green from design
    borderRadius: 25,
  },
});

export default WelcomeScreen;