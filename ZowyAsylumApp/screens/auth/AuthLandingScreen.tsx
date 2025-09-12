import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { AuthService } from '../../services/authService';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';

type AuthLandingScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'AuthLanding'
>;

export const AuthLandingScreen: React.FC = () => {
  const navigation = useNavigation<AuthLandingScreenNavigationProp>();

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleContinueAsGuest = async () => {
    // Clear all guest data from previous sessions
    await AuthService.startGuestSession();
    
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.navigate('MainStack', { screen: 'Resources' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>Zowy</Text>
          <Text style={styles.tagline}>
            Your trusted guide through the asylum process
          </Text>
          <Text style={styles.supportText}>
            Track deadlines, manage documents, find legal help
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Sign up"
            onPress={handleSignUp}
            variant="primary"
            
            style={styles.signUpButton}
          />
          
          <Button
            title="Log in"
            onPress={handleLogin}
            variant="outline"
            
            style={styles.loginButton}
          />

          
        </View>

        {/* Language Selector Placeholder */}
        <View style={styles.languageSection}>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>🌐 English</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#2E6B47',
    marginBottom: 20,
  },
  tagline: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 20,
    marginBottom: 12,
    fontWeight: '600',
  },
  supportText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },

  // Action Section
  actionSection: {
    gap: 16,
    paddingHorizontal: 8,
  },
  signUpButton: {
    backgroundColor: '#2E6B47',
    borderRadius: 8,
    paddingVertical: 16,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderColor: '#2E6B47',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 16,
  },
  guestButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    color: '#666666',
    textDecorationLine: 'underline',
  },

  // Language Section
  languageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  languageText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default AuthLandingScreen;