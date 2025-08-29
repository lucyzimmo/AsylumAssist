import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { AuthStackParamList } from '../../types/navigation';

type Props = StackScreenProps<AuthStackParamList, 'OnboardingStart'>;

const OnboardingStartScreen: React.FC<Props> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('AsylumStatus');
  };

  const handleDoLater = () => {
    // Skip onboarding and go directly to main app  
    console.log('handleDoLater called - navigating to MainStack -> MainTabs');
    const parent = navigation.getParent();
    console.log('Parent navigator:', parent);
    
    if (parent) {
      parent.navigate('MainStack', { screen: 'MainTabs' });
    } else {
      console.log('No parent navigator found');
      // Try alternative navigation
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'MainStack', 
          params: { screen: 'MainTabs' }
        }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Zowy</Text>
          <Text style={styles.subtitle}>
            Your digital companion for navigating the asylum process in the United States
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>Timeline Management</Text>
            <Text style={styles.featureDescription}>
              Track important deadlines and court dates
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureTitle}>Form Assistance</Text>
            <Text style={styles.featureDescription}>
              Get help filling out I-589 and other forms
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏛️</Text>
            <Text style={styles.featureTitle}>Legal Resources</Text>
            <Text style={styles.featureDescription}>
              Find legal aid organizations and support
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.primaryButton}
            textStyle={{ color: Colors.primary }}
          />
          
          <Button
            title="I'll do this later"
            onPress={handleDoLater}
            variant="outline"
            style={styles.secondaryButton}
            textStyle={{ color: Colors.white }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    ...Typography.h1,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 40,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    ...Typography.h4,
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    ...Typography.body,
    color: Colors.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  secondaryButton: {
    borderColor: Colors.white,
  },
});

export default OnboardingStartScreen;