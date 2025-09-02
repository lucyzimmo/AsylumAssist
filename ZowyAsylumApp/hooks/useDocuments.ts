import { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentItem, DocumentCategory, DocumentUploadOptions, DocumentFilters } from '../types/documents';
import documentService from '../services/documentService';

export interface UseDocumentsReturn {
  // Data
  documents: DocumentItem[];
  filteredDocuments: DocumentItem[];
  stats: {
    total: number;
    byCategory: Record<DocumentCategory, number>;
    byStatus: Record<string, number>;
    totalSize: number;
  };
  
  // State
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Filters
  activeCategory: DocumentCategory | 'all';
  searchQuery: string;
  
  // Actions
  setActiveCategory: (category: DocumentCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  takePhoto: (options?: Partial<DocumentUploadOptions>) => Promise<boolean>;
  pickFromGallery: (options?: Partial<DocumentUploadOptions>) => Promise<boolean>;
  pickDocument: (options?: Partial<DocumentUploadOptions>) => Promise<boolean>;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  refreshDocuments: () => Promise<void>;
  
  // Utilities
  formatFileSize: (bytes: number) => string;
  isFileSizeValid: (size: number) => boolean;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<DocumentCategory, number>,
    byStatus: {} as Record<string, number>,
    totalSize: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Prevent concurrent file actions across camera/gallery/document
  const fileActionInProgressRef = useRef(false);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter documents when category or search changes
  useEffect(() => {
    filterDocuments();
  }, [documents, activeCategory, searchQuery]);

  // Update stats when documents change
  useEffect(() => {
    updateStats();
  }, [documents]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = useCallback(() => {
    let filtered = [...documents];

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, activeCategory, searchQuery]);

  const updateStats = async () => {
    try {
      const newStats = await documentService.getDocumentStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to update stats:', err);
    }
  };

  const takePhoto = useCallback(async (options?: Partial<DocumentUploadOptions>): Promise<boolean> => {
    try {
      if (fileActionInProgressRef.current) {
        return false;
      }
      fileActionInProgressRef.current = true;
      setUploading(true);
      setError(null);
      
      const result = await documentService.takePhoto(options);
      
      if (result.success) {
        await loadDocuments();
        return true;
      } else {
        setError(result.error || 'Failed to take photo');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to take photo');
      return false;
    } finally {
      setUploading(false);
      fileActionInProgressRef.current = false;
    }
  }, []);

  const pickFromGallery = useCallback(async (options?: Partial<DocumentUploadOptions>): Promise<boolean> => {
    try {
      if (fileActionInProgressRef.current) {
        return false;
      }
      fileActionInProgressRef.current = true;
      setUploading(true);
      setError(null);
      
      const result = await documentService.pickFromGallery(options);
      
      if (result.success) {
        await loadDocuments();
        return true;
      } else {
        setError(result.error || 'Failed to pick image');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick image');
      return false;
    } finally {
      setUploading(false);
      fileActionInProgressRef.current = false;
    }
  }, []);

  const pickDocument = useCallback(async (options?: Partial<DocumentUploadOptions>): Promise<boolean> => {
    try {
      if (fileActionInProgressRef.current) {
        return false;
      }
      fileActionInProgressRef.current = true;
      setUploading(true);
      setError(null);
      
      const result = await documentService.pickDocument(options);
      
      if (result.success) {
        await loadDocuments();
        return true;
      } else {
        // Silence concurrent picker errors from native modules
        if (result.error && /progress/i.test(result.error)) {
          setError(null);
        } else {
          setError(result.error || 'Failed to pick document');
        }
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick document');
      return false;
    } finally {
      setUploading(false);
      fileActionInProgressRef.current = false;
    }
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<DocumentItem>): Promise<boolean> => {
    try {
      setError(null);
      const success = await documentService.updateDocument(id, updates);
      
      if (success) {
        await loadDocuments();
        return true;
      } else {
        setError('Failed to update document');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
      return false;
    }
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await documentService.deleteDocument(id);
      
      if (success) {
        await loadDocuments();
        return true;
      } else {
        setError('Failed to delete document');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      return false;
    }
  }, []);

  const refreshDocuments = useCallback(async () => {
    await loadDocuments();
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    return documentService.formatFileSize(bytes);
  }, []);

  const isFileSizeValid = useCallback((size: number): boolean => {
    return documentService.isFileSizeValid(size);
  }, []);

  return {
    // Data
    documents,
    filteredDocuments,
    stats,
    
    // State
    loading,
    uploading,
    error,
    
    // Filters
    activeCategory,
    searchQuery,
    
    // Actions
    setActiveCategory,
    setSearchQuery,
    takePhoto,
    pickFromGallery,
    pickDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments,
    
    // Utilities
    formatFileSize,
    isFileSizeValid,
  };
};