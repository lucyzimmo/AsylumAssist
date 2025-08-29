import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Alert } from '../../components/ui/Alert';

interface DashboardScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 72) / 2; // 24px padding on each side + 24px gap

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  
  const quickActions = [
    {
      id: 'timeline',
      title: 'My Timeline',
      description: 'View your asylum case progress and next steps',
      icon: 'time',
      color: Colors.primary,
      route: 'Timeline',
      urgent: true,
      badge: '3 urgent',
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload and manage your case documents',
      icon: 'folder',
      color: Colors.warning,
      route: 'Documents',
      urgent: true,
      badge: '2 missing',
    },
    {
      id: 'forms',
      title: 'Fill Forms',
      description: 'Complete I-589 and other immigration forms',
      icon: 'document-text',
      color: Colors.error,
      route: 'FormWizard',
      params: { formType: 'I-589' },
      urgent: true,
      badge: 'I-589 due',
    },
    {
      id: 'resources',
      title: 'Find Help',
      description: 'Legal aid, organizations, and support',
      icon: 'people',
      color: Colors.success,
      route: 'Resources',
      urgent: false,
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Account settings and personal information',
      icon: 'person',
      color: Colors.purple,
      route: 'Profile',
      urgent: false,
    },
    {
      id: 'calendar',
      title: 'Important Dates',
      description: 'Upcoming deadlines and court hearings',
      icon: 'calendar',
      color: Colors.info,
      route: 'Calendar',
      urgent: false,
    },
  ];

  const emergencyContacts = [
    {
      name: 'Crisis Hotline',
      phone: '1-800-273-8255',
      description: '24/7 mental health support',
      icon: 'call',
    },
    {
      name: 'Legal Emergency',
      phone: '1-855-842-8274',
      description: 'Immediate legal assistance',
      icon: 'shield',
    },
  ];

  const caseStats = {
    daysUntilDeadline: 45,
    documentsCompleted: 3,
    totalDocuments: 8,
    nextHearing: 'Not scheduled',
    caseStatus: 'Application Preparation',
  };

  const handleActionPress = (action: typeof quickActions[0]) => {
    if (action.params) {
      navigation.navigate(action.route, action.params);
    } else {
      navigation.navigate(action.route);
    }
  };

  const handleEmergencyCall = (phone: string) => {
    // In a real app, this would open the phone dialer
    console.log('Calling:', phone);
  };

  const renderQuickAction = (action: typeof quickActions[0]) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionCard,
        action.urgent && styles.urgentCard,
        { 
          width: action.id === 'timeline' || action.id === 'documents' ? '100%' : cardWidth,
          backgroundColor: action.urgent ? action.color + '10' : Colors.white,
        }
      ]}
      onPress={() => handleActionPress(action)}
    >
      <View style={styles.actionHeader}>
        <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
          <Ionicons name={action.icon as any} size={24} color={action.color} />
        </View>
        
        {action.badge && (
          <View style={[styles.actionBadge, { backgroundColor: action.color }]}>
            <Text style={styles.actionBadgeText}>{action.badge}</Text>
          </View>
        )}
      </View>
      
      <Text style={[
        styles.actionTitle,
        action.urgent && { color: action.color }
      ]}>
        {action.title}
      </Text>
      
      <Text style={styles.actionDescription} numberOfLines={2}>
        {action.description}
      </Text>
      
      <View style={styles.actionFooter}>
        <Ionicons 
          name="arrow-forward" 
          size={16} 
          color={action.urgent ? action.color : Colors.textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
              <Text style={styles.welcomeSubtitle}>Let's continue with your asylum case</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <Ionicons name="notifications" size={24} color={Colors.textSecondary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Critical Alert */}
        <View style={styles.alertSection}>
          <Alert
            variant="error"
            title="Critical Deadline Approaching"
            message={`Your one-year filing deadline is in ${caseStats.daysUntilDeadline} days. File your I-589 application immediately!`}
          />
        </View>

        {/* Case Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Case Overview</Text>
          
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>{caseStats.daysUntilDeadline}</Text>
              <Text style={styles.overviewLabel}>Days Until Deadline</Text>
            </View>
            
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>
                {caseStats.documentsCompleted}/{caseStats.totalDocuments}
              </Text>
              <Text style={styles.overviewLabel}>Documents Ready</Text>
            </View>
            
            <View style={[styles.overviewCard, styles.overviewCardWide]}>
              <Text style={styles.overviewLabel}>Case Status</Text>
              <Text style={styles.overviewStatus}>{caseStats.caseStatus}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          
          {/* Priority Actions (Full Width) */}
          <View style={styles.priorityActions}>
            {quickActions.filter(action => action.urgent).map(renderQuickAction)}
          </View>
          
          {/* Other Actions (Grid) */}
          <View style={styles.actionsGrid}>
            {quickActions.filter(action => !action.urgent).map(renderQuickAction)}
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          
          <View style={styles.emergencyGrid}>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emergencyCard}
                onPress={() => handleEmergencyCall(contact.phone)}
              >
                <View style={styles.emergencyIcon}>
                  <Ionicons name={contact.icon as any} size={20} color={Colors.error} />
                </View>
                
                <View style={styles.emergencyContent}>
                  <Text style={styles.emergencyName}>{contact.name}</Text>
                  <Text style={styles.emergencyPhone}>{contact.phone}</Text>
                  <Text style={styles.emergencyDescription}>{contact.description}</Text>
                </View>
                
                <Ionicons name="call" size={20} color={Colors.error} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity style={styles.helpCard}>
            <Ionicons name="help-circle" size={24} color={Colors.primary} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpDescription}>
                Get guidance on your asylum case or find local resources
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  alertSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  overviewSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: cardWidth,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  overviewCardWide: {
    width: '100%',
    alignItems: 'flex-start',
  },
  overviewNumber: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  overviewStatus: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  priorityActions: {
    gap: 12,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentCard: {
    borderWidth: 2,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  actionTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  actionFooter: {
    alignItems: 'flex-end',
  },
  emergencySection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emergencyGrid: {
    gap: 12,
  },
  emergencyCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error + '30',
    gap: 12,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  emergencyPhone: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
    marginBottom: 2,
  },
  emergencyDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  helpSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  helpCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  helpDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});

export default DashboardScreen;