import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { ProgressIndicator } from '../ui/ProgressIndicator';
import { availableLanguages, changeLanguage, isRTL } from '../../i18n';

interface AuthHeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  showLanguageSelector?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
  currentStep,
  totalSteps,
  showProgress = false,
  showLanguageSelector = true,
}) => {
  const { t, i18n } = useTranslation();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const isRTLLayout = isRTL(i18n.language);

  const handleLanguagePress = () => {
    setIsLanguageModalVisible(true);
  };

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      const currentLang = i18n.language;
      const wasRTL = isRTL(currentLang);
      const willBeRTL = isRTL(languageCode);

      await changeLanguage(languageCode);
      setIsLanguageModalVisible(false);

      // Show restart prompt if switching between RTL and LTR layouts
      if (wasRTL !== willBeRTL) {
        Alert.alert(
          t('languageSwitcher.restartRequired'),
          t('languageSwitcher.restartMessage'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('languageSwitcher.errorMessage'));
    }
  };

  const getCurrentLanguage = () => {
    return availableLanguages.find(lang => lang.code === i18n.language) || availableLanguages[0];
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.exitButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
              <Text style={[styles.exitText, isRTLLayout && styles.rtlText]}>{t('common.exit') || 'Exit'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightSection}>
          {showLanguageSelector && (
            <TouchableOpacity
              onPress={handleLanguagePress}
              style={[styles.languageButton, isRTLLayout && styles.rtlLanguageButton]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('languageSwitcher.openLanguageSelector')}
            >
              <Text style={[styles.languageText, isRTLLayout && styles.rtlText]}>
                {getCurrentLanguage().nativeName}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
        
      {showProgress && currentStep && totalSteps && (
        <View style={styles.progressSection}>
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            showStepText={true}
          />
        </View>
      )}

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isRTLLayout && styles.rtlModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isRTLLayout && styles.rtlText]}>
                {t('languageSwitcher.selectLanguage')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsLanguageModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    item.code === i18n.language && styles.selectedLanguageOption,
                    isRTLLayout && styles.rtlLanguageOption
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={[
                      styles.languageOptionText,
                      item.code === i18n.language && styles.selectedLanguageOptionText,
                      isRTLLayout && styles.rtlText
                    ]}>
                      {item.nativeName}
                    </Text>
                    <Text style={[
                      styles.languageEnglishName,
                      item.code === i18n.language && styles.selectedLanguageEnglishName,
                      isRTLLayout && styles.rtlText
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  {item.code === i18n.language && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8F9FA', // Light gray background from design
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA', // Light gray background from design
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  leftSection: {
    alignItems: 'flex-start',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8', // Light green background for exit button
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exitText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: 4,
    fontSize: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginRight: 8,
    fontSize: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark, // Dark green button for language
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    ...Typography.body,
    color: Colors.white,
    marginRight: 8,
    fontSize: 16,
  },
  progressSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },

  // Language Selection Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 0,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rtlModalContent: {
    direction: 'rtl',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rtlLanguageOption: {
    flexDirection: 'row-reverse',
  },
  selectedLanguageOption: {
    backgroundColor: Colors.primaryLight,
  },
  languageInfo: {
    flex: 1,
  },
  languageOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: 2,
  },
  selectedLanguageOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  languageEnglishName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedLanguageEnglishName: {
    color: Colors.primaryDark,
  },

  // RTL Support
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlLanguageButton: {
    flexDirection: 'row-reverse',
  },
});

// Apply RTL layout changes
if (I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}