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

  const {
    control,
    handleSubmit,
    watch,
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

  const handleContinue = (data: ImmigrationStatusFormData) => {
    // Save form data to context/storage
    const combinedData = {
      ...route?.params?.asylumStatusData,
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
            <Text style={styles.title}>Immigration Status and Court Proceedings</Text>
            <Text style={styles.subtitle}>
              Let's check your current immigration status and any ongoing proceedings.
            </Text>
          </View>

          {/* EOIR Link */}
          <View style={styles.linkSection}>
            <Text style={styles.linkLabel}>Visit the EOIR website to check your case status using your A-number</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Ionicons name="link-outline" size={16} color={Colors.primary} />
              <Text style={styles.linkText}>EOIR Automated Case Information System</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* EOIR Case Question */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Does the EOIR website show that you have a case?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCaseInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about EOIR cases"
                >
                  <Text style={styles.infoButtonText}>?</Text>
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
              
              {errors.visitedEOIR && (
                <Text style={styles.errorText}>{errors.visitedEOIR.message}</Text>
              )}
            </View>

            {/* EOIR Case Question */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Does the EOIR website show that you have a case?
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

              {/* Informational Alerts */}
              {hasCase === 'yes' && (
                <View style={styles.alertContainer}>
                  <Alert
                    variant="warning"
                    title="You are in deportation proceedings"
                    message="The government has moved to deport you. You may challenge deportation by filing an asylum application with the Immigration Court."
                  />
                </View>
              )}

              {hasCase === 'no' && (
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
            {hasCase === 'yes' && (
              <>

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
                    rules={{
                      validate: (value) => {
                        if (hasCase === 'yes' && !value) {
                          return 'Next hearing date is required';
                        }
                        return true;
                      },
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
                    rules={{
                      validate: (value) => {
                        if (hasCase === 'yes' && !value) {
                          return 'Court assignment is required';
                        }
                        return true;
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <Dropdown
                        placeholder="Select immigration court"
                        options={[
                          { label: 'New York Immigration Court', value: 'new-york' },
                          { label: 'Los Angeles Immigration Court', value: 'los-angeles' },
                          { label: 'Miami Immigration Court', value: 'miami' },
                          { label: 'San Francisco Immigration Court', value: 'san-francisco' },
                          { label: 'Chicago Immigration Court', value: 'chicago' },
                          { label: 'Houston Immigration Court', value: 'houston' },
                          { label: 'Boston Immigration Court', value: 'boston' },
                          { label: 'Arlington Immigration Court', value: 'arlington' },
                          { label: 'Not sure', value: 'not-sure' },
                        ]}
                        value={value}
                        onSelect={onChange}
                        error={errors.assignedCourt?.message}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    ...Typography.button,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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