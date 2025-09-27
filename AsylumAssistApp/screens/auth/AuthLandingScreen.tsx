import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { AuthService } from '../../services/authService';
import { isRTL } from '../../i18n';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';

type AuthLandingScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'AuthLanding'
>;

export const AuthLandingScreen: React.FC = () => {
  const navigation = useNavigation<AuthLandingScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const isRTLLayout = isRTL(i18n.language);

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
    <SafeAreaView style={[styles.container, isRTLLayout && styles.rtlContainer]}>
      <View style={[styles.content, isRTLLayout && styles.rtlContent]}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>AsylumAssist</Text>
          <Text style={[styles.tagline, isRTLLayout && styles.rtlText]}>
            {t('authLanding.tagline')}
          </Text>
          <Text style={[styles.supportText, isRTLLayout && styles.rtlText]}>
            {t('authLanding.supportText')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title={t('authLanding.signUp')}
            onPress={handleSignUp}
            variant="primary"
            style={styles.signUpButton}
          />

          <Button
            title={t('authLanding.logIn')}
            onPress={handleLogin}
            variant="outline"
            style={styles.loginButton}
          />

          
        </View>

        {/* Language Selector */}
        <View style={[styles.languageSection, isRTLLayout && styles.rtlLanguageSection]}>
          <LanguageSwitcher />
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
  rtlLanguageSection: {
    alignItems: 'center',
  },

  // RTL Support
  rtlContainer: {
    direction: 'rtl',
  },
  rtlContent: {
    direction: 'rtl',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

// Apply RTL layout changes
if (I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default AuthLandingScreen;