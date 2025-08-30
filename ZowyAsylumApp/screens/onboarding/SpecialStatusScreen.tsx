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

interface SpecialStatusFormData {
  hasTPS: 'Yes' | 'No' | 'Not sure' | '';
  tpsCountry?: string;
  tpsExpirationDate?: Date | null;
  hasParole: 'Yes' | 'No' | 'Not sure' | '';
  paroleType?: string;
  paroleExpirationDate?: Date | null;
  hasWorkPermit: 'Yes' | 'No' | 'Applied' | '';
  workPermitNumber?: string;
  workPermitExpirationDate?: Date | null;
  hasOtherStatus: 'Yes' | 'No' | '';
  otherStatusDescription?: string;
}

type SpecialStatusScreenProps = StackScreenProps<AuthStackParamList, 'SpecialStatus'>;

export const SpecialStatusScreen: React.FC<SpecialStatusScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [showTPSInfo, setShowTPSInfo] = useState(false);
  const [showParoleInfo, setShowParoleInfo] = useState(false);
  const [showWorkPermitInfo, setShowWorkPermitInfo] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SpecialStatusFormData>({
    defaultValues: {
      hasTPS: '',
      tpsCountry: '',
      tpsExpirationDate: null,
      hasParole: '',
      paroleType: '',
      paroleExpirationDate: null,
      hasWorkPermit: '',
      workPermitNumber: '',
      workPermitExpirationDate: null,
      hasOtherStatus: '',
      otherStatusDescription: '',
    },
    mode: 'onChange',
  });

  const hasTPS = watch('hasTPS');
  const hasParole = watch('hasParole');
  const hasWorkPermit = watch('hasWorkPermit');
  const hasOtherStatus = watch('hasOtherStatus');

  const handleComplete = (data: SpecialStatusFormData) => {
    // Combine all onboarding data
    const completeOnboardingData = {
      ...route?.params?.onboardingData,
      hasTPS: data.hasTPS === 'Yes' ? 'yes' as const : 
              data.hasTPS === 'No' ? 'no' as const : 'not-sure' as const,
      tpsCountry: data.tpsCountry,
      tpsExpirationDate: data.tpsExpirationDate?.toISOString(),
      hasParole: data.hasParole === 'Yes' ? 'yes' as const : 
                 data.hasParole === 'No' ? 'no' as const : 'not-sure' as const,
      paroleType: data.paroleType,
      paroleExpirationDate: data.paroleExpirationDate?.toISOString(),
      hasWorkPermit: data.hasWorkPermit === 'Yes' ? 'yes' as const :
                     data.hasWorkPermit === 'No' ? 'no' as const : 'applied' as const,
      workPermitNumber: data.workPermitNumber,
      workPermitExpirationDate: data.workPermitExpirationDate?.toISOString(),
      hasOtherStatus: data.hasOtherStatus === 'Yes' ? 'yes' as const : 'no' as const,
      otherStatusDescription: data.otherStatusDescription,
    };

    navigation.navigate('OnboardingComplete', {
      onboardingData: completeOnboardingData,
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
          currentStep={3}
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
            <Text style={styles.title}>Special Status and Work Authorization</Text>
            <Text style={styles.subtitle}>
              Let's check if you have any special immigration status or work authorization that might affect your asylum case.
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
                  <Text style={styles.infoButtonText}>ℹ️</Text>
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasTPS"
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
              
              {errors.hasTPS && (
                <Text style={styles.errorText}>{errors.hasTPS.message}</Text>
              )}

              {/* TPS Information Alert */}
              {hasTPS === 'Yes' && (
                <View style={styles.alertContainer}>
                  <Alert
                    variant="info"
                    title="TPS and asylum applications"
                    message="Having TPS does not prevent you from applying for asylum. You can still file Form I-589 while maintaining TPS status."
                  />
                </View>
              )}
            </View>

            {/* TPS Details */}
            {hasTPS === 'Yes' && (
              <>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    Which country is your TPS for?
                  </Text>
                  
                  <Controller
                    control={control}
                    name="tpsCountry"
                    rules={{
                      required: hasTPS === 'Yes' ? 'Country is required' : false,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="e.g., El Salvador, Haiti, Venezuela"
                        errorText={errors.tpsCountry?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                </View>

                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    When does your TPS expire?
                  </Text>
                  
                  <Controller
                    control={control}
                    name="tpsExpirationDate"
                    rules={{
                      required: hasTPS === 'Yes' ? 'Expiration date is required' : false,
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DateDropdown
                        label="TPS Expiration Date"
                        value={value}
                        onDateChange={onChange}
                        placeholder={{
                          month: 'Month',
                          day: 'Day', 
                          year: 'Year'
                        }}
                        minimumDate={new Date()}
                        error={errors.tpsExpirationDate?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                </View>
              </>
            )}

            {/* Parole Status */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Do you have parole status in the United States?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowParoleInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about parole"
                >
                  <Text style={styles.infoButtonText}>ℹ️</Text>
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasParole"
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
              
              {errors.hasParole && (
                <Text style={styles.errorText}>{errors.hasParole.message}</Text>
              )}
            </View>

            {/* Parole Details */}
            {hasParole === 'Yes' && (
              <>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    What type of parole do you have?
                  </Text>
                  
                  <Controller
                    control={control}
                    name="paroleType"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="e.g., Humanitarian Parole, Cuban Family Reunification"
                        errorText={errors.paroleType?.message}
                        containerStyle={styles.inputContainer}
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
                      />
                    )}
                  />
                </View>
              </>
            )}

            {/* Work Authorization */}
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionTitle}>
                  Do you have work authorization (Employment Authorization Document - EAD)?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowWorkPermitInfo(true)}
                  style={styles.infoButton}
                  accessibilityRole="button"
                  accessibilityLabel="More information about work permits"
                >
                  <Text style={styles.infoButtonText}>ℹ️</Text>
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name="hasWorkPermit"
                rules={{ required: 'Please select an option' }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.radioContainer}>
                    {['Yes', 'No', 'Applied'].map((option) => (
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
                          {option === 'Applied' ? 'I have applied but haven\'t received it yet' : option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              
              {errors.hasWorkPermit && (
                <Text style={styles.errorText}>{errors.hasWorkPermit.message}</Text>
              )}

              {/* Work Authorization Timeline Alert */}
              {hasWorkPermit === 'No' && (
                <View style={styles.alertContainer}>
                  <Alert
                    variant="info"
                    title="Apply for work authorization"
                    message="You can apply for work authorization 150 days after filing your asylum application. This allows you to work legally while your case is pending."
                  />
                </View>
              )}
            </View>

            {/* Work Permit Details */}
            {(hasWorkPermit === 'Yes' || hasWorkPermit === 'Applied') && (
              <>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    {hasWorkPermit === 'Yes' ? 'Work permit number' : 'Receipt number for work permit application'}
                  </Text>
                  
                  <Controller
                    control={control}
                    name="workPermitNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={hasWorkPermit === 'Yes' ? 'EAD card number' : 'Receipt number'}
                        errorText={errors.workPermitNumber?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                </View>

                {hasWorkPermit === 'Yes' && (
                  <View style={styles.questionContainer}>
                    <Text style={styles.questionTitle}>
                      When does your work permit expire?
                    </Text>
                    
                    <Controller
                      control={control}
                      name="workPermitExpirationDate"
                      render={({ field: { onChange, value } }) => (
                        <DateDropdown
                          label="Work Permit Expiration Date"
                          value={value}
                          onDateChange={onChange}
                          placeholder={{
                            month: 'Month',
                            day: 'Day', 
                            year: 'Year'
                          }}
                          minimumDate={new Date()}
                          error={errors.workPermitExpirationDate?.message}
                          containerStyle={styles.inputContainer}
                        />
                      )}
                    />
                  </View>
                )}
              </>
            )}

            {/* Other Status */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>
                Do you have any other immigration status or pending applications?
              </Text>

              <Controller
                control={control}
                name="hasOtherStatus"
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
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              
              {errors.hasOtherStatus && (
                <Text style={styles.errorText}>{errors.hasOtherStatus.message}</Text>
              )}
            </View>

            {/* Other Status Details */}
            {hasOtherStatus === 'Yes' && (
              <View style={styles.questionContainer}>
                <Text style={styles.questionTitle}>
                  Please describe your other status or pending applications
                </Text>
                
                <Controller
                  control={control}
                  name="otherStatusDescription"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="e.g., U Visa application, VAWA petition"
                      multiline
                      numberOfLines={3}
                      errorText={errors.otherStatusDescription?.message}
                      containerStyle={styles.inputContainer}
                    />
                  )}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Go back"
            onPress={handleGoBack}
            variant="outline"
            size="large"
            style={styles.backButtonStyle}
          />
          
          <Button
            title="Complete setup"
            onPress={handleSubmit(handleComplete)}
            variant="primary"
            size="large"
            style={styles.completeButton}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Information Modals */}
      <Modal
        visible={showTPSInfo}
        onClose={() => setShowTPSInfo(false)}
        title="Temporary Protected Status (TPS)"
        size="large"
      >
        <Text style={styles.modalText}>
          Temporary Protected Status (TPS) is protection given to people from certain countries 
          experiencing ongoing armed conflict, environmental disaster, or other extraordinary circumstances.
          {'\n\n'}
          <Text style={styles.bold}>Countries currently designated for TPS include:</Text>
          {'\n'}• El Salvador
          {'\n'}• Haiti
          {'\n'}• Honduras
          {'\n'}• Nepal
          {'\n'}• Nicaragua
          {'\n'}• Somalia
          {'\n'}• Sudan
          {'\n'}• South Sudan
          {'\n'}• Syria
          {'\n'}• Venezuela
          {'\n'}• Yemen
          {'\n\n'}
          <Text style={styles.bold}>Important:</Text> Having TPS does not prevent you from applying for asylum.
        </Text>
      </Modal>

      <Modal
        visible={showParoleInfo}
        onClose={() => setShowParoleInfo(false)}
        title="Immigration Parole"
        size="medium"
      >
        <Text style={styles.modalText}>
          Parole allows certain individuals to temporarily enter or remain in the United States 
          for urgent humanitarian reasons or significant public benefit.
          {'\n\n'}
          <Text style={styles.bold}>Common types of parole:</Text>
          {'\n'}• Humanitarian Parole
          {'\n'}• Cuban Family Reunification Parole (CFRP)
          {'\n'}• Filipino World War II Veterans Parole (FWVP)
          {'\n'}• Central American Minors (CAM) Parole
          {'\n\n'}
          Parole is temporary and does not provide a path to permanent residence by itself.
        </Text>
      </Modal>

      <Modal
        visible={showWorkPermitInfo}
        onClose={() => setShowWorkPermitInfo(false)}
        title="Work Authorization for Asylum Seekers"
        size="medium"
      >
        <Text style={styles.modalText}>
          Asylum seekers can apply for work authorization 150 days after filing their asylum application.
          {'\n\n'}
          <Text style={styles.bold}>Key points:</Text>
          {'\n'}• File Form I-765 to apply for work authorization
          {'\n'}• Must wait at least 150 days after filing I-589
          {'\n'}• Work permits are typically valid for 2 years
          {'\n'}• Can be renewed while case is pending
          {'\n\n'}
          Having work authorization allows you to work legally and obtain a Social Security number.
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
    marginTop: 16,
  },
  radioContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    marginTop: 2,
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
    lineHeight: 22,
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
  completeButton: {
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