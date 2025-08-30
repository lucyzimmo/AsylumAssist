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
import { DateDropdown } from '../../components/forms/DateDropdown';
import { AuthStackParamList } from '../../types/navigation';

interface ImmigrationStatusFormData {
  visitedEOIR: string;
  hasCase: string;
  aNumber?: string;
  nextHearingDate?: Date | null;
  assignedCourt?: string;
}

type ImmigrationStatusScreenProps = StackScreenProps<AuthStackParamList, 'ImmigrationStatus'>;

export const ImmigrationStatusScreen: React.FC<ImmigrationStatusScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [showEOIRInfo, setShowEOIRInfo] = useState(false);
  const [showANumberInfo, setShowANumberInfo] = useState(false);
  const [showCourtHearingInfo, setShowCourtHearingInfo] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ImmigrationStatusFormData>({
    defaultValues: {
      visitedEOIR: '',
      hasCase: '',
      aNumber: '',
      nextHearingDate: null,
      assignedCourt: '',
    },
    mode: 'onChange',
  });

  const visitedEOIR = watch('visitedEOIR');
  const hasCase = watch('hasCase');

  const handleContinue = (data: ImmigrationStatusFormData) => {
    // Save form data to context/storage
    const combinedData = {
      entryDate: route?.params?.asylumStatusData?.entryDate || '',
      hasFiledI589: route?.params?.asylumStatusData?.hasFiledI589 || 'not-sure' as const,
      i589SubmissionDate: route?.params?.asylumStatusData?.i589SubmissionDate,
      filingLocation: route?.params?.asylumStatusData?.filingLocation,
      visitedEOIR: data.visitedEOIR === 'Yes' ? 'yes' as const : 'no' as const,
      hasCase: data.hasCase === 'Yes' ? 'yes' as const : 
               data.hasCase === 'No' ? 'no' as const : 'not-sure' as const,
      aNumber: data.aNumber,
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
          currentStep={2}
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
            <Text style={styles.title}>Immigration Status and Court Proceedings</Text>
            <Text style={styles.subtitle}>
              Let's check your current immigration status and any ongoing proceedings.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* EOIR Website Visit */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Visit the EOIR website to check your case status using your A-number.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEOIRInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about EOIR"
                >
                  <Text style={styles.infoButtonText}>ℹ️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.linkContainer}>
                <TouchableOpacity style={styles.linkButton}>
                  <Text style={styles.linkButtonText}>🌐 EOIR Automated Case Information System</Text>
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="visitedEOIR"
                rules={{ required: 'Please select an option' }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.radioContainer}>
                    {['Yes', 'No'].map((option) => (
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
                        <Text style={styles.radioText}>
                          {option === 'Yes' ? 'I visited the EOIR website' : 'I haven\'t visited yet'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              
              {errors.visitedEOIR && (
                <Text style={styles.errorText}>{errors.visitedEOIR.message}</Text>
              )}
            </View>

            {/* Case Status */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>
                Does the EOIR website show that you have a case?
              </Text>
              
              <Controller
                control={control}
                name="hasCase"
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
              
              {errors.hasCase && (
                <Text style={styles.errorText}>{errors.hasCase.message}</Text>
              )}

              {/* Informational Alerts */}
              {hasCase === 'Yes' && (
                <View style={styles.alertContainer}>
                  <Alert
                    variant="warning"
                    title="You are in deportation proceedings"
                    message="The government has moved to deport you. You may challenge deportation by filing an asylum application with the Immigration Court."
                  />
                </View>
              )}

              {hasCase === 'No' && (
                <View style={styles.alertContainer}>
                  <Alert
                    variant="info"
                    title="You are not currently in deportation proceedings"
                    message="You can apply for asylum with USCIS through the affirmative process."
                  />
                </View>
              )}
            </View>

            {/* Conditional Fields for Court Cases */}
            {hasCase === 'Yes' && (
              <>
                {/* A-Number */}
                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>A-number</Text>
                    <TouchableOpacity
                      onPress={() => setShowANumberInfo(true)}
                      style={styles.infoButton}
                      accessibilityRole="button"
                      accessibilityLabel="More information about A-number"
                    >
                      <Text style={styles.infoButtonText}>ℹ️</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.questionSubtitle}>
                    Your A-number (Alien Registration Number) is assigned to you by 
                    immigration authorities. It should appear on immigration documents.
                  </Text>

                  <View style={styles.linkContainer}>
                    <TouchableOpacity style={styles.linkButton}>
                      <Text style={styles.linkButtonText}>📋 How to find your A-number</Text>
                    </TouchableOpacity>
                  </View>

                  <Controller
                    control={control}
                    name="aNumber"
                    rules={{
                      validate: (value) => {
                        if (hasCase === 'Yes' && !value) {
                          return 'A-number is required for court cases';
                        }
                        return true;
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter A-number"
                        keyboardType="numeric"
                        errorText={errors.aNumber?.message}
                        state={errors.aNumber ? 'error' : 'default'}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                </View>

                {/* Next Hearing Date */}
                <View style={styles.questionContainer}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>
                      What is the date of your next hearing?
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCourtHearingInfo(true)}
                      style={styles.infoButton}
                      accessibilityRole="button"
                      accessibilityLabel="More information about court hearings"
                    >
                      <Text style={styles.infoButtonText}>ℹ️</Text>
                    </TouchableOpacity>
                  </View>

                  <Controller
                    control={control}
                    name="nextHearingDate"
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
                        error={errors.nextHearingDate?.message}
                        containerStyle={styles.inputContainer}
                        required
                      />
                    )}
                  />

                  <View style={styles.alertContainer}>
                    <Alert
                      variant="warning"
                      title="You must attend all scheduled hearings"
                      message="The Court may order your deportation if you fail to show up."
                    />
                  </View>
                </View>

                {/* Assigned Court */}
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    Which immigration court is your case assigned to?
                  </Text>
                  
                  <Controller
                    control={control}
                    name="assignedCourt"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Select option"
                        errorText={errors.assignedCourt?.message}
                        state={errors.assignedCourt ? 'error' : 'default'}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Go back"
            onPress={handleGoBack}
            variant="outline"
            fullWidth
            style={styles.backButtonStyle}
          />
          
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
        visible={showEOIRInfo}
        onClose={() => setShowEOIRInfo(false)}
        title="The EOIR"
        size="medium"
      >
        <Text style={styles.modalText}>
          The Executive Office for Immigration Review (EOIR) handles immigration 
          court proceedings. You can check your case status on their website 
          using your A-number.
          {'\n\n'}
          <Text style={styles.bold}>How to check your case status:</Text>
          {'\n\n'}1. Visit the EOIR website
          {'\n'}2. Enter your A-number
          {'\n'}3. Check for any scheduled hearings or case updates
        </Text>
      </Modal>

      <Modal
        visible={showANumberInfo}
        onClose={() => setShowANumberInfo(false)}
        title="A-number"
        size="medium"
      >
        <Text style={styles.modalText}>
          Your A-number (Alien Registration Number) is a unique identifier 
          assigned by immigration authorities.
          {'\n\n'}
          <Text style={styles.bold}>Where to find it:</Text>
          {'\n'}• Immigration documents
          {'\n'}• Court notices
          {'\n'}• Work permits (EAD cards)
          {'\n'}• Green cards
          {'\n\n'}
          It usually appears as "A" followed by 8-9 digits.
        </Text>
      </Modal>

      <Modal
        visible={showCourtHearingInfo}
        onClose={() => setShowCourtHearingInfo(false)}
        title="Court hearings"
        size="medium"
      >
        <Text style={styles.modalText}>
          Attending your court hearings is mandatory. Missing a hearing could 
          result in a removal order issued in your absence.
          {'\n\n'}
          <Text style={styles.bold}>Find your next hearing:</Text>
          {'\n'}• Check the EOIR website
          {'\n'}• Review court notices
          {'\n'}• Contact your attorney
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
  questionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  infoButton: {
    padding: 4,
  },
  infoButtonText: {
    fontSize: 16,
  },
  linkContainer: {
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  linkButtonText: {
    ...Typography.button,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  alertContainer: {
    marginTop: 16,
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
    gap: 12,
  },
  backButtonStyle: {
    borderColor: Colors.border,
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

export default ImmigrationStatusScreen;