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

// Complete document type options for asylum seekers
const DOCUMENT_TYPES = [
  // Identity Documents
  { id: 'passport', label: 'Passport', category: 'identity' },
  { id: 'birth-certificate', label: 'Birth Certificate', category: 'identity' },
  { id: 'national-id', label: 'National ID', category: 'identity' },
  { id: 'driver-license', label: 'Driver\'s License', category: 'identity' },
  { id: 'marriage-certificate', label: 'Marriage Certificate', category: 'identity' },
  
  // Asylum Application Forms
  { id: 'form-i589', label: 'Form I-589 (Asylum Application)', category: 'asylum_application' },
  { id: 'form-i765', label: 'Form I-765 (Work Authorization)', category: 'work_authorization' },
  { id: 'form-i912', label: 'Form I-912 (Fee Waiver)', category: 'asylum_application' },
  { id: 'filing-receipt', label: 'USCIS Filing Receipt', category: 'asylum_application' },
  
  // Supporting Evidence
  { id: 'police-report', label: 'Police Reports', category: 'supporting_evidence' },
  { id: 'medical-records', label: 'Medical Records', category: 'medical_records' },
  { id: 'psychological-evaluation', label: 'Psychological Evaluation', category: 'medical_records' },
  { id: 'country-report', label: 'Country Condition Reports', category: 'supporting_evidence' },
  { id: 'news-articles', label: 'News Articles/Evidence', category: 'supporting_evidence' },
  { id: 'witness-statement', label: 'Witness Statements', category: 'supporting_evidence' },
  { id: 'photos-evidence', label: 'Photos/Visual Evidence', category: 'supporting_evidence' },
  
  // Legal Documents
  { id: 'court-documents', label: 'Court Documents', category: 'legal_documents' },
  { id: 'attorney-letters', label: 'Attorney Letters', category: 'legal_documents' },
  { id: 'legal-notices', label: 'Legal Notices', category: 'legal_documents' },
  
  // Other
  { id: 'translation', label: 'Certified Translations', category: 'other' },
  { id: 'affidavit', label: 'Affidavits', category: 'other' },
  { id: 'other', label: 'Other Document', category: 'other' },
];

const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ navigation }) => {
  const {
    documents,
    loading,
    uploading,
    error,
    pickDocument,
    updateDocument,
    deleteDocument,
    formatFileSize,
  } = useDocuments();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('other');
  const [documentName, setDocumentName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleUploadPress = async () => {
    try {
      setShowUploadProgress(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const success = await pickDocument({
        allowMultiple: false,
        mediaTypes: ['document', 'photo'],
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (success && documents.length > 0) {
        // Get the most recently uploaded document
        const latestDoc = documents[documents.length - 1];
        
        // Validate file size (10MB limit for mobile optimization)
        if (latestDoc.size > 10 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 10MB for optimal performance.',
            [{ text: 'OK' }]
          );
          setShowUploadProgress(false);
          return;
        }
        
        // Validate file type
        const validTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        const fileExtension = latestDoc.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !validTypes.includes(fileExtension)) {
          Alert.alert(
            'Invalid File Type',
            'Please select a PDF, image, or document file.',
            [{ text: 'OK' }]
          );
          setShowUploadProgress(false);
          return;
        }
        
        setUploadedFile(latestDoc);
        setDocumentName(latestDoc.name);
        setShowUploadModal(true);
      } else if (error) {
        Alert.alert('Upload Failed', error);
      }
    } catch (err) {
      Alert.alert('Upload Error', 'Failed to upload document. Please try again.');
    } finally {
      setTimeout(() => {
        setShowUploadProgress(false);
        setUploadProgress(0);
      }, 1000);
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

  const handleDeleteDocument = (document: any) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteDocument(document.id);
            if (success) {
              Alert.alert('Success', 'Document deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete document. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleHelpPress = () => {
    setShowHelpModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching documents.png */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        <TouchableOpacity style={styles.helpButton} onPress={handleHelpPress}>
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

        {/* Upload Progress Indicator */}
        {showUploadProgress && (
          <View style={styles.uploadProgressContainer}>
            <View style={styles.uploadProgressCard}>
              <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
              <Text style={styles.uploadProgressText}>Uploading document...</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{uploadProgress}%</Text>
            </View>
          </View>
        )}

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
                  <Text style={styles.documentSize}>{formatFileSize(document.size || 0)}</Text>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditDocument(document)}
                  >
                    <Ionicons name="create-outline" size={16} color="#333333" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDocument(document)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
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
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {DOCUMENT_TYPES.find(type => type.id === selectedDocumentType)?.label || 'Other document'}
                  </Text>
                  <Ionicons 
                    name={showDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666666" 
                  />
                </TouchableOpacity>
                
                {showDropdown && (
                  <View style={styles.dropdownOptions}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {DOCUMENT_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.dropdownOption,
                            selectedDocumentType === type.id && styles.selectedOption
                          ]}
                          onPress={() => {
                            setSelectedDocumentType(type.id);
                            setShowDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownOptionText,
                            selectedDocumentType === type.id && styles.selectedOptionText
                          ]}>
                            {type.label}
                          </Text>
                          {selectedDocumentType === type.id && (
                            <Ionicons name="checkmark" size={18} color={Colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
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

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Document Help & Guidance</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHelpModal(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.helpScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Required Documents</Text>
                <View style={styles.helpItem}>
                  <Ionicons name="document-text" size={16} color={Colors.primary} />
                  <Text style={styles.helpItemText}>Identity Documents: Passport, national ID, birth certificate</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="document-text" size={16} color={Colors.primary} />
                  <Text style={styles.helpItemText}>Form I-589: Your asylum application form</Text>
                </View>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Optional Documents</Text>
                <View style={styles.helpItem}>
                  <Ionicons name="folder" size={16} color="#666666" />
                  <Text style={styles.helpItemText}>Supporting Evidence: Country reports, news articles, medical records</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="briefcase" size={16} color="#666666" />
                  <Text style={styles.helpItemText}>Work Authorization: Form I-765, employment authorization documents</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="scale" size={16} color="#666666" />
                  <Text style={styles.helpItemText}>Legal Documents: Court documents, attorney letters</Text>
                </View>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Upload Tips</Text>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.helpItemText}>Accepted formats: PDF, JPG, PNG, DOC, DOCX</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.helpItemText}>Maximum file size: 10MB per document</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.helpItemText}>Ensure documents are clear and readable</Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.helpItemText}>Include certified translations for non-English documents</Text>
                </View>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>Need More Help?</Text>
                <TouchableOpacity style={styles.helpContactButton}>
                  <Ionicons name="call" size={16} color={Colors.primary} />
                  <Text style={styles.helpContactText}>Contact Support: 1-800-ASYLUM</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.helpContactButton}>
                  <Ionicons name="mail" size={16} color={Colors.primary} />
                  <Text style={styles.helpContactText}>Email: help@zowy.app</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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

  // Upload Progress Styles
  uploadProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadProgressText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: 200,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
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
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
    color: '#999999',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#FF4444',
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
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F0F8F0',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
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

  // Help Modal Styles
  helpScrollView: {
    maxHeight: 400,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 16,
  },
  helpItemText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  helpContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  helpContactText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});

export default DocumentsScreen;