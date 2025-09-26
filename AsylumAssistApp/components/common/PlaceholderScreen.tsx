import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../ui/Button';

interface PlaceholderScreenProps {
  title?: string;
  description?: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title = 'Coming Soon',
  description = 'This feature is under development and will be available soon.',
}) => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If no back navigation available, try to go to AuthStack
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    }
  };

  const handleGoToDashboard = () => {
    // Try to force navigate to the dashboard
    console.log('Attempting to navigate to dashboard...');
    try {
      (navigation as any).navigate('MainStack', { 
        screen: 'MainTabs',
        params: { screen: 'Home', params: { screen: 'Dashboard' } }
      });
    } catch (error) {
      console.log('Navigation error:', error);
      // Fallback - try to reset to MainStack
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'MainStack' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={[styles.description, { marginTop: 20, color: 'red', fontSize: 12 }]}>
          DEBUG: This is PlaceholderScreen being shown
        </Text>
        
        {/* Debug Navigation Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="🏠 Try Dashboard Again"
            onPress={handleGoToDashboard}
            variant="primary"
            style={styles.debugButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    maxWidth: 300,
  },
  debugButton: {
    backgroundColor: Colors.primary,
  },
});