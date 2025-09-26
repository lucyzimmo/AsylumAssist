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
import { DateDropdown } from '../../components/forms/DateDropdown';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import type { StackNavigationProp, RouteProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';

type BackgroundInformationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'BackgroundInformation'
>;

type BackgroundInformationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'BackgroundInformation'
>;

interface BackgroundInformationForm {
  countryOfLastResidence: string;
  arrivalDate: Date;
  educationLevel: string;
  occupation: string;
  languagesSpoken: string;
  familyInUS: string;
  familyUSDetails?: string;
  previousLegalHelp: string;
  legalHelpDetails?: string;
  immigrationStatus: string;
  currentlyEmployed: string;
  employmentDetails?: string;
  hasChildren: string;
  childrenDetails?: string;
  medicalConditions?: string;
  specialNeeds?: string;
}

const BackgroundInformationScreen: React.FC = () => {
  const navigation = useNavigation<BackgroundInformationScreenNavigationProp>();
  const route = useRoute<BackgroundInformationScreenRouteProp>();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<BackgroundInformationForm>({
    mode: 'onChange',
    defaultValues: {
      countryOfLastResidence: '',
      arrivalDate: new Date(),
      educationLevel: '',
      occupation: '',
      languagesSpoken: '',
      familyInUS: 'No',
      familyUSDetails: '',
      previousLegalHelp: 'No',
      legalHelpDetails: '',
      immigrationStatus: '',
      currentlyEmployed: 'No',
      employmentDetails: '',
      hasChildren: 'No',
      childrenDetails: '',
      medicalConditions: '',
      specialNeeds: '',
    },
  });

  const watchFamilyInUS = watch('familyInUS');
  const watchPreviousLegal = watch('previousLegalHelp');
  const watchEmployed = watch('currentlyEmployed');
  const watchHasChildren = watch('hasChildren');

  const onSubmit = (data: BackgroundInformationForm) => {
    navigation.navigate('ReviewInformation', {
      ...route.params,
      backgroundInfo: data,
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AuthHeader
        title="Background Information"
        onBackPress={handleBack}
        showBackButton={true}
        currentStep={3}
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
            <Text style={styles.sectionTitle}>Immigration History</Text>
            
            <Controller
              control={control}
              name="countryOfLastResidence"
              rules={{
                required: 'Country of last residence is required',
                minLength: {
                  value: 2,
                  message: 'Please enter a valid country name',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Country of Last Residence"
                  placeholder="Enter the country you lived in before coming to the US"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.countryOfLastResidence?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            <View style={styles.dateSection}>
              <Controller
                control={control}
                name="arrivalDate"
                rules={{
                  required: 'Arrival date is required',
                  validate: (value) => {
                    const today = new Date();
                    if (value > today) {
                      return 'Arrival date cannot be in the future';
                    }
                    const tenYearsAgo = new Date();
                    tenYearsAgo.setFullYear(today.getFullYear() - 50);
                    if (value < tenYearsAgo) {
                      return 'Please enter a valid arrival date';
                    }
                    return true;
                  },
                }}
                render={({ field: { value } }) => (
                  <DateDropdown
                    label="Date of Arrival in US"
                    value={value}
                    onDateChange={(date) => setValue('arrivalDate', date)}
                    error={errors.arrivalDate?.message}
                    required
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="immigrationStatus"
              rules={{
                required: 'Immigration status is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Current Immigration Status"
                  placeholder="Asylum seeker, Refugee, Pending asylum, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.immigrationStatus?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education & Employment</Text>
            
            <Controller
              control={control}
              name="educationLevel"
              rules={{
                required: 'Education level is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Highest Level of Education"
                  placeholder="Elementary, High School, Bachelor's Degree, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.educationLevel?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="occupation"
              rules={{
                required: 'Occupation is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Previous Occupation (in home country)"
                  placeholder="Teacher, Engineer, Farmer, Student, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.occupation?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="currentlyEmployed"
              rules={{
                required: 'Employment status is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Currently Employed in the US?"
                  placeholder="Yes or No"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.currentlyEmployed?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            {(watchEmployed?.toLowerCase() === 'yes') && (
              <Controller
                control={control}
                name="employmentDetails"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Employment Details"
                    placeholder="What type of work do you do? Where do you work?"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={errors.employmentDetails?.message}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language & Communication</Text>
            
            <Controller
              control={control}
              name="languagesSpoken"
              rules={{
                required: 'Languages spoken is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Languages You Speak"
                  placeholder="English, Spanish, Arabic, French, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.languagesSpoken?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                  helperText="List all languages you can speak, separated by commas"
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Information</Text>
            
            <Controller
              control={control}
              name="familyInUS"
              rules={{
                required: 'Please specify if you have family in the US',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Do you have family members in the US?"
                  placeholder="Yes or No"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.familyInUS?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            {(watchFamilyInUS?.toLowerCase() === 'yes') && (
              <Controller
                control={control}
                name="familyUSDetails"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Family Details"
                    placeholder="Who are they? Where do they live? What is their status?"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={errors.familyUSDetails?.message}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="hasChildren"
              rules={{
                required: 'Please specify if you have children',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Do you have children?"
                  placeholder="Yes or No"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.hasChildren?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            {(watchHasChildren?.toLowerCase() === 'yes') && (
              <Controller
                control={control}
                name="childrenDetails"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Children Details"
                    placeholder="How many children? Ages? Are they with you in the US?"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={errors.childrenDetails?.message}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal & Medical Information</Text>
            
            <Controller
              control={control}
              name="previousLegalHelp"
              rules={{
                required: 'Please specify if you have received legal help',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Have you received legal help before?"
                  placeholder="Yes or No"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.previousLegalHelp?.message}
                  required
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />

            {(watchPreviousLegal?.toLowerCase() === 'yes') && (
              <Controller
                control={control}
                name="legalHelpDetails"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Legal Help Details"
                    placeholder="What type of help? From whom? When? What was the outcome?"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorText={errors.legalHelpDetails?.message}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="medicalConditions"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Medical Conditions (Optional)"
                  placeholder="Any chronic conditions, disabilities, or ongoing medical needs"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.medicalConditions?.message}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  multiline
                  numberOfLines={3}
                  helperText="This helps us connect you with appropriate medical resources"
                />
              )}
            />

            <Controller
              control={control}
              name="specialNeeds"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Special Accommodation Needs (Optional)"
                  placeholder="Wheelchair access, interpreter services, childcare, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.specialNeeds?.message}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  multiline
                  numberOfLines={3}
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

export default BackgroundInformationScreen;