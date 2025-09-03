import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>83 days before you can file form I-765</Text>
              <Text style={styles.infoDescription}>
                You can apply for a work permit on 02/09/2025. Click here to learn more.
              </Text>
            </View>
          </View>

          {/* Arrival Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressIndicator}>
                <View style={styles.progressDot} />
              </View>
              <View style={styles.progressTitleSection}>
                <Text style={styles.progressTitle}>Arrival</Text>
                <Text style={styles.progressPercent}>30% complete</Text>
              </View>
            </View>

            <View style={styles.stepsSection}>
              <TouchableOpacity style={styles.stepsToggle}>
                <Text style={styles.stepsToggleText}>Show completed steps</Text>
              </TouchableOpacity>

              <View style={styles.nextStepSection}>
                <View style={styles.nextStepIndicator}>
                  <View style={styles.nextStepDot} />
                  <View style={styles.progressLine} />
                </View>
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepLabel}>Next step:</Text>
                  <Text style={styles.nextStepTitle}>Apply for a work permit after 02/09/2025.</Text>
                  
                  <TouchableOpacity style={styles.addToCalendarButton}>
                    <Text style={styles.addToCalendarText}>Add to calendar</Text>
                  </TouchableOpacity>
                  
                  <Button
                    title="View resources"
                    variant="outline"
                    size="medium"
                    style={styles.viewResourcesButton}
                    onPress={() => {
                      // Navigate to resources
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Download Full Timeline Button */}
          <Button
            title="Download full timeline"
            variant="outline"
            size="large"
            style={styles.downloadButton}
            onPress={() => {
              // Handle download
            }}
          />
        </View>
      </ScrollView>
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
  infoBanner: {
    backgroundColor: '#E6E3FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIconText: {
    color: Colors.white,
    fontSize: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  progressCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressIndicator: {
    marginRight: 16,
  },
  progressDot: {
    width: 12,
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  progressTitleSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  progressPercent: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  stepsSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  stepsToggle: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  stepsToggleText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  nextStepSection: {
    flexDirection: 'row',
  },
  nextStepIndicator: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 4,
  },
  nextStepDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressLine: {
    width: 2,
    height: 80,
    backgroundColor: Colors.border,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  nextStepTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 20,
  },
  addToCalendarButton: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  addToCalendarText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  viewResourcesButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.textPrimary,
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
  },
  downloadButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.textPrimary,
    borderWidth: 1,
  },
});

export default DashboardScreen;