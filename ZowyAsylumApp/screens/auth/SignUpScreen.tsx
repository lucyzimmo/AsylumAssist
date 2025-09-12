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
import { AuthService } from '../../services/authService';

type SignUpScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

interface SignUpForm {
  nickname: string;
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
    setValue,
    formState: { errors, isValid },
  } = useForm<SignUpForm>({
    mode: 'onChange',
    defaultValues: {
      nickname: '',
      password: '',
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const validateNickname = (nickname: string) => {
    if (nickname.length < 3) {
      return 'Nickname must be at least 3 characters';
    }
    if (nickname.length > 20) {
      return 'Nickname must be no more than 20 characters';
    }
    const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
    return nicknameRegex.test(nickname) || 'Nickname can only contain letters, numbers, _ and -';
  };

  const generateRandomNickname = () => {
    const adjectives = ['Swift', 'Bright', 'Kind', 'Strong', 'Wise', 'Bold', 'Calm', 'Free', 'Hope', 'Safe'];
    const nouns = ['Seeker', 'Helper', 'Guide', 'Friend', 'Walker', 'Star', 'Path', 'Bridge', 'Light', 'Haven'];
    const randomNum = Math.floor(Math.random() * 1000);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}${randomNum}`;
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
      // Clear any existing data to ensure fresh start for new account
      await AuthService.clearNewAccountData();
      
      // Simulate API call - in real implementation this would create account with Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Account Created', 
        `Welcome ${data.nickname}! Please complete your timeline questionnaire to get started.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to onboarding questionnaire - users must complete timeline setup
              navigation.navigate('OnboardingStart');
            }
          }
        ]
      );
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
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Sign up</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="nickname"
            rules={{
              required: 'Nickname is required',
              validate: validateNickname,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Nickname</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const randomNickname = generateRandomNickname();
                      setValue('nickname', randomNickname);
                      onChange(randomNickname);
                    }}
                    style={styles.generateButton}
                  >
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.nicknameHint}>
                  Choose a nickname that doesn't identify you personally
                </Text>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Enter a nickname"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={errors.nickname?.message}
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  generateButtonText: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontWeight: '600',
  },
  nicknameHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
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