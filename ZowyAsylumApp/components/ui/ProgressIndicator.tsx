import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  showStepText?: boolean;
  style?: ViewStyle;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  showStepText = false,
  style,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={[styles.container, style]}>
      {showStepText && (
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
      )}
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress}%` }
            ]} 
          />
        </View>
        
        <View style={styles.stepsContainer}>
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <View
                key={stepNumber}
                style={[
                  styles.stepIndicator,
                  isCompleted && styles.stepCompleted,
                  isCurrent && styles.stepCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    isCompleted && styles.stepNumberCompleted,
                  ]}
                >
                  {stepNumber}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  stepText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    position: 'relative',
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  stepCompleted: {
    backgroundColor: Colors.primary,
  },
  stepCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
    borderWidth: 3,
  },
  stepNumber: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  stepNumberCompleted: {
    color: Colors.white,
  },
});

export default ProgressIndicator;