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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome to Zowy</Text>
            <Text style={styles.subtitle}>
              Your digital companion for navigating the asylum process in the United States
            </Text>
          </View>

          {/* Feature List */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Timeline Management</Text>
              <Text style={styles.featureDescription}>
                Track important deadlines and court dates
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Form Assistance</Text>
              <Text style={styles.featureDescription}>
                Get help filling out I-589 and other forms
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Legal Resources</Text>
              <Text style={styles.featureDescription}>
                Find legal aid organizations and support
              </Text>
            </View>
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
              title="Get Started"
              onPress={handleSignUp}
              variant="primary"
              fullWidth
              style={styles.getStartedButton}
            />
            
            <Button
              title="I'll do this later"
              onPress={handleViewResources}
              variant="outline"
              fullWidth
              style={styles.laterButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Content Layout
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height * 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },

  // Title Section
  titleSection: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    lineHeight: 28,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // Features Section
  featuresSection: {
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  featureItem: {
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },

  // Login Section
  loginSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  loginLinkText: {
    color: '#2E6B47',
    fontWeight: '600',
  },

  // Button Section
  buttonSection: {
    gap: 16,
    paddingHorizontal: 8,
  },
  getStartedButton: {
    backgroundColor: '#2E6B47',
    borderRadius: 8,
    paddingVertical: 16,
  },
  laterButton: {
    backgroundColor: 'transparent',
    borderColor: '#666666',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
  },
});

export default WelcomeScreen;