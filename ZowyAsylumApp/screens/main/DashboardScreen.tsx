import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

interface DashboardScreenProps {
  navigation: any;
}

// Timeline data based on the mockups
const timelineSteps = [
  {
    id: 'arrival',
    title: 'Arrival',
    progress: '30% complete',
    nextStep: 'Consult an attorney to determine if you should apply for asylum.',
    alert: {
      type: 'warning',
      title: 'Next Deadline: 340 days left',
      message: 'You must file form I-589 before 05/05/2026. Click here to learn more.',
    },
    hasMarkAsDone: true,
  },
  {
    id: 'interview',
    title: 'Interview',
    progress: '30% complete',
    nextStep: 'Your affirmative asylum interview is on 08/09/2025. Make sure you prepare your supporting documents, along with English translations.',
    alert: {
      type: 'warning',
      title: 'Next Deadline: 41 days left',
      message: 'Your affirmative asylum interview is on 08/09/2025. Click here to learn more.',
    },
    hasMarkAsDone: true,
  },
  {
    id: 'work-permit',
    title: 'Arrival',
    progress: '30% complete',
    nextStep: 'Apply for a work permit after 02/09/2025.',
    alert: {
      type: 'info',
      title: '83 days before you can file form I-765',
      message: 'You can apply for a work permit on 02/09/2025. Click here to learn more.',
    },
    hasMarkAsDone: false,
  },
];

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true); // For demo, set to false to show empty state
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showCompletedSteps, setShowCompletedSteps] = useState(false);
  
  const currentStep = timelineSteps[currentStepIndex];

  const handleAddToCalendar = () => {
    // Extract date from the current step's alert message
    let eventTitle = 'Asylum Process Step';
    let eventDate = new Date();
    
    if (currentStep.alert.title.includes('Deadline')) {
      eventTitle = currentStep.alert.title;
      // Parse date from message if available
      const dateMatch = currentStep.alert.message.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (dateMatch) {
        eventDate = new Date(dateMatch[1]);
      }
    }

    // Create calendar URL for iOS/Android
    const startDate = eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(currentStep.nextStep)}`;
    
    Linking.openURL(calendarUrl).catch(() => {
      Alert.alert('Calendar Error', 'Unable to open calendar. Please add this event manually.');
    });
  };

  const handleMarkAsDone = () => {
    Alert.alert(
      'Mark as Done',
      'Are you sure you want to mark this step as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Done', 
          onPress: () => {
            setCompletedSteps(prev => [...prev, currentStep.id]);
            Alert.alert('Success', 'Step marked as completed!');
          }
        }
      ]
    );
  };

  const handleDownloadTimeline = () => {
    Alert.alert(
      'Download Timeline',
      'Timeline download feature coming soon! This will generate a PDF of your complete asylum journey timeline.',
      [{ text: 'OK' }]
    );
  };

  const handleEditTimeline = () => {
    Alert.alert(
      'Edit Timeline',
      'Do you want to update your asylum journey information?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update Information', 
          onPress: () => {
            // Navigate back to onboarding to update information
            navigation.getParent()?.navigate('AuthStack', { 
              screen: 'OnboardingStart'
            });
          }
        }
      ]
    );
  };

  const handleShowCompletedSteps = () => {
    setShowCompletedSteps(!showCompletedSteps);
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Help & Support',
      'Need assistance with your asylum journey?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact Support', 
          onPress: () => {
            // TODO: Navigate to support/help screen when created
            Alert.alert('Support', 'Support contact information will be available soon.');
          }
        },
        { 
          text: 'View FAQ', 
          onPress: () => {
            // TODO: Navigate to FAQ screen when created
            Alert.alert('FAQ', 'Frequently asked questions will be available soon.');
          }
        }
      ]
    );
  };

  // Empty state when user hasn't completed onboarding
  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Asylum Journey</Text>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={handleHelpPress}
          >
            <View style={styles.helpIcon}>
              <Text style={styles.questionMark}>?</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Empty Timeline Container */}
          <View style={styles.emptyTimelineCard}>
            <View style={styles.emptyTimelineContent}>
              <View style={styles.emptyTimelineDot} />
              <View style={styles.emptyTimelineLine} />
            </View>
          </View>

          {/* Call to Action */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Tell us about your journey</Text>
            <Text style={styles.ctaSubtitle}>
              We need you to answer some questions about your asylum status so we can generate your timeline and determine your next steps.
            </Text>
            <TouchableOpacity 
              style={styles.startQuestionnaireButton}
              onPress={() => navigation.getParent()?.navigate('AuthStack', { 
                screen: 'OnboardingStart'
              })}
            >
              <Text style={styles.startQuestionnaireText}>Start questionnaire</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Home.png */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Asylum Journey</Text>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={handleHelpPress}
        >
          <View style={styles.helpIcon}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert Banner */}
        <TouchableOpacity style={[
          styles.alertBanner,
          currentStep.alert.type === 'warning' ? styles.warningBanner : styles.infoBanner
        ]}>
          <View style={[
            styles.alertIcon,
            currentStep.alert.type === 'warning' ? styles.warningIcon : styles.infoIconStyle
          ]}>
            <Text style={styles.alertIconText}>
              {currentStep.alert.type === 'warning' ? '!' : 'i'}
            </Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{currentStep.alert.title}</Text>
            <Text style={styles.alertText}>{currentStep.alert.message}</Text>
          </View>
        </TouchableOpacity>

        {/* Timeline Card */}
        <View style={styles.timelineCard}>
          {/* Progress Header */}
          <View style={styles.progressHeader}>
            <View style={styles.progressDot} />
            <View style={styles.progressInfo}>
              <Text style={styles.timelineTitle}>{currentStep.title}</Text>
              <Text style={styles.progressPercent}>{currentStep.progress}</Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <TouchableOpacity 
              style={styles.showCompletedButton}
              onPress={handleShowCompletedSteps}
            >
              <Text style={styles.showCompletedText}>
                {showCompletedSteps ? 'Hide completed steps' : 'Show completed steps'}
              </Text>
            </TouchableOpacity>

            {/* Show completed steps if toggled */}
            {showCompletedSteps && completedSteps.length > 0 && (
              <View style={styles.completedStepsSection}>
                <Text style={styles.completedStepsTitle}>Completed Steps:</Text>
                {completedSteps.map((stepId) => {
                  const step = timelineSteps.find(s => s.id === stepId);
                  return step ? (
                    <View key={stepId} style={styles.completedStepItem}>
                      <View style={styles.completedStepDot} />
                      <Text style={styles.completedStepText}>{step.title}</Text>
                      <Text style={styles.completedStepCheck}>✓</Text>
                    </View>
                  ) : null;
                })}
              </View>
            )}

            {showCompletedSteps && completedSteps.length === 0 && (
              <View style={styles.noCompletedSteps}>
                <Text style={styles.noCompletedStepsText}>No completed steps yet.</Text>
              </View>
            )}

            <View style={styles.nextStepSection}>
              <View style={styles.nextStepDot} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepLabel}>Next step:</Text>
                <Text style={styles.nextStepText}>{currentStep.nextStep}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.addToCalendarButton}
              onPress={handleAddToCalendar}
            >
              <Text style={styles.addToCalendarText}>Add to calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.viewResourcesButton}
              onPress={() => navigation.navigate('Resources')}
            >
              <Text style={styles.viewResourcesText}>View resources</Text>
            </TouchableOpacity>

            {currentStep.hasMarkAsDone && (
              <TouchableOpacity 
                style={styles.markAsDoneButton}
                onPress={handleMarkAsDone}
              >
                <Text style={styles.markAsDoneText}>Mark as done</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Edit Timeline Link */}
          <TouchableOpacity 
            style={styles.editTimelineLink}
            onPress={handleEditTimeline}
          >
            <Text style={styles.editTimelineText}>Edit timeline</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Dots */}
        <View style={styles.navigationDots}>
          {timelineSteps.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.navigationDot,
                index === currentStepIndex && styles.navigationDotActive
              ]}
              onPress={() => setCurrentStepIndex(index)}
            />
          ))}
        </View>

        {/* Download Timeline Button */}
        <TouchableOpacity 
          style={styles.downloadTimelineButton}
          onPress={handleDownloadTimeline}
        >
          <Text style={styles.downloadTimelineText}>Download full timeline</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  helpButton: {
    padding: 4,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E6B47',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Empty state styles
  emptyTimelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8F5E8',
    padding: 40,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyTimelineContent: {
    alignItems: 'center',
  },
  emptyTimelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginBottom: 8,
  },
  emptyTimelineLine: {
    width: 2,
    height: 60,
    backgroundColor: Colors.primary,
  },
  ctaSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  startQuestionnaireButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 250,
  },
  startQuestionnaireText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Alert Banner styles
  alertBanner: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoBanner: {
    backgroundColor: '#E3F2FD', // Light blue
  },
  warningBanner: {
    backgroundColor: '#FFF3E0', // Light orange
  },
  alertIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoIconStyle: {
    backgroundColor: '#2196F3', // Blue
  },
  warningIcon: {
    backgroundColor: '#FF9800', // Orange
  },
  alertIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },

  // Timeline Card
  timelineCard: {
    backgroundColor: '#E8F5E8', // Light green
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  progressInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  progressPercent: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },

  // Card Content
  cardContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  showCompletedButton: {
    marginBottom: 16,
  },
  showCompletedText: {
    fontSize: 16,
    color: '#666666',
  },
  completedStepsSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  completedStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  completedStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedStepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  completedStepText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  completedStepCheck: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  noCompletedSteps: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  noCompletedStepsText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nextStepSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  nextStepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CCCCCC',
    marginRight: 12,
    marginTop: 4,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  nextStepText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  addToCalendarButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  addToCalendarText: {
    fontSize: 16,
    color: '#666666',
    textDecorationLine: 'underline',
  },
  viewResourcesButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  viewResourcesText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  markAsDoneButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  markAsDoneText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editTimelineLink: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  editTimelineText: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },

  // Navigation Dots
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  navigationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CCCCCC',
  },
  navigationDotActive: {
    backgroundColor: '#333333',
  },

  // Download Timeline Button
  downloadTimelineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  downloadTimelineText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});

export default DashboardScreen;