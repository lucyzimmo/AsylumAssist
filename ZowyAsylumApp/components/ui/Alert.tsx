import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface AlertProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message?: string;
  description?: string;
  style?: ViewStyle;
}

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  description,
  style,
}) => {
  const content = message || description;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: Colors.success + '15',
          borderColor: Colors.success + '30',
          iconColor: Colors.success,
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning + '15',
          borderColor: Colors.warning + '30',
          iconColor: Colors.warning,
        };
      case 'error':
        return {
          backgroundColor: Colors.error + '15',
          borderColor: Colors.error + '30',
          iconColor: Colors.error,
        };
      case 'info':
        return {
          backgroundColor: Colors.info + '15',
          borderColor: Colors.info + '30',
          iconColor: Colors.info,
        };
      default:
        return {
          backgroundColor: Colors.info + '15',
          borderColor: Colors.info + '30',
          iconColor: Colors.info,
        };
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIcon() as any}
          size={20}
          color={variantStyles.iconColor}
        />
      </View>
      
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: variantStyles.iconColor }]}>
            {title}
          </Text>
        )}
        {content && (
          <Text style={styles.message}>
            {content}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});