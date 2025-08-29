import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  errorText?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  errorText,
  helperText,
  containerStyle,
  required = false,
  style,
  ...props
}, ref) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TextInput
        ref={ref}
        style={[
          styles.input,
          errorText && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textDisabled}
        {...props}
      />
      
      {errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
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
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    color: Colors.textPrimary,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});