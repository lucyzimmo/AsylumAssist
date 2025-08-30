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

interface MainHeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  showBack?: boolean; // Legacy prop for compatibility
  showHelp?: boolean; // Legacy prop for help button
  rightComponent?: React.ReactNode;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  onBackPress,
  showBackButton = false,
  showBack = false,
  showHelp = false,
  rightComponent,
}) => {
  const shouldShowBackButton = showBackButton || showBack;
  
  const handleHelpPress = () => {
    // TODO: Implement help functionality
    console.log('Help pressed for:', title);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {shouldShowBackButton && (
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
        
        <View style={styles.rightSection}>
          {showHelp && (
            <TouchableOpacity
              onPress={handleHelpPress}
              style={styles.helpButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.helpIcon}>
                <Text style={styles.questionMark}>?</Text>
              </View>
            </TouchableOpacity>
          )}
          {rightComponent}
        </View>
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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
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
  helpButton: {
    padding: 4,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
});