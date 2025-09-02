import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useDocuments } from '../../hooks/useDocuments';

interface DocumentsScreenProps {
  navigation: any;
}

// Document type options for the dropdown
const DOCUMENT_TYPES = [
  { id: 'passport', label: 'Passport' },
  { id: 'form-i589', label: 'Form I-589' },
  { id: 'form-i765', label: 'Form I-765' },
  { id: 'birth-certificate', label: 'Birth Certificate' },
  { id: 'driver-license', label: 'Driver\'s License' },
  { id: 'other', label: 'Other document' },
];

const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ navigation }) => {
  const {
    documents,
    loading,
    uploading,
    error,
    pickDocument,
    updateDocument,
    formatFileSize,
  } = useDocuments();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('other');
  const [documentName, setDocumentName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const handleUploadPress = async () => {
    const success = await pickDocument();
    
    if (success && documents.length > 0) {
      // Get the most recently uploaded document
      const latestDoc = documents[documents.length - 1];
      setUploadedFile(latestDoc);
      setDocumentName(latestDoc.name);
      setShowUploadModal(true);
    } else if (error) {
      Alert.alert('Upload Failed', error);
    }
  };

  const handleSaveDocument = async () => {
    if (uploadedFile && documentName.trim()) {
      const success = await updateDocument(uploadedFile.id, {
        name: documentName.trim(),
        category: selectedDocumentType as any,
      });
      
      if (success) {
        setShowUploadModal(false);
        setUploadedFile(null);
        setDocumentName('');
        setSelectedDocumentType('other');
        Alert.alert('Success', 'Document saved successfully!');
      }
    }
  };

  const handleEditDocument = (document: any) => {
    setUploadedFile(document);
    setDocumentName(document.name);
    setSelectedDocumentType(document.category);
    setShowUploadModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching documents.png */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        <TouchableOpacity style={styles.helpButton}>
          <View style={styles.helpIcon}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Card */}
        <TouchableOpacity 
          style={styles.uploadCard} 
          activeOpacity={0.7}
          onPress={handleUploadPress}
          disabled={uploading}
        >
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Tap here to upload a new document</Text>
          <Text style={styles.uploadSubtitle}>Max file size: 25MB</Text>
        </TouchableOpacity>

        {/* Documents List */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Your documents</Text>
          
          {/* Document Item - Passport */}
          <View style={styles.documentItem}>
            <View style={styles.documentIcon}>
              <Ionicons name="document-text" size={20} color={Colors.white} />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>Passport</Text>
              <Text style={styles.documentFilename}>IMG_345345.jpg</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Document Item - Form I-589 */}
          <View style={styles.documentItem}>
            <View style={styles.documentIcon}>
              <Ionicons name="document-text" size={20} color={Colors.white} />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>Form I-589</Text>
              <Text style={styles.documentFilename}>form-I-589-final.pdf</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Document Item - Form I-765 */}
          <View style={styles.documentItem}>
            <View style={styles.documentIcon}>
              <Ionicons name="document-text" size={20} color={Colors.white} />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>Form I-765</Text>
              <Text style={styles.documentFilename}>form-I-765.pdf</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
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

  // Upload Card
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadIcon: {
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },

  // Documents Section
  documentsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },

  // Document Item
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  documentFilename: {
    fontSize: 14,
    color: '#666666',
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
});

export default DocumentsScreen;