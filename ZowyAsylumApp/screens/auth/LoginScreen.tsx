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

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginForm {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Please enter a valid email address';
  };

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate to main app after successful login
      navigation.getParent()?.navigate('MainStack');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    navigation.goBack();
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitIcon}>←</Text>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        
        <View style={styles.languageSelector}>
          <Text style={styles.languageLabel}>Language:</Text>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>English</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Log in</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              validate: validateEmail,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.inputContainer}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.password?.message}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.inputContainer}
              />
            )}
          />

          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>I've forgotten my password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <Button
            title="Log in"
            onPress={handleSubmit(handleLogin)}
            disabled={!isValid}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
  },
  exitIcon: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginRight: 4,
  },
  exitText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
  },
  languageText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '500',
    marginRight: 8,
  },
  dropdownIcon: {
    fontSize: 12,
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  inputContainer: {
    marginBottom: 24,
  },
  forgotPasswordLink: {
    alignSelf: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  forgotPasswordText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  actions: {
    paddingBottom: 32,
    paddingTop: 40,
  },
  loginButton: {
    backgroundColor: Colors.primaryDark,
  },
});

export default LoginScreen;