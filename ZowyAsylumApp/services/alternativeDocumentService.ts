import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { DocumentUploadResult } from '../types/documents';

/**
 * Alternative document service for Expo Go compatibility
 * Uses image picker as a fallback for document picking
 */
export class AlternativeDocumentService {
  
  /**
   * Alternative document picker using image picker
   * This works better in Expo Go for PDF and document files
   */
  static async pickDocumentAlternative(): Promise<DocumentUploadResult> {
    try {
      console.log('Using alternative document picker...');
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Media library permission denied' };
      }

      // Use image picker with all media types
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // This includes documents in some cases
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Selection cancelled' };
      }

      const asset = result.assets[0];
      console.log('Alternative picker asset:', asset);

      return { 
        success: true, 
        document: {
          id: Date.now().toString(),
          name: asset.fileName || `document_${Date.now()}`,
          type: asset.type === 'video' ? 'document' : 'image',
          category: 'other',
          uri: asset.uri,
          size: asset.fileSize || 0,
          mimeType: asset.mimeType || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tags: [],
          isRequired: false,
          status: 'uploaded',
        }
      };
    } catch (error) {
      console.error('Alternative picker error:', error);
      return { success: false, error: `Alternative picker failed: ${error}` };
    }
  }

  /**
   * Show instructions for manual document upload
   */
  static getDocumentUploadInstructions(): string {
    return `For best document upload experience in Expo Go:

1. CAMERA METHOD (Recommended):
   • Use "Take Photo" to capture documents
   • Ensure good lighting and focus
   • Works with all document types

2. GALLERY METHOD:
   • Save documents as images to your photo gallery first
   • Use "Choose from Gallery" to select them
   • Works well for screenshots and saved documents

3. DEVELOPMENT BUILD:
   • For full file system access
   • Supports direct PDF and document picking
   • Recommended for production use

Note: Expo Go has limitations with file system access for security reasons.`;
  }
}

export default AlternativeDocumentService;