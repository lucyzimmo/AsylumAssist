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
    getNextActionableStep,
    initializeTimeline
  } = useTimeline();

  const [showCompletedSteps, setShowCompletedSteps] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStep, setEditingStep] = useState<JourneyStep | null>(null);
  const [editingStepNotes, setEditingStepNotes] = useState('');
  const [editingStepDeadline, setEditingStepDeadline] = useState('');

  // Get the primary alert to display
  const primaryAlert = alerts.length > 0 ? alerts[0] : null;

  const handleAddToCalendar = () => {
    if (!currentStep || !currentStep.deadline) return;
    
    const eventTitle = `${currentStep.title} Deadline`;
    const eventDate = new Date(currentStep.deadline);
    
    // Create calendar URL for iOS/Android
    const startDate = eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(currentStep.description)}`;
    
    Linking.openURL(calendarUrl).catch(() => {
      Alert.alert('Calendar Error', 'Unable to open calendar. Please add this event manually.');
    });
  };

  const handleMarkAsDone = async () => {
    if (!currentStep) return;
    
    Alert.alert(
      'Mark as Done',
      `Are you sure you want to mark "${currentStep.title}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Done', 
          onPress: async () => {
            const success = await markStepComplete(currentStep.id, true);
            if (success) {
              Alert.alert('Success', 'Step marked as completed!');
            } else {
              Alert.alert('Error', 'Failed to update step. Please try again.');
            }
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
    if (editMode) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  };

  const handleEditStep = (step: JourneyStep) => {
    setEditingStep(step);
    setEditingStepNotes(step.notes || '');
    setEditingStepDeadline(step.deadline || '');
    setShowEditModal(true);
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

  const handleStartJourney = async () => {
    // Initialize timeline with default entry date (today)
    const today = new Date().toISOString().split('T')[0];
    const success = await initializeTimeline(today, false);
    
    if (success) {
      Alert.alert('Success', 'Your timeline has been created! You can edit dates and details using the edit timeline feature.');
    } else {
      Alert.alert('Error', 'Failed to initialize timeline. Please try again.');
    }
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
            <Text style={styles.ctaTitle}>Tell us about your journey</Text>
            <Text style={styles.ctaSubtitle}>
              We need you to answer some questions about your asylum status so we can generate your timeline and determine your next steps.
            </Text>
            <TouchableOpacity 
              style={styles.startQuestionnaireButton}
              onPress={handleStartJourney}
            >
              <Text style={styles.startQuestionnaireText}>Start journey</Text>
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
        {primaryAlert && (
          <TouchableOpacity style={[
            styles.alertBanner,
            primaryAlert.type === 'warning' ? styles.warningBanner :
            primaryAlert.type === 'critical' ? styles.criticalBanner : styles.infoBanner
          ]}>
            <View style={[
              styles.alertIcon,
              primaryAlert.type === 'warning' ? styles.warningIcon :
              primaryAlert.type === 'critical' ? styles.criticalIcon : styles.infoIconStyle
            ]}>
              <Ionicons 
                name={primaryAlert.type === 'critical' || primaryAlert.type === 'warning' ? "warning" : "information-circle"} 
                size={16} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{primaryAlert.title}</Text>
              <Text style={styles.alertText}>{primaryAlert.message}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Timeline Card */}
        <View style={styles.timelineCard}>
          {/* Progress Header */}
          <View style={styles.progressHeader}>
            <View style={styles.progressDot} />
            <View style={styles.progressInfo}>
              <Text style={styles.timelineTitle}>
                {currentStep?.title || 'Timeline Progress'}
              </Text>
              <Text style={styles.progressPercent}>
                {getOverallProgress()}% complete
              </Text>
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
            {showCompletedSteps && (
              <View style={styles.completedStepsSection}>
                <Text style={styles.completedStepsTitle}>Completed Steps:</Text>
                {steps.filter(s => s.completed).length > 0 ? (
                  steps.filter(s => s.completed).map((step) => (
                    <View key={step.id} style={styles.completedStepItem}>
                      <View style={styles.completedStepDot} />
                      <Text style={styles.completedStepText}>{step.title}</Text>
                      <Ionicons name="checkmark" size={18} color={Colors.primary} />
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCompletedStepsText}>No completed steps yet.</Text>
                )}
              </View>
            )}

            {currentStep && (
              <>
                <View style={styles.nextStepSection}>
                  <View style={styles.nextStepDot} />
                  <View style={styles.nextStepContent}>
                    <Text style={styles.nextStepLabel}>Current step:</Text>
                    <Text style={styles.nextStepText}>{currentStep.description}</Text>
                    {currentStep.nextActions.length > 0 && (
                      <View style={styles.nextActionsContainer}>
                        <Text style={styles.nextActionsLabel}>Next actions:</Text>
                        {currentStep.nextActions.map((action, index) => (
                          <Text key={index} style={styles.nextActionText}>• {action}</Text>
                        ))}
                      </View>
                    )}
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

                {!currentStep.completed && (
                  <TouchableOpacity 
                    style={styles.markAsDoneButton}
                    onPress={handleMarkAsDone}
                  >
                    <Text style={styles.markAsDoneText}>Mark as done</Text>
                  </TouchableOpacity>
                )}

                {editMode && (
                  <TouchableOpacity 
                    style={styles.editStepButton}
                    onPress={() => handleEditStep(currentStep)}
                  >
                    <Text style={styles.editStepText}>Edit this step</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Edit Timeline Link */}
          <TouchableOpacity 
            style={styles.editTimelineLink}
            onPress={handleEditTimeline}
          >
            <Text style={styles.editTimelineText}>
              {editMode ? 'Exit edit mode' : 'Edit timeline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Download Timeline Button */}
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
                <Text style={styles.stepTitle}>{editingStep.title}</Text>
                
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

  // Step Title in Modal
  stepTitle: {
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
});

export default DashboardScreen;