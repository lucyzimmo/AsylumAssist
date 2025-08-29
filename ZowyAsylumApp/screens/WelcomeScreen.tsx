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
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Button } from '../components/ui/Button';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../types/navigation';

type WelcomeScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

const { width, height } = Dimensions.get('window');

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
      {/* Large decorative clover/flower shape */}
      <View style={styles.decorativeShape}>
        <View style={[styles.petal, styles.petalTop]} />
        <View style={[styles.petal, styles.petalRight]} />
        <View style={[styles.petal, styles.petalBottom]} />
        <View style={[styles.petal, styles.petalLeft]} />
        <View style={styles.center} />
      </View>

      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.textContent}>
            <Text style={styles.title}>Zowy for Asylum</Text>
            <Text style={styles.description}>
              Track your progress, manage documents and find resources to help with your asylum application
            </Text>
          </View>

          <View style={styles.loginSection}>
            <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLinkText}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
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
    backgroundColor: Colors.background,
    position: 'relative',
  },
  decorativeShape: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.8,
    height: height * 0.6,
    zIndex: 0,
  },
  petal: {
    position: 'absolute',
    backgroundColor: Colors.primary,
    borderRadius: 100,
  },
  petalTop: {
    width: 120,
    height: 160,
    top: -20,
    left: 80,
    transform: [{ rotate: '0deg' }],
  },
  petalRight: {
    width: 160,
    height: 120,
    top: 80,
    right: -20,
    transform: [{ rotate: '90deg' }],
  },
  petalBottom: {
    width: 120,
    height: 160,
    bottom: -20,
    left: 80,
    transform: [{ rotate: '180deg' }],
  },
  petalLeft: {
    width: 160,
    height: 120,
    top: 80,
    left: -20,
    transform: [{ rotate: '270deg' }],
  },
  center: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryLight,
    borderRadius: 40,
    top: 120,
    left: 120,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 32,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: width * 0.9,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 40,
  },
  loginSection: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  loginLink: {
    paddingVertical: 8,
  },
  loginText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  loginLinkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actions: {
    gap: 16,
  },
  viewResourcesButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.textPrimary,
    borderWidth: 1,
  },
  signUpButton: {
    backgroundColor: Colors.primaryDark,
  },
});

export default WelcomeScreen;