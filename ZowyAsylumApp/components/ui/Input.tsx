import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  errorText?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  showPasswordToggle?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  errorText,
  helperText,
  containerStyle,
  required = false,
  showPasswordToggle = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const hasError = Boolean(errorText);
  const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

  const getInputStyle = () => {
    const baseStyle = styles.input;
    const focusStyle = isFocused ? styles.inputFocused : {};
    const errorStyle = hasError ? styles.inputError : {};
    const leftIconStyle = leftIcon ? styles.inputWithLeftIcon : {};
    const rightIconStyle = (rightIcon || showPasswordToggle) ? styles.inputWithRightIcon : {};
    
    return [baseStyle, focusStyle, errorStyle, leftIconStyle, rightIconStyle, style];
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons 
              name={leftIcon as any} 
              size={20} 
              color={hasError ? Colors.error : isFocused ? Colors.primary : Colors.textSecondary} 
            />
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={getInputStyle()}
          placeholderTextColor={Colors.textDisabled}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled: props.editable === false,
          }}
          {...props}
        />
        
        {(rightIcon || showPasswordToggle) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={showPasswordToggle ? togglePasswordVisibility : onRightIconPress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              showPasswordToggle 
                ? (isPasswordVisible ? 'Hide password' : 'Show password')
                : 'Icon button'
            }
          >
            <Ionicons 
              name={
                showPasswordToggle 
                  ? (isPasswordVisible ? 'eye-off-outline' : 'eye-outline')
                  : (rightIcon as any)
              }
              size={20} 
              color={hasError ? Colors.error : isFocused ? Colors.primary : Colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {errorText && (
        <Text style={styles.errorText} accessible={true} accessibilityRole="alert">
          {errorText}
        </Text>
      )}
      
      {helperText && !errorText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
    fontSize: Typography.label.fontSize,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...Typography.input,
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,                    // Rounded corners from design system
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    minHeight: 48,                       // Government accessibility minimum
    textAlignVertical: 'center',
  },
  inputFocused: {
    borderColor: Colors.focusOutline,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,                        // Touch target size
    minHeight: 44,
    marginRight: -12,                    // Adjust for touch target
  },
  errorText: {
    ...Typography.error,
    color: Colors.error,
    marginTop: 6,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});