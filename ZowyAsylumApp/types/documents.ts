export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  uri: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  lastModified: string;
  description?: string;
  tags: string[];
  isRequired: boolean;
  status: DocumentStatus;
}

export type DocumentType = 'image' | 'pdf' | 'document';

export type DocumentCategory = 
  | 'identity'
  | 'asylum_application'
  | 'supporting_evidence'
  | 'work_authorization'
  | 'legal_documents'
  | 'medical_records'
  | 'other';

export type DocumentStatus = 
  | 'uploaded'
  | 'processing'
  | 'verified'
  | 'rejected'
  | 'needs_review';

export interface DocumentUploadOptions {
  allowMultiple: boolean;
  mediaTypes: ('photo' | 'video' | 'document')[];
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
}

export interface DocumentCategoryInfo {
  id: DocumentCategory;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  examples: string[];
  acceptedFormats: string[];
}

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, DocumentCategoryInfo> = {
  identity: {
    id: 'identity',
    title: 'Identity Documents',
    description: 'Passport, national ID, birth certificate',
    icon: 'card-outline',
    required: true,
    examples: ['Passport', 'National ID', 'Birth Certificate', 'Driver\'s License'],
    acceptedFormats: ['jpg', 'png', 'pdf']
  },
  asylum_application: {
    id: 'asylum_application',
    title: 'Asylum Application',
    description: 'Form I-589 and related documents',
    icon: 'document-text-outline',
    required: true,
    examples: ['Form I-589', 'Filing Receipt', 'Attorney Representation'],
    acceptedFormats: ['pdf', 'jpg', 'png']
  },
  supporting_evidence: {
    id: 'supporting_evidence',
    title: 'Supporting Evidence',
    description: 'Evidence supporting your asylum claim',
    icon: 'folder-outline',
    required: false,
    examples: ['Country Reports', 'News Articles', 'Medical Reports', 'Police Reports'],
    acceptedFormats: ['pdf', 'jpg', 'png', 'doc', 'docx']
  },
  work_authorization: {
    id: 'work_authorization',
    title: 'Work Authorization',
    description: 'Employment authorization documents',
    icon: 'briefcase-outline',
    required: false,
    examples: ['Form I-765', 'Employment Authorization Document', 'Work Permit'],
    acceptedFormats: ['pdf', 'jpg', 'png']
  },
  legal_documents: {
    id: 'legal_documents',
    title: 'Legal Documents',
    description: 'Court documents and legal correspondence',
    icon: 'scale-outline',
    required: false,
    examples: ['Court Orders', 'Legal Notices', 'Attorney Letters'],
    acceptedFormats: ['pdf', 'jpg', 'png']
  },
  medical_records: {
    id: 'medical_records',
    title: 'Medical Records',
    description: 'Medical documentation and reports',
    icon: 'medical-outline',
    required: false,
    examples: ['Medical Reports', 'Psychological Evaluations', 'Hospital Records'],
    acceptedFormats: ['pdf', 'jpg', 'png']
  },
  other: {
    id: 'other',
    title: 'Other Documents',
    description: 'Additional supporting documents',
    icon: 'document-outline',
    required: false,
    examples: ['Letters', 'Certificates', 'Other Evidence'],
    acceptedFormats: ['pdf', 'jpg', 'png', 'doc', 'docx']
  }
};

export interface DocumentUploadResult {
  success: boolean;
  document?: DocumentItem;
  error?: string;
}

export interface DocumentFilters {
  category?: DocumentCategory;
  status?: DocumentStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}