import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { isRTL } from '../../i18n';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';
import { AuthService, TEST_USERNAME, TEST_USER_PASSWORD } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginForm {
  username: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const isRTLLayout = isRTL(i18n.language);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    mode: 'onChange',
    defaultValues: {
      username: TEST_USERNAME,
      password: TEST_USER_PASSWORD,
    },
  });

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username) || t('auth.login.usernameValidation');
  };

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await AuthService.signIn(data.username, data.password);
      if (!result.success) {
        Alert.alert(t('auth.login.loginFailed'), result.error || t('auth.login.loginError'));
        return;
      }
      // Navigate to main app on success
      navigation.getParent()?.navigate('MainStack');
    } catch (error) {
      Alert.alert(t('auth.login.loginFailed'), t('auth.login.loginGenericError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, isRTLLayout && styles.rtlContainer]}>
      {/* Language Switcher - Hidden for login screen */}
      {/* <View style={[styles.languageSwitcherContainer, isRTLLayout && styles.rtlLanguageSwitcher]}>
        <LanguageSwitcher />
      </View> */}

      <View style={[styles.content, isRTLLayout && styles.rtlContent]}>
        <Text style={[styles.title, isRTLLayout && styles.rtlText]}>{t('auth.login.title')}</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="username"
            rules={{
              required: t('auth.login.usernameRequired'),
              validate: validateUsername,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.login.username')}
                placeholder={t('auth.login.usernamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.username?.message}
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
              required: t('auth.login.passwordRequired'),
              minLength: { value: 8, message: t('auth.login.passwordMinLength') },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  label={t('auth.login.password')}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.password?.message}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.inputContainer}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPassword}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                  <Text style={[styles.showPasswordText, isRTLLayout && styles.rtlText]}>
                    {showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title={t('auth.login.loginButton')}
            onPress={handleSubmit(handleLogin)}
            disabled={!isValid}
            loading={isLoading}
            variant="primary"
            size="large"
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  showPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  showPasswordText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  actions: {
    paddingTop: 32,
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
});

// Apply RTL layout changes
if (I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default LoginScreen;

 