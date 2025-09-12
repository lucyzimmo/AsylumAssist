import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { StackScreenProps } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { Alert as UIAlert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { DateDropdown } from '../../components/forms/DateDropdown';
import { Dropdown } from '../../components/ui/Dropdown';
import { AuthStackParamList } from '../../types/navigation';
import { getTPSCountryOptions, getTPSExpirationDate } from '../../constants/tpsCountries';
import timelineService from '../../services/timelineService';

interface SpecialStatusFormData {
  hasTPS: 'yes' | 'no' | '';
  tpsCountry?: string;
  hasParole: 'yes' | 'no' | '';
  paroleType?: string;
  paroleExpirationDate?: Date | null;
  hasOtherStatus: 'yes' | 'no' | '';
  otherStatusDescription?: string;
}

type SpecialStatusScreenProps = StackScreenProps<AuthStackParamList, 'SpecialStatus'>;

export const SpecialStatusScreen: React.FC<SpecialStatusScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [showTPSInfo, setShowTPSInfo] = useState(false);
  const [showParoleInfo, setShowParoleInfo] = useState(false);
  const [showOtherStatusInfo, setShowOtherStatusInfo] = useState(false);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SpecialStatusFormData>({
    defaultValues: {
      hasTPS: '',
      tpsCountry: '',
      hasParole: '',
      paroleType: '',
      paroleExpirationDate: null,
      hasOtherStatus: '',
      otherStatusDescription: '',
    },
    mode: 'onChange',
  });

  const hasTPS = watch('hasTPS');
  const tpsCountry = watch('tpsCountry');
  const hasParole = watch('hasParole');
  const hasOtherStatus = watch('hasOtherStatus');

  const handleComplete = async (data: SpecialStatusFormData) => {
    setIsGeneratingTimeline(true);
    
    try {
      // Get TPS expiration date automatically from country lookup
      const tpsExpirationDate = data.tpsCountry ? getTPSExpirationDate(data.tpsCountry) : null;
      
      // Combine all onboarding data
      const completeOnboardingData = {
        ...route?.params?.onboardingData,
        hasTPS: data.hasTPS as 'yes' | 'no',
        tpsCountry: data.tpsCountry,
        tpsExpirationDate,
        hasParole: data.hasParole as 'yes' | 'no',
        paroleType: data.paroleType,
        paroleExpirationDate: data.paroleExpirationDate?.toISOString(),
        hasOtherStatus: data.hasOtherStatus as 'yes' | 'no',
        otherStatusDescription: data.otherStatusDescription,
      };

      // Save onboarding data to storage
      await AsyncStorage.setItem('userOnboardingData', JSON.stringify(completeOnboardingData));

      // Initialize timeline with actual service using questionnaire data
      const entryDate = completeOnboardingData.entryDate || new Date().toISOString().split('T')[0];
      const hasAttorney = false; // Can be determined from future questions
      
      await timelineService.initializeTimeline(
        entryDate, 
        hasAttorney, 
        completeOnboardingData
      );

      // Navigate directly to the main dashboard
      navigation.getParent()?.navigate('MainStack');
      
    } catch (error) {
      console.error('Error generating timeline:', error);
      Alert.alert(
        'Error', 
        'There was an error setting up your timeline. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Get help"
        >
          <View style={styles.helpIcon}>
            <Text style={styles.helpText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Special Immigration Status</Text>
            <Text style={styles.subtitle}>
              Tell us about any special immigration status you may have, such as TPS, parole, or work authorization.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* TPS Status */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Do you have Temporary Protected Status (TPS)?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTPSInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about TPS"
                >
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasTPS"
                rules={{ required: 'Please select an option' }}
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    placeholder="Select option"
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                    value={value}
                    onSelect={onChange}
                    error={errors.hasTPS?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />
              
              {errors.hasTPS && (
                <Text style={styles.errorText}>{errors.hasTPS.message}</Text>
              )}
            </View>

            {/* Conditional Fields for TPS */}
            {hasTPS === 'yes' && (
              <>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    Which country is your TPS for?
                  </Text>
                  <Controller
                    control={control}
                    name="tpsCountry"
                    rules={{
                      required: 'TPS country is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                                              <Dropdown
                          placeholder="Select TPS country"
                          options={getTPSCountryOptions()}
                          value={value || ''}
                          onSelect={onChange}
                          error={errors.tpsCountry?.message}
                          containerStyle={styles.inputContainer}
                        />
                    )}
                  />
                </View>

                {/* Show current expiration info */}
                {tpsCountry && (
                  <View style={styles.questionContainer}>
                    <UIAlert
                      variant="info"
                      title="TPS Expiration Information"
                      message={`Current TPS expires: ${new Date(getTPSExpirationDate(tpsCountry) || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. This date may change based on DHS announcements.`}
                    />
                  </View>
                )}
              </>
            )}

            {/* Parole Status */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Do you have humanitarian parole or advance parole?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowParoleInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about parole"
                >
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasParole"
                rules={{ required: 'Please select an option' }}
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    placeholder="Select option"
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                    value={value}
                    onSelect={onChange}
                    error={errors.hasParole?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />
              
              {errors.hasParole && (
                <Text style={styles.errorText}>{errors.hasParole.message}</Text>
              )}
            </View>

            {/* Conditional Fields for Parole */}
            {hasParole === 'yes' && (
              <>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    What type of parole do you have?
                  </Text>
                  <Controller
                    control={control}
                    name="paroleType"
                    rules={{
                      required: 'Parole type is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Parole Type"
                        value={value}
                        onChangeText={onChange}
                        placeholder="e.g., Humanitarian parole, Advance parole, Medical parole"
                        error={errors.paroleType?.message}
                        containerStyle={styles.inputContainer}
                        required
                      />
                    )}
                  />
                </View>

                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    When does your parole expire?
                  </Text>
                  <Controller
                    control={control}
                    name="paroleExpirationDate"
                    rules={{
                      required: 'Parole expiration date is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DateDropdown
                        label="Parole Expiration Date"
                        value={value}
                        onDateChange={onChange}
                        placeholder={{
                          month: 'Month',
                          day: 'Day', 
                          year: 'Year'
                        }}
                        minimumDate={new Date()}
                        error={errors.paroleExpirationDate?.message}
                        containerStyle={styles.inputContainer}
                        required
                      />
                    )}
                  />
                </View>
              </>
            )}


            {/* Other Immigration Status */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Do you have any other immigration status or pending applications?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowOtherStatusInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about other immigration status"
                >
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasOtherStatus"
                rules={{ required: 'Please select an option' }}
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    placeholder="Select option"
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                    value={value}
                    onSelect={onChange}
                    error={errors.hasOtherStatus?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />
              
              {errors.hasOtherStatus && (
                <Text style={styles.errorText}>{errors.hasOtherStatus.message}</Text>
              )}
            </View>

            {/* Conditional Fields for Other Status */}
            {hasOtherStatus === 'yes' && (
              <View style={styles.questionContainer}>
                <Text style={styles.questionTitle}>
                  Please describe your other immigration status or pending applications
                </Text>
                <Controller
                  control={control}
                  name="otherStatusDescription"
                  rules={{
                    required: 'Description is required',
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Status Description"
                      value={value}
                      onChangeText={onChange}
                      placeholder="e.g., Pending green card application, U visa application, etc."
                      error={errors.otherStatusDescription?.message}
                      containerStyle={styles.inputContainer}
                      multiline
                      numberOfLines={3}
                      required
                    />
                  )}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={isGeneratingTimeline ? "Setting up your timeline..." : "Complete Questionnaire"}
          onPress={handleSubmit(handleComplete)}
          disabled={!isValid || isGeneratingTimeline}
          loading={isGeneratingTimeline}
          style={styles.completeButton}
        />
      </View>

      {/* Information Modals */}
      
      {/* TPS Info Modal */}
      <Modal
        visible={showTPSInfo}
        onClose={() => setShowTPSInfo(false)}
        title="TPS Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>What is TPS?</Text>{'\n\n'}
            Temporary Protected Status (TPS) is a temporary immigration status granted to eligible nationals of designated countries facing ongoing armed conflict, environmental disaster, or other extraordinary conditions.{'\n\n'}
            <Text style={styles.bold}>Key benefits:</Text>{'\n\n'}
            • Protection from deportation{'\n'}
            • Work authorization{'\n'}
            • Travel permission{'\n'}
            • Can apply for asylum even after one-year deadline{'\n\n'}
            <Text style={styles.bold}>Common TPS countries:</Text>{'\n\n'}
            • El Salvador, Honduras, Haiti{'\n'}
            • Nicaragua, Venezuela, Myanmar{'\n'}
            • Syria, Yemen, Somalia{'\n\n'}
            <Text style={styles.bold}>Why this matters for asylum:</Text>{'\n\n'}
            Having TPS can provide exceptions to the one-year filing deadline for asylum applications.
          </Text>
        </View>
      </Modal>

      {/* Parole Info Modal */}
      <Modal
        visible={showParoleInfo}
        onClose={() => setShowParoleInfo(false)}
        title="Parole Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>What is parole?</Text>{'\n\n'}
            Parole is permission to enter the United States for a specific purpose and limited time, granted on a case-by-case basis.{'\n\n'}
            <Text style={styles.bold}>Types of parole:</Text>{'\n\n'}
            <Text style={styles.bold}>Humanitarian Parole:</Text>{'\n'}
            • Granted for urgent humanitarian reasons{'\n'}
            • Medical emergencies, family reunification{'\n'}
            • Can provide exceptions to asylum deadlines{'\n\n'}
            <Text style={styles.bold}>Advance Parole:</Text>{'\n'}
            • Permission to travel abroad and return{'\n'}
            • Usually for pending applications{'\n'}
            • Important for maintaining status{'\n\n'}
            <Text style={styles.bold}>Why this matters:</Text>{'\n\n'}
            Having parole can affect your asylum timeline and eligibility.
          </Text>
        </View>
      </Modal>

      {/* Other Status Info Modal */}
      <Modal
        visible={showOtherStatusInfo}
        onClose={() => setShowOtherStatusInfo(false)}
        title="Other Immigration Status"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>What other status might you have?</Text>{'\n\n'}
            There are many other types of immigration status or pending applications that could affect your asylum case.{'\n\n'}
            <Text style={styles.bold}>Common examples:</Text>{'\n\n'}
            • Pending green card applications{'\n'}
            • U visa applications (crime victims){'\n'}
            • VAWA applications (domestic violence){'\n'}
            • Special Immigrant Juvenile status{'\n'}
            • Deferred Action for Childhood Arrivals (DACA){'\n'}
            • Pending family-based petitions{'\n\n'}
            <Text style={styles.bold}>Why this matters:</Text>{'\n\n'}
            Other immigration applications can affect your asylum timeline, eligibility, and what forms you need to file.
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  infoButton: {
    padding: 4,
  },
  infoButtonText: {
    fontSize: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  completeButton: {
    backgroundColor: Colors.primaryDark,
  },
  // Modal styles
  modalContent: {
    padding: 16,
  },
  modalText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
});

export default SpecialStatusScreen;