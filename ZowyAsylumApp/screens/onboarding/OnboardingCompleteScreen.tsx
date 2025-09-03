import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { AuthStackParamList } from '../../types/navigation';

type OnboardingCompleteScreenProps = StackScreenProps<AuthStackParamList, 'OnboardingComplete'>;

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
  category: 'filing' | 'court' | 'work-auth' | 'documents' | 'renewal';
}

export const OnboardingCompleteScreen: React.FC<OnboardingCompleteScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    generatePersonalizedTimeline();
  }, []);

  useEffect(() => {
    if (!isGeneratingTimeline) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isGeneratingTimeline]);

  const generatePersonalizedTimeline = async () => {
    try {
      const onboardingData = route?.params?.onboardingData;
      
      if (!onboardingData) {
        console.error('No onboarding data found');
        setIsGeneratingTimeline(false);
        return;
      }

      // Save onboarding data to storage
      await AsyncStorage.setItem('userOnboardingData', JSON.stringify(onboardingData));

      // Generate personalized timeline based on user's situation
      const generatedTimeline = createTimelineFromData(onboardingData);
      
      // Save timeline to storage
      await AsyncStorage.setItem('userTimeline', JSON.stringify(generatedTimeline));

      // Simulate processing time for better UX
      setTimeout(() => {
        setTimeline(generatedTimeline);
        setIsGeneratingTimeline(false);
      }, 2000);

    } catch (error) {
      console.error('Error generating timeline:', error);
      setIsGeneratingTimeline(false);
    }
  };

  const createTimelineFromData = (data: any): TimelineItem[] => {
    const items: TimelineItem[] = [];
    const now = new Date();

    // Parse entry date for deadline calculations
    let entryDate: Date | null = null;
    if (data.entryDate) {
      entryDate = new Date(data.entryDate);
    }

    // Calculate one-year filing deadline
    let filingDeadline: Date | null = null;
    if (entryDate) {
      filingDeadline = new Date(entryDate);
      filingDeadline.setFullYear(filingDeadline.getFullYear() + 1);
    }

    // 1. Asylum Application Filing
    if (data.hasFiledI589 === 'no') {
      const isDeadlinePassed = filingDeadline && now > filingDeadline;
      items.push({
        id: 'file-i589',
        title: 'File Form I-589 (Asylum Application)',
        description: isDeadlinePassed 
          ? 'Your one-year deadline has passed. Consult an attorney about exceptions.'
          : `File by ${filingDeadline?.toLocaleDateString()} to meet the one-year deadline.`,
        dueDate: filingDeadline || undefined,
        priority: isDeadlinePassed ? 'high' : 'high',
        status: isDeadlinePassed ? 'overdue' : 'pending',
        category: 'filing',
      });
    }

    // 2. Work Authorization Application
    if (data.hasWorkPermit === 'no' && data.hasFiledI589 === 'yes') {
      const i589Date = data.i589SubmissionDate ? new Date(data.i589SubmissionDate) : null;
      if (i589Date) {
        const workAuthEligibleDate = new Date(i589Date);
        workAuthEligibleDate.setDate(workAuthEligibleDate.getDate() + 150);
        
        const canApplyNow = now >= workAuthEligibleDate;
        
        items.push({
          id: 'apply-work-auth',
          title: 'Apply for Work Authorization (Form I-765)',
          description: canApplyNow 
            ? 'You can now apply for work authorization. File Form I-765.'
            : `You can apply starting ${workAuthEligibleDate.toLocaleDateString()}.`,
          dueDate: canApplyNow ? undefined : workAuthEligibleDate,
          priority: canApplyNow ? 'high' : 'medium',
          status: 'pending',
          category: 'work-auth',
        });
      }
    }

    // 3. Court Hearing Attendance
    if (data.hasCase === 'yes' && data.nextHearingDate) {
      const hearingDate = new Date(data.nextHearingDate);
      items.push({
        id: 'attend-hearing',
        title: 'Attend Immigration Court Hearing',
        description: `Mandatory court hearing at ${data.assignedCourt || 'assigned court'}. Failure to attend may result in removal order.`,
        dueDate: hearingDate,
        priority: 'high',
        status: hearingDate < now ? 'overdue' : 'pending',
        category: 'court',
      });
    }

    // 4. TPS Renewal
    if (data.hasTPS === 'yes' && data.tpsExpirationDate) {
      const tpsExpiration = new Date(data.tpsExpirationDate);
      const renewalDate = new Date(tpsExpiration);
      renewalDate.setDate(renewalDate.getDate() - 60); // Apply 60 days before expiration

      items.push({
        id: 'renew-tps',
        title: 'Renew Temporary Protected Status',
        description: `Apply for TPS renewal for ${data.tpsCountry} by ${renewalDate.toLocaleDateString()}.`,
        dueDate: renewalDate,
        priority: renewalDate <= now ? 'high' : 'medium',
        status: renewalDate <= now ? 'pending' : 'pending',
        category: 'renewal',
      });
    }

    // 5. Work Permit Renewal
    if (data.hasWorkPermit === 'yes' && data.workPermitExpirationDate) {
      const workPermitExpiration = new Date(data.workPermitExpirationDate);
      const renewalDate = new Date(workPermitExpiration);
      renewalDate.setDate(renewalDate.getDate() - 90); // Apply 90 days before expiration

      items.push({
        id: 'renew-work-permit',
        title: 'Renew Work Authorization',
        description: `File Form I-765 to renew work authorization before ${workPermitExpiration.toLocaleDateString()}.`,
        dueDate: renewalDate,
        priority: renewalDate <= now ? 'high' : 'medium',
        status: renewalDate <= now ? 'pending' : 'pending',
        category: 'renewal',
      });
    }

    // 6. Document Gathering
    items.push({
      id: 'gather-documents',
      title: 'Gather Supporting Documents',
      description: 'Collect country condition evidence, personal statements, and supporting documentation for your case.',
      priority: 'medium',
      status: 'pending',
      category: 'documents',
    });

    // 7. Legal Representation
    items.push({
      id: 'find-attorney',
      title: 'Find Legal Representation',
      description: 'Connect with pro bono or low-cost legal services in your area.',
      priority: 'high',
      status: 'pending',
      category: 'documents',
    });

    // Sort by priority and due date
    return items.sort((a, b) => {
      // First sort by status (overdue first)
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      
      // Then by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      // Finally by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return 0;
    });
  };

  const handleContinueToApp = async () => {
    try {
      // Mark onboarding as complete
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Navigate to main app
      const parentNavigator = navigation.getParent();
      if (parentNavigator) {
        parentNavigator.navigate('MainStack', { 
          screen: 'MainTabs',
          params: { screen: 'Home' }
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      case 'low': return Colors.info;
      default: return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <Ionicons name="warning" size={16} color="#F44336" />;
      case 'pending': return <Ionicons name="ellipse" size={12} color="#666666" />;
      case 'completed': return <Ionicons name="checkmark" size={16} color={Colors.primary} />;
      default: return <Ionicons name="ellipse" size={12} color="#666666" />;
    }
  };

  if (isGeneratingTimeline) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
        
        <View style={styles.loadingContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>Z</Text>
            </View>
          </View>
          
          <Text style={styles.loadingTitle}>Setting up your journey</Text>
          <Text style={styles.loadingSubtitle}>
            We're creating a personalized timeline based on your responses...
          </Text>
          
          <ActivityIndicator 
            size="large" 
            color={Colors.primary} 
            style={styles.spinner}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Success Header */}
          <View style={styles.successHeader}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>🎉</Text>
            </View>
            <Text style={styles.successTitle}>Your timeline is ready!</Text>
            <Text style={styles.successSubtitle}>
              Based on your responses, we've created a personalized action plan to help guide your asylum journey.
            </Text>
          </View>

          {/* Important Notice */}
          <Alert
            variant="info"
            title="Legal Disclaimer"
            message="This app provides general information and is not a substitute for legal advice. Always consult with a qualified attorney for your specific situation."
          />

          {/* Timeline Preview */}
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Your next steps</Text>
            <Text style={styles.sectionSubtitle}>
              Here are the most important items on your timeline:
            </Text>

            {timeline.slice(0, 4).map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineItemHeader}>
                  <View style={styles.timelineItemIcon}>
                    {getStatusIcon(item.status)}
                  </View>
                  <View style={styles.timelineItemContent}>
                    <Text style={styles.timelineItemTitle}>{item.title}</Text>
                    <Text style={styles.timelineItemDescription}>
                      {item.description}
                    </Text>
                    {item.dueDate && (
                      <Text style={[
                        styles.timelineItemDate,
                        { color: getPriorityColor(item.priority) }
                      ]}>
                        Due: {item.dueDate.toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor(item.priority) }
                  ]} />
                </View>
              </View>
            ))}

            {timeline.length > 4 && (
              <Text style={styles.moreItemsText}>
                +{timeline.length - 4} more items in your complete timeline
              </Text>
            )}
          </View>

          {/* Key Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>What's next?</Text>
            
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>📱</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Track your progress</Text>
                <Text style={styles.benefitDescription}>
                  Mark items as complete and stay on top of deadlines
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>📄</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Manage documents</Text>
                <Text style={styles.benefitDescription}>
                  Upload and organize all your important files securely
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Ionicons name="library" size={24} color={Colors.primary} style={styles.benefitIcon} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Find legal help</Text>
                <Text style={styles.benefitDescription}>
                  Connect with legal aid organizations in your area
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Continue to app"
          onPress={handleContinueToApp}
          variant="primary"
          size="large"
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  loadingTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 40,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  timelineSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  timelineItem: {
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineItemIconText: {
    fontSize: 18,
  },
  timelineItemContent: {
    flex: 1,
  },
  timelineItemTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  timelineItemDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  timelineItemDate: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginLeft: 8,
  },
  moreItemsText: {
    ...Typography.caption,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  benefitDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
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
});