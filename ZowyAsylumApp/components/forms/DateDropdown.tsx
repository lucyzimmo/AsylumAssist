import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Modal as RNModal,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface DateDropdownProps {
  label?: string;
  value?: Date;
  onDateChange: (date: Date) => void;
  placeholder?: {
    month?: string;
    day?: string;
    year?: string;
  };
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
  yearRange?: { start: number; end: number };
}

interface DropdownProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  disabled?: boolean;
  error?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  onSelect,
  options,
  placeholder,
  disabled = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={[styles.dropdownLabel, error && styles.errorLabel]}>
        {label}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          error && styles.dropdownError,
          disabled && styles.dropdownDisabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label} dropdown. Current value: ${displayValue}`}
      >
        <Text style={[
          styles.dropdownText,
          !selectedOption && styles.placeholderText,
          disabled && styles.disabledText,
        ]}>
          {displayValue}
        </Text>
        <Text style={[styles.dropdownArrow, disabled && styles.disabledText]}>
          ▼
        </Text>
      </TouchableOpacity>

      <RNModal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    option.value === value && styles.selectedOption,
                    index === options.length - 1 && styles.lastOption,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    option.value === value && styles.selectedOptionText,
                  ]}>
                    {option.label}
                  </Text>
                  {option.value === value && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </RNModal>
    </View>
  );
};

export const DateDropdown: React.FC<DateDropdownProps> = ({
  label,
  value,
  onDateChange,
  placeholder = {
    month: 'Month',
    day: 'Day',
    year: 'Year',
  },
  minimumDate,
  maximumDate = new Date(),
  error,
  disabled = false,
  containerStyle,
  required = false,
  yearRange,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      setSelectedMonth(String(value.getMonth() + 1));
      setSelectedDay(String(value.getDate()));
      setSelectedYear(String(value.getFullYear()));
    }
  }, [value]);

  // Generate options
  const monthOptions = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const dayOptions = React.useMemo(() => {
    if (!selectedMonth || !selectedYear) {
      return Array.from({ length: 31 }, (_, i) => ({
        label: String(i + 1),
        value: String(i + 1),
      }));
    }

    const daysInMonth = getDaysInMonth(parseInt(selectedMonth), parseInt(selectedYear));
    return Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      value: String(i + 1),
    }));
  }, [selectedMonth, selectedYear]);

  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = yearRange?.start || (minimumDate?.getFullYear() || 1900);
    const endYear = yearRange?.end || (maximumDate?.getFullYear() || currentYear);
    
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push({
        label: String(year),
        value: String(year),
      });
    }
    return years;
  }, [yearRange, minimumDate, maximumDate]);

  const handleDatePartChange = (part: 'month' | 'day' | 'year', value: string) => {
    let newMonth = selectedMonth;
    let newDay = selectedDay;
    let newYear = selectedYear;

    switch (part) {
      case 'month':
        newMonth = value;
        setSelectedMonth(value);
        // Reset day if it's invalid for the new month
        if (newDay && newYear) {
          const daysInNewMonth = getDaysInMonth(parseInt(value), parseInt(newYear));
          if (parseInt(newDay) > daysInNewMonth) {
            newDay = String(daysInNewMonth);
            setSelectedDay(newDay);
          }
        }
        break;
      case 'day':
        newDay = value;
        setSelectedDay(value);
        break;
      case 'year':
        newYear = value;
        setSelectedYear(value);
        // Reset day if it's invalid for the new year (leap year considerations)
        if (newDay && newMonth) {
          const daysInNewMonth = getDaysInMonth(parseInt(newMonth), parseInt(value));
          if (parseInt(newDay) > daysInNewMonth) {
            newDay = String(daysInNewMonth);
            setSelectedDay(newDay);
          }
        }
        break;
    }

    // Create date if all parts are selected
    if (newMonth && newDay && newYear) {
      const newDate = new Date(parseInt(newYear), parseInt(newMonth) - 1, parseInt(newDay));
      
      // Validate against min/max dates
      const isValidDate = (!minimumDate || newDate >= minimumDate) && 
                         (!maximumDate || newDate <= maximumDate);
      
      if (isValidDate) {
        onDateChange(newDate);
      }
    }
  };

  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, hasError && styles.errorLabel]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.dateRow}>
        <View style={styles.monthContainer}>
          <Dropdown
            label="Month"
            value={selectedMonth}
            onSelect={(value) => handleDatePartChange('month', value)}
            options={monthOptions}
            placeholder={placeholder.month || 'Month'}
            disabled={disabled}
            error={hasError}
          />
        </View>

        <View style={styles.dayContainer}>
          <Dropdown
            label="Day"
            value={selectedDay}
            onSelect={(value) => handleDatePartChange('day', value)}
            options={dayOptions}
            placeholder={placeholder.day || 'Day'}
            disabled={disabled}
            error={hasError}
          />
        </View>

        <View style={styles.yearContainer}>
          <Dropdown
            label="Year"
            value={selectedYear}
            onSelect={(value) => handleDatePartChange('year', value)}
            options={yearOptions}
            placeholder={placeholder.year || 'Year'}
            disabled={disabled}
            error={hasError}
          />
        </View>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorLabel: {
    color: Colors.error,
  },
  required: {
    color: Colors.error,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  monthContainer: {
    flex: 2,
  },
  dayContainer: {
    flex: 1,
  },
  yearContainer: {
    flex: 1.2,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  
  // Dropdown styles
  dropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontSize: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  dropdownError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  dropdownDisabled: {
    backgroundColor: Colors.background,
    borderColor: Colors.disabled,
  },
  dropdownText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.textDisabled,
  },
  dropdownArrow: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: Math.min(300, screenWidth * 0.8),
    maxHeight: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  checkMark: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DateDropdown;