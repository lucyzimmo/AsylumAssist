import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHeader } from '../../components/navigation/AuthHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DateDropdown } from '../../components/forms/DateDropdown';
import { Colors } from '../../constants/Colors';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';

type PersonalInformationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'PersonalInformation'
>;

interface PersonalInformationForm {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  countryOfBirth: string;
  cityOfBirth: string;
  nationality: string;
  aliasNames?: string;
  maritalStatus: string;
}

const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation<PersonalInformationScreenNavigationProp>();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<PersonalInformationForm>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: new Date(),
      countryOfBirth: '',
      cityOfBirth: '',
      nationality: '',
      aliasNames: '',
      maritalStatus: '',
    },
  });

  const onSubmit = (data: PersonalInformationForm) => {
    navigation.navigate('ContactInformation', { personalInfo: data });
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AuthHeader
        title="Personal Information"
        onBackPress={handleBack}
        showBackButton={true}
        currentStep={1}
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
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
              pattern: {
                value: /^[a-zA-Z\s\-']+$/,
                message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="First Name"
                placeholder="Enter your first name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.firstName?.message}
                required
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="middleName"
            rules={{
              pattern: {
                value: /^[a-zA-Z\s\-']*$/,
                message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Middle Name (Optional)"
                placeholder="Enter your middle name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.middleName?.message}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            rules={{
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
              pattern: {
                value: /^[a-zA-Z\s\-']+$/,
                message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.lastName?.message}
                required
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <View style={styles.dateSection}>
            <Controller
              control={control}
              name="dateOfBirth"
              rules={{
                required: 'Date of birth is required',
                validate: (value) => {
                  const today = new Date();
                  const age = today.getFullYear() - value.getFullYear();
                  if (age < 13) {
                    return 'You must be at least 13 years old';
                  }
                  if (age > 120) {
                    return 'Please enter a valid date of birth';
                  }
                  return true;
                },
              }}
              render={({ field: { value } }) => (
                <DateDropdown
                  label="Date of Birth"
                  value={value}
                  onDateChange={(date) => setValue('dateOfBirth', date)}
                  errorText={errors.dateOfBirth?.message}
                  required
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="countryOfBirth"
            rules={{
              required: 'Country of birth is required',
              minLength: {
                value: 2,
                message: 'Country name must be at least 2 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Country of Birth"
                placeholder="Enter your country of birth"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.countryOfBirth?.message}
                required
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="cityOfBirth"
            rules={{
              required: 'City of birth is required',
              minLength: {
                value: 2,
                message: 'City name must be at least 2 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="City of Birth"
                placeholder="Enter your city of birth"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.cityOfBirth?.message}
                required
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="nationality"
            rules={{
              required: 'Nationality is required',
              minLength: {
                value: 2,
                message: 'Nationality must be at least 2 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nationality"
                placeholder="Enter your nationality"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.nationality?.message}
                required
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="maritalStatus"
            rules={{
              required: 'Marital status is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Marital Status"
                placeholder="Single, Married, Divorced, Widowed, etc."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.maritalStatus?.message}
                required
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="aliasNames"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Other Names/Aliases (Optional)"
                placeholder="Any other names you have been known by"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.aliasNames?.message}
                autoCapitalize="words"
                autoCorrect={false}
                multiline
                numberOfLines={3}
                helperText="Include any maiden names, nicknames, or other names you have used"
              />
            )}
          />
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
  dateSection: {
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

export default PersonalInformationScreen;