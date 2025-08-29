import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from './Button';

const { width, height } = Dimensions.get('window');

interface ModalAction {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  children: React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  actions?: ModalAction[];
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  size = 'medium',
  showCloseButton = true,
  children,
  primaryAction,
  secondaryAction,
  actions,
}) => {
  const getModalWidth = () => {
    switch (size) {
      case 'small':
        return width * 0.8;
      case 'medium':
        return width * 0.9;
      case 'large':
        return width * 0.95;
      default:
        return width * 0.9;
    }
  };

  const getModalHeight = () => {
    switch (size) {
      case 'small':
        return height * 0.4;
      case 'medium':
        return height * 0.6;
      case 'large':
        return height * 0.8;
      default:
        return height * 0.6;
    }
  };

  const allActions = [
    ...(actions || []),
    ...(secondaryAction ? [secondaryAction] : []),
    ...(primaryAction ? [primaryAction] : []),
  ];

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
        
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modal,
              {
                width: getModalWidth(),
                maxHeight: getModalHeight(),
              },
            ]}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  {title && (
                    <Text style={styles.title} numberOfLines={2}>
                      {title}
                    </Text>
                  )}
                </View>
                
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>
              {children}
            </View>

            {/* Actions */}
            {allActions.length > 0 && (
              <View style={styles.actions}>
                {allActions.map((action, index) => (
                  <Button
                    key={index}
                    title={action.title}
                    onPress={action.onPress}
                    variant={action.variant || 'primary'}
                    loading={action.loading}
                    size="large"
                    style={[
                      styles.actionButton,
                      index < allActions.length - 1 && styles.actionButtonSpacing,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  actionButtonSpacing: {
    marginBottom: 0,
  },
});

export default Modal;