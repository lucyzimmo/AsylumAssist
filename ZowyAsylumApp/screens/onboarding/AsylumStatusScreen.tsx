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
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { DateDropdown } from '../../components/forms/DateDropdown';
import { Dropdown } from '../../components/ui/Dropdown';
import { AuthStackParamList } from '../../types/navigation';

interface AsylumStatusFormData {
  entryDate: Date | null;
  hasFiledI589: 'yes' | 'no' | 'not-sure' | '';
  i589SubmissionDate?: Date | null;
  filingLocation?: 'uscis' | 'immigration-court' | 'not-sure' | '';
  nextHearingDate?: Date | null;
  assignedCourt?: string;
  eoirCaseStatus?: 'yes' | 'no' | 'not-sure' | '';
}

type AsylumStatusScreenProps = StackScreenProps<AuthStackParamList, 'AsylumStatus'>;

export const AsylumStatusScreen: React.FC<AsylumStatusScreenProps> = ({ navigation }) => {
  const [showEntryDateInfo, setShowEntryDateInfo] = useState(false);
  const [showI589Info, setShowI589Info] = useState(false);
  const [showSubmissionDateInfo, setShowSubmissionDateInfo] = useState(false);
  const [showFilingLocationInfo, setShowFilingLocationInfo] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<AsylumStatusFormData>({
    defaultValues: {
      entryDate: null,
      hasFiledI589: '',
      i589SubmissionDate: null,
      filingLocation: '',
      nextHearingDate: null,
      assignedCourt: '',
      eoirCaseStatus: '',
    },
    mode: 'onChange',
  });

  const hasFiledI589 = watch('hasFiledI589');
  const entryDate = watch('entryDate');
  const filingLocation = watch('filingLocation');
  const eoirCaseStatus = watch('eoirCaseStatus');

  const calculateFilingDeadline = (entryDate: Date | null) => {
    if (!entryDate) return null;
    
    const deadline = new Date(entryDate);
    deadline.setFullYear(deadline.getFullYear() + 1);
    
    return deadline.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isDeadlinePassed = (entryDate: Date | null) => {
    if (!entryDate) return false;
    
    const deadline = new Date(entryDate);
    deadline.setFullYear(deadline.getFullYear() + 1);
    
    return new Date() > deadline;
  };

  const handleContinue = (data: AsylumStatusFormData) => {
    // Save form data to context/storage
    // TODO: Implement data persistence
    
    // Convert form data to navigation param format
    const asylumStatusData = {
      entryDate: data.entryDate?.toISOString(),
      hasFiledI589: data.hasFiledI589 as 'yes' | 'no',
      i589SubmissionDate: data.i589SubmissionDate?.toISOString(),
      filingLocation: data.filingLocation as 'uscis' | 'immigration-court' | 'not-sure' | undefined,
    };
    
    navigation.navigate('ImmigrationStatus', {
      asylumStatusData,
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const filingDeadline = calculateFilingDeadline(entryDate);
  const deadlinePassed = isDeadlinePassed(entryDate);

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
        <Text style={styles.progressText}>Step 1 of 3</Text>
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
            <Text style={styles.title}>Asylum application status</Text>
            <Text style={styles.subtitle}>
              Tell us where you are in the asylum process so we can determine your next steps.
            </Text>
          </View>

          {/* Critical Legal Warning */}
          <View style={styles.warningContainer}>
            <Alert
              variant="warning"
              title="Important Legal Warning"
              message="If you are NOT currently in removal proceedings with Immigration Court, applying for asylum could put you at risk of deportation if your case is denied. Consider consulting with an attorney before filing."
            />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Entry Date */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  When did you last enter the United States?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEntryDateInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about entry date"
                >
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                </TouchableOpacity>
              </View>
              
              <Controller
                control={control}
                name="entryDate"
                rules={{
                  required: 'Entry date is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <DateDropdown
                    label="Entry Date"
                    value={value}
                    onDateChange={onChange}
                    placeholder={{
                      month: 'Month',
                      day: 'Day', 
                      year: 'Year'
                    }}
                    maximumDate={new Date()}
                    error={errors.entryDate?.message}
                    containerStyle={styles.inputContainer}
                    required
                  />
                )}
              />
              
              {/* Filing Deadline Warning/Info */}
              {filingDeadline && (
                <View style={styles.alertContainer}>
                  <Alert
                    variant={deadlinePassed ? 'warning' : 'info'}
                    title={deadlinePassed ? 'One year filing deadline exception' : 'You\'re eligible to apply for asylum'}
                    message={
                      deadlinePassed
                        ? 'Your one-year filing deadline has passed. You may still be able to apply if you qualify for an exception. Consult an attorney to determine whether you should apply.'
                        : `Your one-year filing deadline is ${filingDeadline}.`
                    }
                  />
                </View>
              )}
            </View>

            {/* I-589 Filing Status */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Have you applied for asylum in the United States by filing a Form I-589?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowI589Info(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about Form I-589"
                >
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasFiledI589"
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
                    error={errors.hasFiledI589?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />
              
              {errors.hasFiledI589 && (
                <Text style={styles.errorText}>{errors.hasFiledI589.message}</Text>
              )}
            </View>

            {/* Conditional Fields for I-589 Filers */}
            {hasFiledI589 === 'yes' && (
              <>
                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>
                      When did you submit your asylum application?
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowSubmissionDateInfo(true)}
                      style={styles.infoButton}
                      accessibilityRole="button"
                      accessibilityLabel="More information about submission date"
                    >
                      <Ionicons name="information-circle" size={20} color={Colors.info} />
                    </TouchableOpacity>
                  </View>
                  <Controller
                    control={control}
                    name="i589SubmissionDate"
                    rules={{
                      required: 'Submission date is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DateDropdown
                        label="Submission Date"
                        value={value}
                        onDateChange={onChange}
                        placeholder={{
                          month: 'Month',
                          day: 'Day', 
                          year: 'Year'
                        }}
                        maximumDate={new Date()}
                        error={errors.i589SubmissionDate?.message}
                        containerStyle={styles.inputContainer}
                        required
                      />
                    )}
                  />
                </View>

                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>
                      Where did you file your asylum application?
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowFilingLocationInfo(true)}
                      style={styles.infoButton}
                      accessibilityRole="button"
                      accessibilityLabel="More information about filing location"
                    >
                      <Ionicons name="information-circle" size={20} color={Colors.info} />
                    </TouchableOpacity>
                  </View>
                  <Controller
                    control={control}
                    name="filingLocation"
                    rules={{
                      required: 'Filing location is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <Dropdown
                        placeholder="Select option"
                        options={[
                          { label: 'USCIS (Affirmative Process)', value: 'uscis' },
                          { label: 'Immigration Court (Defensive Process)', value: 'immigration-court' },
                          { label: 'Not sure', value: 'not-sure' }
                        ]}
                        value={value}
                        onSelect={onChange}
                        error={errors.filingLocation?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleSubmit(handleContinue)}
          disabled={!isValid}
          style={styles.continueButton}
        />
      </View>

      {/* Information Modals */}
      
      {/* Entry Date Info Modal */}
      <Modal
        visible={showEntryDateInfo}
        onClose={() => setShowEntryDateInfo(false)}
        title="Entry Date Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>What is your entry date?</Text>{'\n\n'}
            This is the date you last entered the United States, regardless of how you entered (legally or illegally).{'\n\n'}
            <Text style={styles.bold}>Why is this important?</Text>{'\n\n'}
            • You generally must file for asylum within one year of your last entry{'\n'}
            • This deadline affects your eligibility for asylum{'\n'}
            • Some exceptions may apply if you have TPS, parole, or other protected status{'\n\n'}
            <Text style={styles.bold}>If you're not sure:</Text>{'\n\n'}
            Use your best estimate. You can provide more details about your entry later.
          </Text>
        </View>
      </Modal>

      {/* I-589 Info Modal */}
      <Modal
        visible={showI589Info}
        onClose={() => setShowI589Info(false)}
        title="Form I-589 Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>What is Form I-589?</Text>{'\n\n'}
            Form I-589 is the Application for Asylum and for Withholding of Removal. It's the official form you must file to request asylum in the United States.{'\n\n'}
            <Text style={styles.bold}>Key points:</Text>{'\n\n'}
            • This is the main asylum application form{'\n'}
            • You can file it with USCIS (affirmative) or in Immigration Court (defensive){'\n'}
            • Filing this form starts your asylum process{'\n'}
            • You must file within one year of entry (with some exceptions){'\n\n'}
            <Text style={styles.bold}>If you haven't filed yet:</Text>{'\n\n'}
            Don't worry - we'll help you understand the process and what you need to do next.
          </Text>
        </View>
      </Modal>

      {/* Submission Date Info Modal */}
      <Modal
        visible={showSubmissionDateInfo}
        onClose={() => setShowSubmissionDateInfo(false)}
        title="Submission Date Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>When did you submit your I-589?</Text>{'\n\n'}
            This is the date you filed your asylum application with USCIS or Immigration Court.{'\n\n'}
            <Text style={styles.bold}>Why this matters:</Text>{'\n\n'}
            • Determines when you become eligible for work authorization{'\n'}
            • Affects your timeline for next steps{'\n'}
            • Helps track your case progress{'\n\n'}
            <Text style={styles.bold}>If you're not sure:</Text>{'\n\n'}
            Use your best estimate. You can check your receipt notice or ask your attorney for the exact date.
          </Text>
        </View>
      </Modal>

      {/* Filing Location Info Modal */}
      <Modal
        visible={showFilingLocationInfo}
        onClose={() => setShowFilingLocationInfo(false)}
        title="Filing Location Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>Where did you file your application?</Text>{'\n\n'}
            <Text style={styles.bold}>USCIS (Affirmative Process):</Text>{'\n'}
            • You filed directly with U.S. Citizenship and Immigration Services{'\n'}
            • Your case is processed by USCIS Asylum Office{'\n'}
            • You'll have an interview with an asylum officer{'\n\n'}
            <Text style={styles.bold}>Immigration Court (Defensive Process):</Text>{'\n'}
            • You filed in Immigration Court during removal proceedings{'\n'}
            • Your case is heard by an Immigration Judge{'\n'}
            • You're in deportation proceedings{'\n\n'}
            <Text style={styles.bold}>Not sure?</Text>{'\n\n'}
            Select "Not sure" and we can help you figure it out based on other information.
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
  alertContainer: {
    marginTop: 8,
  },
  warningContainer: {
    marginBottom: 24,
  },
  radioContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
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
  continueButton: {
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

export default AsylumStatusScreen;