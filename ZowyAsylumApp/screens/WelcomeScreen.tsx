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
    navigation.getParent()?.navigate('MainStack');
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
              size="large"
              style={styles.viewResourcesButton}
            />
            
            <Button
              title="Sign up"
              onPress={handleSignUp}
              variant="primary"
              size="large"
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
    backgroundColor: '#F5F5F5', // Light gray background
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
    top: -100,
    left: -50,
    width: 350,
    height: 450,
    backgroundColor: Colors.primary,
    borderRadius: 175,
    transform: [
      { scaleX: 1.2 },
      { scaleY: 1.1 },
      { rotate: '-15deg' }
    ],
  },
  cloverCenter: {
    position: 'absolute',
    top: 110,
    left: 30,
    width: 120,
    height: 120,
    backgroundColor: Colors.primaryLight,
    borderRadius: 60,
    opacity: 0.8,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: 150,
    right: 50,
    width: 140,
    height: 140,
    backgroundColor: Colors.primary,
    borderRadius: 70,
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
    backgroundColor: 'transparent',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 25,
  },
  signUpButton: {
    backgroundColor: '#2E6B47', // Dark green from design
    borderRadius: 25,
  },
});

export default WelcomeScreen;