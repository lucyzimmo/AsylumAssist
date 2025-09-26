import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const handleMenuItemPress = (itemId: string) => {
    switch (itemId) {
      case 'account-details':
        Alert.alert(
          'Account Details',
          'Account management features coming soon! You will be able to view and edit your profile information.',
          [{ text: 'OK' }]
        );
        break;
      case 'settings':
        Alert.alert(
          'Settings',
          'App settings coming soon! You will be able to customize language, notifications, and accessibility options.',
          [{ text: 'OK' }]
        );
        break;
      case 'help':
        Alert.alert(
          'Help & Support',
          'Choose how you would like to get help:',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Contact Support', 
              onPress: () => Alert.alert('Contact Support', 'Support contact information will be available soon.')
            },
            { 
              text: 'View Help Center', 
              onPress: () => Alert.alert('Help Center', 'Help documentation will be available soon.')
            }
          ]
        );
        break;
      case 'feedback':
        Alert.alert(
          'Feedback',
          'We value your input! Feedback submission features coming soon.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Email Feedback', 
              onPress: () => {
                Linking.openURL('mailto:feedback@zowyasylum.org?subject=App Feedback').catch(() => {
                  Alert.alert('Error', 'Unable to open email client. Please email us directly at feedback@zowyasylum.org');
                });
              }
            }
          ]
        );
        break;
      case 'about-zowy':
        Alert.alert(
          'About AsylumAssist',
          'AsylumAssist is designed to help asylum seekers navigate the U.S. immigration system.\n\n📅 Timeline Management\nTrack important deadlines and court dates\n\n📄 Form Assistance\nGet help filling out I-589 and other forms\n\n🏢 Legal Resources\nFind legal aid organizations and support\n\nOur mission is to provide clear guidance, timeline tracking, and resources to support your asylum journey.\n\nVersion: 1.0.0\nDeveloped with care for the asylum seeking community.',
          [{ text: 'OK' }]
        );
        break;
      case 'data-protection':
        Alert.alert(
          'Data Protection Policy',
          'Your privacy and data security are our top priorities. We follow strict data protection guidelines to ensure your personal information is safe and secure.\n\nFull privacy policy will be available soon.',
          [{ text: 'OK' }]
        );
        break;
      default:
        Alert.alert('Feature Coming Soon', 'This feature will be available in a future update.');
    }
  };

  const handleHelpPress = () => {
    handleMenuItemPress('help');
  };

  const accountItems = [
    {
      id: 'account-details',
      title: 'Account details',
      icon: 'person-circle',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
    },
  ];

  const appItems = [
    {
      id: 'help',
      title: 'Help',
      icon: 'help-circle',
    },
    {
      id: 'feedback',
      title: 'Feedback',
      icon: 'chatbox',
    },
    {
      id: 'about-zowy',
      title: 'About AsylumAssist',
      icon: 'information-circle',
    },
    {
      id: 'data-protection',
      title: 'Data protection policy',
      icon: 'shield-checkmark',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Profile.png */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
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
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {accountItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.id)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          {appItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.id)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This tool is for general informational purposes only and is not legal 
            advice. The asylum process can be complex, and every case is unique. 
            For individualized legal advice, please consult a qualified immigration 
            attorney or accredited representative.
          </Text>
        </View>
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

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  chevron: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '300',
  },

  // Disclaimer
  disclaimer: {
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
    textAlign: 'left',
  },
});

export default ProfileScreen;