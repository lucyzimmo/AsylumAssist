import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors } from '../../constants/Colors';
import { useTimeline } from '../../hooks/useTimeline';
import { JourneyStep } from '../../types/timeline';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const {
    timeline,
    steps,
    alerts,
    currentStep,
    loading,
    error,
    editMode,
    markStepComplete,
    updateStep,
    enterEditMode,
    exitEditMode,
    getOverallProgress,
    getNextActionableStep
  } = useTimeline();

  const [showCompletedSteps, setShowCompletedSteps] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStep, setEditingStep] = useState<JourneyStep | null>(null);
  const [editingStepNotes, setEditingStepNotes] = useState('');
  const [editingStepDeadline, setEditingStepDeadline] = useState('');
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  // Get the primary alert to display
  const primaryAlert = alerts.length > 0 ? alerts[0] : null;
  
  // Get the currently selected step
  const selectedStep = steps[selectedStepIndex] || currentStep;

  const handleAddToCalendar = () => {
    if (!selectedStep || !selectedStep.deadline) return;
    
    const eventTitle = `${selectedStep.title} Deadline`;
    const eventDate = new Date(selectedStep.deadline);
    
    // Create calendar URL for iOS/Android
    const startDate = eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(selectedStep.description || '')}`;
    
    Linking.openURL(calendarUrl).catch(() => {
      Alert.alert('Calendar Error', 'Unable to open calendar. Please add this event manually.');
    });
  };

  const handleMarkAsDone = async () => {
    const stepToComplete = steps[selectedStepIndex];
    if (!stepToComplete) return;
    
    const success = await markStepComplete(stepToComplete.id, true);
    if (!success) {
      Alert.alert('Error', 'Failed to update step. Please try again.');
      return;
    }
    
    // Show success feedback
    Alert.alert(
      'Step Completed!', 
      `"${stepToComplete.title}" has been marked as done.`,
      [{ text: 'OK' }]
    );
    
    // Auto-advance to next incomplete step
    const nextIncompleteIndex = steps.findIndex((step, index) => 
      index > selectedStepIndex && !step.completed
    );
    
    if (nextIncompleteIndex !== -1) {
      setSelectedStepIndex(nextIncompleteIndex);
    }
  };

  const handleStepNavigation = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setSelectedStepIndex(index);
    }
  };

  const handleDownloadTimeline = async () => {
    try {
      const currentDate = new Date().toLocaleDateString();
      const progress = getOverallProgress();
      
      const completedSteps = steps.filter(step => step.completed);
      const pendingSteps = steps.filter(step => !step.completed);
      
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
              h1 { color: #2E6B47; border-bottom: 2px solid #2E6B47; padding-bottom: 10px; }
              h2 { color: #2E6B47; margin-top: 30px; }
              .progress { background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .step { margin: 15px 0; padding: 10px; border-left: 3px solid #2E6B47; }
              .completed { background-color: #f8fff8; }
              .pending { background-color: #fff8f0; border-left-color: #FFA726; }
              .step-title { font-weight: bold; margin-bottom: 5px; }
              .step-date { color: #666; font-size: 14px; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>Your Asylum Journey Timeline</h1>
            <p><strong>Generated:</strong> ${currentDate}</p>
            
            <div class="progress">
              <h3>Progress Summary</h3>
              <p><strong>${progress}% Complete</strong></p>
              <p>${completedSteps.length} of ${steps.length} steps completed</p>
            </div>

            ${completedSteps.length > 0 ? `
              <h2>Completed Steps</h2>
              ${completedSteps.map(step => `
                <div class="step completed">
                  <div class="step-title">✓ ${step.title}</div>
                  ${step.deadline ? `<div class="step-date">Deadline: ${new Date(step.deadline).toLocaleDateString()}</div>` : ''}
                  ${step.completedDate ? `<div class="step-date">Completed: ${new Date(step.completedDate).toLocaleDateString()}</div>` : ''}
                </div>
              `).join('')}
            ` : ''}

            ${pendingSteps.length > 0 ? `
              <h2>Upcoming Steps</h2>
              ${pendingSteps.map(step => `
                <div class="step pending">
                  <div class="step-title">${step.title}</div>
                  ${step.deadline ? `<div class="step-date">Deadline: ${new Date(step.deadline).toLocaleDateString()}</div>` : ''}
                  ${step.description ? `<div style="margin-top: 8px; color: #555;">${step.description}</div>` : ''}
                </div>
              `).join('')}
            ` : ''}

            <div class="footer">
              <p>Generated by Zowy - Your asylum journey companion</p>
              <p>This document contains your personal timeline and should be kept confidential.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your timeline',
        });
      } else {
        Alert.alert('PDF Created', 'Your timeline has been saved successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const handleEditTimeline = () => {
    if (editMode) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  };


  const handleSaveStepEdit = async () => {
    if (!editingStep) return;

    const updates: Partial<JourneyStep> = {
      notes: editingStepNotes,
      deadline: editingStepDeadline || undefined,
    };

    const success = await updateStep(editingStep.id, updates);
    if (success) {
      setShowEditModal(false);
      setEditingStep(null);
      Alert.alert('Success', 'Step updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update step. Please try again.');
    }
  };

  const handleStartJourney = () => {
    // Navigate to the journey questionnaire
    const rootNavigation = navigation.getParent?.() || navigation;
    rootNavigation.navigate('AuthStack', { screen: 'AsylumStatus' });
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

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E6B47" />
          <Text style={styles.loadingText}>Loading your timeline...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleStartJourney}
          >
            <Text style={styles.retryButtonText}>Start Journey</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state when user hasn't completed onboarding
  if (!timeline) {
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
            <Text style={styles.ctaTitle}>Complete journey questionnaire to see your timeline</Text>
            <Text style={styles.ctaSubtitle}>
              Answer a few questions about your asylum status to create your personalized timeline.
            </Text>
            <TouchableOpacity 
              style={styles.startQuestionnaireButton}
              onPress={handleStartJourney}
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
        {/* Dynamic Alert Banner */}
        {primaryAlert && (
          <TouchableOpacity style={[
            styles.alertBanner,
            primaryAlert.type === 'warning' ? styles.warningBanner :
            primaryAlert.type === 'critical' ? styles.criticalBanner : styles.infoBanner
          ]}>
            <View style={styles.alertIcon}>
              <Ionicons 
                name={primaryAlert.type === 'critical' || primaryAlert.type === 'warning' ? "warning" : "information-circle"} 
                size={20} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{primaryAlert.title}</Text>
              <Text style={styles.alertText}>{primaryAlert.message}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Current Step Card */}
        {selectedStep && (
          <View style={styles.stepCard}>
            {/* Step Header with Progress */}
            <View style={styles.stepCardHeader}>
              <View style={styles.stepTimeline}>
                <View style={[styles.timelineDot, selectedStep.completed ? styles.completedDot : styles.activeDot]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.stepHeaderContent}>
                <Text style={styles.stepName}>{selectedStep.title}</Text>
                <Text style={styles.stepProgress}>{Math.round(selectedStep.progress || 0)}% complete</Text>
              </View>
            </View>

            {/* Step Content */}
            <View style={styles.stepCardContent}>
              {/* Show Completed Steps Toggle */}
              <TouchableOpacity 
                style={styles.showCompletedToggle}
                onPress={handleShowCompletedSteps}
              >
                <Text style={styles.showCompletedText}>
                  {showCompletedSteps ? 'Hide completed steps' : 'Show completed steps'}
                </Text>
              </TouchableOpacity>

              {/* Completed Steps List */}
              {showCompletedSteps && (
                <View style={styles.completedStepsSection}>
                  {steps.filter(s => s.completed).length > 0 ? (
                    steps.filter(s => s.completed).map((step) => (
                      <View key={step.id} style={styles.completedStepRow}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                        <Text style={styles.completedStepText}>{step.title}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCompletedText}>No completed steps yet</Text>
                  )}
                </View>
              )}

              {/* Next Step */}
              <View style={styles.nextStepSection}>
                <Text style={styles.nextStepLabel}>Next step:</Text>
                <Text style={styles.nextStepDescription}>
                  {selectedStep.description || selectedStep.nextActions?.[0] || 'Continue with your asylum process'}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.stepActions}>
                <TouchableOpacity 
                  style={styles.addToCalendarLink}
                  onPress={handleAddToCalendar}
                >
                  <Text style={styles.linkText}>Add to calendar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.viewResourcesButton}
                  onPress={() => navigation.navigate('Resources')}
                >
                  <Text style={styles.viewResourcesText}>View resources</Text>
                </TouchableOpacity>

                {!selectedStep.completed && (
                  <TouchableOpacity 
                    style={styles.markAsDoneButton}
                    onPress={handleMarkAsDone}
                  >
                    <Text style={styles.markAsDoneText}>Mark as done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Progress Indicators */}
        <View style={styles.progressIndicators}>
          {steps.slice(0, 5).map((step, index) => (
            <TouchableOpacity 
              key={step.id} 
              style={[
                styles.progressDot,
                step.completed ? styles.completedProgressDot : 
                index === selectedStepIndex ? styles.activeProgressDot : 
                styles.inactiveProgressDot
              ]} 
              onPress={() => handleStepNavigation(index)}
            />
          ))}
        </View>

        {/* Edit Timeline Link */}
        <TouchableOpacity 
          style={styles.editTimelineLink}
          onPress={editMode ? exitEditMode : enterEditMode}
        >
          <Text style={styles.editTimelineText}>
            {editMode ? 'Save changes' : 'Edit timeline'}
          </Text>
        </TouchableOpacity>

        {/* Download Button */}
        <TouchableOpacity 
          style={styles.downloadTimelineButton}
          onPress={handleDownloadTimeline}
        >
          <Text style={styles.downloadTimelineText}>Download full timeline</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Step Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Step</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEditModal(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {editingStep && (
              <>
                <Text style={styles.modalStepTitle}>{editingStep.title}</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Deadline (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editingStepDeadline}
                    onChangeText={setEditingStepDeadline}
                    placeholder="Enter deadline date"
                    placeholderTextColor="#999999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={editingStepNotes}
                    onChangeText={setEditingStepNotes}
                    placeholder="Add personal notes..."
                    placeholderTextColor="#999999"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Mark as completed</Text>
                  <Switch
                    value={editingStep.completed}
                    onValueChange={async (value) => {
                      await markStepComplete(editingStep.id, value);
                      setEditingStep({...editingStep, completed: value});
                    }}
                    trackColor={{ false: '#E0E0E0', true: '#2E6B47' }}
                    thumbColor={editingStep.completed ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveStepEdit}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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

  // Loading/Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2E6B47',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Critical Alert Banner
  criticalBanner: {
    backgroundColor: '#FFEBEE', // Light red
  },
  criticalIcon: {
    backgroundColor: '#F44336', // Red
  },

  // Next Actions
  nextActionsContainer: {
    marginTop: 12,
  },
  nextActionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  nextActionText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    paddingLeft: 8,
  },

  // Edit Step Button
  editStepButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2E6B47',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  editStepText: {
    fontSize: 16,
    color: '#2E6B47',
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },

  // Step Title in Modal (renamed to modalStepTitle)
  modalStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
  },

  // Form Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Switch Container
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },

  // Save Button
  saveButton: {
    backgroundColor: '#2E6B47',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Timeline Card Styles
  stepCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  stepCardHeader: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTimeline: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#4CAF50',
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  stepProgress: {
    fontSize: 16,
    color: '#333333',
  },
  stepCardContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  showCompletedToggle: {
    marginBottom: 16,
  },
  showCompletedText: {
    fontSize: 14,
    color: '#666666',
  },
  completedStepsSection: {
    marginBottom: 16,
  },
  completedStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedStepText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  noCompletedText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  nextStepSection: {
    marginBottom: 20,
  },
  nextStepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  nextStepDescription: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  stepActions: {
    gap: 12,
  },
  addToCalendarLink: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#333333',
    textDecorationLine: 'underline',
  },
  viewResourcesButton: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewResourcesText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  markAsDoneButton: {
    backgroundColor: '#2E6B47',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  markAsDoneText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeProgressDot: {
    backgroundColor: '#2E6B47',
  },
  completedProgressDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveProgressDot: {
    backgroundColor: '#CCCCCC',
  },
  editTimelineLink: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  editTimelineText: {
    fontSize: 14,
    color: '#333333',
    textDecorationLine: 'underline',
  },
  downloadTimelineButton: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  downloadTimelineText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});

export default DashboardScreen;