import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useResources } from '../../hooks/useResources';
import { RESOURCE_CATEGORIES } from '../../types/resources';

interface ResourcesScreenProps {
  navigation: any;
}

const ResourcesScreen: React.FC<ResourcesScreenProps> = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState<'main' | 'legal' | 'online' | 'process'>('main');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  // Use the resources hook
  const {
    resources,
    featuredResources,
    searchResults,
    loading,
    searching,
    error,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    toggleBookmark,
    isBookmarked,
  } = useResources();

  const mainResourceItems = [
    {
      id: 'asylum-process',
      title: 'Asylum process',
      subtitle: 'Learn about the 5-step asylum process',
      icon: 'list-outline',
      onPress: () => setCurrentTab('process'),
    },
    {
      id: 'legal-resources',
      title: 'Legal resources', 
      subtitle: 'Find legal aid organizations near you',
      icon: 'scale-outline',
      onPress: () => setCurrentTab('legal'),
    },
    {
      id: 'online-resources',
      title: 'Online resources',
      subtitle: 'Forms, guides, and helpful information',
      icon: 'globe-outline',
      onPress: () => setCurrentTab('online'),
    },
    {
      id: 'document-descriptions',
      title: 'Document descriptions',
      subtitle: 'Understanding your immigration documents',
      icon: 'document-text-outline',
      onPress: () => setShowDocumentModal(true),
    },
  ];

  // Handle opening external URLs
  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const asylumProcessSteps = [
    {
      id: 'arrival',
      title: 'Arrival',
      number: 1,
      content: 'Upon arrival in the United States, you have one year to file for asylum unless you qualify for an exception.',
    },
    {
      id: 'applying',
      title: 'Applying for asylum',
      number: 2,
      content: 'File Form I-589 with USCIS or in Immigration Court. Gather supporting documentation and evidence.',
    },
    {
      id: 'employment',
      title: 'Employment authorisation',
      number: 3,
      content: 'Apply for work authorization 150 days after filing your asylum application with Form I-765.',
    },
    {
      id: 'interview',
      title: 'Interview',
      number: 4,
      content: 'Attend your asylum interview or court hearing. Present your case and evidence to an officer or judge.',
    },
    {
      id: 'green-card',
      title: 'Green card',
      number: 5,
      content: 'If granted asylum, you can apply for a green card one year after your approval.',
    },
  ];

  const handleToggleExpanded = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };


  const getIconBackgroundColor = (itemId: string) => {
    switch (itemId) {
      case 'asylum-process': return '#E8F5E8';
      case 'document-descriptions': return '#E8F5E8';
      case 'legal-resources': return '#E8F5E8';
      case 'online-resources': return '#E8F5E8';
      default: return '#E8F5E8';
    }
  };

  const getIconColor = (itemId: string) => {
    switch (itemId) {
      case 'asylum-process': return '#2E6B47';
      case 'document-descriptions': return '#2E6B47';
      case 'legal-resources': return '#2E6B47';
      case 'online-resources': return '#2E6B47';
      default: return '#2E6B47';
    }
  };

  const handleBackPress = () => {
    if (currentTab !== 'main') {
      setCurrentTab('main');
    } else {
      navigation.goBack();
    }
  };

  const renderMainResources = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {mainResourceItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.resourceCard} onPress={item.onPress}>
          <View style={[styles.resourceIcon, { backgroundColor: getIconBackgroundColor(item.id) }]}>
            <Ionicons name={item.icon as any} size={24} color={getIconColor(item.id)} />
          </View>
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>{item.title}</Text>
            <Text style={styles.resourceSubtitle}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity style={styles.helpLink}>
        <Text style={styles.helpLinkText}>I can't find what I'm looking for</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLegalResources = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Search by...</Text>
        <TouchableOpacity style={styles.searchTypeButton}>
          <Text style={styles.searchTypeText}>Location</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="State, city, zip code...."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Text style={styles.infoIconText}>i</Text>
        </View>
        <View style={styles.infoContent}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Looking for legal aid?</Text>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>
            You will likely need to meet your lawyer in person, so it's best to search for organisations near you.
          </Text>
          <View style={styles.infoCheckbox}>
            <TouchableOpacity style={styles.checkbox}>
              <View style={styles.checkboxInner} />
            </TouchableOpacity>
            <Text style={styles.checkboxText}>Don't show this message again</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderOnlineResources = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
      </View>

      <ScrollView horizontal style={styles.categoriesContainer} showsHorizontalScrollIndicator={false}>
        {RESOURCE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {searching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2E6B47" />
          <Text style={styles.loadingText}>Searching resources...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!searching && !error && searchResults.map((resource) => (
        <View key={resource.id} style={styles.onlineResourceCard}>
          <View style={styles.onlineResourceHeader}>
            <Text style={styles.onlineResourceTitle}>{resource.title}</Text>
            <View style={styles.onlineResourceActions}>
              <TouchableOpacity onPress={() => handleOpenUrl(resource.url)}>
                <Ionicons name="open-outline" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={() => toggleBookmark(resource.id)}
              >
                <Ionicons 
                  name={isBookmarked(resource.id) ? "star" : "star-outline"} 
                  size={20} 
                  color={isBookmarked(resource.id) ? '#34D399' : Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.onlineResourceDescription}>{resource.description}</Text>
          {resource.isOfficial && (
            <View style={styles.officialBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#2E6B47" />
              <Text style={styles.officialBadgeText}>Official USCIS Resource</Text>
            </View>
          )}
        </View>
      ))}

      {!searching && !error && searchResults.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={48} color="#CCCCCC" />
          <Text style={styles.noResultsTitle}>No resources found</Text>
          <Text style={styles.noResultsText}>
            Try adjusting your search terms or selecting a different category.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderAsylumProcess = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {asylumProcessSteps.map((step) => {
        const isExpanded = expandedSections.includes(step.id);
        return (
          <TouchableOpacity
            key={step.id}
            style={styles.processStep}
            onPress={() => handleToggleExpanded(step.id)}
          >
            <View style={styles.processStepHeader}>
              <View style={styles.processStepNumber}>
                <Text style={styles.processStepNumberText}>{step.number}</Text>
              </View>
              <Text style={styles.processStepTitle}>{step.title}</Text>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={Colors.textSecondary} 
              />
            </View>
            {isExpanded && (
              <View style={styles.processStepContent}>
                <Text style={styles.processStepText}>{step.content}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'legal': return 'Legal resources';
      case 'online': return 'Online resources';
      case 'process': return 'Asylum process';
      default: return 'Resources';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentTab !== 'main' && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, currentTab !== 'main' && styles.headerTitleWithBack]}>
          {getHeaderTitle()}
        </Text>
        <TouchableOpacity style={styles.helpButton}>
          <View style={styles.helpIcon}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      {currentTab === 'main' && renderMainResources()}
      {currentTab === 'legal' && renderLegalResources()}
      {currentTab === 'online' && renderOnlineResources()}
      {currentTab === 'process' && renderAsylumProcess()}

      <Modal
        visible={showDocumentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDocumentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Document Descriptions</Text>
            <Text style={styles.modalText}>Document descriptions feature coming soon!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowDocumentModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  headerTitleWithBack: {
    textAlign: 'left',
    marginLeft: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 16,
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  helpButton: {
    padding: 4,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E6B47',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Resource Cards
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 14,
    color: '#666666',
  },

  // Help Link
  helpLink: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  helpLinkText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // Search Section
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 16,
    color: '#000000',
    marginRight: 12,
  },
  searchTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E6B47',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  searchTypeText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 4,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },

  // Categories
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#2E6B47',
    borderColor: '#2E6B47',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },

  // Online Resource Cards
  onlineResourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  onlineResourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  onlineResourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  onlineResourceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginLeft: 12,
  },
  onlineResourceDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContent: {
    flex: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666666',
  },

  // Process Steps
  processStep: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  processStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  processStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  processStepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E6B47',
  },
  processStepTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  processStepContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  processStepText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginLeft: 48,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#2E6B47',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Loading and Error States
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#DC2626',
    flex: 1,
  },

  // Official Badge
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  officialBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#2E6B47',
  },

  // No Results
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default ResourcesScreen;