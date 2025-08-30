import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface ResourcesScreenProps {
  navigation: any;
}

const ResourcesScreen: React.FC<ResourcesScreenProps> = ({ navigation }) => {
  const resourceItems = [
    {
      id: 'asylum-process',
      title: 'Asylum process',
      icon: 'leaf',
      color: '#E8F5E8',
    },
    {
      id: 'document-description',
      title: 'Document description',
      icon: 'document-text',
      color: '#E8F5E8',
    },
    {
      id: 'legal-aid',
      title: 'Legal aid',
      icon: 'scale',
      color: '#E8F5E8',
    },
    {
      id: 'online-resources',
      title: 'Online resources',
      icon: 'globe',
      color: '#E8F5E8',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Resources@2x.png */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resources</Text>
        <TouchableOpacity style={styles.helpButton}>
          <View style={styles.helpIcon}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resource Items */}
        <View style={styles.resourcesSection}>
          {resourceItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.resourceItem}>
              <View style={[styles.resourceIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.resourceTitle}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Link */}
        <TouchableOpacity style={styles.helpLink}>
          <Text style={styles.helpLinkText}>I can't find what I'm looking for</Text>
        </TouchableOpacity>
      </ScrollView>
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