import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthHeader } from '../../components/navigation/AuthHeader';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import type { StackNavigationProp, RouteProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';

type ReviewScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ReviewInformation'
>;

type ReviewScreenRouteProp = RouteProp<
  AuthStackParamList,
  'ReviewInformation'
>;

interface ReviewSectionProps {
  title: string;
  data: Record<string, any>;
  onEdit: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, data, onEdit }) => {
  const formatValue = (key: string, value: any) => {
    if (!value) return 'Not provided';
    
    if (value instanceof Date) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return String(value);
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="pencil" size={18} color={Colors.primary} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionContent}>
        {Object.entries(data).map(([key, value]) => {
          if (!value && value !== false && value !== 0) return null;
          
          return (
            <View key={key} style={styles.dataRow}>
              <Text style={styles.dataLabel}>{formatLabel(key)}:</Text>
              <Text style={styles.dataValue}>{formatValue(key, value)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const ReviewScreen: React.FC = () => {
  const navigation = useNavigation<ReviewScreenNavigationProp>();
  const route = useRoute<ReviewScreenRouteProp>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { personalInfo, contactInfo, backgroundInfo } = route.params || {};

  const handleSubmit = async () => {
    Alert.alert(
      'Complete Setup',
      'Your information has been saved. You can update it anytime from your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              navigation.getParent()?.navigate('MainStack');
            } catch (error) {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditPersonal = () => {
    navigation.navigate('PersonalInformation', route.params);
  };

  const handleEditContact = () => {
    navigation.navigate('ContactInformation', route.params);
  };

  const handleEditBackground = () => {
    navigation.navigate('BackgroundInformation', route.params);
  };

  const hasAnyInfo = personalInfo || contactInfo || backgroundInfo;

  if (!hasAnyInfo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthHeader
          title="Review Information"
          onBackPress={handleBack}
          showBackButton={true}
          currentStep={4}
          totalSteps={4}
          showProgress={true}
        />
        
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={Colors.textDisabled} />
          <Text style={styles.emptyTitle}>No Information to Review</Text>
          <Text style={styles.emptyDescription}>
            You haven't provided any information yet. Go back to fill out the forms.
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Skip Setup"
            onPress={() => navigation.getParent()?.navigate('MainStack')}
            variant="outline"
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AuthHeader
        title="Review Information"
        onBackPress={handleBack}
        showBackButton={true}
        currentStep={4}
        totalSteps={4}
        showProgress={true}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            Please review your information below. You can edit any section by tapping the edit button.
          </Text>

          {personalInfo && (
            <ReviewSection
              title="Personal Information"
              data={personalInfo}
              onEdit={handleEditPersonal}
            />
          )}

          {contactInfo && (
            <ReviewSection
              title="Contact Information"
              data={contactInfo}
              onEdit={handleEditContact}
            />
          )}

          {backgroundInfo && (
            <ReviewSection
              title="Background Information"
              data={backgroundInfo}
              onEdit={handleEditBackground}
            />
          )}

          <View style={styles.privacySection}>
            <Text style={styles.privacyTitle}>Privacy & Terms</Text>
            <Text style={styles.privacyText}>
              By completing setup, you agree to our Terms of Service and Privacy Policy. 
              Your information is encrypted and secure. You can update or delete your information at any time.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={isSubmitting ? "Completing..." : "Complete Setup"}
          onPress={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
          variant="primary"
          size="large"
        />
        
        <Button
          title="Skip for now"
          onPress={() => navigation.getParent()?.navigate('MainStack')}
          variant="outline"
          size="large"
          style={styles.skipButton}
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editText: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionContent: {
    gap: 12,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  dataLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
    minWidth: 120,
  },
  dataValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 2,
    flexWrap: 'wrap',
  },
  privacySection: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  privacyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  skipButton: {
    marginTop: 12,
  },
});

export default ReviewScreen;