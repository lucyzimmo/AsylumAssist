import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage, availableLanguages, isRTL } from '../../i18n';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface LanguageSwitcherProps {
  showLabel?: boolean;
  iconSize?: number;
  style?: any;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showLabel = false,
  iconSize = 20,
  style,
}) => {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = availableLanguages.find(lang => lang.code === i18n.language);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      const wasRTL = isRTL(i18n.language);
      await changeLanguage(languageCode);
      const isNowRTL = isRTL(languageCode);

      // Handle RTL layout change
      if (wasRTL !== isNowRTL) {
        Alert.alert(
          t('languageSwitcher.restartRequired', 'Restart Required'),
          t('languageSwitcher.restartMessage', 'Please restart the app to apply the layout direction change.'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                // Force RTL layout change
                I18nManager.forceRTL(isNowRTL);
                // Note: In a real app, you might want to trigger an app restart here
              },
            },
          ]
        );
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        t('languageSwitcher.errorMessage', 'Failed to change language. Please try again.')
      );
    }
  };

  const renderLanguageItem = ({ item }: { item: typeof availableLanguages[0] }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        item.code === i18n.language && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageChange(item.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={[styles.languageName, item.code === i18n.language && styles.selectedLanguageName]}>
          {item.nativeName}
        </Text>
        <Text style={[styles.languageCode, item.code === i18n.language && styles.selectedLanguageCode]}>
          {item.name}
        </Text>
      </View>
      {item.code === i18n.language && (
        <Ionicons name="checkmark" size={20} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.switcherButton}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('languageSwitcher.openLanguageSelector', 'Open language selector')}
      >
        <Ionicons name="language" size={iconSize} color={Colors.primary} />
        {showLabel && (
          <Text style={styles.buttonLabel}>
            {currentLanguage?.nativeName || 'Language'}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('languageSwitcher.selectLanguage', 'Select Language')}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableLanguages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  switcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonLabel: {
    ...Typography.button,
    color: Colors.textPrimary,
    marginLeft: 6,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 20,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  selectedLanguageItem: {
    backgroundColor: Colors.primaryLight || '#E3F2FD',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: Colors.primary,
    fontWeight: '700',
  },
  languageCode: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedLanguageCode: {
    color: Colors.primary,
  },
});