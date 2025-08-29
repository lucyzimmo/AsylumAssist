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
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
  currentStep,
  totalSteps,
  showProgress = false,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.topSection}>
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                onPress={onBackPress}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.centerSection}>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <View style={styles.rightSection} />
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingTop: 12,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
});