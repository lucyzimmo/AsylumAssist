import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = {
      ...styles.base,
      ...styles[size],
    };

    if (disabled || loading) {
      return {
        ...baseStyle,
        backgroundColor: Colors.disabled,
        borderColor: Colors.disabled,
        elevation: 0,
        shadowOpacity: 0,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: Colors.primary,
          ...styles.elevated,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: Colors.secondary,
          ...styles.elevated,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: Colors.primary,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: Colors.error,
          ...styles.elevated,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = {
      ...(size === 'large' ? Typography.buttonLarge : Typography.button),
      textAlign: 'center' as const,
    };

    if (disabled || loading) {
      return {
        ...baseTextStyle,
        color: Colors.textDisabled,
      };
    }

    switch (variant) {
      case 'outline':
      case 'ghost':
        return {
          ...baseTextStyle,
          color: Colors.primary,
        };
      case 'danger':
        return {
          ...baseTextStyle,
          color: Colors.white,
        };
      default:
        return {
          ...baseTextStyle,
          color: Colors.white,
        };
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Provide haptic feedback for better UX
      if (AccessibilityInfo) {
        AccessibilityInfo.announceForAccessibility(`${title} pressed`);
      }
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white} 
          size="small"
          accessibilityLabel="Loading" 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,                    // Rounded corners from design system
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 0,
  },
  
  // Touch Target Sizes (Government Accessibility Standards)
  small: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,                       // Minimum 44px touch target
    minWidth: 100,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,                       // Standard touch target
    minWidth: 120,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,                       // Large touch target for CTAs
    minWidth: 140,
  },
  
  // Elevation for Primary Actions
  elevated: {
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,                        // Android shadow
  },
});