import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface ResourcesScreenProps {
  navigation: any;
}

const ResourcesScreen: React.FC<ResourcesScreenProps> = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState<'main' | 'legal' | 'online' | 'process'>('main');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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
      onPress: () => Alert.alert('Document Descriptions', 'Document descriptions feature coming soon!'),
    },
  ];

  const onlineResourceCategories = ['All', 'Forms', 'Guides', 'Legal', 'Statistics'];
  
  const onlineResources = [
    {
      id: 'form-i589',
      title: 'Form I-589 (Application for Asylum)',
      description: 'The official form used to apply for asylum and for withholding of removal in the United States.',
      category: 'Forms',
      isFavorite: false,
    },
    {
      id: 'work-permit-guide', 
      title: 'Work Permit Guide',
      description: 'How to obtain work authorization while your asylum case is pending.',
      category: 'Guides',
      isFavorite: false,
    },
    {
      id: 'asylum-denied',
      title: 'What happens if asylum is denied?',
      description: 'Information about the deportation process and options if your asylum request is denied.',
      category: 'Legal',
      isFavorite: false,
    },
    {
      id: 'withholding-removal',
      title: 'Withholding of Removal',
      description: 'Information about withholding of removal, an alternative form of relief for people who don\'t qualify for asylum.',
      category: 'Legal',
      isFavorite: false,
    },
  ];

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
          <View style={styles.resourceIcon}>
            <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
          </View>
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>{item.title}</Text>
            <Text style={styles.resourceSubtitle}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      ))}
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
          value={searchText}
          onChangeText={setSearchText}
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
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
      </View>

      <ScrollView horizontal style={styles.categoriesContainer} showsHorizontalScrollIndicator={false}>
        {onlineResourceCategories.map((category) => (
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

      {onlineResources
        .filter(resource => selectedCategory === 'All' || resource.category === selectedCategory)
        .map((resource) => (
          <TouchableOpacity key={resource.id} style={styles.onlineResourceCard}>
            <View style={styles.onlineResourceHeader}>
              <Text style={styles.onlineResourceTitle}>{resource.title}</Text>
              <View style={styles.onlineResourceActions}>
                <TouchableOpacity>
                  <Ionicons name="open-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton}>
                  <Ionicons 
                    name={resource.isFavorite ? "star" : "star-outline"} 
                    size={20} 
                    color={resource.isFavorite ? Colors.warning : Colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.onlineResourceDescription}>{resource.description}</Text>
          </TouchableOpacity>
        ))}
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
    color: Colors.textPrimary,
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

  // Resources Section
  resourcesSection: {
    marginBottom: 32,
  },

  // Resource Item
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  resourceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  chevron: {
    fontSize: 24,
    color: '#666666',
    fontWeight: '300',
  },

  // Help Link
  helpLink: {
    paddingVertical: 20,
  },
  helpLinkText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default ResourcesScreen;