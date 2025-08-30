import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Home.png */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Asylum Journey</Text>
        <TouchableOpacity style={styles.helpButton}>
          <View style={styles.helpIcon}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoBannerTitle}>83 days before you can file form I-765</Text>
            <Text style={styles.infoBannerText}>
              You can apply for a work permit on 02/09/2025. Click here to learn more.
            </Text>
          </View>
        </View>

        {/* Timeline Card */}
        <View style={styles.timelineCard}>
          {/* Progress Header */}
          <View style={styles.progressHeader}>
            <View style={styles.progressDot} />
            <View style={styles.progressInfo}>
              <Text style={styles.timelineTitle}>Arrival</Text>
              <Text style={styles.progressPercent}>30% complete</Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <TouchableOpacity style={styles.showCompletedButton}>
              <Text style={styles.showCompletedText}>Show completed steps</Text>
            </TouchableOpacity>

            <View style={styles.nextStepSection}>
              <View style={styles.nextStepDot} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepLabel}>Next step:</Text>
                <Text style={styles.nextStepText}>Apply for a work permit after 02/09/2025.</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addToCalendarButton}>
              <Text style={styles.addToCalendarText}>Add to calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewResourcesButton}>
              <Text style={styles.viewResourcesText}>View resources</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Download Timeline Button */}
        <TouchableOpacity style={styles.downloadTimelineButton}>
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

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E6E6FA', // Light purple
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4169E1', // Blue
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  infoBannerText: {
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