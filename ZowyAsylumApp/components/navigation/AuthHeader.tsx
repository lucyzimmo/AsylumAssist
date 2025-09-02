import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { ProgressIndicator } from '../ui/ProgressIndicator';

interface AuthHeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  showLanguageSelector?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
  currentStep,
  totalSteps,
  showProgress = false,
  showLanguageSelector = true,
}) => {
  const handleLanguagePress = () => {
    // TODO: Implement language selection
    console.log('Language selection pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.exitButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
              <Text style={styles.exitText}>Exit</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showLanguageSelector && (
          <View style={styles.rightSection}>
            <View style={styles.languageSelector}>
              <Text style={styles.languageLabel}>Language:</Text>
              <TouchableOpacity 
                style={styles.languageButton}
                onPress={handleLanguagePress}
              >
                <Text style={styles.languageText}>English</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
        
      {showProgress && currentStep && totalSteps && (
        <View style={styles.progressSection}>
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            showStepText={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8F9FA', // Light gray background from design
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA', // Light gray background from design
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  leftSection: {
    alignItems: 'flex-start',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8', // Light green background for exit button
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exitText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: 4,
    fontSize: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginRight: 8,
    fontSize: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark, // Dark green button for language
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    ...Typography.body,
    color: Colors.white,
    marginRight: 8,
    fontSize: 16,
  },
  progressSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
});