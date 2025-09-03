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
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

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
    const documentToUpdate = uploadedFile || selectedDocument;
    if (documentToUpdate && documentName.trim()) {
      const success = await updateDocument(documentToUpdate.id, {
        name: documentName.trim(),
        category: selectedDocumentType as any,
      });
      
      if (success) {
        setShowUploadModal(false);
        setUploadedFile(null);
        setSelectedDocument(null);
        setDocumentName('');
        setSelectedDocumentType('other');
        Alert.alert('Success', 'Document saved successfully!');
      }
    }
  };

  const handleEditDocument = (document: any) => {
    setSelectedDocument(document);
    setUploadedFile(null); // Clear uploaded file since we're editing existing
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
          
          {documents.length === 0 ? (
            <Text style={styles.noDocuments}>No documents uploaded yet</Text>
          ) : (
            documents.map((document) => (
              <View key={document.id} style={styles.documentItem}>
                <View style={styles.documentIcon}>
                  <Ionicons name="document-text" size={20} color={Colors.white} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>
                    {DOCUMENT_TYPES.find(type => type.id === document.category)?.label || 'Other document'}
                  </Text>
                  <Text style={styles.documentFilename}>{document.name}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditDocument(document)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Document Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Document Preview */}
            {(uploadedFile || selectedDocument) && (
              <View style={styles.documentPreview}>
                <Text style={styles.previewFilename}>
                  {(uploadedFile || selectedDocument)?.name}
                </Text>
                <Text style={styles.previewSize}>
                  {formatFileSize((uploadedFile || selectedDocument)?.size || 0)}
                </Text>
              </View>
            )}

            {/* Document Type Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Document type</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>
                    {DOCUMENT_TYPES.find(type => type.id === selectedDocumentType)?.label || 'Other document'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Document Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Document name</Text>
              <TextInput
                style={styles.textInput}
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="Enter document name"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveDocument}
            >
              <Text style={styles.saveButtonText}>Save</Text>
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

  // No Documents
  noDocuments: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 40,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },

  // Document Preview
  documentPreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  previewFilename: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  previewSize: {
    fontSize: 14,
    color: '#666666',
  },

  // Form Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },

  // Save Button
  saveButton: {
    backgroundColor: '#2E6B47',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentsScreen;