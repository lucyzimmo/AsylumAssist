import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.container}>
      {/* Top curved header */}
      <View style={styles.topSection}>
        <View style={styles.curvedBackground} />
        
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>Z</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <SafeAreaView style={styles.contentWrapper}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome to Zowy</Text>
            <Text style={styles.subtitle}>
              Your digital companion for navigating the asylum process in the United States
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📅</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Timeline Management</Text>
                <Text style={styles.featureDescription}>
                  Track important deadlines and court dates
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📋</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Form Assistance</Text>
                <Text style={styles.featureDescription}>
                  Get help filling out I-589 and other forms
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="library" size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Legal Resources</Text>
                <Text style={styles.featureDescription}>
                  Find legal aid organizations and support
                </Text>
              </View>
            </View>
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
  topSection: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  curvedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
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
    color: Colors.primary,
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: 4,
    fontWeight: '600',
  },
  featureDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontSize: 14,
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