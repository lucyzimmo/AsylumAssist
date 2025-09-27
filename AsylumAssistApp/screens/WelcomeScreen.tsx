import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { Button } from '../components/ui/Button';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { isRTL } from '../i18n';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../types/navigation';

type WelcomeScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

// Dimensions available if needed for responsive design

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const isRTLLayout = isRTL(i18n.language);

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
    <SafeAreaView style={[styles.container, isRTLLayout && styles.rtlContainer]}>
      {/* Language Switcher */}
      <View style={[styles.languageSwitcherContainer, isRTLLayout && styles.rtlLanguageSwitcher]}>
        <LanguageSwitcher />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isRTLLayout && styles.rtlContent]}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, isRTLLayout && styles.rtlText]}>{t('welcome.title')}</Text>
            <Text style={[styles.subtitle, isRTLLayout && styles.rtlText]}>
              {t('welcome.subtitle')}
            </Text>
          </View>

          {/* Feature List */}
          <View style={styles.featuresSection}>
            <View style={[styles.featureItem, isRTLLayout && styles.rtlFeatureItem]}>
              <Text style={[styles.featureTitle, isRTLLayout && styles.rtlText]}>{t('welcome.features.timeline.title')}</Text>
              <Text style={[styles.featureDescription, isRTLLayout && styles.rtlText]}>
                {t('welcome.features.timeline.description')}
              </Text>
            </View>

            <View style={[styles.featureItem, isRTLLayout && styles.rtlFeatureItem]}>
              <Text style={[styles.featureTitle, isRTLLayout && styles.rtlText]}>{t('welcome.features.forms.title')}</Text>
              <Text style={[styles.featureDescription, isRTLLayout && styles.rtlText]}>
                {t('welcome.features.forms.description')}
              </Text>
            </View>

            <View style={[styles.featureItem, isRTLLayout && styles.rtlFeatureItem]}>
              <Text style={[styles.featureTitle, isRTLLayout && styles.rtlText]}>{t('welcome.features.resources.title')}</Text>
              <Text style={[styles.featureDescription, isRTLLayout && styles.rtlText]}>
                {t('welcome.features.resources.description')}
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
            <Text style={[styles.loginText, isRTLLayout && styles.rtlText]}>
              {t('welcome.loginPrompt')} <Text style={styles.loginLinkText}>{t('welcome.loginLink')}</Text>
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <Button
              title={t('welcome.getStarted')}
              onPress={handleSignUp}
              variant="primary"
              fullWidth
              style={styles.getStartedButton}
            />

            <Button
              title={t('welcome.doLater')}
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

  // Language Switcher
  languageSwitcherContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  rtlLanguageSwitcher: {
    right: undefined,
    left: 20,
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
  rtlFeatureItem: {
    alignItems: 'flex-end',
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

// Apply RTL layout changes
if (I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default WelcomeScreen;