import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { StackScreenProps } from '@react-navigation/stack';
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
import { getCourtOptions } from '../../constants/immigrationCourts';

interface ImmigrationStatusFormData {
  hasCase: 'yes' | 'no' | '';
  nextHearingDate?: Date | null;
  assignedCourt?: string;
}

type ImmigrationStatusScreenProps = StackScreenProps<AuthStackParamList, 'ImmigrationStatus'>;

export const ImmigrationStatusScreen: React.FC<ImmigrationStatusScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [showEOIRInfo, setShowEOIRInfo] = useState(false);
  const [showCourtHearingInfo, setShowCourtHearingInfo] = useState(false);
  const [showAssignedCourtInfo, setShowAssignedCourtInfo] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<ImmigrationStatusFormData>({
    defaultValues: {
      hasCase: '',
      nextHearingDate: null,
      assignedCourt: '',
    },
    mode: 'onChange',
  });

  const hasCase = watch('hasCase');
  const nextHearingDate = watch('nextHearingDate');
  const assignedCourt = watch('assignedCourt');


  // Trigger validation when hasCase changes
  useEffect(() => {
    if (hasCase) {
      trigger(['nextHearingDate', 'assignedCourt']);
    }
  }, [hasCase, trigger]);

  const handleContinue = (data: ImmigrationStatusFormData) => {
    // Save form data to context/storage
    const combinedData = {
      ...route?.params?.asylumStatusData,
      visitedEOIR: true, // Always true since they answered the EOIR question
      hasCase: data.hasCase as 'yes' | 'no',
      nextHearingDate: data.nextHearingDate?.toISOString(),
      assignedCourt: data.assignedCourt,
    };
    
    navigation.navigate('SpecialStatus', {
      onboardingData: combinedData,
    });
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
        <Text style={styles.progressText}>Step 2 of 3</Text>
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
            <Text style={styles.title}>Immigration Court Status</Text>
            <Text style={styles.subtitle}>
              Tell us about your immigration court proceedings, if any.
            </Text>
          </View>


          {/* Form */}
          <View style={styles.form}>
            {/* EOIR Case Status */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Do you have a case in Immigration Court (EOIR)?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEOIRInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about EOIR cases"
                >
                  <Ionicons name="information-circle" size={20} color={Colors.info} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasCase"
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
                    error={errors.hasCase?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />
              
              {errors.hasCase && (
                <Text style={styles.errorText}>{errors.hasCase.message}</Text>
              )}
            </View>

            {/* Conditional Fields for EOIR Cases */}
            {hasCase === 'yes' && (
              <>
                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>
                      When is your next court hearing?
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCourtHearingInfo(true)}
                      style={styles.infoButton}
                      accessibilityRole="button"
                      accessibilityLabel="More information about court hearings"
                    >
                      <Ionicons name="information-circle" size={20} color={Colors.info} />
                    </TouchableOpacity>
                  </View>
                  <Controller
                    control={control}
                    name="nextHearingDate"
                    rules={{
                      required: hasCase === 'yes' ? 'Next hearing date is required' : false,
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DateDropdown
                        label="Next Hearing Date"
                        value={value}
                        onDateChange={onChange}
                        placeholder={{
                          month: 'Month',
                          day: 'Day', 
                          year: 'Year'
                        }}
                        minimumDate={new Date()}
                        yearRange={{ start: 2024, end: 2030 }}
                        error={errors.nextHearingDate?.message}
                        containerStyle={styles.inputContainer}
                        required
                      />
                    )}
                  />
                </View>

                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>
                      Which court is handling your case?
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAssignedCourtInfo(true)}
                      style={styles.infoButton}
                      accessibilityRole="button"
                      accessibilityLabel="More information about assigned courts"
                    >
                      <Ionicons name="information-circle" size={20} color={Colors.info} />
                    </TouchableOpacity>
                  </View>
                  <Controller
                    control={control}
                    name="assignedCourt"
                    rules={{
                      required: hasCase === 'yes' ? 'Assigned court is required' : false,
                    }}
                    render={({ field: { onChange, value } }) => (
                                              <Dropdown
                          label="Court Name"
                          value={value || ''}
                          onSelect={onChange}
                          options={getCourtOptions()}
                          placeholder="Select your assigned immigration court"
                          error={errors.assignedCourt?.message}
                          containerStyle={styles.inputContainer}
                        />
                    )}
                  />
                </View>

                {/* Critical Warning for Court Cases */}
                <View style={styles.alertContainer}>
                  <Alert
                    variant="warning"
                    title="Critical: Court Proceedings"
                    message="You are in Immigration Court proceedings. You MUST attend all hearings. Failure to appear will result in an automatic deportation order. Legal representation is strongly recommended."
                  />
                </View>
              </>
            )}

            {/* Information for Non-Court Cases */}
            {hasCase === 'no' && (
              <View style={styles.alertContainer}>
                <Alert
                  variant="info"
                  title="No Court Proceedings"
                  message="You are not currently in Immigration Court proceedings. This means you can file for asylum through the affirmative process with USCIS if you haven't already."
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleSubmit(handleContinue)}
          disabled={!isValid || (hasCase === 'yes' && (!nextHearingDate || !assignedCourt))}
          style={styles.continueButton}
        />
      </View>

      {/* Information Modals */}
      
      {/* EOIR Info Modal */}
      <Modal
        visible={showEOIRInfo}
        onClose={() => setShowEOIRInfo(false)}
        title="EOIR Case Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>What is EOIR?</Text>{'\n\n'}
            EOIR stands for Executive Office for Immigration Review. This is the system that handles Immigration Court cases.{'\n\n'}
            <Text style={styles.bold}>Do you have a case if:</Text>{'\n\n'}
            • You received a Notice to Appear (NTA) in Immigration Court{'\n'}
            • You were placed in removal proceedings{'\n'}
            • You have an A-number and court case number{'\n'}
            • You've been to Immigration Court before{'\n\n'}
            <Text style={styles.bold}>If you're not sure:</Text>{'\n\n'}
            Check if you have any court documents, NTA, or ask your attorney. You can also check online at the EOIR portal.
          </Text>
        </View>
      </Modal>

      {/* Court Hearing Info Modal */}
      <Modal
        visible={showCourtHearingInfo}
        onClose={() => setShowCourtHearingInfo(false)}
        title="Court Hearing Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>When is your next hearing?</Text>{'\n\n'}
            This is the date of your next scheduled appearance in Immigration Court.{'\n\n'}
            <Text style={styles.bold}>Why this is critical:</Text>{'\n\n'}
            • You MUST attend this hearing{'\n'}
            • Failure to appear = automatic deportation order{'\n'}
            • This date determines your timeline{'\n'}
            • You need to prepare for this hearing{'\n\n'}
            <Text style={styles.bold}>If you don't know the date:</Text>{'\n\n'}
            Check your court documents, ask your attorney, or check the EOIR portal. Do not miss this hearing!
          </Text>
        </View>
      </Modal>

      {/* Assigned Court Info Modal */}
      <Modal
        visible={showAssignedCourtInfo}
        onClose={() => setShowAssignedCourtInfo(false)}
        title="Assigned Court Information"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            <Text style={styles.bold}>Which court is handling your case?</Text>{'\n\n'}
            This is the specific Immigration Court where your case is being heard.{'\n\n'}
            <Text style={styles.bold}>How to find this:</Text>{'\n\n'}
            • Check your Notice to Appear (NTA){'\n'}
            • Look at court documents you received{'\n'}
            • Ask your attorney{'\n'}
            • Check the EOIR portal online{'\n\n'}
            <Text style={styles.bold}>Common court names:</Text>{'\n\n'}
            • [City] Immigration Court{'\n'}
            • [State] Immigration Court{'\n'}
            • [City] Federal Building{'\n\n'}
            <Text style={styles.bold}>Why this matters:</Text>{'\n\n'}
            You need to know which court to go to for your hearings and where to file documents.{'\n\n'}
            <Text style={styles.bold}>Changing Venue:</Text>{'\n\n'}
            If you need to change your court location, you must file a Motion to Change Venue with your current court. This is typically done for hardship reasons (medical, family, work).{'\n\n'}
            <Text style={styles.bold}>If Your Hearing Has Passed:</Text>{'\n\n'}
            If you missed a hearing, you may be able to file a Motion to Reopen or Motion to Reconsider within 30 days. Contact an attorney immediately as this is time-sensitive.
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

export default ImmigrationStatusScreen;