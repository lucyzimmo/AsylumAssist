import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Modal } from '../ui/Modal';

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type DatePickerMode = 'calendar' | 'dropdown';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: DatePickerMode;
  format?: DateFormat;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onDateChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate = new Date(), // Default to today as max
  mode = 'calendar',
  format = 'MM/DD/YYYY',
  error,
  disabled = false,
  containerStyle,
  required = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDate = (date: Date, formatType: DateFormat): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());

    switch (formatType) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const handleDateSelect = (selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      onDateChange(selectedDate);
    }
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowPicker(false);
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setShowPicker(false);
  };

  const displayValue = value ? formatDate(value, format) : '';
  const hasError = !!error;
  const isEmpty = !value;

  const inputStyle = [
    styles.input,
    {
      borderColor: hasError ? Colors.error : Colors.border,
      backgroundColor: hasError ? Colors.errorLight : Colors.white,
    },
    disabled && styles.disabledInput,
  ];

  const textStyle = [
    styles.inputText,
    {
      color: isEmpty ? Colors.textSecondary : Colors.textPrimary,
    },
    disabled && styles.disabledText,
  ];

  const renderNativeAndroidPicker = () => {
    if (Platform.OS === 'android' && showPicker) {
      return (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date && event.type === 'set') {
              handleDateSelect(date);
            }
          }}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      );
    }
    return null;
  };

  const renderModalPicker = () => {
    if (Platform.OS === 'ios' || mode === 'calendar') {
      return (
        <Modal
          visible={showPicker}
          onClose={handleCancel}
          title="Select Date"
          size="small"
          primaryAction={{
            title: 'Confirm',
            onPress: handleConfirm,
          }}
          secondaryAction={{
            title: 'Cancel',
            onPress: handleCancel,
          }}
        >
          <View style={styles.modalContent}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                if (date) {
                  setTempDate(date);
                }
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={styles.picker}
            />
          </View>
        </Modal>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, hasError && styles.errorLabel]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={inputStyle}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Date picker'}. ${value ? `Selected date: ${displayValue}` : 'No date selected'}`}
        accessibilityHint="Tap to select a date"
      >
        <View style={styles.inputContent}>
          <Text style={textStyle}>
            {displayValue || placeholder}
          </Text>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={disabled ? Colors.textDisabled : Colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Render appropriate picker based on platform and mode */}
      {renderNativeAndroidPicker()}
      {renderModalPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  errorLabel: {
    color: Colors.error,
  },
  required: {
    color: Colors.error,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: Colors.white,
  },
  disabledInput: {
    backgroundColor: Colors.background,
    borderColor: Colors.disabled,
  },
  inputContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    ...Typography.input,
    flex: 1,
  },
  disabledText: {
    color: Colors.textDisabled,
  },
  icon: {
    fontSize: 16,
    marginLeft: 8,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  picker: {
    width: '100%',
    height: 200,
  },
});

export default DatePicker;