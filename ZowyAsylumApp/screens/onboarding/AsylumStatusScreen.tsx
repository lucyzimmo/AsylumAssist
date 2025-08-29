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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { StackScreenProps } from '@react-navigation/stack';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { DatePicker } from '../../components/forms/DatePicker';
import { AuthStackParamList } from '../../types/navigation';

interface AsylumStatusFormData {
  entryDate: Date | null;
  hasFiledI589: 'Yes' | 'No' | 'Not sure' | '';
  i589SubmissionDate?: Date | null;
  filingLocation?: string;
}

type AsylumStatusScreenProps = StackScreenProps<AuthStackParamList, 'AsylumStatus'>;

export const AsylumStatusScreen: React.FC<AsylumStatusScreenProps> = ({ navigation }) => {
  const [showEntryDateInfo, setShowEntryDateInfo] = useState(false);
  const [showI589Info, setShowI589Info] = useState(false);

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
    },
    mode: 'onChange',
  });

  const hasFiledI589 = watch('hasFiledI589');
  const entryDate = watch('entryDate');

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
      hasFiledI589: data.hasFiledI589 === 'Yes' ? 'yes' as const : 
                   data.hasFiledI589 === 'No' ? 'no' as const : 'not-sure' as const,
      i589SubmissionDate: data.i589SubmissionDate?.toISOString(),
      filingLocation: data.filingLocation === 'USCIS (Affirmative Process)' ? 'uscis' as const :
                     data.filingLocation === 'Immigration Court (Defensive Process)' ? 'immigration-court' as const :
                     data.filingLocation === 'Not sure' ? 'not-sure' as const : undefined,
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
          <Text style={styles.backButtonText}>← Exit</Text>
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
        <ProgressIndicator
          currentStep={1}
          totalSteps={3}
          stepLabels={['Asylum Status', 'Immigration Status', 'Special Status']}
          showLabels={false}
        />
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
                  <Text style={styles.infoButtonText}>ℹ️</Text>
                </TouchableOpacity>
              </View>
              
              <Controller
                control={control}
                name="entryDate"
                rules={{
                  required: 'Entry date is required',
                  validate: (value) => {
                    if (!value) return 'Entry date is required';
                    if (value > new Date()) return 'Entry date cannot be in the future';
                    return true;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    onDateChange={onChange}
                    placeholder="Select entry date"
                    format="DD/MM/YYYY"
                    maximumDate={new Date()}
                    error={errors.entryDate?.message}
                    containerStyle={styles.inputContainer}
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
                  <Text style={styles.infoButtonText}>ℹ️</Text>
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasFiledI589"
                rules={{ required: 'Please select an option' }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.radioContainer}>
                    {['Yes', 'No', 'Not sure'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioOption}
                        onPress={() => onChange(option)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: value === option }}
                      >
                        <View style={[
                          styles.radioCircle,
                          value === option && styles.radioCircleSelected
                        ]}>
                          {value === option && (
                            <View style={styles.radioInner} />
                          )}
                        </View>
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              
              {errors.hasFiledI589 && (
                <Text style={styles.errorText}>{errors.hasFiledI589.message}</Text>
              )}
            </View>

            {/* Conditional Fields for I-589 Filers */}
            {hasFiledI589 === 'Yes' && (
              <>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    When did you submit your asylum application?
                  </Text>
                  <Controller
                    control={control}
                    name="i589SubmissionDate"
                    rules={{
                      required: 'Submission date is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        value={value}
                        onDateChange={onChange}
                        placeholder="Select submission date"
                        format="DD/MM/YYYY"
                        maximumDate={new Date()}
                        error={errors.i589SubmissionDate?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                </View>

                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    Where did you file your asylum application?
                  </Text>
                  <Controller
                    control={control}
                    name="filingLocation"
                    rules={{
                      required: 'Filing location is required',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.radioContainer}>
                        {[
                          'USCIS (Affirmative Process)',
                          'Immigration Court (Defensive Process)',
                          'Not sure'
                        ].map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={styles.radioOption}
                            onPress={() => onChange(option)}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: value === option }}
                          >
                            <View style={[
                              styles.radioCircle,
                              value === option && styles.radioCircleSelected
                            ]}>
                              {value === option && (
                                <View style={styles.radioInner} />
                              )}
                            </View>
                            <Text style={styles.radioText}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  />
                  {errors.filingLocation && (
                    <Text style={styles.errorText}>{errors.filingLocation.message}</Text>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleSubmit(handleContinue)}
            variant="primary"
            fullWidth
            style={styles.continueButton}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Information Modals */}
      <Modal
        visible={showEntryDateInfo}
        onClose={() => setShowEntryDateInfo(false)}
        title="Where to find your entry date"
        size="medium"
      >
        <Text style={styles.modalText}>
          This date determines your one-year filing deadline for asylum. If you don't 
          know your exact entry date, find it on:
          {'\n\n'}• Your I-94 Arrival/Departure Record
          {'\n'}• Your passport stamp
          {'\n'}• Legal documents from arrival
          {'\n\n'}If you entered multiple times, use your most recent entry date.
        </Text>
      </Modal>

      <Modal
        visible={showI589Info}
        onClose={() => setShowI589Info(false)}
        title="Form I-589"
        size="medium"
      >
        <Text style={styles.modalText}>
          Form I-589 is the application for asylum. If you've filed this form, you 
          have already begun the asylum process.
          {'\n\n'}• <Text style={styles.bold}>Affirmative process:</Text> Filed with USCIS if you are not in removal proceedings
          {'\n\n'}• <Text style={styles.bold}>Defensive process:</Text> Filed with the Immigration Court as a defense against removal
        </Text>
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
    paddingVertical: 8,
  },
  backButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
  helpIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  alertContainer: {
    marginTop: 8,
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