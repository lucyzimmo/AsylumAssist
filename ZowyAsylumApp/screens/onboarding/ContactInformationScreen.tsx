import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHeader } from '../../components/navigation/AuthHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import type { StackNavigationProp, RouteProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';

type ContactInformationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ContactInformation'
>;

type ContactInformationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'ContactInformation'
>;

interface ContactInformationForm {
  phoneNumber: string;
  email: string;
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  preferredLanguage: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredContactMethod: string;
}

const ContactInformationScreen: React.FC = () => {
  const navigation = useNavigation<ContactInformationScreenNavigationProp>();
  const route = useRoute<ContactInformationScreenRouteProp>();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ContactInformationForm>({
    mode: 'onChange',
    defaultValues: {
      phoneNumber: '',
      email: '',
      currentAddress: '',
      city: '',
      state: '',
      zipCode: '',
      preferredLanguage: 'English',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      preferredContactMethod: 'email',
    },
  });

  const onSubmit = (data: ContactInformationForm) => {
    navigation.navigate('BackgroundInformation', {
      ...route.params,
      contactInfo: data,
    });
  };

  const handleBack = () => {
    Alert.alert(
      'Go Back',
      'Are you sure you want to go back? Any unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go Back', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Please enter a valid email address';
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone) || 'Please enter a valid phone number';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AuthHeader
        title="Contact Information"
        onBackPress={handleBack}
        showBackButton={true}
        currentStep={2}
        totalSteps={4}
        showProgress={true}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Contact</Text>
            
            <Controller
              control={control}
              name="phoneNumber"
              rules={{
                required: 'Phone number is required',
                validate: validatePhone,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.phoneNumber?.message}
                  required
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email address is required',
                validate: validateEmail,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.email?.message}
                  required
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Address</Text>
            
            <Controller
              control={control}
              name="currentAddress"
              rules={{
                required: 'Current address is required',
                minLength: {
                  value: 10,
                  message: 'Please enter a complete address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Street Address"
                  placeholder="123 Main Street, Apt 4B"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.currentAddress?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              rules={{
                required: 'City is required',
                minLength: {
                  value: 2,
                  message: 'City name must be at least 2 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="City"
                  placeholder="Enter your city"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.city?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="state"
                  rules={{
                    required: 'State is required',
                    minLength: {
                      value: 2,
                      message: 'State must be at least 2 characters',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="State"
                      placeholder="NY"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      errorText={errors.state?.message}
                      required
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  )}
                />
              </View>
              
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="zipCode"
                  rules={{
                    required: 'ZIP code is required',
                    pattern: {
                      value: /^\d{5}(-\d{4})?$/,
                      message: 'Please enter a valid ZIP code',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="ZIP Code"
                      placeholder="10001"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      errorText={errors.zipCode?.message}
                      required
                      keyboardType="numeric"
                      autoCorrect={false}
                    />
                  )}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communication Preferences</Text>
            
            <Controller
              control={control}
              name="preferredLanguage"
              rules={{
                required: 'Preferred language is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Preferred Language"
                  placeholder="English, Spanish, Arabic, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.preferredLanguage?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="preferredContactMethod"
              rules={{
                required: 'Preferred contact method is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Preferred Contact Method"
                  placeholder="Email, Phone, Text Message"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.preferredContactMethod?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>
            
            <Controller
              control={control}
              name="emergencyContactName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Emergency Contact Name"
                  placeholder="Enter name of emergency contact"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.emergencyContactName?.message}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="emergencyContactPhone"
              rules={{
                validate: (value) => {
                  if (value && !validatePhone(value)) {
                    return 'Please enter a valid phone number';
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Emergency Contact Phone"
                  placeholder="+1 (555) 123-4567"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.emergencyContactPhone?.message}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="emergencyContactRelationship"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Relationship to Emergency Contact"
                  placeholder="Mother, Father, Spouse, Friend, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.emergencyContactRelationship?.message}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
          variant="primary"
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default ContactInformationScreen;