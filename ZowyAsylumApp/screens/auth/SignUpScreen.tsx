import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type SignUpScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

interface SignUpForm {
  email: string;
  password: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpForm>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Please enter a valid email address';
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return true;
  };

  const handleSignUp = async (data: SignUpForm) => {
    if (!agreeToTerms || !agreeToPrivacy) {
      Alert.alert('Agreement Required', 'Please agree to the terms and conditions and privacy policy to continue.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate to email verification
      navigation.navigate('EmailVerification', { email: data.email });
    } catch (error) {
      Alert.alert('Sign Up Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    navigation.goBack();
  };

  const isFormValid = isValid && agreeToTerms && agreeToPrivacy;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with exit and language selector */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        
        <View style={styles.languageSelector}>
          <Text style={styles.languageLabel}>Language:</Text>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>English</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Sign up</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              validate: validateEmail,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    containerStyle={styles.customInputContainer}
                    style={styles.customInput}
                  />
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              validate: validatePassword,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={errors.password?.message}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    containerStyle={styles.customInputContainer}
                    style={styles.customInput}
                  />
                </View>
              </View>
            )}
          />

          <View style={styles.checkboxSection}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeToTerms }}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={14} color={Colors.textPrimary} />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.link}>terms and conditions</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreeToPrivacy(!agreeToPrivacy)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeToPrivacy }}
            >
              <View style={[styles.checkbox, agreeToPrivacy && styles.checkboxChecked]}>
                {agreeToPrivacy && (
                  <Ionicons name="checkmark" size={14} color={Colors.textPrimary} />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.link}>privacy policy</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign up"
            onPress={handleSubmit(handleSignUp)}
            disabled={!isFormValid}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.signUpButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light gray background from design
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8', // Light green background for exit button
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exitText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: 4,
    fontSize: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginRight: 8,
    fontSize: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark, // Dark green button for language
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    ...Typography.body,
    color: Colors.white,
    marginRight: 8,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    // This will allow us to override the Input component styles
  },
  customInputContainer: {
    marginBottom: 0, // Remove default margin
  },
  customInput: {
    borderRadius: 25, // Very rounded inputs as shown in design
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
    minHeight: 56, // Make inputs taller to match design
  },
  checkboxSection: {
    marginTop: 24,
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.white,
    borderColor: Colors.textPrimary,
  },
  checkboxText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    color: Colors.textPrimary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actions: {
    paddingTop: 32,
    paddingBottom: 40,
  },
  signUpButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 25,
    paddingVertical: 16,
  },
});

export default SignUpScreen;