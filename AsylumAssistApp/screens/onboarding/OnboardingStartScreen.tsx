import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { AuthStackParamList } from '../../types/navigation';

type Props = StackScreenProps<AuthStackParamList, 'OnboardingStart'>;

const OnboardingStartScreen: React.FC<Props> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('AsylumStatus');
  };

  const handleDoLater = () => {
    // Skip onboarding and go directly to main app  
    const rootNavigation = navigation.getParent();
    
    if (rootNavigation) {
      rootNavigation.navigate('MainStack', { screen: 'MainTabs' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Clean header */}
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tell us about your journey</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <SafeAreaView style={styles.contentWrapper}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create your timeline</Text>
            <Text style={styles.subtitle}>
              We'll ask a few questions to build your personalized asylum journey timeline.
            </Text>
          </View>

          <View style={styles.iconSection}>
            <Ionicons 
              name="time-outline" 
              size={100} 
              color={Colors.primary}
              style={{ marginBottom: 0 , marginTop: 0, marginLeft: 0, marginRight: 0}} 
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              This will help us show you the most relevant deadlines, forms, and resources for your specific situation.
            </Text>
            <Text style={styles.privacyText}>
              Your information is private and secure.
            </Text>
          </View>

          <View style={styles.footer}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              variant="primary"
              size="large"
              style={styles.primaryButton}
            />
            
            <Button
              title="I'll do this later"
              onPress={handleDoLater}
              variant="outline"
              size="large"
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 0,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  infoText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    marginTop: 0,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
});

export default OnboardingStartScreen;