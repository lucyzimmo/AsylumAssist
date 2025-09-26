import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DocumentItem, DocumentCategory, DocumentUploadOptions, DocumentUploadResult, DocumentFilters } from '../types/documents';

const STORAGE_KEY = '@asylumassist_documents';
const DOCUMENTS_FOLDER = FileSystem.documentDirectory + 'asylumassist_documents/';

class DocumentService {
  private documents: DocumentItem[] = [];
  private takingPhoto: boolean = false;
  private pickingImage: boolean = false;
  private pickingDocument: boolean = false;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Create documents folder if it doesn't exist
      const folderInfo = await FileSystem.getInfoAsync(DOCUMENTS_FOLDER);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOCUMENTS_FOLDER, { intermediates: true });
      }
      
      // Load existing documents
      await this.loadDocumentsFromStorage();
    } catch (error) {
      console.error('Failed to initialize document service:', error);
    }
  }

  /**
   * Request necessary permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: mediaLibraryWriteStatus } = await MediaLibrary.requestPermissionsAsync();

      return cameraStatus === 'granted' && 
             mediaLibraryStatus === 'granted' && 
             mediaLibraryWriteStatus === 'granted';
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(options: Partial<DocumentUploadOptions> = {}): Promise<DocumentUploadResult> {
    try {
      if (this.takingPhoto || this.pickingImage || this.pickingDocument) {
        return { success: false, error: 'Another file action is in progress. Please wait.' };
      }
      this.takingPhoto = true;
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Camera permission denied' };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Photo capture cancelled' };
      }

      const asset = result.assets[0];
      return await this.processUploadedFile(asset);
    } catch (error) {
      return { success: false, error: `Failed to take photo: ${error}` };
    }
    finally {
      this.takingPhoto = false;
    }
  }

  /**
   * Pick image from gallery
   */
  async pickFromGallery(options: Partial<DocumentUploadOptions> = {}): Promise<DocumentUploadResult> {
    try {
      if (this.takingPhoto || this.pickingImage || this.pickingDocument) {
        return { success: false, error: 'Another file action is in progress. Please wait.' };
      }
      this.pickingImage = true;
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Media library permission denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: options.allowMultiple ?? false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Image selection cancelled' };
      }

      const asset = result.assets[0];
      return await this.processUploadedFile(asset);
    } catch (error) {
      return { success: false, error: `Failed to pick image: ${error}` };
    }
    finally {
      this.pickingImage = false;
    }
  }

  /**
   * Pick document file
   */
  async pickDocument(options: Partial<DocumentUploadOptions> = {}): Promise<DocumentUploadResult> {
    try {
      if (this.takingPhoto || this.pickingImage || this.pickingDocument) {
        return { success: false, error: 'Different document picking in progress. Please wait.' };
      }
      this.pickingDocument = true;
      
      console.log('Starting document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accept all file types to work with "My Files"
        copyToCacheDirectory: false, // Try without copying first
        multiple: options.allowMultiple ?? false,
      });

      console.log('Document picker result:', result);

      if (result.canceled) {
        console.log('Document selection was cancelled');
        return { success: false, error: 'Document selection cancelled' };
      }

      if (!result.assets || result.assets.length === 0) {
        console.log('No assets in result');
        return { success: false, error: 'No document selected' };
      }

      const asset = result.assets[0];
      console.log('Selected asset:', asset);
      
      // Validate file size
      if (asset.size && !this.isFileSizeValid(asset.size)) {
        return { success: false, error: 'File size too large (max 50MB)' };
      }

      return await this.processUploadedFile(asset);
    } catch (error) {
      console.error('Document picker error:', error);
      return { success: false, error: `Failed to pick document: ${error}` };
    }
    finally {
      this.pickingDocument = false;
    }
  }

  /**
   * Process uploaded file and save to local storage
   */
  private async processUploadedFile(asset: any): Promise<DocumentUploadResult> {
    try {
      console.log('Processing uploaded file:', asset);
      
      const fileExtension = asset.uri.split('.').pop() || '';
      const fileName = asset.name || `document_${Date.now()}.${fileExtension}`;
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
      const newUri = DOCUMENTS_FOLDER + sanitizedFileName;

      console.log('Copying file from:', asset.uri);
      console.log('Copying file to:', newUri);

      // Check if source file exists and is accessible
      const sourceInfo = await FileSystem.getInfoAsync(asset.uri);
      console.log('Source file info:', sourceInfo);
      
      if (!sourceInfo.exists) {
        throw new Error('Source file is not accessible');
      }

      // Copy file to documents folder
      try {
        await FileSystem.copyAsync({
          from: asset.uri,
          to: newUri,
        });
        console.log('File copied successfully');
      } catch (copyError) {
        console.error('Copy failed, trying alternative method:', copyError);
        
        // Alternative: Read and write the file
        const fileData = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(newUri, fileData, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log('File copied using alternative method');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(newUri);
      console.log('File info:', fileInfo);

      const document: DocumentItem = {
        id: Date.now().toString(),
        name: sanitizedFileName,
        type: this.getDocumentType(asset.mimeType || '', sanitizedFileName),
        category: 'other', // Default category, user can change later
        uri: newUri,
        size: fileInfo.size || 0,
        mimeType: asset.mimeType || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [],
        isRequired: false,
        status: 'uploaded',
      };

      // Add to documents array
      this.documents.push(document);
      await this.saveDocumentsToStorage();

      return { success: true, document };
    } catch (error) {
      return { success: false, error: `Failed to process file: ${error}` };
    }
  }

  /**
   * Get document type based on MIME type and file extension
   */
  private getDocumentType(mimeType: string, fileName?: string): 'image' | 'pdf' | 'document' {
    // Check MIME type first
    if (mimeType && mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    
    // Fallback to file extension if MIME type is unclear
    if (fileName) {
      const extension = fileName.toLowerCase().split('.').pop() || '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
        return 'image';
      }
      if (extension === 'pdf') {
        return 'pdf';
      }
    }
    
    return 'document';
  }

  /**
   * Get all documents
   */
  async getAllDocuments(): Promise<DocumentItem[]> {
    await this.loadDocumentsFromStorage();
    return [...this.documents];
  }

  /**
   * Get documents by category
   */
  async getDocumentsByCategory(category: DocumentCategory): Promise<DocumentItem[]> {
    await this.loadDocumentsFromStorage();
    return this.documents.filter(doc => doc.category === category);
  }

  /**
   * Search documents
   */
  async searchDocuments(filters: DocumentFilters): Promise<DocumentItem[]> {
    await this.loadDocumentsFromStorage();
    
    let filtered = [...this.documents];

    if (filters.category) {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.uploadedAt);
        return docDate >= filters.dateRange!.start && docDate <= filters.dateRange!.end;
      });
    }

    return filtered;
  }

  /**
   * Update document details
   */
  async updateDocument(id: string, updates: Partial<DocumentItem>): Promise<boolean> {
    try {
      const index = this.documents.findIndex(doc => doc.id === id);
      if (index === -1) return false;

      this.documents[index] = {
        ...this.documents[index],
        ...updates,
        lastModified: new Date().toISOString(),
      };

      await this.saveDocumentsToStorage();
      return true;
    } catch (error) {
      console.error('Failed to update document:', error);
      return false;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const document = this.documents.find(doc => doc.id === id);
      if (!document) return false;

      // Delete file from filesystem
      const fileInfo = await FileSystem.getInfoAsync(document.uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(document.uri);
      }

      // Remove from documents array
      this.documents = this.documents.filter(doc => doc.id !== id);
      await this.saveDocumentsToStorage();

      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<{
    total: number;
    byCategory: Record<DocumentCategory, number>;
    byStatus: Record<string, number>;
    totalSize: number;
  }> {
    await this.loadDocumentsFromStorage();
    
    const byCategory = {} as Record<DocumentCategory, number>;
    const byStatus = {} as Record<string, number>;
    let totalSize = 0;

    this.documents.forEach(doc => {
      byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
      totalSize += doc.size;
    });

    return {
      total: this.documents.length,
      byCategory,
      byStatus,
      totalSize,
    };
  }

  /**
   * Save documents to AsyncStorage
   */
  private async saveDocumentsToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents));
    } catch (error) {
      console.error('Failed to save documents to storage:', error);
    }
  }

  /**
   * Load documents from AsyncStorage
   */
  private async loadDocumentsFromStorage(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.documents = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load documents from storage:', error);
      this.documents = [];
    }
  }

  /**
   * Check file size limits
   */
  isFileSizeValid(size: number): boolean {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    return size <= MAX_SIZE;
  }

  /**
   * Get human readable file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const documentService = new DocumentService();
export default documentService;