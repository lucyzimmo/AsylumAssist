import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import type { StackNavigationProp, RouteProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';

type EmailVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'EmailVerification'
>;

type EmailVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'EmailVerification'
>;

export const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
  const route = useRoute<EmailVerificationScreenRouteProp>();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const { email } = route.params || { email: 'your email' };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Email Sent',
        'We\'ve sent another verification email to your inbox.'
      );
      
      // Reset countdown
      setCountdown(30);
      setCanResend(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    // Navigate to onboarding start
    navigation.navigate('OnboardingStart');
  };

  const handleChangeEmail = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.emailIcon}>✉️</Text>
        </View>

        <Text style={styles.title}>Check your email</Text>
        
        <Text style={styles.description}>
          We've sent a verification link to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <Text style={styles.instruction}>
          Please check your email and click the verification link to continue.
        </Text>

        <View style={styles.actions}>
          <Button
            title="I've verified my email"
            onPress={handleContinue}
            variant="primary"
            size="large"
            style={styles.continueButton}
          />

          <Button
            title={
              canResend
                ? 'Resend email'
                : `Resend email in ${countdown}s`
            }
            onPress={handleResendEmail}
            disabled={!canResend}
            loading={isResending}
            variant="outline"
            size="large"
            style={styles.resendButton}
          />

          <Button
            title="Change email address"
            onPress={handleChangeEmail}
            variant="outline"
            size="medium"
            style={styles.changeEmailButton}
          />
        </View>

        <Text style={styles.helpText}>
          Can't find the email? Check your spam folder or contact support.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryLight,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emailIcon: {
    fontSize: 40,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  email: {
    fontWeight: '600',
    color: Colors.primary,
  },
  instruction: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 48,
  },
  actions: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: Colors.primary,
  },
  resendButton: {
    borderColor: Colors.textSecondary,
  },
  changeEmailButton: {
    borderColor: Colors.textDisabled,
  },
  helpText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default EmailVerificationScreen;